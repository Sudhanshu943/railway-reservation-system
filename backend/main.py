from fastapi import FastAPI, Depends, HTTPException, status, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
import random
import string
import logging
from database import get_db, SessionLocal, User, Train, Booking, create_tables, engine, Base
from auth import hash_password, verify_password, create_access_token, get_current_user, verify_google_token, ACCESS_TOKEN_EXPIRE_MINUTES
from schemas import *

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Railway Reservation API",
    version="1.0.0",
    description="Complete Railway Reservation System API"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def generate_pnr():
    """Generate unique PNR number"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))


@app.on_event("startup")
def startup():
    """Initialize database and seed data on startup"""
    try:
        logger.info("Starting application...")
        create_tables()
        logger.info("✓ Database tables created")
        seed_data()
        logger.info("✓ Application startup complete")
    except Exception as e:
        logger.error(f"✗ Startup error: {e}")
        raise


@app.on_event("shutdown")
def shutdown():
    """Cleanup on shutdown"""
    logger.info("Shutting down application...")
    engine.dispose()
    logger.info("✓ Database connections closed")


def seed_data():
    """Seed initial data if database is empty"""
    db = SessionLocal()
    try:
        # Seed admin user
        if not db.query(User).filter(User.email == "admin@railway.com").first():
            admin = User(
                name="Admin",
                email="admin@railway.com",
                hashed_password=hash_password("admin123"),
                is_admin=True
            )
            db.add(admin)
            logger.info("✓ Admin user created")

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
            logger.info(f"✓ Seeded {len(trains)} trains")
    except Exception as e:
        logger.error(f"Seed data error: {e}")
        db.rollback()
    finally:
        db.close()


# ─── HEALTH CHECK ─────────────────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"}


# ─── AUTH ROUTES ───────────────────────────────────────────────────────────────

@app.post("/api/auth/register", response_model=TokenResponse, tags=["Authentication"])
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register new user"""
    try:
        if db.query(User).filter(User.email == user_data.email).first():
            logger.warning(f"Registration attempt with existing email: {user_data.email}")
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
        logger.info(f"✓ New user registered: {user.email}")
        return {"access_token": token, "token_type": "bearer", "user": user}
    except Exception as e:
        db.rollback()
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")


@app.post("/api/auth/login", response_model=TokenResponse, tags=["Authentication"])
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    try:
        user = db.query(User).filter(User.email == user_data.email).first()
        if not user or not verify_password(user_data.password, user.hashed_password):
            logger.warning(f"Failed login attempt: {user_data.email}")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        token = create_access_token({"sub": user.email})
        logger.info(f"✓ User logged in: {user.email}")
        return {"access_token": token, "token_type": "bearer", "user": user}
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


@app.post("/api/auth/google-login", response_model=TokenResponse, tags=["Authentication"])
def google_login(request: GoogleLoginRequest, response: Response, db: Session = Depends(get_db)):
    """Login or register user with Google OAuth token"""
    try:
        # Verify Google token
        idinfo = verify_google_token(request.token)
        
        email = idinfo.get("email")
        name = idinfo.get("name", "")
        google_id = idinfo.get("sub")
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not found in Google token")
        
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            # Create new user
            user = User(
                name=name,
                email=email,
                google_id=google_id,
                hashed_password=None  # No password for Google auth
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"✓ New Google user registered: {email}")
        else:
            # Update google_id if not set
            if not user.google_id:
                user.google_id = google_id
                db.commit()
                db.refresh(user)
            logger.info(f"✓ Google user logged in: {email}")
        
        # Create JWT token
        access_token = create_access_token({"sub": user.email})
        
        # Set HTTP-only secure cookie
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,  # Only send over HTTPS in production
            samesite="lax",
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
        
        return {"access_token": access_token, "token_type": "bearer", "user": user}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google login error: {e}")
        raise HTTPException(status_code=500, detail=f"Google login failed: {str(e)}")


@app.get("/api/auth/logout", tags=["Authentication"])
def logout(response: Response):
    """Logout user by clearing cookie"""
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}


@app.get("/api/auth/me", response_model=UserOut, tags=["Authentication"])
def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return current_user


# ─── TRAIN ROUTES ────────────────────────────────────────────────────────────

@app.get("/api/trains", response_model=list[TrainOut], tags=["Trains"])
def get_all_trains(db: Session = Depends(get_db)):
    """Get all active trains"""
    trains = db.query(Train).filter(Train.is_active == True).all()
    logger.debug(f"Retrieved {len(trains)} active trains")
    return trains


@app.get("/api/trains/search", response_model=list[TrainOut], tags=["Trains"])
def search_trains(source: str, destination: str, db: Session = Depends(get_db)):
    """Search trains by source and destination"""
    trains = db.query(Train).filter(
        Train.source.ilike(f"%{source}%"),
        Train.destination.ilike(f"%{destination}%"),
        Train.is_active == True
    ).all()
    logger.info(f"✓ Train search: {source} → {destination}, found {len(trains)} trains")
    return trains


@app.get("/api/trains/{train_id}", response_model=TrainOut, tags=["Trains"])
def get_train(train_id: int, db: Session = Depends(get_db)):
    """Get train details"""
    train = db.query(Train).filter(Train.id == train_id).first()
    if not train:
        logger.warning(f"Train {train_id} not found")
        raise HTTPException(status_code=404, detail="Train not found")
    return train


@app.post("/api/trains", response_model=TrainOut, tags=["Trains"])
def create_train(train_data: TrainCreate, db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_user)):
    """Create new train (admin only)"""
    if not current_user.is_admin:
        logger.warning(f"Non-admin user {current_user.email} attempted to create train")
        raise HTTPException(status_code=403, detail="Admin only")
    
    try:
        train = Train(**train_data.dict(), available_seats=train_data.total_seats)
        db.add(train)
        db.commit()
        db.refresh(train)
        logger.info(f"✓ Train created: {train.train_number} - {train.train_name}")
        return train
    except Exception as e:
        db.rollback()
        logger.error(f"Train creation failed: {e}")
        raise HTTPException(status_code=500, detail="Train creation failed")


# ─── BOOKING ROUTES ──────────────────────────────────────────────────────────

@app.post("/api/bookings", response_model=BookingOut, tags=["Bookings"])
def create_booking(booking_data: BookingCreate, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    """Create a new train booking"""
    try:
        train = db.query(Train).filter(Train.id == booking_data.train_id).first()
        if not train:
            logger.warning(f"Train {booking_data.train_id} not found")
            raise HTTPException(status_code=404, detail="Train not found")
        if train.available_seats < booking_data.num_passengers:
            logger.warning(f"Insufficient seats on train {train.id}: available={train.available_seats}, requested={booking_data.num_passengers}")
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
        logger.info(f"✓ Booking created: PNR={pnr}, User={current_user.email}, Train={train.train_number}")
        return booking
    except Exception as e:
        db.rollback()
        logger.error(f"Booking creation failed: {e}")
        raise HTTPException(status_code=500, detail="Booking creation failed")


@app.get("/api/bookings/my", response_model=list[BookingOut], tags=["Bookings"])
def my_bookings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all bookings for current user"""
    bookings = db.query(Booking).filter(Booking.user_id == current_user.id).all()
    logger.info(f"Retrieved {len(bookings)} bookings for user {current_user.email}")
    return bookings


@app.get("/api/bookings/pnr/{pnr}", tags=["Bookings"])
def check_pnr(pnr: str, db: Session = Depends(get_db)):
    """Check booking status by PNR"""
    booking = db.query(Booking).filter(Booking.pnr == pnr).first()
    if not booking:
        logger.warning(f"PNR {pnr} not found")
        raise HTTPException(status_code=404, detail="PNR not found")
    return booking


@app.delete("/api/bookings/{booking_id}", tags=["Bookings"])
def cancel_booking(booking_id: int, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    """Cancel a booking"""
    try:
        booking = db.query(Booking).filter(Booking.id == booking_id, Booking.user_id == current_user.id).first()
        if not booking:
            logger.warning(f"Booking {booking_id} not found or unauthorized for user {current_user.email}")
            raise HTTPException(status_code=404, detail="Booking not found")
        booking.status = "CANCELLED"
        train = db.query(Train).filter(Train.id == booking.train_id).first()
        if train:
            train.available_seats += booking.num_passengers
        db.commit()
        logger.info(f"✓ Booking {booking_id} cancelled, PNR={booking.pnr}")
        return {"message": "Booking cancelled successfully", "pnr": booking.pnr}
    except Exception as e:
        db.rollback()
        logger.error(f"Cancellation failed: {e}")
        raise HTTPException(status_code=500, detail="Cancellation failed")


# ─── ADMIN ROUTES ────────────────────────────────────────────────────────────

@app.get("/api/admin/stats", tags=["Admin"])
def admin_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get system statistics (admin only)"""
    if not current_user.is_admin:
        logger.warning(f"Non-admin user {current_user.email} attempted to access stats")
        raise HTTPException(status_code=403, detail="Admin only")
    
    try:
        total_bookings = db.query(Booking).count()
        confirmed = db.query(Booking).filter(Booking.status == "CONFIRMED").count()
        cancelled = db.query(Booking).filter(Booking.status == "CANCELLED").count()
        total_revenue = db.query(Booking).filter(Booking.status == "CONFIRMED").all()
        revenue = sum(b.total_fare for b in total_revenue)
        
        stats = {
            "total_users": db.query(User).count(),
            "total_trains": db.query(Train).count(),
            "total_bookings": total_bookings,
            "confirmed_bookings": confirmed,
            "cancelled_bookings": cancelled,
            "total_revenue": revenue
        }
        logger.info(f"Admin stats retrieved by {current_user.email}")
        return stats
    except Exception as e:
        logger.error(f"Error retrieving admin stats: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving stats")


@app.get("/api/admin/bookings", response_model=list[BookingOut], tags=["Admin"])
def all_bookings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all bookings (admin only)"""
    if not current_user.is_admin:
        logger.warning(f"Non-admin user {current_user.email} attempted to access all bookings")
        raise HTTPException(status_code=403, detail="Admin only")
    return db.query(Booking).all()


@app.get("/api/admin/users", response_model=list[UserOut], tags=["Admin"])
def all_users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all users (admin only)"""
    if not current_user.is_admin:
        logger.warning(f"Non-admin user {current_user.email} attempted to access all users")
        raise HTTPException(status_code=403, detail="Admin only")
    return db.query(User).all()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
