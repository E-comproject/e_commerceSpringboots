# 🗄️ Database Setup Guide

## เข้าใจความแตกต่างระหว่าง Local และ Cloud Database

### 🏠 Local Development Database (Docker)

**ที่อยู่:**
```yaml
# จาก docker-compose.yml
Host: localhost:6543
Database: ecommerce_dev
User: postgres
Password: password
```

**ใช้สำหรับ:**
- ✅ Development ใน local machine
- ✅ Testing features
- ✅ Debug

**ข้อมูล:**
- ข้อมูลอยู่ใน Docker volume
- เปิด-ปิดได้ตามต้องการ
- ไม่สามารถเข้าถึงจาก internet

---

### ☁️ Render Cloud Database (Production)

**ที่อยู่:**
```bash
Host: dpg-xxxxx.render.com
Database: ecommerce_prod
User: ecommerce_user (หรือชื่อที่ Render generate)
Password: <random_secure_password> (Render สร้างให้)
```

**ใช้สำหรับ:**
- ✅ Production deployment
- ✅ Demo/Portfolio online
- ✅ เข้าถึงได้จาก internet

**ข้อมูล:**
- ข้อมูลอยู่บน Render cloud
- รันตลอด 24/7
- เข้าถึงได้จากทุกที่

---

## 🔧 วิธีสร้าง Render Database

### Step 1: สร้าง PostgreSQL Service

1. ไปที่ [Render Dashboard](https://dashboard.render.com/)
2. คลิก **New** → **PostgreSQL**

### Step 2: ตั้งค่า Database

```
Name:               ecommerce-postgres
Database:           ecommerce_prod
User:               ecommerce_user
Region:             Singapore (หรือใกล้ที่สุด)
PostgreSQL Version: 15 (หรือ latest)
Plan:               Starter (Free)
```

### Step 3: คลิก "Create Database"

Render จะ:
1. สร้าง PostgreSQL instance ใหม่
2. Generate password ที่ปลอดภัย
3. สร้าง connection URLs

---

## 📋 Copy Credentials จาก Render

หลังจาก database สร้างเสร็จ คุณจะเห็น:

### Dashboard จะแสดง:

```
┌─────────────────────────────────────────────────────────┐
│ Database Information                                     │
├─────────────────────────────────────────────────────────┤
│ Name:     ecommerce-postgres                            │
│ Status:   Available ✓                                   │
│ Region:   Singapore                                     │
│ Version:  PostgreSQL 15                                 │
├─────────────────────────────────────────────────────────┤
│ CONNECTIONS                                             │
├─────────────────────────────────────────────────────────┤
│ Internal Database URL:                                  │
│ postgresql://ecommerce_user:AaBbCc123...@dpg-xxxxx-... │
│                                                         │
│ External Database URL:                                  │
│ postgresql://ecommerce_user:AaBbCc123...@dpg-xxxxx-... │
│                                                         │
│ PSQL Command:                                           │
│ psql -h dpg-xxxxx... -U ecommerce_user ecommerce_prod  │
├─────────────────────────────────────────────────────────┤
│ CREDENTIALS                                             │
├─────────────────────────────────────────────────────────┤
│ Database:  ecommerce_prod                               │
│ Username:  ecommerce_user                               │
│ Password:  AaBbCc123XxYyZz789... [Show] [Copy]         │
│ Host:      dpg-xxxxx-xxx.singapore-postgres.render.com  │
│ Port:      5432                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 นำ Credentials ไปใช้

### Copy ค่าเหล่านี้:

```bash
# 1. Internal Database URL (แนะนำ)
DATABASE_URL=postgresql://ecommerce_user:AaBbCc123...@dpg-xxxxx.render.com/ecommerce_prod

# หรือ แยกเป็น 3 ส่วน:
DATABASE_URL=postgresql://dpg-xxxxx.render.com:5432/ecommerce_prod
DATABASE_USER=ecommerce_user
DATABASE_PASSWORD=AaBbCc123XxYyZz789...
```

### วาง Environment Variables ใน Backend Service:

ไปที่ **Backend Service** → **Environment** tab:

```bash
# Database Connection (คัดลอกจาก PostgreSQL service ด้านบน)
DATABASE_URL=<paste_Internal_Database_URL>
DATABASE_USER=<paste_username>
DATABASE_PASSWORD=<paste_password>

# Spring Config
SPRING_DATASOURCE_URL=${DATABASE_URL}
SPRING_DATASOURCE_USERNAME=${DATABASE_USER}
SPRING_DATASOURCE_PASSWORD=${DATABASE_PASSWORD}
```

---

## ⚠️ สิ่งสำคัญที่ต้องจำ

### ❌ อย่าใช้ค่าจาก Local Docker

```bash
# ❌ อย่าใช้อันนี้ใน Render!
DATABASE_URL=postgresql://localhost:6543/ecommerce_dev
DATABASE_USER=postgres
DATABASE_PASSWORD=password
```

**เพราะ:**
- `localhost` หมายถึง local machine (ไม่ใช่ Render)
- Render backend ไม่สามารถเชื่อมต่อกับ local Docker ได้

### ✅ ใช้ค่าที่ Render สร้างให้

```bash
# ✅ ใช้อันนี้ (จาก Render Dashboard)
DATABASE_URL=postgresql://dpg-xxxxx.render.com/ecommerce_prod
DATABASE_USER=ecommerce_user
DATABASE_PASSWORD=<Render_generated_password>
```

---

## 🔒 ความปลอดภัย

### Password ที่ Render สร้างให้:
- ✅ Random และปลอดภัย (32+ characters)
- ✅ ไม่ซ้ำกับที่อื่น
- ✅ ไม่ต้องจำ (copy-paste จาก dashboard)

### ห้ามใช้ password ง่ายๆ:
```bash
# ❌ อย่าใช้ password แบบนี้ใน production!
DATABASE_PASSWORD=password
DATABASE_PASSWORD=123456
DATABASE_PASSWORD=admin
```

---

## 📊 เปรียบเทียบ

| Feature | Local Docker | Render Cloud |
|---------|--------------|--------------|
| **Host** | localhost:6543 | dpg-xxxxx.render.com |
| **Database** | ecommerce_dev | ecommerce_prod |
| **User** | postgres | ecommerce_user |
| **Password** | password (ง่าย) | xyz123... (random) |
| **เข้าถึง** | Local only | Internet |
| **ใช้สำหรับ** | Development | Production |
| **ข้อมูล** | Test data | Real data |
| **สร้างโดย** | docker-compose | Render |

---

## 🎯 สรุป

1. **Local database** = สำหรับ development
   - ใช้ค่าจาก `docker-compose.yml`
   - Password: `password`

2. **Render database** = สำหรับ production  
   - **สร้างใหม่บน Render**
   - **Password: Render generate ให้**
   - **Copy จาก Render Dashboard**

3. **ไม่ใช่ค่าเดิม!** แต่เป็นค่าที่ Render สร้างให้ใหม่

---

## 🚀 Next Steps

1. ✅ สร้าง PostgreSQL database บน Render
2. ✅ Copy credentials จาก Render dashboard
3. ✅ วาง credentials ใน Backend environment variables
4. ✅ Deploy backend
5. ✅ Database จะถูกสร้างตาราง schema อัตโนมัติ (ครั้งแรก)

---

## 💡 Tips

### ถ้าต้องการ migrate ข้อมูลจาก local → Render:

```bash
# 1. Export จาก local
docker exec ecommerce_postgres pg_dump -U postgres ecommerce_dev > backup.sql

# 2. Import ไปยัง Render
psql <Render_Database_URL> < backup.sql
```

**แต่สำหรับ demo/test ไม่จำเป็น** - ให้ Render สร้าง schema ใหม่เลย
