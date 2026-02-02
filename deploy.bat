@echo off
echo 🚀 Starting deployment process...

REM Check if .env.local exists
if not exist "client\.env.local" (
    echo ❌ .env.local not found. Copying from .env.example...
    copy "client\.env.example" "client\.env.local"
    echo ⚠️  Please update client\.env.local with your actual credentials
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
cd client
npm install

REM Build the project
echo 🔨 Building project...
npm run build

echo ✅ Build completed successfully!
echo 🌐 Ready for deployment to Vercel, Netlify, or any static hosting
echo.
echo To deploy to Vercel:
echo   npx vercel --prod
echo.
echo To deploy to Netlify:
echo   Upload the .next folder to Netlify
pause