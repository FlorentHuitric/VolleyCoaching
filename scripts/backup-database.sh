#!/bin/bash

# ============================================
# Script de sauvegarde PostgreSQL
# ============================================
# Ce script crée une sauvegarde complète de la base de données PostgreSQL
# Les données persistent dans les volumes Docker nommés, mais cette sauvegarde
# permet une restauration facile sur un autre système.
#
# Usage:
#   ./scripts/backup-database.sh
#   ./scripts/backup-database.sh mon_backup.sql
# ============================================

set -e

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${1:-${BACKUP_DIR}/backup_${TIMESTAMP}.sql}"

# Créer le dossier de sauvegarde s'il n'existe pas
mkdir -p "$(dirname "$BACKUP_FILE")"

echo "🔄 Création de la sauvegarde PostgreSQL..."
echo "📁 Fichier: $BACKUP_FILE"

# Vérifier que le conteneur PostgreSQL est en cours d'exécution
if ! docker ps | grep -q volleycoaching-postgres-1; then
    echo "❌ Erreur: Le conteneur PostgreSQL n'est pas en cours d'exécution"
    echo "   Démarrez-le avec: docker-compose up -d postgres"
    exit 1
fi

# Créer la sauvegarde
docker exec volleycoaching-postgres-1 pg_dump -U volleyuser volleycoaching > "$BACKUP_FILE"

# Vérifier la taille du fichier
FILESIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null || echo "0")

if [ "$FILESIZE" -gt 0 ]; then
    FILESIZE_HUMAN=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✅ Sauvegarde créée avec succès!"
    echo "📊 Taille: $FILESIZE_HUMAN"
    echo "📍 Emplacement: $BACKUP_FILE"

    # Compter les backups existants
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/backup_*.sql 2>/dev/null | wc -l)
    echo "📦 Nombre total de sauvegardes: $BACKUP_COUNT"

    # Afficher les 5 dernières sauvegardes
    echo ""
    echo "📋 Dernières sauvegardes:"
    ls -lht "$BACKUP_DIR"/backup_*.sql 2>/dev/null | head -5 | awk '{print "   "$9" ("$5")"}'
else
    echo "❌ Erreur: La sauvegarde est vide"
    exit 1
fi

echo ""
echo "💡 Pour restaurer cette sauvegarde:"
echo "   cat $BACKUP_FILE | docker exec -i volleycoaching-postgres-1 psql -U volleyuser volleycoaching"
