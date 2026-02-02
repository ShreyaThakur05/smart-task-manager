#!/bin/bash

echo "🚀 Starting deployment process..."

# Check if .env.local exists
if [ ! -f "client/.env.local" ]; then
    echo "❌ .env.local not found. Copying from .env.example..."
    cp client/.env.example client/.env.local
    echo "⚠️  Please update client/.env.local with your actual credentials"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
cd client && npm install

# Build the project
echo "🔨 Building project..."
npm run build

echo "✅ Build completed successfully!"
echo "🌐 Ready for deployment to Vercel, Netlify, or any static hosting"
echo ""
echo "To deploy to Vercel:"
echo "  npx vercel --prod"
echo ""
echo "To deploy to Netlify:"
echo "  Upload the .next folder to Netlify"