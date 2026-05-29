"""
Database migration script to update users table schema for Google OAuth support
Run this to update your PostgreSQL schema
"""

from database import engine, SessionLocal
from sqlalchemy import text
import logging

logger = logging.getLogger(__name__)

def migrate_add_google_id():
    """Add google_id column to users table if it doesn't exist"""
    with engine.connect() as connection:
        try:
            # Check if column exists
            result = connection.execute(
                text("""
                    SELECT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name='users' AND column_name='google_id'
                    )
                """)
            )
            column_exists = result.scalar()
            
            if not column_exists:
                # Add the column
                connection.execute(
                    text("""
                        ALTER TABLE users 
                        ADD COLUMN google_id VARCHAR(255) UNIQUE
                    """)
                )
                connection.commit()
                logger.info("✓ Added google_id column to users table")
            else:
                logger.info("✓ google_id column already exists")
                
        except Exception as e:
            logger.error(f"Migration error: {e}")
            raise


def migrate_make_hashed_password_nullable():
    """Make hashed_password nullable for Google OAuth users"""
    with engine.connect() as connection:
        try:
            # Alter the hashed_password column to be nullable
            connection.execute(
                text("""
                    ALTER TABLE users 
                    ALTER COLUMN hashed_password DROP NOT NULL
                """)
            )
            connection.commit()
            logger.info("✓ Made hashed_password nullable in users table")
        except Exception as e:
            # If it's already nullable, this will error - that's fine
            if "drop not-null constraint" in str(e).lower():
                logger.info("✓ hashed_password is already nullable")
            else:
                logger.error(f"Migration error: {e}")
                raise


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    logger.info("Running database migrations...")
    migrate_add_google_id()
    migrate_make_hashed_password_nullable()
    print("✓ All migrations completed!")
