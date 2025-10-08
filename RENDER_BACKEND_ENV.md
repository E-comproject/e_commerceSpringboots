# 🔧 Environment Variables สำหรับ Backend บน Render

## 📋 Environment Variables ที่ต้องตั้งค่า

### 1. Database Configuration
```bash
# Database Connection (จาก Render PostgreSQL service)
SPRING_DATASOURCE_URL=postgresql://...
SPRING_DATASOURCE_USERNAME=ecommerce_user
SPRING_DATASOURCE_PASSWORD=...

# หรือใช้ DATABASE_URL แทน
DATABASE_URL=postgresql://...
```

### 2. JWT Configuration
```bash
# JWT Secret (สำคัญมาก!)
JWT_SECRET=base64:3m8p3c1zYvM3gUe9s9XU9c9z0Qm3a1C6c5b7m8r1o2w4x6y8z0A=
JWT_EXPIRATION=86400000
```

### 3. Omise Payment Gateway
```bash
# Test Keys (สำหรับ demo/test)
OMISE_PUBLIC_KEY=pkey_test_65a692c53l3a7q5cheh
OMISE_SECRET_KEY=skey_test_656kahkzqaoi7js7rjc
OMISE_API_VERSION=2019-05-29
```

### 4. Application URLs
```bash
# Backend URL
API_BASE_URL=https://e-commercespringboots.onrender.com

# Frontend URL (อัปเดตตาม frontend URL จริง)
FRONTEND_URL=https://your-frontend-url.onrender.com

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://your-frontend-url.onrender.com
```

### 5. Upload Configuration
```bash
# Upload Directory (สำคัญสำหรับ file upload!)
UPLOAD_DIR=/app/uploads
```

## 🚀 ขั้นตอนการตั้งค่า

### Step 1: เข้า Render Dashboard
1. ไปที่ [render.com](https://render.com)
2. เลือก Backend Service ของคุณ
3. ไปที่ **Environment** tab

### Step 2: เพิ่ม Environment Variables
เพิ่มตัวแปรทั้งหมดข้างต้นใน Environment tab

### Step 3: เพิ่ม Persistent Disk
1. ไปที่ **Disks** tab
2. **Add Disk:**
   - Name: `uploads`
   - Mount Path: `/app/uploads`
   - Size: `1 GB`

### Step 4: Deploy
1. Save environment variables
2. Trigger manual deploy
3. ตรวจสอบ logs

## 🧪 ทดสอบการตั้งค่า

### 1. Health Check
```bash
curl https://e-commercespringboots.onrender.com/api/health
# ควรได้: {"status":"UP"}
```

### 2. Test File Upload
```bash
# ทดสอบอัปโหลดรูป profile
curl -X POST \
  -F "file=@test-image.jpg" \
  https://e-commercespringboots.onrender.com/api/files/upload/profile
```

### 3. Test Static File Access
```bash
# ทดสอบการเข้าถึงไฟล์
curl https://e-commercespringboots.onrender.com/api/files/profiles/filename.jpg
```

## 🔍 ตรวจสอบ Logs

### 1. Backend Logs
- Render Dashboard → Service → Logs
- หา error messages เกี่ยวกับ:
  - Database connection
  - File upload
  - CORS issues

### 2. Common Errors
```bash
# Database connection error
Cannot create PoolableConnectionFactory
# แก้ไข: ตรวจสอบ SPRING_DATASOURCE_URL

# JWT secret error
JWT secret key cannot be null
# แก้ไข: ตั้งค่า JWT_SECRET

# File upload error
Failed to store file
# แก้ไข: ตรวจสอบ UPLOAD_DIR และ persistent disk
```

## 📊 Monitoring

### 1. Service Status
- ตรวจสอบ service health
- ตรวจสอบ response time
- ตรวจสอบ error rate

### 2. Disk Usage
- ตรวจสอบ disk space
- ตรวจสอบ file count
- วางแผน cleanup

### 3. Database Performance
- ตรวจสอบ connection pool
- ตรวจสอบ query performance
- ตรวจสอบ storage usage

## 🚨 Troubleshooting

### Error 500 - Internal Server Error
**สาเหตุ:** Database หรือ JWT configuration ผิด
**แก้ไข:**
1. ตรวจสอบ `SPRING_DATASOURCE_URL`
2. ตรวจสอบ `JWT_SECRET`
3. ตรวจสอบ logs

### Error 503 - Service Unavailable
**สาเหตุ:** Service spin down หรือ CORS issues
**แก้ไข:**
1. ตรวจสอบ service status
2. ตรวจสอบ CORS configuration
3. รอ service spin up

### File Upload ไม่ทำงาน
**สาเหตุ:** Upload directory หรือ disk mount ผิด
**แก้ไข:**
1. ตรวจสอบ `UPLOAD_DIR=/app/uploads`
2. ตรวจสอบ persistent disk mount
3. ตรวจสอบ file permissions

## 📝 Notes

### Free Tier Limitations
- Services spin down หลัง 15 นาทีไม่ใช้งาน
- First request ใช้เวลา 50+ วินาที
- Disk space จำกัด 1GB

### Production Recommendations
- Upgrade to paid plan ($7/month)
- ใช้ production Omise keys
- ตั้งค่า monitoring
- วางแผน backup

---

**การตั้งค่านี้จะแก้ปัญหา error 500 และ 503 ในการอัปโหลดรูปภาพ! 🎉**
