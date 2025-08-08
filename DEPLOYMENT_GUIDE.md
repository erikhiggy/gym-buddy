# Gym Buddy - Production Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Option 1: Deploy via GitHub Integration (Easiest)

1. **Push to GitHub** (if not already done):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/gym-buddy.git
   git branch -M main
   git push -u origin main
   ```

2. **Visit [vercel.com](https://vercel.com)** and sign in with GitHub

3. **Import Project**: Click "Add New" → "Project" → Import your gym-buddy repo

4. **Configure Environment Variables**:
   - `DATABASE_URL` = Your PostgreSQL connection string
   - `NEXT_PUBLIC_APP_URL` = `https://your-project-name.vercel.app`

5. **Deploy**: Click "Deploy" - Vercel will automatically handle the build

### Option 2: Deploy via Vercel CLI

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables**:
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXT_PUBLIC_APP_URL
   ```

## Database Setup

### Option A: Vercel Postgres (Recommended)

1. In your Vercel dashboard, go to your project
2. Navigate to "Storage" tab
3. Click "Create Database" → "Postgres"
4. Copy the provided `DATABASE_URL`
5. Add it to your environment variables

### Option B: External PostgreSQL

Use any PostgreSQL provider:
- **Neon** (neon.tech) - Free tier available
- **PlanetScale** - MySQL alternative  
- **Supabase** - Free tier with 500MB
- **Railway** - Free tier available
- **AWS RDS** - Production grade

## Post-Deployment Setup

### 1. Database Migration & Seeding

After deployment, run these commands to set up your production database:

```bash
# Push schema to production database
vercel env pull .env.local
npx prisma db push

# Seed production database with sample workouts
npx prisma db seed
```

Or using Vercel CLI:
```bash
vercel exec -- npx prisma db push
vercel exec -- npx prisma db seed
```

### 2. Verify Deployment

Visit your deployed URL and test:
- ✅ Home page loads with dashboard
- ✅ Workouts page shows sample data  
- ✅ API endpoints work (`/api/workouts`)
- ✅ Search and filtering work
- ✅ Mobile responsive design
- ✅ Favorites functionality
- ✅ Workout completion tracking

## Environment Variables Reference

### Required for Production:
```env
# Database connection (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# App URL (replace with your actual Vercel URL)  
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
```

### Optional:
```env
# Enable Prisma query logging (debug)
DEBUG="prisma:query"

# Analytics (if added later)
# NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

## Performance Optimizations

The app is already optimized for production with:

- ⚡ **Next.js 15** with App Router for optimal performance
- 🎯 **Static generation** where possible
- 📦 **Optimized bundle size** (~156kB first load)
- 🚀 **API routes** with proper caching headers
- 📱 **Mobile-first responsive design**
- 🔄 **Client-side caching** with React Query patterns

## Monitoring & Analytics

### Add Error Tracking (Optional)
```bash
npm install @sentry/nextjs
```

### Add Analytics (Optional)
```bash
npm install @vercel/analytics
```

## Custom Domain (Optional)

1. In Vercel dashboard, go to project settings
2. Navigate to "Domains" tab
3. Add your custom domain
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain

## Database Schema Management

The app uses Prisma migrations for schema changes:

```bash
# Create migration for schema changes
npx prisma migrate dev --name description

# Deploy migrations to production  
npx prisma migrate deploy
```

## Backup & Recovery

### Database Backup:
```bash
# Using pg_dump for PostgreSQL
pg_dump $DATABASE_URL > backup.sql

# Restore from backup
psql $DATABASE_URL < backup.sql
```

## Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check TypeScript errors: `npm run build`
   - Verify dependencies: `npm ci`

2. **Database Connection Issues**:
   - Verify `DATABASE_URL` format
   - Check SSL settings (`sslmode=require`)
   - Test connection: `npx prisma db push`

3. **API Errors**:
   - Check Vercel function logs
   - Verify environment variables are set
   - Test API endpoints locally first

4. **Missing Data**:
   - Run database seed: `npx prisma db seed`
   - Check if migrations applied: `npx prisma migrate status`

## Security Considerations

- ✅ All inputs validated with Zod schemas
- ✅ SQL injection protection via Prisma ORM  
- ✅ Environment variables properly configured
- ✅ No sensitive data exposed in client bundle
- ✅ API rate limiting ready (can be added)

## Next Steps After Deployment

1. **Add Authentication**: Implement user accounts and login
2. **Add Analytics**: Track user behavior and workout trends
3. **Push Notifications**: Workout reminders and achievements
4. **Offline Support**: PWA capabilities for mobile use
5. **Social Features**: Share workouts and compete with friends

## Support

If you encounter any issues:
1. Check the [deployment logs](https://vercel.com/docs/deployments/troubleshoot-a-build)
2. Verify environment variables are set correctly
3. Test the API endpoints directly
4. Check database connectivity

---

**Your Gym Buddy app is production-ready! 🏋️‍♀️**

The deployment includes:
- Complete workout management system
- Mobile-optimized responsive design  
- RESTful API with full CRUD operations
- Sample data with 8 diverse workout templates
- Progress tracking and analytics
- Search, filtering, and favorites
- Production-grade database setup