# ⚡ Render Quick Start Guide

Quick reference for deploying to Render. For detailed guide, see [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)

## 🚀 Deploy in 3 Steps

### Step 1: Database (5 min)

1. Render Dashboard → **New** → **PostgreSQL**
2. Settings:
   - Name: `ecommerce-postgres`
   - Region: `Singapore`
   - Plan: `Starter` (Free)
3. Save **Internal Database URL**

### Step 2: Backend (10 min)

1. Render Dashboard → **New** → **Web Service**
2. Connect repository → Select branch `main`
3. Settings:
   - Name: `ecommerce-backend`
   - Root Directory: `backend`
   - Environment: `Docker`
   - Dockerfile Path: `./backend/Dockerfile`
   - Health Check: `/api/health`
   
4. **Add Disk:**
   - Name: `uploads`
   - Mount Path: `/app/uploads`
   - Size: `1 GB`

5. **Environment Variables:**
   ```bash
   # ✅ Copy จาก Database (Step 1)
   DATABASE_URL=<from_step_1>
   DATABASE_USER=ecommerce_user
   DATABASE_PASSWORD=<from_step_1>
   
   # JWT Secret (เลือกอย่างใดอย่างหนึ่ง)
   # Option 1: ใช้ค่าเดิม (สำหรับ test/demo)
   JWT_SECRET=base64:3m8p3c1zYvM3gUe9s9XU9c9z0Qm3a1C6c5b7m8r1o2w4x6y8z0A=
   
   # Option 2: สร้างใหม่ (ดูวิธีด้านล่าง - ปลอดภัยกว่า)
   # JWT_SECRET=<GENERATE_32_CHAR_RANDOM_STRING>
   
   JWT_EXPIRATION=86400000                # ✅ วางได้เลย
   
   # 🧪 TEST MODE (วางได้เลย - ไม่เก็บเงินจริง):
   OMISE_PUBLIC_KEY=pkey_test_65a692c53l3a7q5cheh
   OMISE_SECRET_KEY=skey_test_656kahkzqaoi7js7rjc
   
   # 💰 PRODUCTION MODE (ต้องหามา production keys):
   # OMISE_PUBLIC_KEY=pkey_live_xxxxx
   # OMISE_SECRET_KEY=skey_live_xxxxx
   
   # 🔄 Update หลัง deploy เสร็จ
   API_BASE_URL=https://ecommerce-backend.onrender.com
   FRONTEND_URL=https://ecommerce-frontend.onrender.com
   CORS_ALLOWED_ORIGINS=https://ecommerce-frontend.onrender.com
   ```

6. **Deploy** → Save URL

### Step 3: Frontend (5 min)

1. Render Dashboard → **New** → **Web Service**
2. Connect same repository
3. Settings:
   - Name: `ecommerce-frontend`
   - Root Directory: `frontend`
   - Environment: `Docker`
   - Dockerfile Path: `./frontend/Dockerfile`

4. **Environment Variables:**
   ```bash
   # 🔄 Update ด้วย backend URL จริง (จาก Step 2)
   NEXT_PUBLIC_API_URL=https://ecommerce-backend.onrender.com/api
   NEXT_PUBLIC_WS_URL=wss://ecommerce-backend.onrender.com
   
   # 🧪 TEST MODE (วางได้เลย - ไม่เก็บเงินจริง):
   NEXT_PUBLIC_OMISE_PUBLIC_KEY=pkey_test_65a692c53l3a7q5cheh
   
   # 💰 PRODUCTION MODE (ต้องหามา production key):
   # NEXT_PUBLIC_OMISE_PUBLIC_KEY=pkey_live_xxxxx
   
   # 🔄 Update หลัง deploy เสร็จ
   NEXT_PUBLIC_APP_URL=https://ecommerce-frontend.onrender.com
   ```

5. **Deploy** → Save URL

---

## ✅ Post-Deploy Checklist

### Update Backend URLs
After both services are deployed, update backend env vars with actual URLs:
```bash
API_BASE_URL=https://your-actual-backend.onrender.com
FRONTEND_URL=https://your-actual-frontend.onrender.com
CORS_ALLOWED_ORIGINS=https://your-actual-frontend.onrender.com
```

### Test
```bash
# Health check
curl https://your-backend.onrender.com/api/health

# Frontend
curl https://your-frontend.onrender.com
```

### Setup Omise Webhook
1. [Omise Dashboard](https://dashboard.omise.co/) → Settings → Webhooks
2. Add: `https://your-backend.onrender.com/api/payments/webhook/omise`
3. Select events: `charge.complete`, `charge.failed`, `charge.pending`

---

## 🎯 Quick Blueprint Deploy

**Fastest way - Use render.yaml:**

1. Render Dashboard → **New** → **Blueprint**
2. Connect repository
3. Select `render.yaml`
4. Review → **Create**
5. Update environment variables:
   - `JWT_SECRET`
   - `OMISE_PUBLIC_KEY`
   - `OMISE_SECRET_KEY`
   - Service URLs (after deployment)

---

## 🔑 Generate JWT Secret

```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# Online
# https://generate-random.org/api-key-generator (32+ chars)
```

---

## ⚠️ Important Notes

### Free Tier Limitations
- Services **spin down** after 15 min inactivity
- First request takes **50+ seconds** (cold start)
- **Not recommended for production** with real users
- Upgrade to **Starter plan** ($7/month) for always-on

### Required Environment Variables

**Backend Must Have:**
- `DATABASE_URL` ✅
- `JWT_SECRET` ✅ (generate random!)
- `OMISE_PUBLIC_KEY` ✅ (production key!)
- `OMISE_SECRET_KEY` ✅ (production key!)
- `CORS_ALLOWED_ORIGINS` ✅ (frontend URL!)

**Frontend Must Have:**
- `NEXT_PUBLIC_API_URL` ✅
- `NEXT_PUBLIC_OMISE_PUBLIC_KEY` ✅ (production key!)

### Security Checklist
- [ ] Using Omise **production** keys (pkey_live_, skey_live_)
- [ ] JWT_SECRET is **random** (32+ characters)
- [ ] CORS set to **frontend domain only**
- [ ] Database password is **strong**

---

## 🚨 Troubleshooting

### Backend won't start
```bash
# Check logs in Render Dashboard
# Common issues:
- Missing DATABASE_URL
- Missing JWT_SECRET
- Wrong Dockerfile path
```

### Frontend can't connect to backend
```bash
# Check:
1. NEXT_PUBLIC_API_URL is correct
2. CORS_ALLOWED_ORIGINS includes frontend URL
3. Backend is running (check health endpoint)
```

### Payment not working
```bash
# Check:
1. Using pkey_live_ and skey_live_ (not test keys)
2. Webhook URL configured in Omise
3. Backend logs for errors
```

---

## 📚 Full Documentation

- **Complete Guide:** [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)
- **General Deployment:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Project Setup:** [README.md](README.md)

---

## 💡 Tips

1. **Use Blueprint** for easiest deployment
2. **Set up monitoring** after first deploy
3. **Test with small payment** before going live
4. **Upgrade to paid plan** for production
5. **Enable auto-deploy** for continuous deployment

---

**Ready to deploy? Start with Step 1! 🚀**
