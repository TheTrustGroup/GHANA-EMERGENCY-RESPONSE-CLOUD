#!/bin/bash

# Database Backup Script
# Run this daily via cron: 0 2 * * * /path/to/backup-database.sh

set -e

# Configuration
BACKUP_DIR="/backups/database"
S3_BUCKET="ghana-emergency-backups"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/db_backup_${DATE}.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Perform backup
echo "Starting database backup at $(date)"
pg_dump "$DATABASE_URL" > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

# Upload to S3 (if AWS CLI is configured)
if command -v aws &> /dev/null; then
    echo "Uploading backup to S3..."
    aws s3 cp "$BACKUP_FILE" "s3://${S3_BUCKET}/database/" || echo "Warning: S3 upload failed"
fi

# Clean up old backups (keep last 30 days)
find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $BACKUP_FILE"
echo "Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"

