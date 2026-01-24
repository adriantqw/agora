# Database Migration for Catalogue Streaming

## What Changed

Added three new columns to the `catalogues` table for real-time streaming progress:

- **`current_page`** (INTEGER, default 0) - Tracks which page is currently being processed
- **`total_pages`** (INTEGER, default 0) - Total number of pages in the PDF
- **`thinking_message`** (TEXT, nullable) - AI's current thinking message (truncated to 60 chars)

## Migration Options

### Option 1: Fresh Database (RECOMMENDED if no data to preserve)

Simply delete the existing database and restart the server:

```bash
# Windows
cd backend
del agora.db
uv run uvicorn app.main:app --reload

# Mac/Linux
cd backend
rm agora.db
uv run uvicorn app.main:app --reload
```

The database will be recreated with all new columns automatically.

### Option 2: Migrate Existing Database

If you have existing data, use the migration script:

```bash
cd backend
uv run --link-mode=copy python init_or_migrate_db.py
```

This will:
- Create the database if it doesn't exist
- Add missing columns to existing tables
- Preserve all existing data

## Verify Migration

After running the migration, verify the columns exist:

```bash
cd backend
sqlite3 agora.db "PRAGMA table_info(catalogues);"
```

You should see the three new columns in the output.

## Rollback

If you need to rollback (remove the columns):

```bash
# SQLite doesn't support DROP COLUMN, so you need to:
# 1. Create backup
# 2. Recreate table without columns
# 3. Copy data back

# Or simply delete the database and start fresh
cd backend
del agora.db  # Windows
rm agora.db   # Mac/Linux
```

## Production Deployment

For production, ensure you run the migration script before deploying the new code:

1. **Backup your database**
2. **Run migration**: `uv run python init_or_migrate_db.py`
3. **Deploy new backend code**
4. **Verify streaming works**

## Troubleshooting

### Error: "No module named 'sqlalchemy'"

Run with `uv run` to use the virtual environment:
```bash
uv run --link-mode=copy python init_or_migrate_db.py
```

### Error: "Database is locked"

Stop the backend server before running the migration:
```bash
# Stop the server (Ctrl+C)
# Then run migration
uv run python init_or_migrate_db.py
```

### Error: "Column already exists"

The migration is idempotent - it skips columns that already exist. This is safe to ignore.

### Database doesn't exist

The script will create it automatically. Just run:
```bash
uv run python init_or_migrate_db.py
```

## Scripts Available

- **`init_or_migrate_db.py`** - Main migration script (recommended)
- **`add_streaming_columns.py`** - Manual column addition (alternative)

Both scripts are safe to run multiple times.
