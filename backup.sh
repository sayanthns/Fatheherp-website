#!/bin/bash

# Fateh ERP - Automated Data Backup System
# Runs nightly via Ubuntu root crontab

BACKUP_DIR="/opt/Fatheherp-website/backups"
DATA_DIR="/opt/Fatheherp-website/data"
DATE=$(date +%Y-%m-%d_%H-%M-%S)

# Ensure backup directory safely exists
mkdir -p "$BACKUP_DIR"

# Zip the core data folder for persistence
zip -r "$BACKUP_DIR/backup_$DATE.zip" "$DATA_DIR" > /dev/null

# Clean up older backups strictly exceeding exactly 5 Days to preserve VPS storage constraints.
find "$BACKUP_DIR" -type f -name "*.zip" -mtime +5 -exec rm {} \;
