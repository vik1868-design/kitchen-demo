# Render Deployment Guide for Kitchen Demo

## Prerequisites
- GitHub account with your kitchen-demo repo pushed
- Render account (render.com - sign up free)

## Deployment Steps

### 1. Push to GitHub
```bash
cd kitchen-demo
git init
git add .
git commit -m "Initial commit - ready for Render deployment"
git remote add origin https://github.com/YOUR_USERNAME/kitchen-demo.git
git branch -M main
git push -u origin main
```

### 2. Create Render Account
- Go to https://render.com
- Sign up with GitHub (easiest option)
- Authorize Render to access your GitHub repos

### 3. Deploy from Blueprint
- Click "New" → "Blueprint"
- Select your kitchen-demo repository
- Render automatically detects `render.yaml`
- Review services:
  - **kitchen-api**: Node.js web service
  - **kitchen-frontend**: Static site
  - **kitchen-db**: PostgreSQL database (free tier)

### 4. Configure Environment Variables
After deployment, services will auto-generate:
- `DATABASE_URL`: Render PostgreSQL connection string
- `JWT_SECRET`: Auto-generated for security
- `VITE_API_URL`: Automatically set to kitchen-api service URL

### 5. Verify Deployment
- Check API: `https://kitchen-api-xxx.onrender.com/api/health`
- Check Frontend: `https://kitchen-frontend-xxx.onrender.com`

## Important Notes

**Free Tier Limitations:**
- Services spin down after 15 min inactivity (auto-restart on request)
- 100 GB/month bandwidth
- Shared CPU resources

**Production Changes Needed:**
- Remove MailHog (kept local only)
- JWT_SECRET should be strong (Render auto-generates one)
- Database backups not automatic (use Render Pro for that)
- CORS properly configured for your frontend domain

## Updating Deployment

Push changes to main branch:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

Render auto-deploys on every push to main.

## Troubleshooting

**API won't start:**
- Check logs: Dashboard → kitchen-api → Logs
- Verify DATABASE_URL format
- Ensure entrypoint.sh is executable

**Frontend shows blank page:**
- Check browser console for API URL errors
- Verify VITE_API_URL is set correctly
- Check nginx.conf routing

**Database connection fails:**
- Ensure pool SSL settings are correct (included in render.yaml)
- Check DATABASE_URL has sslmode=require

## Scaling Beyond Free Tier

When ready for production:
- Upgrade to paid plans for always-on services
- Add custom domain
- Enable automatic backups
- Use Render's private database option
