# Agora MerchantHub Backend API

Backend service for Agora MerchantHub - Merchant Authentication, Profile Management & AI-Powered Catalogue Processing.

## Tech Stack

- **Framework:** FastAPI
- **Database:** SQLite with SQLAlchemy ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt via passlib
- **Validation:** Pydantic
- **AI Agent:** LangGraph with Google Gemini
- **Package Manager:** uv (modern Python package installer)

## Features

- ✅ JWT-based authentication (access & refresh tokens)
- ✅ Secure password hashing with bcrypt
- ✅ Merchant profile management
- ✅ Token refresh mechanism
- ✅ CORS support for frontend integration
- ✅ Auto-generated API documentation (OpenAPI/Swagger)
- ✅ AI-powered catalogue PDF processing with OCR
- ✅ Product image extraction and storage (Cloudflare R2)

## Setup

### Prerequisites

- **Python 3.11 or higher**
- **uv** - Modern Python package installer ([installation guide](https://github.com/astral-sh/uv))
- **Tesseract OCR** - Required for PDF catalogue processing

### Quick Setup (Recommended)

Use the automated setup script for your platform:

**On Windows:**
```bash
cd backend
setup.bat
```

**On macOS/Linux:**
```bash
cd backend
./setup.sh
```

These scripts will:
1. Check for uv installation
2. Create a virtual environment
3. Install all dependencies
4. Create `.env` file from template
5. Seed the database with a demo account

### Manual Setup

If you prefer to set up manually:

1. **Install uv (if not already installed):**

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
pip install uv

# Or with pipx
pipx install uv
```

2. **Create virtual environment and install dependencies:**

```bash
cd backend
uv venv
uv sync
```

3. **Activate virtual environment:**

```bash
# On macOS/Linux:
source .venv/bin/activate

# On Windows:
.venv\Scripts\activate
```

4. **Configure environment variables:**

```bash
cp .env.example .env
```

Edit `.env` and configure:
- `GOOGLE_API_KEY` - **Required** for catalogue processing ([Get API key](https://makersuite.google.com/app/apikey))
- `TESSERACT_PATH` - Path to Tesseract executable (OS-specific, see below)
- `R2_*` - Cloudflare R2 credentials (optional, for image storage)
- `JWT_SECRET_KEY` - Generate a secure key for production

5. **Install Tesseract OCR:**

**Windows:**
- Download from: https://github.com/UB-Mannheim/tesseract/wiki
- Default install path: `C:\Program Files\Tesseract-OCR\tesseract.exe`
- Update `TESSERACT_PATH` in `.env` if installed elsewhere

**macOS:**
```bash
brew install tesseract
# Default path: /opt/homebrew/bin/tesseract or /usr/local/bin/tesseract
```

**Linux:**
```bash
sudo apt-get install tesseract-ocr
# Default path: /usr/bin/tesseract
```

6. **Seed the database:**

```bash
python scripts/seed_database.py
```

This creates a demo merchant account:
- Email: `demo@merchant.com`
- Password: `password123`

## Running the Server

### Development Mode

Make sure your virtual environment is activated, then:

```bash
# From backend directory
python run.py
```

The server will start at `http://localhost:8000` with auto-reload enabled.

**Note:** If you used the setup script, activate the virtual environment first:

```bash
# macOS/Linux
source .venv/bin/activate

# Windows
.venv\Scripts\activate
```

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

### Test Authentication API

Test the API with the demo account:

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@merchant.com","password":"password123"}'
```

### Test Catalogue Agent

Test the AI catalogue processing agent:

```bash
cd agent
python tests/test_catalogue_ingestor.py --pdf_path /path/to/your/catalogue.pdf
```

This will process a PDF catalogue and extract product items with images.

## Frontend Integration

This backend integrates with the Agora MerchantHub React frontend at `../frontend`.

To test full integration:

1. Start backend: `cd backend && python run.py`
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to http://localhost:3000/merchant/login
4. Login with demo@merchant.com / password123

## Docker Deployment

Build and run with Docker:

```bash
cd backend

# Build image
docker build -t agora-backend .

# Run container
docker run -p 8000:8080 \
  -e GOOGLE_API_KEY=your_api_key_here \
  -e R2_ACCOUNT_ID=your_r2_account_id \
  -e R2_ACCESS_KEY_ID=your_r2_key \
  -e R2_SECRET_ACCESS_KEY=your_r2_secret \
  agora-backend
```

The Docker image includes:
- All Python dependencies installed via uv
- Tesseract OCR pre-installed
- Pre-seeded database with demo account

## Troubleshooting

### Tesseract Not Found

If you get errors about Tesseract not being found:

1. Verify Tesseract is installed:
   ```bash
   # macOS/Linux
   which tesseract

   # Windows
   where tesseract
   ```

2. Update `TESSERACT_PATH` in `.env` with the correct path

### Missing GOOGLE_API_KEY

Catalogue processing requires a Google Gemini API key:

1. Get your API key from: https://makersuite.google.com/app/apikey
2. Add it to `.env`: `GOOGLE_API_KEY=your_key_here`

### Python Version Mismatch

This project requires Python 3.11 or higher:

```bash
python --version  # Should be 3.11+
```

If you have multiple Python versions, you may need to use `python3.11` or specify the version when creating the virtual environment.

### uv Command Not Found

Install uv:

```bash
# With pip
pip install uv

# Or with pipx
pipx install uv

# Or with curl (macOS/Linux)
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## License

MIT
