import 'reflect-metadata';
import express, { RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { expressMiddleware } from '@apollo/server/express4';
import dotenv from 'dotenv';
import { DependencyContainer } from './config/container';
import { createApolloServer } from './config/apollo';
import { container } from 'tsyringe';
import { UploadService } from './services/UploadService';
import { ExportService } from './services/ExportService';
import { AuthService } from './services/auth.service';
import { extractTokenFromHeader } from './utils/auth.context';
import type { GraphQLContext } from './utils/auth.context';

// Load environment variables
dotenv.config();

async function startServer() {
  // Initialize Dependency Injection
  await DependencyContainer.initialize();

  // Create Express app
  const app = express();
  const httpServer = createServer(app);

  // Create Socket.IO server
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Basic middleware
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
  }));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'volleycoaching-backend',
      graphql: '/graphql'
    });
  });

  const requireUser: RequestHandler = async (req, res, next) => {
    try {
      const token = extractTokenFromHeader(req);
      const user = token ? await container.resolve(AuthService).getUserFromToken(token) : null;
      if (!user) { res.status(401).json({ error: 'Connexion requise.' }); return; }
      if (!['ADMIN', 'COACH', 'ASSISTANT_COACH'].includes(user.role)) { res.status(403).json({ error: 'Accès interdit.' }); return; }
      res.locals.user = user;
      next();
    } catch { res.status(503).json({ error: 'Service temporairement indisponible.' }); }
  };

  // File upload endpoint
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024, files: 1 }, fileFilter: (_req, file, done) => {
    if (['image/jpeg','image/png','image/webp'].includes(file.mimetype)) done(null, true);
    else done(new Error('Formats acceptés : JPEG, PNG ou WebP.'));
  } });
  app.post('/upload', requireUser, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const uploadService = container.resolve(UploadService);
      const fileUrl = await uploadService.uploadFile(req.file);

      res.json({ url: fileUrl });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  });

  // Export endpoints (PDF & Excel)
  app.get('/export/player/:id/pdf', requireUser, async (req, res) => {
    try {
      const exportService = container.resolve(ExportService);
      if (!await container.resolve(AuthService).validateUserOwnsPlayer(res.locals.user.id, req.params.id)) return res.status(403).json({ error: 'Accès interdit.' });
      const buffer = await exportService.generatePlayerPDF(req.params.id);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=joueur-${req.params.id}.pdf`);
      res.send(buffer);
    } catch (error: any) {
      console.error('PDF export error:', error);
      res.status(error.message === 'Player not found' ? 404 : 500)
        .json({ error: error.message || 'Failed to generate PDF' });
    }
  });

  app.get('/export/team/:id/excel', requireUser, async (req, res) => {
    try {
      const exportService = container.resolve(ExportService);
      if (!await container.resolve(AuthService).validateUserOwnsTeam(res.locals.user.id, req.params.id)) return res.status(403).json({ error: 'Accès interdit.' });
      const buffer = await exportService.generateTeamExcel(req.params.id);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=equipe-${req.params.id}.xlsx`);
      res.send(buffer);
    } catch (error: any) {
      console.error('Excel export error:', error);
      res.status(error.message === 'Team not found' ? 404 : 500)
        .json({ error: error.message || 'Failed to generate Excel' });
    }
  });

  // Instagram oEmbed proxy endpoint
  app.get('/api/instagram/oembed', async (req, res) => {
    try {
      const instagramUrl = req.query.url as string;

      if (!instagramUrl) {
        return res.status(400).json({ error: 'Missing required "url" query parameter' });
      }

      // Validate that it looks like an Instagram URL
      if (!instagramUrl.includes('instagram.com/')) {
        return res.status(400).json({ error: 'Invalid Instagram URL' });
      }

      const encodedUrl = encodeURIComponent(instagramUrl);
      const facebookToken = process.env.FACEBOOK_OEMBED_TOKEN;

      let oembedApiUrl: string;
      if (facebookToken) {
        // Use Facebook Graph API (preferred, requires app token)
        oembedApiUrl = `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodedUrl}&access_token=${facebookToken}&omitscript=true`;
      } else {
        // Fallback to legacy Instagram oEmbed (no token needed)
        oembedApiUrl = `https://api.instagram.com/oembed?url=${encodedUrl}&omitscript=true`;
      }

      const response = await fetch(oembedApiUrl);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Instagram oEmbed API error:', response.status, errorText);
        return res.status(response.status).json({
          error: 'Failed to fetch Instagram oEmbed data',
          details: response.status === 404 ? 'Post not found or not accessible' : 'Instagram API error',
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Instagram oEmbed proxy error:', error);
      res.status(500).json({ error: 'Internal error while fetching Instagram embed data' });
    }
  });

  // Create and configure Apollo Server
  const apolloServer = await createApolloServer();

  // Apply Apollo middleware to Express
  app.use(
    '/graphql',
    expressMiddleware<GraphQLContext>(apolloServer, {
      context: async ({ req }): Promise<GraphQLContext> => {
        // Extract token from Authorization header
        const token = extractTokenFromHeader(req);

        // If no token, return context without user
        if (!token) {
          return { req, user: null };
        }

        // Verify token and get user
        const authService = container.resolve(AuthService);
        const user = await authService.getUserFromToken(token);

        // Return context with user info
        return {
          req,
          user,
          userId: user?.id,
          userRole: user?.role,
          orgId: user?.orgId,
        };
      },
    })
  );

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(err?.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: err?.code === 'LIMIT_FILE_SIZE' ? 'Image trop volumineuse (8 Mo maximum).' : 'Requête ou fichier invalide.' });
  });

  io.use(async (socket, next) => {
    const user = await container.resolve(AuthService).getUserFromToken(socket.handshake.auth?.token || '');
    if (!user) return next(new Error('Connexion requise.'));
    socket.data.user = user;
    next();
  });
  // Socket.IO for real-time features
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-tactical-room', async (tacticId: string) => {
      if (typeof tacticId !== 'string' || !await container.resolve(AuthService).validateUserOwnsTeam(socket.data.user.id, tacticId)) return;
      socket.join(`tactic-${tacticId}`);
      console.log(`Client ${socket.id} joined tactic room: ${tacticId}`);
    });

    socket.on('player-movement', (data) => {
      if (!data || typeof data.tacticId !== 'string' || !socket.rooms.has(`tactic-${data.tacticId}`)) return;
      socket.to(`tactic-${data.tacticId}`).emit('player-movement-update', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  const PORT = process.env.PORT || 3001;

  httpServer.listen(PORT, () => {
    console.log(`🏐 VolleyCoaching Backend API running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🚀 GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await DependencyContainer.cleanup();
    httpServer.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
