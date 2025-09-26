import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Basic health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'volleycoaching-backend'
  });
});

// Socket.IO for real-time features
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join tactical room for real-time collaboration
  socket.on('join-tactical-room', (tacticId: string) => {
    socket.join(`tactic-${tacticId}`);
    console.log(`Client ${socket.id} joined tactic room: ${tacticId}`);
  });

  // Handle player movement updates
  socket.on('player-movement', (data) => {
    socket.to(`tactic-${data.tacticId}`).emit('player-movement-update', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🏐 VolleyCoaching Backend API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});