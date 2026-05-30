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


def migrate_add_wl_count_to_seat_availability():
    """Add wl_count column to seat_availability table if it doesn't exist"""
    with engine.connect() as connection:
        try:
            db_url = str(engine.url)
            if "sqlite" in db_url:
                # SQLite - check and add missing columns
                result = connection.execute(text("PRAGMA table_info(seat_availability)"))
                columns = [row[1] for row in result.fetchall()]
                
                # Check if we need to recreate the table with correct schema
                if "wl_count" not in columns or "seat_class" not in columns:
                    connection.execute(text("DROP TABLE IF EXISTS seat_availability_new"))
                    connection.execute(text("""
                        CREATE TABLE seat_availability (
                            id SERIAL PRIMARY KEY,
                            train_id INTEGER NOT NULL REFERENCES trains(id) ON DELETE CASCADE,
                            journey_date DATE NOT NULL,
                            seat_class VARCHAR(20) NOT NULL,
                            fare NUMERIC(10,2) NOT NULL DEFAULT 0,
                            total_seats INTEGER NOT NULL DEFAULT 0,
                            available_seats INTEGER NOT NULL DEFAULT 0,
                            booked_seats INTEGER NOT NULL DEFAULT 0,
                            wl_count INTEGER NOT NULL DEFAULT 0,
                            is_active BOOLEAN NOT NULL DEFAULT TRUE,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                            UNIQUE (train_id, journey_date, seat_class)
                        )
                    """))
                    connection.commit()
                    logger.info("✓ Recreated seat_availability table with correct schema (SQLite)")
                else:
                    if "wl_count" not in columns:
                        connection.execute(text("ALTER TABLE seat_availability ADD COLUMN wl_count INTEGER NOT NULL DEFAULT 0"))
                        connection.commit()
                        logger.info("✓ Added wl_count column to seat_availability table (SQLite)")
                    else:
                        logger.info("✓ wl_count column already exists in seat_availability")
            else:
                # PostgreSQL
                result = connection.execute(text("""
                    SELECT column_name FROM information_schema.columns
                    WHERE table_name='seat_availability'
                """))
                columns = [row[0] for row in result.fetchall()]
                
                # Add missing columns
                if "wl_count" not in columns:
                    connection.execute(text("ALTER TABLE seat_availability ADD COLUMN wl_count INTEGER NOT NULL DEFAULT 0"))
                    connection.commit()
                    logger.info("✓ Added wl_count column to seat_availability table (PostgreSQL)")
                
                if "booked_seats" not in columns:
                    connection.execute(text("ALTER TABLE seat_availability ADD COLUMN booked_seats INTEGER NOT NULL DEFAULT 0"))
                    connection.commit()
                    logger.info("✓ Added booked_seats column to seat_availability table (PostgreSQL)")
                    
                if "total_seats" not in columns:
                    connection.execute(text("ALTER TABLE seat_availability ADD COLUMN total_seats INTEGER NOT NULL DEFAULT 0"))
                    connection.commit()
                    logger.info("✓ Added total_seats column to seat_availability table (PostgreSQL)")
                
                if "updated_at" not in columns:
                    connection.execute(text("ALTER TABLE seat_availability ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()"))
                    connection.commit()
                    logger.info("✓ Added updated_at column to seat_availability table (PostgreSQL)")
                
                if "is_active" not in columns:
                    connection.execute(text("ALTER TABLE seat_availability ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE"))
                    connection.commit()
                    logger.info("✓ Added is_active column to seat_availability table (PostgreSQL)")
                
                # Drop the trigger that references missing columns before updating
                connection.execute(text("DROP TRIGGER IF EXISTS trg_sa_updated_at ON seat_availability"))
                connection.commit()
                
                # Update seat_class values to match expected format
                connection.execute(text("""
                    UPDATE seat_availability 
                    SET seat_class = CASE seat_class
                        WHEN 'SL' THEN 'SLEEPER'
                        WHEN 'AC3' THEN 'AC_3'
                        WHEN 'AC2' THEN 'AC_2'
                        WHEN 'AC1' THEN 'AC_1'
                        WHEN 'General' THEN 'GENERAL'
                        ELSE seat_class
                    END
                """))
                connection.commit()
                logger.info("✓ Migrated seat_class values to correct format (PostgreSQL)")
                
                # Ensure total_seats has values
                connection.execute(text("""
                    UPDATE seat_availability 
                    SET total_seats = available_seats
                    WHERE total_seats = 0
                """))
                connection.commit()
                logger.info("✓ Updated total_seats values (PostgreSQL)")
                
                # Recreate the trigger function
                connection.execute(text("""
                    CREATE OR REPLACE FUNCTION update_seat_availability_timestamp()
                    RETURNS TRIGGER LANGUAGE plpgsql AS $$
                    BEGIN
                        NEW.updated_at = NOW();
                        RETURN NEW;
                    END;
                    $$;
                """))
                connection.execute(text("""
                    CREATE TRIGGER trg_sa_updated_at
                        BEFORE UPDATE ON seat_availability
                        FOR EACH ROW EXECUTE FUNCTION update_seat_availability_timestamp();
                """))
                connection.commit()
                logger.info("✓ Recreated trigger function (PostgreSQL)")
                    
                logger.info("✓ seat_availability schema migration complete (PostgreSQL)")
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
