"""
Migration: Add thread_id column to journeys table
Date: 2026-02-05
"""

import sqlite3
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.config import settings

def migrate():
    """Add thread_id column to journeys table."""
    db_path = settings.DATABASE_URL.replace("sqlite:///", "")

    print(f"Connecting to database: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Check if column already exists
        cursor.execute("PRAGMA table_info(journeys)")
        columns = [row[1] for row in cursor.fetchall()]

        if 'thread_id' in columns:
            print("Column 'thread_id' already exists. Migration not needed.")
            return

        print("Adding thread_id column to journeys table...")

        # Add the column (nullable)
        cursor.execute("""
            ALTER TABLE journeys
            ADD COLUMN thread_id VARCHAR
        """)

        # Create unique index on thread_id (enforces uniqueness)
        cursor.execute("""
            CREATE UNIQUE INDEX IF NOT EXISTS ix_journeys_thread_id
            ON journeys(thread_id)
        """)

        conn.commit()
        print("✓ Successfully added thread_id column and index")

        # Verify the change
        cursor.execute("PRAGMA table_info(journeys)")
        columns = [row[1] for row in cursor.fetchall()]
        print(f"✓ Current columns: {columns}")

    except Exception as e:
        conn.rollback()
        print(f"✗ Migration failed: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
