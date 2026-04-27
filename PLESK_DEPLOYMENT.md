# Plesk Docker Deployment Guide

## Prerequisites
- Plesk server with Docker installed
- SSH access to server
- Domain name pointing to server
- Git installed on server (or upload files via SFTP)

## Step 1: Upload Project to Server

**Option A: Using Git (easier)**
```bash
ssh user@your-server-ip
cd /var/www/yourdomain.com/
git clone https://github.com/YOUR_USERNAME/kitchen-demo.git .
```

**Option B: Using SFTP**
- Use FileZilla or WinSCP
- Upload all files to `/var/www/yourdomain.com/`

## Step 2: Create Environment File

SSH into server:
```bash
ssh user@your-server-ip
cd /var/www/yourdomain.com/
```

Copy example and edit:
```bash
cp .env.example .env
nano .env
```

Update these values:
```
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your_secure_jwt_secret_here
API_URL=https://yourdomain.com
```

Save (Ctrl+X, then Y, then Enter)

## Step 3: Start Docker Containers

```bash
cd /var/www/yourdomain.com/
docker compose up -d
```

Verify containers are running:
```bash
docker compose ps
```

Check logs:
```bash
docker compose logs -f api
docker compose logs -f frontend
```

## Step 4: Configure Plesk Reverse Proxy

1. Log in to Plesk
2. Go to Websites & Domains
3. Select your domain
4. Click "Web Server"
5. In "Reverse Proxy" section, add:
   - **Frontend**: `http://localhost:5173`
   - **API**: `http://localhost:3001`

Or create nginx config manually in Plesk.

## Step 5: Set Up HTTPS (Let's Encrypt)

1. In Plesk, go to Websites & Domains
2. Select your domain
3. Click "SSL/TLS Certificates"
4. Click "Add SSL Certificate"
5. Choose "Let's Encrypt"
6. Install certificate

## Step 6: Test Your Deployment

- Frontend: `https://yourdomain.com`
- API: `https://yourdomain.com/api/health`
- MailHog (local only): Not accessible from web

## Updating Your Application

To pull latest changes and restart:

```bash
cd /var/www/yourdomain.com/
git pull origin main
docker compose up -d --build
```

## Troubleshooting

**Check container logs:**
```bash
docker compose logs api
docker compose logs frontend
docker compose logs db
```

**Restart containers:**
```bash
docker compose restart
```

**Stop and remove all containers:**
```bash
docker compose down
```

**View running containers:**
```bash
docker compose ps
```

**SSH into container:**
```bash
docker compose exec api sh
docker compose exec frontend sh
```

## Security Notes

1. **Change JWT_SECRET** - Generate a strong value
2. **Change DB_PASSWORD** - Never use default
3. **Use HTTPS** - Enable Let's Encrypt in Plesk
4. **Hide .env** - Add to .gitignore (already done)
5. **Database backups** - Set up automated backups in Plesk
6. **Monitor logs** - Check `docker compose logs` regularly

## Scaling (if needed)

If you need multiple servers, use Docker Swarm or Kubernetes. For now, single Plesk server with Docker is fine for testing.
