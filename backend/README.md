# Agora MerchantHub Backend API

Backend service for Agora MerchantHub - Merchant Authentication & Profile Management.

## Tech Stack

- **Framework:** FastAPI
- **Database:** SQLite with SQLAlchemy ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt via passlib
- **Validation:** Pydantic

## Features

- ✅ JWT-based authentication (access & refresh tokens)
- ✅ Secure password hashing with bcrypt
- ✅ Merchant profile management
- ✅ Token refresh mechanism
- ✅ CORS support for frontend integration
- ✅ Auto-generated API documentation (OpenAPI/Swagger)

## Setup

### Prerequisites

- Python 3.9 or higher
- pip

### Installation

1. **Create and activate virtual environment:**

```bash
cd backend
python -m venv venv

# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

2. **Install dependencies:**

```bash
pip install -r requirements.txt
```

3. **Configure environment variables:**

```bash
cp .env.example .env
```

Edit `.env` and update the `JWT_SECRET_KEY` if needed (default is set for development).

4. **Seed the database:**

```bash
python scripts/seed_database.py
```

This creates a demo merchant account:
- Email: `demo@merchant.com`
- Password: `password123`

## Running the Server

### Development Mode

```bash
python run.py
```

The server will start at `http://localhost:8000` with auto-reload enabled.

## API Documentation

Once the server is running, access the interactive API documentation:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## API Endpoints

### POST /api/auth/login
Login with email and password.

### POST /api/auth/logout
Logout by revoking refresh token.

### POST /api/auth/refresh
Refresh access token using refresh token.

### GET /api/auth/me
Get current authenticated merchant's profile.

See full API documentation at http://localhost:8000/docs

## Testing

Test the API with the demo account:

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@merchant.com","password":"password123"}'
```

## Frontend Integration

This backend integrates with the Agora MerchantHub React frontend at `../frontend`.

To test full integration:

1. Start backend: `cd backend && python run.py`
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to http://localhost:3000/merchant/login
4. Login with demo@merchant.com / password123

## License

MIT
