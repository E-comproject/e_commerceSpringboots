# 🔧 แก้ไขปัญหา Upload บน Render

## 🚨 ปัญหาที่พบ
- Error 500 และ 503 เมื่ออัปโหลดรูปภาพ
- StaticResourceConfig ตั้งค่า path ผิด
- File upload path ไม่ตรงกับ persistent disk บน Render

## ✅ การแก้ไข

### 1. แก้ไข StaticResourceConfig
```java
@Value("${app.upload.dir:uploads}")
private String uploadDir;

@Override
public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
    String uploadPath = Paths.get(uploadDir).toAbsolutePath().toString();
    registry.addResourceHandler("/files/**")
            .addResourceLocations("file:" + uploadPath + "/");
}
```

### 2. แก้ไข FileUploadController
```java
@Value("${app.upload.dir:uploads}")
private String uploadBaseDir;

private String getUploadDir(String subdir) {
    return uploadBaseDir + "/" + subdir + "/";
}
```

### 3. เพิ่มการตั้งค่าใน application.properties
```properties
# Upload Directory Configuration
app.upload.dir=${UPLOAD_DIR:uploads}
```

### 4. เพิ่มการตั้งค่าใน application-prod.properties
```properties
# Upload Directory Configuration for Render
app.upload.dir=${UPLOAD_DIR:/app/uploads}
```

## 🔧 Environment Variables บน Render

### Backend Environment Variables
```bash
# Upload directory (สำคัญ!)
UPLOAD_DIR=/app/uploads

# Database
DATABASE_URL=postgresql://...
DATABASE_USER=ecommerce_user
DATABASE_PASSWORD=...

# JWT
JWT_SECRET=base64:3m8p3c1zYvM3gUe9s9XU9c9z0Qm3a1C6c5b7m8r1o2w4x6y8z0A=
JWT_EXPIRATION=86400000

# Omise (Test keys)
OMISE_PUBLIC_KEY=pkey_test_65a692c53l3a7q5cheh
OMISE_SECRET_KEY=skey_test_656kahkzqaoi7js7rjc

# URLs (Update หลัง deploy)
API_BASE_URL=https://your-backend.onrender.com
FRONTEND_URL=https://your-frontend.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend.onrender.com
```

## 📁 Persistent Disk Setup

### 1. เพิ่ม Disk บน Render
1. Go to Backend Service → **Disks**
2. **Add Disk:**
   - Name: `uploads`
   - Mount Path: `/app/uploads`
   - Size: `1 GB` (free tier)

### 2. ตรวจสอบ Disk Mount
```bash
# ใน Render logs ควรเห็น:
# Disk mounted at /app/uploads
```

## 🧪 ทดสอบการอัปโหลด

### 1. ทดสอบ Health Check
```bash
curl https://your-backend.onrender.com/api/health
# ควรได้: {"status":"UP"}
```

### 2. ทดสอบ Upload Endpoint
```bash
# ทดสอบอัปโหลดรูป profile
curl -X POST \
  -F "file=@test-image.jpg" \
  https://your-backend.onrender.com/api/files/upload/profile
```

### 3. ทดสอบ Static File Serving
```bash
# ทดสอบการเข้าถึงไฟล์ที่อัปโหลดแล้ว
curl https://your-backend.onrender.com/api/files/profiles/filename.jpg
```

## 🚨 Troubleshooting

### Error 500 - Internal Server Error
**สาเหตุ:** Upload directory ไม่ถูกต้อง
**แก้ไข:**
1. ตรวจสอบ `UPLOAD_DIR=/app/uploads` ใน environment variables
2. ตรวจสอบ persistent disk mount
3. ตรวจสอบ logs ใน Render dashboard

### Error 503 - Service Unavailable
**สาเหตุ:** Service spin down หรือ CORS issues
**แก้ไข:**
1. ตรวจสอบ CORS_ALLOWED_ORIGINS
2. ตรวจสอบ service status
3. รอ service spin up (อาจใช้เวลา 50+ วินาที)

### File Upload ไม่ทำงาน
**ตรวจสอบ:**
1. ✅ Persistent disk mounted ที่ `/app/uploads`
2. ✅ Environment variable `UPLOAD_DIR=/app/uploads`
3. ✅ CORS configuration ถูกต้อง
4. ✅ File size ไม่เกิน 5MB
5. ✅ File type เป็นรูปภาพ (.jpg, .png, .gif, .webp)

## 📊 Monitoring

### 1. ตรวจสอบ Disk Usage
- Render Dashboard → Service → Disks
- ตรวจสอบ available space

### 2. ตรวจสอบ Logs
- Render Dashboard → Service → Logs
- หา error messages เกี่ยวกับ file upload

### 3. ตรวจสอบ File Access
```bash
# ทดสอบเข้าถึงไฟล์ที่อัปโหลดแล้ว
https://your-backend.onrender.com/api/files/profiles/filename.jpg
```

## 🎯 Best Practices

### 1. File Size Limits
- Max file size: 5MB
- Allowed types: .jpg, .jpeg, .png, .gif, .webp
- Validation อยู่ที่ frontend และ backend

### 2. Security
- File names ถูก sanitize
- Path traversal protection
- Content type validation

### 3. Performance
- ใช้ persistent disk
- File caching ผ่าน static resources
- Optimize image sizes

## 🔄 Deployment Steps

### 1. Commit Changes
```bash
git add .
git commit -m "Fix file upload for Render deployment"
git push origin main
```

### 2. Deploy on Render
- Render จะ auto-deploy เมื่อ push code
- ตรวจสอบ build logs
- ตรวจสอบ service health

### 3. Update Environment Variables
- ตั้งค่า `UPLOAD_DIR=/app/uploads`
- ตั้งค่า CORS URLs
- ตั้งค่า Omise keys

### 4. Test Upload
- ทดสอบอัปโหลดรูป profile
- ทดสอบอัปโหลดรูป product
- ทดสอบการเข้าถึงไฟล์

## 📝 Notes

### Free Tier Limitations
- Services spin down หลัง 15 นาทีไม่ใช้งาน
- First request ใช้เวลา 50+ วินาที
- Disk space จำกัด 1GB

### Production Recommendations
- Upgrade to paid plan ($7/month) สำหรับ production
- ใช้ CDN สำหรับ static files
- Implement file cleanup mechanism
- Monitor disk usage

---

**การแก้ไขนี้จะแก้ปัญหา error 500 และ 503 ในการอัปโหลดรูปภาพบน Render! 🎉**
