#!/bin/bash
set -e

echo "=========================================="
echo "Agora MerchantHub Backend Setup"
echo "=========================================="
echo ""

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "❌ uv is not installed."
    echo ""
    echo "Please install uv first:"
    echo "  curl -LsSf https://astral.sh/uv/install.sh | sh"
    echo ""
    echo "Or with pip:"
    echo "  pip install uv"
    echo ""
    exit 1
fi

echo "✓ uv is installed"
echo ""

# Check Python version
echo "Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
required_version="3.11"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Python $required_version or higher is required. Found: $python_version"
    exit 1
fi

echo "✓ Python $python_version detected"
echo ""

# Create virtual environment at backend root
echo "Creating virtual environment..."
uv venv
echo "✓ Virtual environment created at .venv"
echo ""

# Install dependencies
echo "Installing dependencies..."
uv sync
echo "✓ Dependencies installed"
echo ""

# Setup environment variables
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit backend/.env and add your API keys:"
    echo "   - GOOGLE_API_KEY (required for catalogue processing)"
    echo "   - R2 credentials (if using Cloudflare R2 storage)"
    echo ""
else
    echo "✓ .env file already exists"
    echo ""
fi

# Seed database
echo "Seeding database..."
source .venv/bin/activate
python scripts/seed_database.py
echo "✓ Database seeded with demo account"
echo ""

echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Install Tesseract OCR (required for catalogue processing):"
echo "   - macOS: brew install tesseract"
echo "   - Linux: sudo apt-get install tesseract-ocr"
echo ""
echo "2. Update TESSERACT_PATH in .env if needed"
echo "   - macOS: /opt/homebrew/bin/tesseract or /usr/local/bin/tesseract"
echo "   - Linux: /usr/bin/tesseract"
echo ""
echo "3. Add your GOOGLE_API_KEY to .env"
echo "   - Get it from: https://makersuite.google.com/app/apikey"
echo ""
echo "4. Start the development server:"
echo "   cd backend"
echo "   source .venv/bin/activate"
echo "   python run.py"
echo ""
echo "5. Access the API at http://localhost:8000/docs"
echo ""
echo "Demo account:"
echo "  Email: demo@merchant.com"
echo "  Password: password123"
echo ""
