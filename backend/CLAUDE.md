# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This is the **Agora MerchantHub Backend API** - a FastAPI-based REST API for merchant authentication and profile management.

**Current State:**
- ✅ FastAPI application scaffolded
- ✅ JWT-based authentication system (access & refresh tokens)
- ✅ SQLite database with SQLAlchemy ORM
- ✅ Merchant profile management endpoints
- ✅ Docker configuration for Cloud Run deployment
- ✅ CORS middleware configured
- ✅ Auto-generated OpenAPI documentation
- ✅ Health check endpoints for monitoring
- `README.md` - Setup and usage guide
- `DEPLOYMENT.md` - Google Cloud Run deployment guide

## Tech Stack

- **Framework:** FastAPI 0.115.6
- **Server:** Uvicorn with standard features (uvloop, websockets, httptools)
- **Database:** SQLite 3 with SQLAlchemy 2.0 ORM
- **Authentication:** JWT tokens via python-jose with cryptography
- **Password Hashing:** bcrypt via passlib
- **Validation:** Pydantic 2.10 with email validation
- **Settings:** pydantic-settings for environment configuration
- **Python Version:** 3.11+ (3.13 in development)

## Features

**Authentication & Security:**
- JWT-based authentication with separate access and refresh tokens
- Secure password hashing using bcrypt (rounds=12)
- Token refresh mechanism for session management
- Protected endpoints with dependency injection
- CORS middleware for frontend integration

**API Documentation:**
- Auto-generated OpenAPI 3.0 specification
- Interactive Swagger UI at `/docs`
- ReDoc documentation at `/redoc`

**Cloud-Ready:**
- Health check endpoints (`/health`, `/ready`)
- Multi-stage Docker build for optimized images
- Non-root user execution for security
- Cloud Run deployment configuration
- Environment-based configuration

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Settings and environment configuration
│   ├── database.py          # Database connection and session management
│   ├── dependencies.py      # Dependency injection functions
│   ├── models/              # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   └── merchant.py      # Merchant database model
│   ├── schemas/             # Pydantic models for request/response
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication schemas
│   │   └── merchant.py      # Merchant profile schemas
│   ├── routes/              # API route handlers
│   │   ├── __init__.py
│   │   └── auth.py          # Authentication endpoints
│   ├── services/            # Business logic layer
│   │   ├── __init__.py
│   │   └── auth_service.py  # Authentication service
│   └── utils/               # Utility functions
│       ├── __init__.py
│       ├── jwt.py           # JWT token creation and validation
│       └── security.py      # Password hashing utilities
├── scripts/
│   └── seed_database.py     # Database seeding script
├── tests/                   # Test directory (placeholder)
├── run.py                   # Development server runner
├── main.py                  # Alternative entry point
├── requirements.txt         # Python dependencies
├── Dockerfile               # Multi-stage Docker build
├── .env.example             # Environment variables template
├── .dockerignore            # Docker build exclusions
├── README.md                # Setup and usage documentation
├── DEPLOYMENT.md            # Cloud Run deployment guide
└── agora.db                 # SQLite database (pre-seeded)
```

## Architecture

### Models (`app/models/`)

SQLAlchemy ORM models representing database tables.

**Merchant Model:**
```python
class Merchant(Base):
    id: str              # Primary key (e.g., "user_demo123")
    email: str           # Unique, indexed
    hashed_password: str # bcrypt hashed
    merchant_name: str   # Full name
    store_name: str      # Store display name
    store_id: str        # Store identifier (e.g., "STORE001")
    role: str            # User role (default: "merchant")
    is_active: bool      # Account status (default: True)
    member_since: datetime # Account creation timestamp
    refresh_token: str   # Current refresh token (nullable)
    created_at: datetime # Record creation timestamp
    updated_at: datetime # Record update timestamp
```

### Schemas (`app/schemas/`)

Pydantic models for API request/response validation and serialization.

**Auth Schemas:**
- `LoginRequest` - Email and password for login
- `TokenResponse` - Access token, refresh token, token type, user data
- `RefreshRequest` - Refresh token for token renewal
- `UserResponse` - Merchant profile data (no sensitive fields)

**Merchant Schemas:**
- `MerchantBase` - Base merchant fields
- `MerchantCreate` - Fields for merchant creation
- `MerchantUpdate` - Fields for merchant updates
- `MerchantResponse` - Public merchant data

### Routes (`app/routes/`)

API endpoint handlers using FastAPI router pattern.

**Authentication Routes (`/api/auth`):**
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/logout` - Logout and revoke refresh token
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile (protected)

### Services (`app/services/`)

Business logic layer separating route handlers from implementation.

**AuthService:**
- `authenticate_merchant()` - Verify credentials
- `create_tokens()` - Generate access and refresh tokens
- `refresh_access_token()` - Validate refresh token and issue new access token
- `revoke_refresh_token()` - Invalidate refresh token on logout

### Utils (`app/utils/`)

Reusable utility functions.

**JWT Utils:**
- `create_access_token()` - Generate JWT access token (24h expiry)
- `create_refresh_token()` - Generate JWT refresh token (90d expiry)
- `verify_token()` - Validate and decode JWT token

**Security Utils:**
- `hash_password()` - Hash password with bcrypt
- `verify_password()` - Verify password against hash

### Dependencies (`app/dependencies.py`)

FastAPI dependency injection functions.

- `get_db()` - Database session dependency
- `get_current_user()` - Extract and validate JWT from Authorization header

## Development Commands

### Setup

```bash
# Create and activate virtual environment
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env to set JWT_SECRET_KEY

# Seed database with demo account
python scripts/seed_database.py
```

### Running the Server

**Development Mode (with hot-reload):**
```bash
python run.py
# Server starts at http://localhost:8000
```

**Direct Uvicorn:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Production Mode:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8080 --workers 4
```

### Testing

```bash
# Manual API testing with demo account
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@merchant.com","password":"password123"}'

# Health check
curl http://localhost:8000/health
```

## API Endpoints

### Public Endpoints

**Root:**
- `GET /` - API information and version

**Health Checks:**
- `GET /health` - Liveness probe (returns `{"status": "healthy"}`)
- `GET /ready` - Readiness probe (returns `{"status": "ready"}`)

**Documentation:**
- `GET /docs` - Swagger UI (interactive API documentation)
- `GET /redoc` - ReDoc (alternative documentation UI)
- `GET /openapi.json` - OpenAPI 3.0 specification

### Authentication Endpoints

**Login:**
```
POST /api/auth/login
Body: {"email": "string", "password": "string"}
Response: {
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "bearer",
  "user": {...}
}
```

**Logout:**
```
POST /api/auth/logout
Headers: Authorization: Bearer <access_token>
Response: {"message": "Logged out successfully"}
```

**Refresh Token:**
```
POST /api/auth/refresh
Body: {"refresh_token": "string"}
Response: {
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "bearer"
}
```

**Get Current User:**
```
GET /api/auth/me
Headers: Authorization: Bearer <access_token>
Response: {
  "id": "string",
  "email": "string",
  "merchant_name": "string",
  "store_name": "string",
  "store_id": "string",
  "role": "string",
  "member_since": "datetime"
}
```

## Database

**Type:** SQLite 3 (development) / PostgreSQL (production recommended)

**Connection:**
- Local: `sqlite:///./agora.db`
- Production: Configure `DATABASE_URL` for PostgreSQL on Cloud SQL

**Migrations:**
- Currently using SQLAlchemy's `create_all()` on startup
- For production, use Alembic for migrations

**Seeding:**
```bash
python scripts/seed_database.py
```

Creates demo merchant:
- **Email:** demo@merchant.com
- **Password:** password123
- **Store:** John's Store
- **Store ID:** STORE001

## Authentication Flow

### Login Flow

1. User submits email and password
2. Backend verifies credentials against hashed password
3. Backend generates access token (24h) and refresh token (90d)
4. Refresh token stored in database
5. Both tokens returned to client
6. Client stores tokens (localStorage or httpOnly cookies)
7. Client includes access token in Authorization header: `Bearer <token>`

### Token Refresh Flow

1. When access token expires, client sends refresh token
2. Backend validates refresh token against database
3. Backend generates new access token and refresh token
4. Old refresh token revoked, new one stored
5. New tokens returned to client

### Logout Flow

1. Client sends logout request with access token
2. Backend invalidates refresh token in database
3. Client discards stored tokens

## Configuration

### Environment Variables

**Database:**
- `DATABASE_URL` - Database connection string (default: `sqlite:///./agora.db`)

**JWT:**
- `JWT_SECRET_KEY` - Secret key for signing tokens (REQUIRED, min 32 chars)
- `JWT_ALGORITHM` - Algorithm for JWT (default: `HS256`)
- `ACCESS_TOKEN_EXPIRE_HOURS` - Access token lifetime (default: 24)
- `REFRESH_TOKEN_EXPIRE_DAYS` - Refresh token lifetime (default: 90)

**CORS:**
- `CORS_ORIGINS` - Comma-separated allowed origins (default: `http://localhost:3000,http://localhost:5173`)

**Server:**
- `HOST` - Server host (default: `0.0.0.0`)
- `PORT` - Server port (default: 8000, Cloud Run uses 8080)

### Configuration Loading

Settings loaded via pydantic-settings from:
1. Environment variables
2. `.env` file
3. Default values in `app/config.py`

## Docker & Deployment

### Docker Build

**Multi-stage Dockerfile optimized for production:**
- Stage 1: Builder - Install dependencies in virtual environment
- Stage 2: Runtime - Minimal image with only app code and venv
- Non-root user execution for security
- Pre-seeded database included in image

**Build Commands:**
```bash
# Build image
docker build -t agora-backend:latest .

# Run container
docker run -p 8080:8080 \
  -e JWT_SECRET_KEY="your-secret-key" \
  agora-backend:latest
```

### Cloud Run Deployment

See `DEPLOYMENT.md` for comprehensive Cloud Run deployment guide.

**Key Steps:**
1. Generate JWT secret key and store in Secret Manager
2. Build and push Docker image to Container Registry
3. Deploy to Cloud Run with environment variables
4. Configure CORS with frontend URL
5. Update frontend to use backend URL

**Production Considerations:**
- SQLite resets on container restart (use Cloud SQL for persistence)
- Set `--min-instances 0` for cost optimization (scales to zero)
- Use Secret Manager for JWT_SECRET_KEY
- Configure custom domain
- Enable Cloud CDN for static assets

## Frontend Integration

### Connection

Frontend at `/Users/justynlgh/Documents/agora/frontend` integrates with this backend.

**Local Development:**
1. Start backend: `cd backend && python run.py` (port 8000)
2. Start frontend: `cd frontend && npm run dev` (port 3000)
3. Login at http://localhost:3000/merchant/login
4. Use demo@merchant.com / password123

**CORS Configuration:**
- Development: `http://localhost:3000,http://localhost:5173`
- Production: Add deployed frontend URL to `CORS_ORIGINS`

### API Client Pattern

Frontend should implement:
- Axios/Fetch service with base URL configuration
- Interceptor for Authorization header injection
- Token refresh logic on 401 responses
- Logout on refresh token expiration

## Testing

### Manual Testing

**Interactive API Documentation:**
- Visit http://localhost:8000/docs
- Click "Authorize" button
- Login to get access token
- Use "Try it out" to test endpoints

**cURL Examples:**
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@merchant.com","password":"password123"}'

# Get user profile (replace <TOKEN>)
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"

# Refresh token
curl -X POST http://localhost:8000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"<REFRESH_TOKEN>"}'
```

### Automated Testing

**Test Directory:** `tests/` (currently placeholder)

**Recommended Tools:**
- pytest for test framework
- pytest-asyncio for async tests
- httpx for async HTTP client
- fakeredis for Redis mocking (if added)

## Security Best Practices

### Current Implementation

- ✅ Password hashing with bcrypt (rounds=12)
- ✅ JWT tokens with expiration
- ✅ Refresh token rotation on renewal
- ✅ Token validation on protected endpoints
- ✅ Non-root Docker user
- ✅ CORS middleware configured
- ✅ Environment-based secrets

### Production Recommendations

- [ ] Use HTTPS only (TLS termination at load balancer)
- [ ] Store JWT_SECRET_KEY in Secret Manager (not .env)
- [ ] Implement rate limiting (e.g., slowapi)
- [ ] Add request logging and monitoring
- [ ] Enable security headers (helmet-equivalent)
- [ ] Implement token blacklisting (Redis)
- [ ] Add input sanitization middleware
- [ ] Configure CSP headers
- [ ] Use Cloud SQL for production database
- [ ] Enable Cloud Armor for DDoS protection

## Recent Updates & Progress

### January 9, 2026

**Backend Authentication System (commit: 3bf5c29)**
- ✅ Implemented JWT-based authentication with FastAPI
- ✅ Created merchant model with SQLAlchemy
- ✅ Added password hashing with bcrypt
- ✅ Implemented token refresh mechanism
- ✅ Created authentication routes and services
- ✅ Added CORS middleware for frontend integration
- ✅ Configured environment-based settings

**Frontend Integration (commit: 41f9069)**
- ✅ Connected frontend to new authentication system
- ✅ Updated login flow to use JWT tokens
- ✅ Verified CORS configuration

**Docker Configuration (commits: 1a31cd6, 70e0eee)**
- ✅ Multi-stage Dockerfile for optimized builds
- ✅ Non-root user execution
- ✅ Pre-seeded database in image
- ✅ Health check endpoints
- ✅ Cloud Run deployment configuration

## Next Steps

### Inventory Management API

**Product Endpoints:**
- GET /api/products - List products with pagination, search, filter
- GET /api/products/{id} - Get single product
- POST /api/products - Create product (bulk import)
- PUT /api/products/{id} - Update product
- DELETE /api/products - Bulk delete products
- GET /api/products/export - Export products (CSV, Excel)

**Product Model:**
```python
class Product(Base):
    id: str              # UUID
    merchant_id: str     # Foreign key to merchant
    name: str            # Max 255 chars
    sku: str             # Unique per merchant, read-only after creation
    price: Decimal       # 2 decimal places
    quantity: int        # >= 0
    tags: JSON           # Array of strings
    image: str           # URL (optional)
    description: str     # Max 2000 chars (optional)
    created_at: datetime
    updated_at: datetime
```

### Real-Time Features

**Server-Sent Events (SSE):**
- Bulk import progress streaming
- Route: GET /api/products/import/stream
- Event types: IMPORT_START, IMPORT_PROGRESS, IMPORT_COMPLETE

**WebSocket:**
- Real-time inventory updates
- Multi-user collaboration
- Route: WS /ws/inventory

### Enhanced Security

- Implement rate limiting with slowapi
- Add Redis for token blacklisting
- Set up request logging
- Add API key authentication for service-to-service calls

### Infrastructure

- Set up Alembic for database migrations
- Add pytest test suite
- Configure CI/CD pipeline (GitHub Actions)
- Set up monitoring (Cloud Monitoring, Sentry)
- Implement structured logging
- Add performance profiling

### Database

- Migrate to PostgreSQL for production
- Set up Cloud SQL instance
- Implement connection pooling
- Add database backups
- Create read replicas for scaling

## Troubleshooting

### Common Issues

**Import Error: "No module named 'app'"**
- Ensure you're running from backend directory
- Activate virtual environment: `source venv/bin/activate`

**Database Locked Error:**
- SQLite doesn't handle concurrent writes well
- For production, use PostgreSQL

**CORS Error:**
- Check `CORS_ORIGINS` includes frontend URL
- Verify frontend is sending credentials

**JWT Decode Error:**
- Check JWT_SECRET_KEY matches between requests
- Verify token hasn't expired

**Port Already in Use:**
- Change PORT in .env
- Kill existing process: `lsof -ti:8000 | xargs kill`

## Resources

**FastAPI Documentation:** https://fastapi.tiangolo.com/
**SQLAlchemy 2.0 Docs:** https://docs.sqlalchemy.org/en/20/
**Pydantic V2 Docs:** https://docs.pydantic.dev/latest/
**JWT.io:** https://jwt.io/ (decode and inspect tokens)
**Python-JOSE Docs:** https://python-jose.readthedocs.io/
