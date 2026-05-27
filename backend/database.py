from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import enum

SQLALCHEMY_DATABASE_URL = "sqlite:///./railway.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


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
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    bookings = relationship("Booking", back_populates="user")


class Train(Base):
    __tablename__ = "trains"
    id = Column(Integer, primary_key=True, index=True)
    train_number = Column(String, unique=True, nullable=False)
    train_name = Column(String, nullable=False)
    source = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    departure_time = Column(String, nullable=False)
    arrival_time = Column(String, nullable=False)
    duration = Column(String, nullable=False)
    total_seats = Column(Integer, default=500)
    available_seats = Column(Integer, default=500)
    price_sleeper = Column(Float, default=500)
    price_ac3 = Column(Float, default=1000)
    price_ac2 = Column(Float, default=1500)
    price_ac1 = Column(Float, default=3000)
    price_general = Column(Float, default=200)
    days_of_operation = Column(String, default="Mon,Tue,Wed,Thu,Fri,Sat,Sun")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    bookings = relationship("Booking", back_populates="train")


class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    pnr = Column(String, unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    train_id = Column(Integer, ForeignKey("trains.id"))
    journey_date = Column(String, nullable=False)
    seat_class = Column(String, nullable=False)
    num_passengers = Column(Integer, default=1)
    total_fare = Column(Float, nullable=False)
    status = Column(String, default=BookingStatus.CONFIRMED)
    passenger_names = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="bookings")
    train = relationship("Train", back_populates="bookings")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    Base.metadata.create_all(bind=engine)
