# Smart Task Management - Production Deployment Guide

## Prerequisites
- Node.js 18+ installed
- Supabase account and project
- Domain name (optional but recommended)

## Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure environment variables:**
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `NEXT_PUBLIC_GEMINI_API_KEY`: Google Gemini API key (optional)
   - `NEXT_PUBLIC_BASE_URL`: Your production domain

## Database Setup

1. **Create Supabase project:**
   - Go to https://supabase.com
   - Create new project
   - Get your project URL and anon key

2. **Database tables will be created automatically via Supabase client**

## Deployment Options

### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Option 2: Netlify
```bash
npm run build
# Upload .next folder to Netlify
```

### Option 3: Docker
```bash
docker build -t smart-tasks .
docker run -p 3000:3000 smart-tasks
```

## Security Checklist

- [ ] Supabase RLS (Row Level Security) enabled
- [ ] Environment variables secured
- [ ] HTTPS enabled in production
- [ ] CORS configured properly
- [ ] Rate limiting implemented (optional)

## Performance Optimizations

- [ ] Enable gzip compression
- [ ] Configure CDN for static assets
- [ ] Set up Supabase indexing
- [ ] Enable caching headers
- [ ] Monitor application performance

## Monitoring

- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Configure uptime monitoring
- [ ] Set up Supabase monitoring
- [ ] Enable application logs

## Backup Strategy

- [ ] Automated Supabase backups
- [ ] Environment variable backup
- [ ] Code repository backup
- [ ] Regular backup testing