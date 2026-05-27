from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import random, string
from database import get_db, User, Train, Booking, create_tables
from auth import hash_password, verify_password, create_access_token, get_current_user
from schemas import *

app = FastAPI(title="Railway Reservation API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def generate_pnr():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))


@app.on_event("startup")
def startup():
    create_tables()
    seed_data()


def seed_data():
    db = next(get_db())
    # Seed admin user
    if not db.query(User).filter(User.email == "admin@railway.com").first():
        admin = User(
            name="Admin",
            email="admin@railway.com",
            hashed_password=hash_password("admin123"),
            is_admin=True
        )
        db.add(admin)

    # Seed trains
    if db.query(Train).count() == 0:
        trains = [
            Train(train_number="12301", train_name="Rajdhani Express", source="New Delhi", destination="Mumbai Central",
                  departure_time="16:55", arrival_time="08:35+1", duration="15h 40m",
                  total_seats=800, available_seats=320,
                  price_sleeper=0, price_ac3=1805, price_ac2=2580, price_ac1=4325, price_general=0,
                  days_of_operation="Mon,Wed,Fri,Sat"),
            Train(train_number="12951", train_name="Mumbai Rajdhani", source="Mumbai Central", destination="New Delhi",
                  departure_time="17:00", arrival_time="08:35+1", duration="15h 35m",
                  total_seats=800, available_seats=150,
                  price_sleeper=0, price_ac3=1805, price_ac2=2580, price_ac1=4325, price_general=0,
                  days_of_operation="Tue,Thu,Sun"),
            Train(train_number="12002", train_name="Bhopal Shatabdi", source="New Delhi", destination="Bhopal",
                  departure_time="06:00", arrival_time="14:00", duration="8h 00m",
                  total_seats=600, available_seats=420,
                  price_sleeper=0, price_ac3=0, price_ac2=1005, price_ac1=0, price_general=0,
                  days_of_operation="Mon,Tue,Wed,Thu,Fri,Sat,Sun"),
            Train(train_number="12259", train_name="Duronto Express", source="Sealdah", destination="New Delhi",
                  departure_time="20:05", arrival_time="12:15+1", duration="16h 10m",
                  total_seats=750, available_seats=280,
                  price_sleeper=945, price_ac3=2470, price_ac2=3475, price_ac1=5895, price_general=0,
                  days_of_operation="Mon,Wed,Fri"),
            Train(train_number="22691", train_name="Rajdhani Express", source="Bangalore", destination="New Delhi",
                  departure_time="20:00", arrival_time="05:55+2", duration="33h 55m",
                  total_seats=600, available_seats=95,
                  price_sleeper=0, price_ac3=2745, price_ac2=3910, price_ac1=6595, price_general=0,
                  days_of_operation="Tue,Thu,Sun"),
            Train(train_number="12621", train_name="Tamil Nadu Express", source="Chennai Central", destination="New Delhi",
                  departure_time="22:00", arrival_time="07:45+2", duration="33h 45m",
                  total_seats=900, available_seats=550,
                  price_sleeper=745, price_ac3=1965, price_ac2=2815, price_ac1=4765, price_general=340,
                  days_of_operation="Mon,Tue,Wed,Thu,Fri,Sat,Sun"),
            Train(train_number="12909", train_name="Garib Rath", source="Mumbai Central", destination="Hazrat Nizamuddin",
                  departure_time="17:40", arrival_time="10:55+1", duration="17h 15m",
                  total_seats=1200, available_seats=780,
                  price_sleeper=0, price_ac3=620, price_ac2=0, price_ac1=0, price_general=0,
                  days_of_operation="Mon,Wed,Sat"),
            Train(train_number="12627", train_name="Karnataka Express", source="Bangalore", destination="New Delhi",
                  departure_time="18:20", arrival_time="10:30+2", duration="40h 10m",
                  total_seats=1000, available_seats=630,
                  price_sleeper=570, price_ac3=1545, price_ac2=2195, price_ac1=3715, price_general=255,
                  days_of_operation="Mon,Tue,Wed,Thu,Fri,Sat,Sun"),
        ]
        for t in trains:
            db.add(t)
    db.commit()
    db.close()


# ─── AUTH ROUTES ─────────────────────────────────────────────────────────────

@app.post("/api/auth/register", response_model=TokenResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        hashed_password=hash_password(user_data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.post("/api/auth/login", response_model=TokenResponse)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.get("/api/auth/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# ─── TRAIN ROUTES ─────────────────────────────────────────────────────────────

@app.get("/api/trains", response_model=List[TrainOut])
def get_all_trains(db: Session = Depends(get_db)):
    return db.query(Train).filter(Train.is_active == True).all()


@app.get("/api/trains/search")
def search_trains(source: str, destination: str, db: Session = Depends(get_db)):
    trains = db.query(Train).filter(
        Train.source.ilike(f"%{source}%"),
        Train.destination.ilike(f"%{destination}%"),
        Train.is_active == True
    ).all()
    return trains


@app.get("/api/trains/{train_id}", response_model=TrainOut)
def get_train(train_id: int, db: Session = Depends(get_db)):
    train = db.query(Train).filter(Train.id == train_id).first()
    if not train:
        raise HTTPException(status_code=404, detail="Train not found")
    return train


@app.post("/api/trains", response_model=TrainOut)
def create_train(train_data: TrainCreate, db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    train = Train(**train_data.dict(), available_seats=train_data.total_seats)
    db.add(train)
    db.commit()
    db.refresh(train)
    return train


# ─── BOOKING ROUTES ──────────────────────────────────────────────────────────

@app.post("/api/bookings", response_model=BookingOut)
def create_booking(booking_data: BookingCreate, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    train = db.query(Train).filter(Train.id == booking_data.train_id).first()
    if not train:
        raise HTTPException(status_code=404, detail="Train not found")
    if train.available_seats < booking_data.num_passengers:
        raise HTTPException(status_code=400, detail="Not enough seats available")

    price_map = {
        "SLEEPER": train.price_sleeper,
        "AC_3": train.price_ac3,
        "AC_2": train.price_ac2,
        "AC_1": train.price_ac1,
        "GENERAL": train.price_general,
    }
    fare_per_person = price_map.get(booking_data.seat_class, 0)
    total_fare = fare_per_person * booking_data.num_passengers

    pnr = generate_pnr()
    while db.query(Booking).filter(Booking.pnr == pnr).first():
        pnr = generate_pnr()

    booking = Booking(
        pnr=pnr,
        user_id=current_user.id,
        train_id=booking_data.train_id,
        journey_date=booking_data.journey_date,
        seat_class=booking_data.seat_class,
        num_passengers=booking_data.num_passengers,
        passenger_names=booking_data.passenger_names,
        total_fare=total_fare,
        status="CONFIRMED"
    )
    train.available_seats -= booking_data.num_passengers
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@app.get("/api/bookings/my", response_model=List[BookingOut])
def my_bookings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Booking).filter(Booking.user_id == current_user.id).all()


@app.get("/api/bookings/pnr/{pnr}")
def check_pnr(pnr: str, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.pnr == pnr).first()
    if not booking:
        raise HTTPException(status_code=404, detail="PNR not found")
    return booking


@app.delete("/api/bookings/{booking_id}")
def cancel_booking(booking_id: int, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.user_id == current_user.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = "CANCELLED"
    train = db.query(Train).filter(Train.id == booking.train_id).first()
    if train:
        train.available_seats += booking.num_passengers
    db.commit()
    return {"message": "Booking cancelled successfully"}


# ─── ADMIN STATS ──────────────────────────────────────────────────────────────

@app.get("/api/admin/stats")
def admin_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    total_bookings = db.query(Booking).count()
    confirmed = db.query(Booking).filter(Booking.status == "CONFIRMED").count()
    cancelled = db.query(Booking).filter(Booking.status == "CANCELLED").count()
    total_revenue = db.query(Booking).filter(Booking.status == "CONFIRMED").all()
    revenue = sum(b.total_fare for b in total_revenue)
    return {
        "total_users": db.query(User).count(),
        "total_trains": db.query(Train).count(),
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed,
        "cancelled_bookings": cancelled,
        "total_revenue": revenue
    }


@app.get("/api/admin/bookings", response_model=List[BookingOut])
def all_bookings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    return db.query(Booking).all()


@app.get("/api/admin/users", response_model=List[UserOut])
def all_users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    return db.query(User).all()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
