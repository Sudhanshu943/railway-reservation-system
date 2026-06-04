# Railway Reservation System

A full-stack railway ticket booking application built with **Next.js** (frontend) and **FastAPI** (backend). Users can search trains, view seat availability, make bookings, check PNR status, and manage their reservations.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, Axios |
| Backend | FastAPI, Uvicorn, SQLAlchemy 2.0 |
| Database | PostgreSQL (Neon DB) |
| Auth | JWT + Google OAuth |

---

## Prerequisites

- **Node.js** >= 18.x
- **Python** >= 3.12
- **PostgreSQL** (or the project uses Neon DB by default)
- **pip**, **npm**

---

## Local Installation & Setup

### 1. Clone the repository

```bash
git clone <https://github.com/Sudhanshu943/railway-reservation-system.git>
cd railway-reservation-system
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<database>
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
ALLOWED_ORIGINS=http://localhost:3000
```

Start the backend server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

> On first run, tables are auto-created and 7 sample trains are seeded. An admin user is also created:  
> **Email:** `admin@railway.com` | **Password:** `admin123`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file inside `frontend/`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

Start the frontend dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Project Structure

```
railway-reservation-system/
├── backend/
│   ├── main.py          # FastAPI app & routes
│   ├── database.py      # SQLAlchemy models
│   ├── auth.py          # JWT & OAuth helpers
│   ├── migrate.py       # DB migration scripts
│   ├── requirements.txt
│   └── .env             # Backend secrets & DB config
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js pages (login, signup, booking, etc.)
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Auth & Toast state
│   │   ├── lib/         # API client
│   │   └── data/        # Static train/route/feature data
│   ├── package.json
│   └── .env.local       # Frontend env vars
└── README.md
```

---

## Key Features

- Search trains by source, destination, and date
- View seat availability and fare details
- User registration and login (email/password + Google OAuth)
- Book tickets and receive PNR
- View booking history
- Check PNR status
- Admin dashboard for managing trains and bookings

---

## API Endpoints (Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login with credentials |
| POST | `/api/auth/google-login` | Google OAuth login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/trains` | List all trains |
| GET | `/api/trains/search` | Search trains by route |
| GET | `/api/trains/{id}/availability` | Seat availability |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/my` | User bookings |
| GET | `/api/bookings/pnr/{pnr}` | PNR status |
| DELETE | `/api/bookings/{id}` | Cancel booking |
