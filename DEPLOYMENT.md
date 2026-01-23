# Smart Task Management - Production Deployment Guide

## Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account or MongoDB instance
- Domain name (optional but recommended)

## Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.production .env.local
   ```

2. **Configure environment variables:**
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Generate a secure random string (32+ characters)
   - `NEXT_PUBLIC_BASE_URL`: Your production domain
   - `NEXT_PUBLIC_GEMINI_API_KEY`: Google Gemini API key (optional)

## Database Setup

1. **Create MongoDB Atlas cluster** (recommended):
   - Go to https://cloud.mongodb.com
   - Create new cluster
   - Add database user
   - Whitelist IP addresses
   - Get connection string

2. **Database collections will be created automatically:**
   - `users` - User accounts
   - `userdata` - User tasks and lists

## Deployment Options

### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Option 2: Netlify
```bash
npm run build
# Upload dist folder to Netlify
```

### Option 3: Docker
```bash
docker build -t smart-tasks .
docker run -p 3000:3000 smart-tasks
```

### Option 4: Traditional Server
```bash
npm run build
npm start
```

## Security Checklist

- [ ] Strong JWT_SECRET (32+ random characters)
- [ ] MongoDB connection uses authentication
- [ ] HTTPS enabled in production
- [ ] Environment variables secured
- [ ] CORS configured properly
- [ ] Rate limiting implemented (optional)

## Performance Optimizations

- [ ] Enable gzip compression
- [ ] Configure CDN for static assets
- [ ] Set up database indexing
- [ ] Enable caching headers
- [ ] Monitor application performance

## Monitoring

- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Configure uptime monitoring
- [ ] Set up database monitoring
- [ ] Enable application logs

## Backup Strategy

- [ ] Automated MongoDB backups
- [ ] Environment variable backup
- [ ] Code repository backup
- [ ] Regular backup testing