https://github.com/ShreyaThakur05/smart-task-manager# 🚀 GitHub Deployment Guide

## 📋 Pre-deployment Checklist

### 1. Clean Up Sensitive Data
```bash
# Remove your API key from .env.local (already in .gitignore)
# The .env.example file shows what keys are needed
```

### 2. Remove Development Files
```bash
# Delete build artifacts
rm -rf client/.next
rm -rf client/node_modules

# Remove unnecessary directories (if they exist)
rm -rf server docs shared
rm -rf client/components client/hooks client/pages client/store client/styles client/utils
```

## 🔧 Setup Repository

### 1. Initialize Git Repository
```bash
cd to_do_list
git init
git add .
git commit -m "Initial commit: Smart Task Management Platform"
```

### 2. Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "New Repository"
3. Name: `smart-task-manager` (or your preferred name)
4. Description: `AI-powered task management with drag & drop interface`
5. Keep it **Public** or **Private** (your choice)
6. Don't initialize with README (we already have one)

### 3. Connect Local to GitHub
```bash
# Replace YOUR_USERNAME and YOUR_REPO_NAME
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## 🌐 Deploy to Vercel

### 1. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/in with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Select the `client` folder as root directory

### 2. Configure Environment Variables
In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add: `NEXT_PUBLIC_GEMINI_API_KEY` = `your_actual_api_key`
3. Save and redeploy

### 3. Deploy
- Vercel will auto-deploy on every push to main branch
- Your app will be live at: `https://your-project-name.vercel.app`

## 🔒 Security Best Practices

### ✅ What's Safe to Commit
- All source code files
- Package.json files
- README and documentation
- .env.example (template file)

### ❌ Never Commit
- .env.local (actual API keys)
- node_modules/
- .next/ build files
- Personal information

### 🛡️ Additional Security
1. **Regenerate API Key**: Since your Gemini key was exposed, create a new one:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create new API key
   - Update in Vercel environment variables

2. **Enable Branch Protection** (optional):
   - GitHub repo → Settings → Branches
   - Add rule for `main` branch
   - Require pull request reviews

## 📁 Final Project Structure
```
smart-task-manager/
├── client/                 # Next.js app
│   ├── app/               # App router
│   ├── .env.example       # Environment template
│   └── package.json       # Dependencies
├── .gitignore             # Git ignore rules
└── README.md              # Project documentation
```

## 🎉 You're Done!

Your task management app is now:
- ✅ Safely stored on GitHub
- ✅ Deployed to Vercel
- ✅ API keys secured
- ✅ Ready for collaboration

Share your live app URL with others! 🚀