# 🚀 คู่มือการ Deploy ขึ้น Render

คู่มือนี้จะแนะนำวิธีการ deploy โปรเจค E-commerce ขึ้น Render.com

## 📋 สิ่งที่ต้องเตรียม

1. บัญชี [Render.com](https://render.com) (สมัครฟรี)
2. บัญชี GitHub (เชื่อมต่อกับ Render)
3. โค้ดต้องอยู่บน GitHub Repository

---

## 🗄️ ส่วนที่ 1: สร้าง PostgreSQL Database

### ขั้นตอน:

1. ไปที่ [Render Dashboard](https://dashboard.render.com/)
2. คลิก **"New +"** → เลือก **"PostgreSQL"**
3. กรอกข้อมูล:
   - **Name**: `ecommerce-database` (หรือชื่อที่ต้องการ)
   - **Database**: `ecommerce_prod_0o5l`
   - **User**: `ecommerce_user`
   - **Region**: Singapore (ใกล้ไทยที่สุด)
   - **Instance Type**: Free
4. คลิก **"Create Database"**
5. รอประมาณ 2-3 นาที

### 🔑 เก็บข้อมูล Connection ไว้:

หลังจากสร้างเสร็จ คุณจะได้ข้อมูล:
- **Internal Database URL** (ใช้ภายใน Render):
  ```
  postgresql://ecommerce_user:xxx@dpg-xxx:5432/ecommerce_prod_0o5l
  ```
- **External Database URL** (ใช้เชื่อมจากภายนอก)
- **POSTGRES_PASSWORD**: เก็บไว้ใช้ในขั้นตอนถัดไป

---

## 🔧 ส่วนที่ 2: Deploy Backend (Spring Boot)

### ขั้นตอน:

1. คลิก **"New +"** → เลือก **"Web Service"**
2. เชื่อมต่อ GitHub Repository ของคุณ
3. กรอกข้อมูล:
   - **Name**: `ecommerce-backend`
   - **Region**: Singapore
   - **Branch**: `main` (หรือ branch ที่ใช้งาน)
   - **Root Directory**: `backend`
   - **Runtime**: `Java`
   - **Build Command**:
     ```bash
     ./mvnw clean install -DskipTests
     ```
   - **Start Command**:
     ```bash
     java -Dserver.port=$PORT -Dspring.profiles.active=prod -jar target/*.jar
     ```
   - **Instance Type**: Free

### 🔐 ตั้งค่า Environment Variables:

ไปที่ **Environment** tab และเพิ่ม variables ดังนี้:

```env
# Database Configuration
SPRING_DATASOURCE_URL=<คัดลอกจาก Internal Database URL>
SPRING_DATASOURCE_USERNAME=ecommerce_user
SPRING_DATASOURCE_PASSWORD=<คัดลอกจาก Database Password>

# Spring Configuration
SPRING_PROFILES_ACTIVE=prod

# JWT Configuration
JWT_SECRET=base64:3m8p3c1zYvM3gUe9s9XU9c9z0Qm3a1C6c5b7m8r1o2w4x6y8z0A=
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# Omise Payment (Test Mode)
OMISE_PUBLIC_KEY=pkey_test_65a692c53l3a7q5cheh
OMISE_SECRET_KEY=skey_test_656kahkzqaoi7js7rjc
OMISE_API_VERSION=2019-05-29

# Frontend URL (จะได้หลังจาก deploy frontend)
FRONTEND_URL=https://ecommerce-frontend1-257i.onrender.com
CORS_ALLOWED_ORIGINS=https://ecommerce-frontend1-257i.onrender.com

# API Base URL (URL ของ backend นี้เอง)
API_BASE_URL=https://ecommerce-backend.onrender.com/api

# Upload Directory
UPLOAD_DIR=/app/uploads
```

4. คลิก **"Create Web Service"**
5. รอประมาณ 5-10 นาที สำหรับ build และ deploy

### ✅ ตรวจสอบ Backend:

เมื่อ deploy สำเร็จ ให้ทดสอบ:
```bash
https://ecommerce-backend.onrender.com/api/health
```

---

## 🎨 ส่วนที่ 3: Deploy Frontend (Next.js)

### ขั้นตอน:

1. คลิก **"New +"** → เลือก **"Static Site"**
2. เชื่อมต่อ GitHub Repository เดียวกัน
3. กรอกข้อมูล:
   - **Name**: `ecommerce-frontend`
   - **Region**: Singapore
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory**: `.next`

### 🔐 ตั้งค่า Environment Variables:

ไปที่ **Environment** tab:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://ecommerce-backend.onrender.com/api
NEXT_PUBLIC_APP_URL=https://ecommerce-frontend1-257i.onrender.com

# Omise Public Key
NEXT_PUBLIC_OMISE_PUBLIC_KEY=pkey_test_65a692c53l3a7q5cheh

# Feature Flags
NEXT_PUBLIC_ENABLE_DEBUG=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# Node Environment
NODE_ENV=production
```

4. คลิก **"Create Static Site"**
5. รอประมาณ 3-5 นาที

### ✅ ตรวจสอบ Frontend:

เปิดใช้งาน:
```
https://ecommerce-frontend1-257i.onrender.com
```

---

## 🔄 ส่วนที่ 4: อัพเดท CORS Configuration

หลังจาก Frontend deploy สำเร็จ:

1. กลับไปที่ **Backend Service** บน Render
2. ไปที่ **Environment** tab
3. อัพเดท:
   ```env
   CORS_ALLOWED_ORIGINS=https://ecommerce-frontend1-257i.onrender.com
   FRONTEND_URL=https://ecommerce-frontend1-257i.onrender.com
   ```
4. บันทึกและรอ backend restart อัตโนมัติ

---

## 📦 ส่วนที่ 5: ทดสอบระบบ

### ทดสอบ Backend API:
```bash
# Health Check
curl https://ecommerce-backend.onrender.com/api/health

# Test Register
curl -X POST https://ecommerce-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

### ทดสอบ Frontend:
1. เปิดเว็บไซต์: `https://ecommerce-frontend1-257i.onrender.com`
2. ทดสอบ Login/Register
3. ทดสอบ Browse Products
4. ทดสอบ Add to Cart
5. ทดสอบ Checkout (กับบัตรทดสอบ Omise)

---

## 🐛 การแก้ไขปัญหาที่พบบ่อย

### 1. Backend ไม่สามารถเชื่อมต่อ Database
**วิธีแก้:**
- ตรวจสอบว่าใช้ **Internal Database URL** (ไม่ใช่ External)
- ตรวจสอบ username และ password
- ลอง restart backend service

### 2. CORS Error
**วิธีแก้:**
- ตรวจสอบว่า `CORS_ALLOWED_ORIGINS` มี URL ของ frontend ที่ถูกต้อง
- ไม่ต้องมี `/` ต้อนท้าย
- Restart backend หลังแก้ไข

### 3. Images ไม่แสดง
**วิธีแก้:**
- ตรวจสอบ `next.config.js` ว่ามี domain ของ backend
- ตรวจสอบว่า `UPLOAD_DIR` ถูกสร้างใน backend
- อัพโหลดรูปใหม่หลัง deploy

### 4. Free Tier Spinning Down
**หมายเหตุ:** Render Free tier จะ sleep หลังไม่มีการใช้งาน 15 นาที
- การเข้าครั้งแรกจะใช้เวลา 30-60 วินาที wake up
- ถ้าต้องการให้ online ตลอด ต้อง upgrade เป็น Paid plan

### 5. Build ล้มเหลว
**วิธีแก้:**
- ตรวจสอบ logs บน Render Dashboard
- ตรวจสอบว่า Java version เป็น 21
- ลอง Manual Deploy อีกครั้ง

---

## 🔄 การ Deploy ใหม่ (Update Code)

### Auto Deploy:
- Push code ไป GitHub
- Render จะ auto deploy อัตโนมัติ

### Manual Deploy:
1. ไปที่ Service บน Render Dashboard
2. คลิก **"Manual Deploy"** → เลือก branch
3. รอ build และ deploy

---

## 📊 การตรวจสอบ Logs

### Backend Logs:
1. ไปที่ Backend Service
2. คลิก **"Logs"** tab
3. ดู error messages และ debugging info

### Frontend Logs:
1. ไปที่ Frontend Service
2. คลิก **"Logs"** tab
3. ดู build errors

---

## 💰 ค่าใช้จ่าย

### Free Tier (ที่ใช้อยู่):
- ✅ 750 ชั่วโมง/เดือน สำหรับ Web Services
- ✅ 100GB Bandwidth
- ✅ PostgreSQL 1GB
- ⚠️ Service จะ sleep หลัง 15 นาที ไม่ได้ใช้งาน

### หากต้องการ Upgrade:
- **Starter Plan**: $7/เดือน (Web Service)
- **Standard Plan**: $25/เดือน (PostgreSQL 10GB)

---

## 🎉 เสร็จสิ้น!

ขอแสดงความยินดี! 🎊 เว็บไซต์ E-commerce ของคุณออนไลน์แล้ว

**URLs:**
- Frontend: https://ecommerce-frontend1-257i.onrender.com
- Backend API: https://ecommerce-backend.onrender.com/api

---

## 📞 ต้องการความช่วยเหลือ?

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com/)
- [GitHub Issues](https://github.com/your-repo/issues)
