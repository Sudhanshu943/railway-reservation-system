from pydantic import BaseModel, EmailStr, field_serializer
from typing import Optional, List
from datetime import datetime, date


class UserCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class GoogleLoginRequest(BaseModel):
    token: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class TrainCreate(BaseModel):
    train_number: str
    train_name: str
    source: str
    destination: str
    departure_time: str
    arrival_time: str
    duration: str
    total_seats: int = 500
    price_sleeper: float = 500
    price_ac3: float = 1000
    price_ac2: float = 1500
    price_ac1: float = 3000
    price_general: float = 200
    days_of_operation: str = "Mon,Tue,Wed,Thu,Fri,Sat,Sun"


class TrainOut(BaseModel):
    id: int
    train_number: str
    train_name: str
    source: str
    destination: str
    departure_time: str
    arrival_time: str
    duration: str
    total_seats: int
    available_seats: int
    price_sleeper: float
    price_ac3: float
    price_ac2: float
    price_ac1: float
    price_general: float
    days_of_operation: str
    is_active: bool

    class Config:
        from_attributes = True


class BookingCreate(BaseModel):
    train_id: int
    journey_date: str
    seat_class: str
    num_passengers: int
    passenger_names: str  # comma-separated


class BookingOut(BaseModel):
    id: int
    pnr: str
    journey_date: date
    seat_class: str
    num_passengers: int
    total_fare: float
    status: str
    passenger_names: str
    wl_number: Optional[int] = None
    created_at: datetime
    train: TrainOut
    user: UserOut

    class Config:
        from_attributes = True
        json_encoders = {
            date: lambda v: v.isoformat() if v else None
        }


class PNRCheck(BaseModel):
    pnr: str


class SearchTrains(BaseModel):
    source: str
    destination: str
    journey_date: str
