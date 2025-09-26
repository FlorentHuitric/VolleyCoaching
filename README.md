# 🏐 VolleyCoaching

Plateforme complète de coaching volleyball avec interfaces tactiques interactives, gestion d'équipes, et entraînements personnalisés.

## 🚀 Architecture

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + Prisma + PostgreSQL
- **Temps réel**: Socket.IO + Redis
- **Stockage**: MinIO (S3-compatible)
- **Analyse vidéo**: Python + FastAPI + OpenCV
- **Déploiement**: Docker + Docker Compose

## 📁 Structure du projet

```
/
├── frontend/           # Interface Next.js
├── backend/           # API Node.js + Prisma
├── services/
│   └── video-analysis/  # Service Python pour l'IA
├── database/
│   └── init/           # Scripts d'initialisation PostgreSQL
└── docker-compose.yml  # Orchestration des services
```

## 🛠️ Installation et lancement

### Prérequis
- Docker & Docker Compose
- Node.js 20+ (pour le développement local)

### Démarrage rapide

1. **Cloner et configurer**
```bash
git clone <repository>
cd VolleyCoaching
cp .env.example .env
# Ajuster les variables d'environnement si nécessaire
```

2. **Lancer tous les services**
```bash
docker-compose up -d
```

3. **Initialiser la base de données**
```bash
docker-compose exec backend npm run prisma:migrate
docker-compose exec backend npm run prisma:seed
```

4. **Accéder aux services**
- 🌐 Frontend: http://localhost:3000
- 🔌 API Backend: http://localhost:3001
- 🎥 Service vidéo: http://localhost:8000
- 🗄️ MinIO Console: http://localhost:9001
- 🐘 PostgreSQL: localhost:5432
- 🟥 Redis: localhost:6379

## 🏐 Fonctionnalités principales

### Interface tactique
- Terrain interactif avec drag & drop
- Jetons joueurs personnalisables (photos + maillots)
- Enregistrement des mouvements en temps réel
- Système de replay avec contrôles temporels

### Gestion d'équipes
- Profils joueurs complets avec statistiques
- Tests de positionnement personnalisables
- Notes et évaluations détaillées
- Calcul automatique de la note d'équipe

### Entraînements intelligents
- Base d'exercices avec métadonnées complètes
- Générateur d'entraînements basé sur l'IA
- Intégration vidéos Instagram
- Système de défis et récompenses

### Analyses et statistiques
- Tracking complet des performances
- Graphiques et évolutions temporelles
- Rapports d'équipe et individuels

## 🔧 Développement

### Commandes utiles

```bash
# Logs de tous les services
docker-compose logs -f

# Restart d'un service spécifique
docker-compose restart backend

# Accès shell dans un container
docker-compose exec backend sh

# Reset complet de la base de données
docker-compose down -v
docker-compose up -d postgres
docker-compose exec backend npm run prisma:migrate
```

### Structure de la base de données

Voir `backend/prisma/schema.prisma` pour le modèle complet incluant :
- Users, Teams, Players
- Stats et évaluations
- Entraînements et exercices
- Tactiques et phases de jeu
- Mouvements et positionnements

## 📱 API Endpoints

La documentation complète de l'API sera disponible sur `/api/docs` une fois les services lancés.

Endpoints principaux :
- `/api/teams` - Gestion des équipes
- `/api/players` - Profils et statistiques joueurs
- `/api/trainings` - Entraînements et exercices
- `/api/tactics` - Phases tactiques
- `/api/upload` - Gestion des médias

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalité`)
3. Commit (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Push (`git push origin feature/nouvelle-fonctionnalité`)
5. Créer une Pull Request

## 📄 License

MIT License - voir le fichier LICENSE pour plus de détails.