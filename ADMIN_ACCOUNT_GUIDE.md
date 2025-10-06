# 👤 Admin Account Setup Guide

## 🔑 Default Admin Credentials

```
Email:    admin@ecommerce.com
Password: admin123
```

---

## 🚀 Admin Account on Render Deployment

### Option 1: ✨ Automatic Creation (Recommended)

หลังจาก fix `DataLoader.java` แล้ว admin จะถูกสร้างอัตโนมัติเมื่อ deploy ครั้งแรก

**Check logs หลัง deploy:**
```
✓ Admin user created: admin@ecommerce.com / admin123
```

หรือ
```
✓ Admin user already exists
```

### Option 2: 🔧 Manual Creation via API

ถ้า admin ไม่ถูกสร้างอัตโนมัติ สามารถสร้างด้วย API:

```bash
# สร้าง admin account
curl -X POST https://your-backend.onrender.com/api/auth/create-admin
```

**Response:**
```json
{
  "message": "Admin user created successfully",
  "email": "admin@ecommerce.com",
  "password": "admin123"
}
```

---

## ✅ Verify Admin Account

### 1. Check ว่า Admin มีอยู่หรือไม่:

```bash
curl https://your-backend.onrender.com/api/auth/check-admin
```

**Response (exists):**
```json
{
  "exists": true,
  "username": "admin",
  "email": "admin@ecommerce.com",
  "role": "ROLE_ADMIN",
  "firstName": "Admin",
  "lastName": "System"
}
```

**Response (not exists):**
```json
{
  "exists": false
}
```

### 2. Login ทดสอบ:

```bash
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ecommerce.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@ecommerce.com",
    "role": "ROLE_ADMIN"
  }
}
```

---

## 🔧 Troubleshooting

### ❌ Admin Account ไม่มี

**วิธีแก้:**

#### 1. สร้างผ่าน API:
```bash
curl -X POST https://your-backend.onrender.com/api/auth/create-admin
```

#### 2. ตรวจสอบ DataLoader logs:
```
Render Dashboard → Backend Service → Logs
ค้นหา: "Admin user created" หรือ "Admin user already exists"
```

#### 3. ตรวจสอบ Profile:
```
ใน Environment variables ต้องมี:
SPRING_PROFILES_ACTIVE=prod

และ DataLoader.java ต้องมี:
@Profile({"dev", "prod"})
```

### ❌ Login ไม่ได้

**เช็คสิ่งเหล่านี้:**

#### 1. Email ถูกต้องหรือไม่:
```bash
curl https://your-backend.onrender.com/api/auth/check-admin
```

#### 2. ลอง Fix Admin:
```bash
curl -X POST https://your-backend.onrender.com/api/auth/fix-admin
```

**Response:**
```json
{
  "message": "Admin user fixed successfully",
  "username": "admin",
  "email": "admin@ecommerce.com",
  "password": "admin123",
  "role": "ROLE_ADMIN"
}
```

#### 3. Database ถูก Drop หรือไม่:
```
ตรวจสอบ application.properties:
spring.jpa.hibernate.ddl-auto=update (ไม่ใช่ create-drop!)
```

---

## 📝 API Endpoints Summary

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/auth/create-admin` | POST | สร้าง admin account | ❌ No |
| `/auth/check-admin` | GET | เช็คว่า admin มีหรือไม่ | ❌ No |
| `/auth/fix-admin` | POST | แก้ไข admin account | ❌ No |
| `/auth/login` | POST | Login | ❌ No |

**Note:** Endpoints เหล่านี้เปิด public (permitAll) เพื่อความสะดวก

---

## 🔒 Security Recommendations

### สำหรับ Production จริง:

#### 1. เปลี่ยนรหัสผ่าน Admin

หลัง login ครั้งแรก ให้เปลี่ยนรหัสผ่านทันที:

```bash
curl -X PUT https://your-backend.onrender.com/api/users/me/password \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "admin123",
    "newPassword": "YourStrongPassword123!"
  }'
```

#### 2. ปิด Admin Creation Endpoints

แก้ไข `SecurityConfig.java` ให้ protect endpoints:

```java
// Before (public)
.requestMatchers("/auth/**").permitAll()

// After (protect admin creation)
.requestMatchers("/auth/login", "/auth/register", "/auth/refresh").permitAll()
.requestMatchers("/auth/create-admin", "/auth/fix-admin").hasRole("ADMIN")
```

#### 3. ใช้ Environment Variable สำหรับรหัสผ่าน

แทนที่จะ hardcode `admin123`:

```java
@Value("${app.admin.password:admin123}")
private String adminPassword;

admin.setPassword(passwordEncoder.encode(adminPassword));
```

Environment Variable:
```bash
APP_ADMIN_PASSWORD=<strong_random_password>
```

---

## 🎯 Summary for Render Deployment

### ขั้นตอน:

1. ✅ Deploy backend (DataLoader จะสร้าง admin อัตโนมัติ)
2. ✅ ตรวจสอบ logs: "Admin user created"
3. ✅ ถ้าไม่มี: `POST /auth/create-admin`
4. ✅ Verify: `GET /auth/check-admin`
5. ✅ Login ทดสอบ: `POST /auth/login`
6. ⚠️ เปลี่ยนรหัสผ่านหลังใช้งานจริง

### Default Credentials:
```
Email:    admin@ecommerce.com
Password: admin123
Role:     ROLE_ADMIN
```

---

## 💡 Tips

### Local Development

Admin จะถูกสร้างอัตโนมัติเมื่อ:
```bash
# Start backend
mvn spring-boot:run -Dspring.profiles.active=dev

# Check logs
✓ Admin user created: admin@ecommerce.com / admin123
```

### Render Production

Admin จะถูกสร้างอัตโนมัติหลัง deploy ครั้งแรก (หลัง fix DataLoader)

หรือสร้างด้วย:
```bash
curl -X POST https://your-backend.onrender.com/api/auth/create-admin
```

---

**Admin account พร้อมใช้งานแล้ว! 🎉**
