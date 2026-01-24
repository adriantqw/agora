@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo Agora MerchantHub Backend Setup
echo ==========================================
echo.

REM Check if uv is installed
where uv >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X uv is not installed.
    echo.
    echo Please install uv first:
    echo   pip install uv
    echo.
    echo Or download from: https://github.com/astral-sh/uv
    echo.
    exit /b 1
)

echo + uv is installed
echo.

REM Check Python version
echo Checking Python version...
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo + Python %PYTHON_VERSION% detected
echo.

REM Create virtual environment
echo Creating virtual environment...
cd agent
uv venv
if %ERRORLEVEL% NEQ 0 (
    echo X Failed to create virtual environment
    exit /b 1
)
echo + Virtual environment created at agent\.venv
echo.

REM Install dependencies (use copy mode on Windows to avoid hardlink issues)
echo Installing dependencies...
uv sync --link-mode=copy
if %ERRORLEVEL% NEQ 0 (
    echo X Failed to install dependencies
    exit /b 1
)
echo + Dependencies installed
echo.

cd ..

REM Setup environment variables
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env >nul
    echo + .env file created
    echo.
    echo WARNING: Edit backend\.env and add your API keys:
    echo    - GOOGLE_API_KEY ^(required for catalogue processing^)
    echo    - R2 credentials ^(if using Cloudflare R2 storage^)
    echo    - TESSERACT_PATH ^(default: C:\Program Files\Tesseract-OCR\tesseract.exe^)
    echo.
) else (
    echo + .env file already exists
    echo.
)

REM Seed database
echo Seeding database...
call agent\.venv\Scripts\activate.bat
python scripts\seed_database.py
if %ERRORLEVEL% NEQ 0 (
    echo X Failed to seed database
    exit /b 1
)
echo + Database seeded with demo account
echo.

echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo.
echo 1. Install Tesseract OCR ^(required for catalogue processing^):
echo    - Download: https://github.com/UB-Mannheim/tesseract/wiki
echo    - Install to: C:\Program Files\Tesseract-OCR
echo.
echo 2. Update TESSERACT_PATH in .env if installed elsewhere
echo    - Default: C:\Program Files\Tesseract-OCR\tesseract.exe
echo.
echo 3. Add your GOOGLE_API_KEY to .env
echo    - Get it from: https://makersuite.google.com/app/apikey
echo.
echo 4. Start the development server:
echo    cd backend
echo    agent\.venv\Scripts\activate.bat
echo    python run.py
echo.
echo 5. Access the API at http://localhost:8000/docs
echo.
echo Demo account:
echo   Email: demo@merchant.com
echo   Password: password123
echo.

endlocal
