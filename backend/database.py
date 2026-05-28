from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Enum, Date, Time, Numeric, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.pool import NullPool, QueuePool
from datetime import datetime
import enum
import os
from dotenv import load_dotenv
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Get database URL from .env or fallback to local SQLite for development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./railway.db")

# Configure connection pool based on database type
if DATABASE_URL.startswith("sqlite"):
    # SQLite doesn't need connection pooling
    connect_args = {"check_same_thread": False}
    poolclass = NullPool
    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        poolclass=poolclass,
        echo=False
    )
else:
    # PostgreSQL/Neon needs proper connection pooling
    engine = create_engine(
        DATABASE_URL,
        poolclass=QueuePool,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        pool_recycle=3600,  # Recycle connections after 1 hour
        echo=False,
        connect_args={
            "connect_timeout": 10,
            "application_name": "railway_reservation_system"
        }
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Test connection on startup
@event.listens_for(engine, "connect")
def receive_connect(dbapi_conn, connection_record):
    logger.info("✓ Database connection established")


class BookingStatus(str, enum.Enum):
    CONFIRMED = "CONFIRMED"
    PENDING = "PENDING"
    CANCELLED = "CANCELLED"
    WAITLISTED = "WAITLISTED"


class SeatClass(str, enum.Enum):
    SLEEPER = "SLEEPER"
    AC_3 = "AC_3"
    AC_2 = "AC_2"
    AC_1 = "AC_1"
    GENERAL = "GENERAL"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    bookings = relationship("Booking", back_populates="user", cascade="all, delete-orphan")


class Train(Base):
    __tablename__ = "trains"
    id = Column(Integer, primary_key=True, index=True)
    train_number = Column(String(50), unique=True, index=True, nullable=False)
    train_name = Column(String(255), nullable=False)
    source = Column(String(100), nullable=False)
    destination = Column(String(100), nullable=False)
    departure_time = Column(String(10), nullable=False)
    arrival_time = Column(String(10), nullable=False)
    duration = Column(String(50), nullable=False)
    total_seats = Column(Integer, default=500, nullable=False)
    available_seats = Column(Integer, default=500, nullable=False)
    price_sleeper = Column(Float, default=500)
    price_ac3 = Column(Float, default=1000)
    price_ac2 = Column(Float, default=1500)
    price_ac1 = Column(Float, default=3000)
    price_general = Column(Float, default=200)
    days_of_operation = Column(String(255), default="Mon,Tue,Wed,Thu,Fri,Sat,Sun")
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    bookings = relationship("Booking", back_populates="train", cascade="all, delete-orphan")
    coaches = relationship("Coach", back_populates="train", cascade="all, delete-orphan")


class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    pnr = Column(String(20), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    train_id = Column(Integer, ForeignKey("trains.id", ondelete="CASCADE"), nullable=False)
    journey_date = Column(String(20), nullable=False, index=True)
    seat_class = Column(String(50), nullable=False)
    num_passengers = Column(Integer, default=1, nullable=False)
    total_fare = Column(Float, nullable=False)
    status = Column(String(50), default="CONFIRMED", index=True)
    passenger_names = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = relationship("User", back_populates="bookings")
    train = relationship("Train", back_populates="bookings")
    payment = relationship("Payment", back_populates="booking", uselist=False, cascade="all, delete-orphan")


class Coach(Base):
    __tablename__ = "coaches"
    id = Column(Integer, primary_key=True, index=True)
    train_id = Column(Integer, ForeignKey("trains.id", ondelete="CASCADE"), nullable=False)
    coach_number = Column(Integer, nullable=False)
    coach_type = Column(String(50), nullable=False)
    total_seats = Column(Integer, default=72, nullable=False)
    available_seats = Column(Integer, default=72, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    train = relationship("Train", back_populates="coaches")
    seats = relationship("Seat", back_populates="coach", cascade="all, delete-orphan")


class Seat(Base):
    __tablename__ = "seats"
    id = Column(Integer, primary_key=True, index=True)
    coach_id = Column(Integer, ForeignKey("coaches.id", ondelete="CASCADE"), nullable=False)
    seat_number = Column(Integer, nullable=False)
    seat_type = Column(String(50), nullable=False)
    is_available = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    coach = relationship("Coach", back_populates="seats")


class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), unique=True, nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(50), nullable=False)
    payment_status = Column(String(50), default="PENDING", index=True)
    transaction_id = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    booking = relationship("Booking", back_populates="payment")


class Cancellation(Base):
    __tablename__ = "cancellations"
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, index=True)
    cancellation_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    refund_amount = Column(Float, nullable=False)
    cancellation_reason = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class WaitingList(Base):
    __tablename__ = "waiting_list"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    train_id = Column(Integer, ForeignKey("trains.id", ondelete="CASCADE"), nullable=False, index=True)
    journey_date = Column(String(20), nullable=False)
    seat_class = Column(String(50), nullable=False)
    num_passengers = Column(Integer, default=1, nullable=False)
    wl_number = Column(Integer, nullable=False)
    status = Column(String(50), default="WAITING", index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


def get_db():
    """Database session dependency for FastAPI endpoints"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables if they don't exist (preserves data on restart)"""
    # Only create tables if they don't already exist
    Base.metadata.create_all(bind=engine)
    logger.info("✓ Database schema initialized")
