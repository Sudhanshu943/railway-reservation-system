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


def migrate_add_wl_number():
    """Add wl_number column to bookings table if it doesn't exist"""
    with engine.connect() as connection:
        try:
            # SQLite-compatible check
            db_url = str(engine.url)
            if "sqlite" in db_url:
                result = connection.execute(text("PRAGMA table_info(bookings)"))
                columns = [row[1] for row in result.fetchall()]
                if "wl_number" not in columns:
                    connection.execute(text("ALTER TABLE bookings ADD COLUMN wl_number INTEGER"))
                    connection.commit()
                    logger.info("✓ Added wl_number column to bookings table (SQLite)")
                else:
                    logger.info("✓ wl_number column already exists")
            else:
                # PostgreSQL
                result = connection.execute(text("""
                    SELECT EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name='bookings' AND column_name='wl_number'
                    )
                """))
                if not result.scalar():
                    connection.execute(text("ALTER TABLE bookings ADD COLUMN wl_number INTEGER"))
                    connection.commit()
                    logger.info("✓ Added wl_number column to bookings table (PostgreSQL)")
                else:
                    logger.info("✓ wl_number column already exists")
        except Exception as e:
            logger.error(f"Migration error: {e}")
            raise


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    logger.info("Running database migrations...")
    migrate_add_google_id()
    migrate_make_hashed_password_nullable()
    migrate_add_wl_number()
    print("✓ All migrations completed!")
