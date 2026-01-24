# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This is the **Agora MerchantHub Backend API** - a FastAPI-based REST API for merchant authentication and profile management.

**Current State:**
- ✅ FastAPI application scaffolded
- ✅ JWT-based authentication system (access & refresh tokens)
- ✅ SQLite database with SQLAlchemy ORM
- ✅ Merchant profile management endpoints
- ✅ Product inventory management (CRUD, bulk import, bulk delete)
- ✅ AI product tagging (dummy implementation)
- ✅ **Catalogue ingestion system (PDF extraction with AI agent)**
- ✅ Image upload to Cloudflare R2
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
- **AI/ML:** LangChain 1.2.0, LangGraph 1.0.5, Google Gemini (langchain-google-genai 4.1.3)
- **Document Processing:** pypdfium2 5.3.0, pytesseract 0.3.13, Pillow 12.1.0
- **Storage:** Cloudflare R2 (boto3 1.35.0)
- **Python Version:** 3.11+ (3.13 in development)

## Features

**Authentication & Security:**
- JWT-based authentication with separate access and refresh tokens
- Secure password hashing using bcrypt (rounds=12)
- Token refresh mechanism for session management
- Protected endpoints with dependency injection
- CORS middleware for frontend integration

**Catalogue Ingestion (AI-Powered):**
- Upload PDF catalogues for automatic extraction
- AI agent extracts items with names, descriptions, sizes, colours
- Database staging area for review before product creation
- Cropped item images stored on Cloudflare R2
- Selective conversion of catalogue items to products
- Google Gemini-powered vision model for extraction

**Product Management:**
- Full CRUD operations with pagination, search, filtering
- Bulk import/export capabilities
- Image upload to Cloudflare R2
- AI product tagging (dummy implementation)

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
│   │   ├── merchant.py      # Merchant database model
│   │   ├── product.py       # Product database model
│   │   └── catalogue.py     # Catalogue & CatalogueItem models
│   ├── schemas/             # Pydantic models for request/response
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication schemas
│   │   ├── merchant.py      # Merchant profile schemas
│   │   ├── product.py       # Product schemas (CRUD, bulk, AI tagging)
│   │   └── catalogue.py     # Catalogue schemas (upload, items, conversion)
│   ├── routes/              # API route handlers
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── products.py      # Product endpoints
│   │   └── catalogues.py    # Catalogue ingestion endpoints
│   ├── services/            # Business logic layer
│   │   ├── __init__.py
│   │   ├── auth_service.py  # Authentication service
│   │   ├── product_service.py  # Product business logic
│   │   ├── storage_service.py  # Cloudflare R2 file storage
│   │   └── catalogue_service.py  # Catalogue processing & agent integration
│   └── utils/               # Utility functions
│       ├── __init__.py
│       ├── jwt.py           # JWT token creation and validation
│       └── security.py      # Password hashing utilities
├── agent/                   # AI Catalogue Ingestion Agent (separate module)
│   ├── config/
│   │   └── agent.yml        # Agent configuration
│   ├── src/
│   │   ├── agents/
│   │   │   ├── catalogue_ingestor.py  # Main ingestion agent
│   │   │   ├── schemas.py   # Agent-specific schemas
│   │   │   └── states.py    # LangGraph state definitions
│   │   ├── models/
│   │   │   └── utils.py     # Model loading utilities
│   │   ├── utils/
│   │   │   ├── yaml.py      # Config loading
│   │   │   └── image.py     # Image processing utilities
│   │   └── prompts/
│   │       └── templates.yml  # Prompt templates
│   └── main.py              # Agent entry point (3 public functions)
├── data/                    # Local data storage
│   ├── uploads/
│   │   └── catalogues/      # Temp PDF storage
│   ├── catalogues/          # Page images during processing
│   └── items/               # Cropped item images (temp)
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

**Catalogue Model:**
```python
class Catalogue(Base):
    id: str              # Primary key (UUID)
    merchant_id: str     # FK to merchant_info, CASCADE DELETE
    filename: str        # Original PDF filename
    file_url: str        # R2 URL for uploaded PDF
    status: str          # "processing" | "completed" | "failed"
    items_extracted: int # Number of items extracted
    processing_time: float # Processing duration in seconds
    error_message: str   # Error details if failed
    created_at: datetime
    updated_at: datetime
```

**CatalogueItem Model:**
```python
class CatalogueItem(Base):
    id: str              # Primary key (UUID)
    catalogue_id: str    # FK to catalogues, CASCADE DELETE
    merchant_id: str     # FK to merchant_info, CASCADE DELETE
    name: str            # Item name
    description: str     # Item description (nullable)
    sizes: JSON          # Array of size strings
    colours: JSON        # Array of colour strings
    page: int            # Page number in PDF
    image_url: str       # R2 URL for cropped item image
    bbox_data: JSON      # {ymin, xmin, ymax, xmax}
    product_id: str      # FK to product_inventory, SET NULL (nullable)
    is_converted: bool   # Whether converted to product
    created_at: datetime
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

**Catalogue Schemas:**
- `CatalogueResponse` - Single catalogue with processing status
- `CatalogueListResponse` - Paginated list of catalogues
- `CatalogueItemResponse` - Single item with image, sizes, colours
- `CatalogueItemListResponse` - Paginated items + catalogue info
- `CreateProductsRequest` - Item IDs, default price/quantity, SKU options
- `CreateProductsResponse` - Created count and errors

### Routes (`app/routes/`)

API endpoint handlers using FastAPI router pattern.

**Authentication Routes (`/api/auth`):**
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/logout` - Logout and revoke refresh token
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile (protected)

**Catalogue Routes (`/api/catalogues`):**
- `POST /api/catalogues/upload` - Upload & process PDF catalogue
- `GET /api/catalogues` - List catalogues with pagination
- `GET /api/catalogues/{id}` - Get single catalogue details
- `GET /api/catalogues/{id}/items` - Get catalogue items with pagination
- `POST /api/catalogues/{id}/create-products` - Create products from selected items
- `DELETE /api/catalogues/{id}` - Delete catalogue and all items

### Services (`app/services/`)

Business logic layer separating route handlers from implementation.

**AuthService:**
- `authenticate_merchant()` - Verify credentials
- `create_tokens()` - Generate access and refresh tokens
- `refresh_access_token()` - Validate refresh token and issue new access token
- `revoke_refresh_token()` - Invalidate refresh token on logout

**CatalogueService:**
- `upload_and_ingest_catalogue()` - Upload PDF, call agent, store items in staging
- `get_catalogues()` - Get paginated list of catalogues for merchant
- `get_catalogue_by_id()` - Get single catalogue with ownership verification
- `get_catalogue_items()` - Get paginated items from catalogue
- `create_products_from_items()` - Convert selected items to products
- `delete_catalogue()` - Delete catalogue and cleanup R2 storage

**Agent Integration:**
- Agent located in `backend/agent/` (separate module)
- Service layer imports agent's public functions from `agent/main.py`
- Agent uses LangGraph for state management and Google Gemini for vision
- `ingest_catalogue()` - Synchronous PDF ingestion
- `ingest_catalogue_stream()` - Async streaming ingestion (future use)
- `parse_final_agent_state()` - Extract items with cropped images

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

### Product Inventory Endpoints

**List Products:**
```
GET /api/products
Headers: Authorization: Bearer <access_token>
Query Parameters:
  - page: int (default: 1)
  - limit: int (default: 20, max: 100)
  - search: string (search by name or SKU)
  - tags: string (comma-separated tag filter)
  - sortBy: string (name, sku, price, quantity, createdAt)
  - sortOrder: string (asc, desc)
Response: {
  "success": true,
  "data": {
    "items": [Product...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

**Get Single Product:**
```
GET /api/products/{product_id}
Headers: Authorization: Bearer <access_token>
Response: {
  "success": true,
  "data": Product
}
```

**Create Product:**
```
POST /api/products
Headers: Authorization: Bearer <access_token>
Body: {
  "name": "string",
  "sku": "string",
  "price": 19.99,
  "quantity": 100,
  "tags": ["Electronics", "Gadgets"],
  "image": "https://...",
  "description": "Product description"
}
Response: {
  "success": true,
  "data": Product
}
```

**Update Product:**
```
PUT /api/products/{product_id}
Headers: Authorization: Bearer <access_token>
Body: {
  "name": "string",
  "price": 24.99,
  "quantity": 75,
  "tags": ["Electronics", "New"],
  "image": "https://...",
  "description": "Updated description"
}
Response: {
  "success": true,
  "data": Product
}
```

**Bulk Import Products:**
```
POST /api/products/bulk
Headers: Authorization: Bearer <access_token>
Body: {
  "products": [ProductCreate...],
  "skipDuplicates": false
}
Response: {
  "success": true,
  "data": {
    "created": 50,
    "updated": 10,
    "skipped": 2,
    "errors": []
  }
}
```

**Bulk Delete Products:**
```
DELETE /api/products/bulk
Headers: Authorization: Bearer <access_token>
Body: {
  "ids": ["uuid1", "uuid2", ...]
}
Response: {
  "success": true,
  "data": {
    "deleted": 5
  }
}
```

**Upload Product Image:**
```
POST /api/products/upload-image
Headers: Authorization: Bearer <access_token>
Content-Type: multipart/form-data
Body: file (jpg, png, webp, gif - max 5MB)
Response: {
  "success": true,
  "data": {
    "url": "https://...",
    "filename": "..."
  }
}
```

**AI Product Tagging (Dummy):**
```
POST /api/products/ai-tags
Headers: Authorization: Bearer <access_token>
Body: {
  "productIds": ["uuid1", "uuid2", ...]
}
Response: {
  "success": true,
  "data": {
    "processed": 5,
    "results": [
      {
        "productId": "uuid1",
        "suggestedTags": ["Electronics", "Modern", "Premium"],
        "applied": false
      }
    ]
  }
}
```
Note: This is a dummy implementation that returns random tags from predefined categories (material, style, audience). Replace with actual AI service integration in production.

### Catalogue Ingestion Endpoints

**Upload Catalogue:**
```
POST /api/catalogues/upload
Headers: Authorization: Bearer <access_token>
Content-Type: multipart/form-data
Body: file (PDF, max 50MB)
Response: {
  "success": true,
  "data": {
    "id": "uuid",
    "filename": "catalogue.pdf",
    "fileUrl": "https://r2.../catalogues/uuid.pdf",
    "status": "completed",
    "itemsExtracted": 25,
    "processingTime": 45.2,
    "createdAt": "2026-01-18T10:30:00Z"
  }
}
```

**List Catalogues:**
```
GET /api/catalogues?page=1&limit=20
Headers: Authorization: Bearer <access_token>
Response: {
  "success": true,
  "data": {
    "items": [Catalogue...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

**Get Catalogue Items:**
```
GET /api/catalogues/{id}/items?page=1&limit=20
Headers: Authorization: Bearer <access_token>
Response: {
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Cotton T-Shirt",
        "description": "Comfortable cotton tee",
        "sizes": ["S", "M", "L", "XL"],
        "colours": ["Red", "Blue", "White"],
        "page": 1,
        "imageUrl": "https://r2.../catalogue-items/uuid.jpg",
        "isConverted": false
      }
    ],
    "catalogue": {Catalogue},
    "pagination": {...}
  }
}
```

**Create Products from Items:**
```
POST /api/catalogues/{id}/create-products
Headers: Authorization: Bearer <access_token>
Body: {
  "itemIds": ["uuid1", "uuid2"],
  "defaultPrice": 29.99,
  "defaultQuantity": 100,
  "generateSku": true,
  "skuPrefix": "CAT-"
}
Response: {
  "success": true,
  "data": {
    "created": 2,
    "errors": []
  }
}
```
Note: Products are created with tags merged from item sizes + colours. Items marked as `isConverted: true` after creation.

**Delete Catalogue:**
```
DELETE /api/catalogues/{id}
Headers: Authorization: Bearer <access_token>
Response: {
  "success": true,
  "data": {
    "deleted": true
  }
}
```
Note: Deletes catalogue, all items, and cleans up R2 storage (PDF + item images).

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

**Google AI:**
- `GOOGLE_API_KEY` - Google Gemini API key for catalogue extraction (REQUIRED for catalogue ingestion)

**Catalogue Processing:**
- `CATALOGUE_UPLOAD_DIR` - Directory for temp PDF storage (default: `data/uploads/catalogues`)
- `TESSERACT_PATH` - Path to tesseract binary (default: `/usr/bin/tesseract`)

**Cloudflare R2:**
- `R2_ACCOUNT_ID` - R2 account ID
- `R2_ACCESS_KEY_ID` - R2 access key
- `R2_SECRET_ACCESS_KEY` - R2 secret key
- `R2_BUCKET_NAME` - Bucket name (default: `agora-product-images`)
- `R2_PUBLIC_URL` - Public URL for R2 bucket

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

### January 11, 2026

**Product Inventory Management System**
- ✅ Implemented full CRUD operations for products
- ✅ Added product model with SQLAlchemy (id, merchant_id, name, sku, price, quantity, tags, image, description)
- ✅ Created product schemas for request/response validation
- ✅ Implemented bulk import with upsert logic (create or update based on SKU)
- ✅ Added bulk delete functionality
- ✅ Implemented pagination, search, filtering, and sorting
- ✅ Added image upload to Cloudflare R2 storage
- ✅ Created product service layer with business logic

**AI Product Tagging (Dummy Implementation)**
- ✅ Added POST /api/products/ai-tags endpoint
- ✅ Implemented mock AI tag generation (random tags from predefined categories)
- ✅ Created AITaggingRequest, AITaggingResult, AITaggingResponse schemas
- ✅ Added generate_ai_tags_for_products() service function
- ✅ Returns suggested tags for up to 100 products per request
- ✅ Categories: material (Cotton, Leather, etc.), style (Modern, Vintage, etc.), audience (Men, Women, etc.)
- 📝 Note: Replace with actual AI service (OpenAI, Anthropic, etc.) for production use

### January 18, 2026

**Catalogue Ingestion System (AI-Powered)**
- ✅ Integrated catalogue extraction agent into FastAPI backend
- ✅ Added dependencies: LangChain 1.2.0, LangGraph 1.0.5, langchain-google-genai 4.1.3
- ✅ Added document processing: pypdfium2, pytesseract, Pillow
- ✅ Created Catalogue and CatalogueItem database models
- ✅ Implemented database staging area workflow (no CSV files needed)
- ✅ Created catalogue schemas with camelCase API responses
- ✅ Implemented catalogue_service with agent integration
- ✅ Created 6 catalogue API endpoints (upload, list, get, get items, create products, delete)
- ✅ Agent integration via service layer (agent kept in `backend/agent/`)
- ✅ Items extracted with name, description, sizes, colours, bounding boxes
- ✅ Cropped item images uploaded to R2 storage
- ✅ Selective product creation from catalogue items
- ✅ Tags merged from sizes + colours during product creation
- ✅ Proper merchant isolation and ownership verification
- 📝 Requires: GOOGLE_API_KEY environment variable for Gemini model

**Catalogue Workflow:**
1. Merchant uploads PDF → Agent extracts items → Stored in `catalogue_items` table
2. Merchant reviews items via API (database staging area)
3. Merchant selects items, sets price/quantity → Products created
4. Items marked as `is_converted: true` after product creation

**Architecture Decisions:**
- Agent remains in `backend/agent/` (no renaming)
- Service layer translates agent output to business objects
- Database-backed staging (CSV-like structure) instead of actual CSV files
- 3-layer architecture maintained (routes → services → models)
- R2 storage for PDFs (`catalogues/`) and item images (`catalogue-items/`)

## Next Steps

### AI Product Tagging - Production Implementation

**Current State:** Dummy implementation with random tags from predefined categories

**Production Requirements:**
- Integrate with AI service (OpenAI GPT-4, Anthropic Claude, or custom model)
- Implement proper prompt engineering for product categorization
- Add confidence scores for tag suggestions
- Implement tag validation and filtering
- Add rate limiting for AI API calls
- Cache common product patterns
- Handle batch processing for large imports
- Add user feedback loop for tag quality improvement

**Recommended AI Service Integration:**
```python
# Example OpenAI integration
async def generate_ai_tags_for_products(db, merchant_id, product_ids):
    products = [get_product_by_id(db, merchant_id, pid) for pid in product_ids]

    # Batch products for AI processing
    batch_results = []
    for product in products:
        prompt = f"""Analyze this product and suggest 3-5 relevant tags:
        Name: {product.name}
        Description: {product.description}

        Categories: material, style, audience, category
        Return JSON: {{"tags": ["tag1", "tag2", ...]}}
        """

        response = await openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )

        suggested_tags = parse_ai_response(response)
        batch_results.append({
            "productId": product.id,
            "suggestedTags": suggested_tags,
            "applied": False
        })

    return {"processed": len(batch_results), "results": batch_results}
```

### Enhanced Product Features

**Product Endpoints to Add:**
- GET /api/products/export - Export products (CSV, Excel)
- GET /api/products/stats - Get inventory statistics and analytics
- POST /api/products/bulk-update - Bulk update specific fields

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

**Bcrypt Version Warning:**
- Warning: "(trapped) error reading bcrypt version"
- This is harmless - compatibility issue between passlib 1.7.4 and bcrypt 4.x
- Passlib falls back to other version detection methods
- No action required, does not affect functionality

**Catalogue Processing Errors:**
- **"ModuleNotFoundError: No module named 'PIL'"**
  - Install dependencies: `pip install -r requirements.txt`
  - Ensure virtual environment is activated
- **"GOOGLE_API_KEY not set"**
  - Add `GOOGLE_API_KEY=your_key` to `.env` file
  - Get API key from Google AI Studio
- **"Tesseract not found"**
  - Install tesseract: `brew install tesseract` (macOS)
  - Update `TESSERACT_PATH` in `.env` if needed
- **"PDF processing failed"**
  - Check PDF is not password-protected or corrupted
  - Verify PDF size is under 50MB
  - Check agent logs for detailed error messages

## Resources

**FastAPI Documentation:** https://fastapi.tiangolo.com/
**SQLAlchemy 2.0 Docs:** https://docs.sqlalchemy.org/en/20/
**Pydantic V2 Docs:** https://docs.pydantic.dev/latest/
**JWT.io:** https://jwt.io/ (decode and inspect tokens)
**Python-JOSE Docs:** https://python-jose.readthedocs.io/
