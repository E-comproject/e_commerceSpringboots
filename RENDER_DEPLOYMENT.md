# 🚀 Render Deployment Guide

Complete guide for deploying E-Commerce Application to Render.com

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

---

## 📦 Prerequisites

### 1. Render Account
- Sign up at [render.com](https://render.com/)
- Free tier available (limited resources, services spin down after 15 min of inactivity)
- Paid tier starts at $7/month for always-on services

### 2. Git Repository
- Push your code to GitHub/GitLab
- Ensure `main` branch is up to date

### 3. Payment Gateway
- **Omise Production Keys** ready
  - Public Key: `pkey_live_xxxxx`
  - Secret Key: `skey_live_xxxxx`
- Set up webhook URL after deployment

---

## 🗄️ Database Setup

### Option 1: Using Render PostgreSQL (Recommended)

1. **Go to Render Dashboard** → New → PostgreSQL
2. **Configure Database:**
   - Name: `ecommerce-postgres`
   - Database: `ecommerce_prod`
   - User: `ecommerce_user`
   - Region: `Singapore` (or closest to your users)
   - Plan: `Starter` (Free tier: 256 MB RAM, 1 GB storage)

3. **Save Connection Details:**
   ```
   Internal Database URL: postgresql://...
   External Database URL: postgresql://...
   ```

4. **Notes:**
   - Free database includes 90 days of retention
   - Paid plan starts at $7/month (unlimited retention)
   - Database does NOT spin down (always available)

### Option 2: External Database

Use any PostgreSQL hosting service:
- **AWS RDS**
- **DigitalOcean Managed Database**
- **ElephantSQL**
- **Supabase**

---

## ⚙️ Backend Deployment

### Step 1: Create Web Service

1. **Render Dashboard** → New → Web Service
2. **Connect Repository:**
   - Select your GitHub/GitLab repository
   - Choose branch: `main`

### Step 2: Configure Service

**Basic Settings:**
- **Name:** `ecommerce-backend`
- **Region:** `Singapore` (same as database)
- **Branch:** `main`
- **Root Directory:** `backend` (important!)
- **Environment:** `Docker`
- **Dockerfile Path:** `./backend/Dockerfile`
- **Docker Context:** `./backend`

**Instance Settings:**
- **Plan:** `Starter` (Free: 512 MB RAM, shared CPU)
- **Auto-Deploy:** `Yes` (deploy on push)

**Health Check:**
- **Health Check Path:** `/api/health`

### Step 3: Add Persistent Disk (for file uploads)

1. Go to service settings → Disks
2. **Add Disk:**
   - Name: `uploads`
   - Mount Path: `/app/uploads`
   - Size: `1 GB` (free tier includes 1 GB)

### Step 4: Environment Variables

Add these in **Environment** tab:

```bash
# ============================================
# 📊 Database Connection
# ⚠️ สร้างใหม่บน Render! ไม่ใช่ค่าจาก local docker
# คัดลอกจาก Render PostgreSQL service → Credentials
# ============================================
# ขั้นตอน:
# 1. Render Dashboard → PostgreSQL service (ที่สร้างใหม่)
# 2. คัดลอก "Internal Database URL" หรือ Credentials แยก
# 3. วางตามนี้:

DATABASE_URL=postgresql://...  # ✅ Copy จาก Render (ไม่ใช่ localhost!)
DATABASE_USER=ecommerce_user   # ✅ Copy จาก Render (ไม่ใช่ postgres!)
DATABASE_PASSWORD=<password>   # ✅ Copy จาก Render (random password)

# ============================================
# ⚙️ Spring Configuration
# ✅ วางได้เลย - ใช้ค่าเหล่านี้
# ============================================
SPRING_PROFILES_ACTIVE=prod                         # ✅ วางได้เลย
SPRING_DATASOURCE_URL=${DATABASE_URL}              # ✅ วางได้เลย
SPRING_DATASOURCE_USERNAME=${DATABASE_USER}        # ✅ วางได้เลย
SPRING_DATASOURCE_PASSWORD=${DATABASE_PASSWORD}    # ✅ วางได้เลย

# ============================================
# 🔐 JWT Configuration
# เลือกอย่างใดอย่างหนึ่ง:
# ============================================
# Option 1: ใช้ค่าเดิม (สำหรับ test/demo) ✅ แนะนำสำหรับ test mode
JWT_SECRET=base64:3m8p3c1zYvM3gUe9s9XU9c9z0Qm3a1C6c5b7m8r1o2w4x6y8z0A=

# Option 2: สร้างใหม่ (สำหรับ production จริง - ปลอดภัยกว่า)
# JWT_SECRET=<GENERATE_32_ตัวอักษรขึ้นไป>  # ⚠️ ดูวิธี generate ด้านล่าง

JWT_EXPIRATION=86400000                          # ✅ วางได้เลย (24 ชม.)
JWT_REFRESH_EXPIRATION=604800000                 # ✅ วางได้เลย (7 วัน)

# ============================================
# 💳 Omise Payment Gateway
# 🧪 สำหรับ DEMO/TEST: ใช้ test keys (วางได้เลย)
# 💰 สำหรับ PRODUCTION: ต้องหามา production keys
# ============================================
# สำหรับ DEMO/TEST (ไม่เก็บเงินจริง):
OMISE_PUBLIC_KEY=pkey_test_65a692c53l3a7q5cheh   # ✅ วางได้เลย (test key)
OMISE_SECRET_KEY=skey_test_656kahkzqaoi7js7rjc   # ✅ วางได้เลย (test key)

# สำหรับ PRODUCTION (เก็บเงินจริง):
# OMISE_PUBLIC_KEY=pkey_live_xxxxx                 # ⚠️ ต้องหามา production key
# OMISE_SECRET_KEY=skey_live_xxxxx                 # ⚠️ ต้องหามา production key

OMISE_API_VERSION=2019-05-29                      # ✅ วางได้เลย

# ============================================
# 🌐 Application URLs
# 🔄 ต้อง UPDATE หลัง deploy เสร็จ
# ============================================
API_BASE_URL=https://ecommerce-backend.onrender.com           # 🔄 Update หลัง deploy
FRONTEND_URL=https://ecommerce-frontend.onrender.com          # 🔄 Update หลัง deploy
CORS_ALLOWED_ORIGINS=https://ecommerce-frontend.onrender.com  # 🔄 Update หลัง deploy

# ============================================
# 📁 Upload Directory
# ✅ วางได้เลย
# ============================================
UPLOAD_DIR=/app/uploads  # ✅ วางได้เลย
```

**Generate JWT Secret:**
```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows PowerShell:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# Or use online generator:
# https://generate-random.org/api-key-generator
```

### Step 5: Deploy

1. Click **Create Web Service**
2. Wait for build and deployment (5-10 minutes)
3. **Save the URL:** `https://ecommerce-backend.onrender.com`

---

## 🎨 Frontend Deployment

### Step 1: Create Web Service

1. **Render Dashboard** → New → Web Service
2. **Connect same repository**

### Step 2: Configure Service

**Basic Settings:**
- **Name:** `ecommerce-frontend`
- **Region:** `Singapore`
- **Branch:** `main`
- **Root Directory:** `frontend`
- **Environment:** `Docker`
- **Dockerfile Path:** `./frontend/Dockerfile`
- **Docker Context:** `./frontend`

**Instance Settings:**
- **Plan:** `Starter`
- **Auto-Deploy:** `Yes`

### Step 3: Environment Variables

```bash
# ============================================
# 🌐 API Configuration
# 🔄 ต้อง UPDATE ด้วย backend URL ที่ได้จาก Step ก่อนหน้า
# ============================================
NEXT_PUBLIC_API_URL=https://ecommerce-backend.onrender.com/api  # 🔄 Update ด้วย URL จริง
NEXT_PUBLIC_WS_URL=wss://ecommerce-backend.onrender.com          # 🔄 Update ด้วย URL จริง

# ============================================
# 💳 Omise Public Key
# 🧪 สำหรับ DEMO/TEST: ใช้ test key (วางได้เลย)
# 💰 สำหรับ PRODUCTION: ต้องหามา production key
# ============================================
# สำหรับ DEMO/TEST (ไม่เก็บเงินจริง):
NEXT_PUBLIC_OMISE_PUBLIC_KEY=pkey_test_65a692c53l3a7q5cheh  # ✅ วางได้เลย (test key)

# สำหรับ PRODUCTION (เก็บเงินจริง):
# NEXT_PUBLIC_OMISE_PUBLIC_KEY=pkey_live_xxxxx                # ⚠️ ต้องหามา production key

# ============================================
# 🌐 Application URL
# 🔄 ต้อง UPDATE หลัง deploy เสร็จ
# ============================================
NEXT_PUBLIC_APP_URL=https://ecommerce-frontend.onrender.com  # 🔄 Update หลัง deploy
```

### Step 4: Deploy

1. Click **Create Web Service**
2. Wait for deployment
3. **Save the URL:** `https://ecommerce-frontend.onrender.com`

---

## 🔄 Update CORS and URLs

After both services are deployed, **update backend environment variables:**

1. Go to Backend Service → Environment
2. Update these variables:
   ```bash
   API_BASE_URL=https://your-actual-backend-url.onrender.com
   FRONTEND_URL=https://your-actual-frontend-url.onrender.com
   CORS_ALLOWED_ORIGINS=https://your-actual-frontend-url.onrender.com
   ```
3. Save and trigger manual deploy

---

## 🔐 Environment Variables Summary

### Backend Required Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://...` | Database connection string |
| `DATABASE_USER` | `ecommerce_user` | Database username |
| `DATABASE_PASSWORD` | `***` | Database password |
| `JWT_SECRET` | `random_string_32+` | JWT signing key (REQUIRED) |
| `OMISE_PUBLIC_KEY` | `pkey_live_xxx` | Omise public key |
| `OMISE_SECRET_KEY` | `skey_live_xxx` | Omise secret key |
| `API_BASE_URL` | `https://...` | Backend URL |
| `FRONTEND_URL` | `https://...` | Frontend URL |
| `CORS_ALLOWED_ORIGINS` | `https://...` | Allowed CORS origins |

### Frontend Required Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://.../api` | Backend API URL |
| `NEXT_PUBLIC_WS_URL` | `wss://...` | WebSocket URL |
| `NEXT_PUBLIC_OMISE_PUBLIC_KEY` | `pkey_live_xxx` | Omise public key |
| `NEXT_PUBLIC_APP_URL` | `https://...` | Frontend URL |

---

## ✅ Post-Deployment Checklist

### 1. Test Endpoints

**Backend Health Check:**
```bash
curl https://your-backend.onrender.com/api/health
# Should return: {"status":"UP"}
```

**Frontend:**
```bash
curl https://your-frontend.onrender.com
# Should return HTML
```

### 2. Test Features

- [ ] User registration and login
- [ ] Product listing and search
- [ ] Shopping cart
- [ ] Order creation
- [ ] Payment processing (test with small amount first!)
- [ ] File upload (product images, profile pictures)
- [ ] WebSocket chat
- [ ] Mobile responsiveness

### 3. Configure Omise Webhook

1. Go to [Omise Dashboard](https://dashboard.omise.co/)
2. **Settings → Webhooks**
3. Add webhook URL:
   ```
   https://your-backend.onrender.com/api/payments/webhook/omise
   ```
4. Select events:
   - `charge.complete`
   - `charge.failed`
   - `charge.pending`

### 4. Monitor Logs

**Backend Logs:**
```bash
# Render Dashboard → Backend Service → Logs
```

**Frontend Logs:**
```bash
# Render Dashboard → Frontend Service → Logs
```

### 5. Set Up Custom Domain (Optional)

1. Go to Service → Settings → Custom Domains
2. Add your domain
3. Update DNS records
4. Update environment variables with new domain

---

## 🚨 Important Notes

### Free Tier Limitations

1. **Services spin down after 15 minutes of inactivity**
   - First request takes 50+ seconds (cold start)
   - Not suitable for production with real users
   - Upgrade to paid plan ($7/month) for always-on

2. **Database limitations:**
   - 256 MB RAM
   - 1 GB storage
   - 90-day retention

3. **Build minutes:**
   - Free: 500 build minutes/month
   - Paid: Unlimited

### Performance Tips

1. **Enable connection pooling** (already configured in application.properties)
2. **Use persistent disk** for uploads (already configured)
3. **Monitor resource usage** in Render dashboard
4. **Set up alerts** for service issues

### Security Checklist

- [ ] JWT_SECRET is random and secure (32+ characters)
- [ ] Using Omise **production** keys (not test keys)
- [ ] CORS configured for frontend domain only
- [ ] Database password is strong
- [ ] Environment variables are set (not hardcoded)
- [ ] HTTPS is enabled (automatic on Render)
- [ ] DevController is disabled in production

---

## 🔧 Troubleshooting

### Backend Won't Start

**Check logs for:**
```bash
# Database connection error
Cannot create PoolableConnectionFactory

# Solution: Check DATABASE_URL, DATABASE_USER, DATABASE_PASSWORD
```

```bash
# JWT secret error
JWT secret key cannot be null

# Solution: Set JWT_SECRET environment variable
```

```bash
# Port binding error
Port 8080 already in use

# Solution: Render handles this automatically, check Dockerfile EXPOSE
```

### Frontend Build Fails

**Check:**
1. `next.config.js` has `output: 'standalone'`
2. All environment variables start with `NEXT_PUBLIC_`
3. Dockerfile uses correct Node version (18-alpine)

### Cold Start Issues

**Problem:** First request takes 50+ seconds

**Solutions:**
1. Upgrade to paid plan ($7/month)
2. Use health check pinger (e.g., UptimeRobot, cron-job.org)
3. Implement warming mechanism

### Payment Not Working

**Check:**
1. Using production keys (`pkey_live_`, `skey_live_`)
2. Webhook URL is correct
3. Backend logs for payment errors
4. Omise dashboard for transaction status

### File Upload Issues

**Check:**
1. Persistent disk is mounted to `/app/uploads`
2. Disk has available space (check usage in dashboard)
3. File size limits in `application.properties`
4. CORS allows file uploads from frontend

---

## 📊 Monitoring & Maintenance

### Regular Checks

1. **Monitor disk usage:**
   - Dashboard → Service → Disks
   - Free tier: 1 GB limit

2. **Check database storage:**
   - Dashboard → Database → Metrics

3. **Review logs weekly:**
   - Look for errors, warnings
   - Check for unusual activity

### Backup Strategy

1. **Database:**
   - Render provides automatic backups (paid plans)
   - Manual export: `pg_dump` command
   
2. **Uploaded files:**
   - Consider using S3/Cloudinary for production
   - Or implement regular disk snapshots

### Scaling

**When to upgrade:**
- Services frequently spin down
- Database running out of storage
- Response times are slow
- Need more than 512 MB RAM

**Paid Plans:**
- Starter: $7/month (always-on, 512 MB RAM)
- Standard: $25/month (1 GB RAM, better performance)
- Pro: $85/month (4 GB RAM, dedicated resources)

---

## 🎯 Production Best Practices

### Before Going Live

1. **Test thoroughly** with real payment amounts
2. **Set up monitoring** (Sentry, LogRocket, etc.)
3. **Configure custom domain**
4. **Upgrade to paid plan** for reliability
5. **Set up automatic backups**
6. **Document recovery procedures**

### Post-Launch

1. **Monitor error rates**
2. **Track payment success/failure**
3. **Review logs regularly**
4. **Plan for scaling**
5. **Keep dependencies updated**

---

## 📞 Support & Resources

### Render Documentation
- [Render Docs](https://render.com/docs)
- [Docker Deployments](https://render.com/docs/docker)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Persistent Disks](https://render.com/docs/disks)

### Omise Documentation
- [Omise API Docs](https://docs.opn.ooo/)
- [Webhook Setup](https://docs.opn.ooo/webhooks)
- [Payment Methods](https://docs.opn.ooo/payments)

### Community
- [Render Community](https://community.render.com/)
- [Render Status](https://status.render.com/)

---

## 🚀 Quick Deploy with Blueprint

You can use the `render.yaml` blueprint file for automated deployment:

1. **Go to Render Dashboard**
2. **New → Blueprint**
3. **Connect repository**
4. **Select `render.yaml`**
5. **Review and create**
6. **Update environment variables** (JWT_SECRET, Omise keys)

**Note:** Blueprint will create all services at once!

---

**Good luck with your deployment! 🎉**

For issues or questions, check the troubleshooting section above or contact support.
