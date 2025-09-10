# Docker Setup Guide

คู่มือการตั้งค่า Docker สำหรับโปรเจค E-commerce

## การติดตั้ง Docker Desktop

### 1. ดาวน์โหลดและติดตั้ง Docker Desktop

1. ไปที่ https://www.docker.com/products/docker-desktop/
2. ดาวน์โหลด Docker Desktop สำหรับ Windows
3. ติดตั้งและรีสตาร์ทเครื่อง

### 2. เริ่มต้น Docker Desktop

1. เปิด Docker Desktop
2. รอให้ Docker Engine เริ่มต้นเสร็จ (จะเห็นไอคอน Docker ใน system tray)
3. ตรวจสอบสถานะโดยรัน:
   ```bash
   scripts/check-docker.bat
   ```

## การแก้ไขปัญหา

### ปัญหา: "Docker Desktop is not running"

**สาเหตุ**: Docker Desktop ยังไม่ได้เริ่มต้นหรือยังโหลดไม่เสร็จ

**วิธีแก้**:
1. เปิด Docker Desktop
2. รอให้ Docker Engine เริ่มต้นเสร็จ (ประมาณ 1-2 นาที)
3. ตรวจสอบไอคอน Docker ใน system tray ว่าสีเขียว
4. รัน `scripts/check-docker.bat` อีกครั้ง

### ปัญหา: "error during connect: Get http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine"

**สาเหตุ**: Docker Desktop ยังไม่ได้เริ่มต้นเสร็จสมบูรณ์

**วิธีแก้**:
1. รอให้ Docker Desktop โหลดเสร็จ (ดูที่ไอคอนใน system tray)
2. ลองรันคำสั่ง `docker info` ใน Command Prompt
3. หากยังไม่ได้ ให้รีสตาร์ท Docker Desktop

### ปัญหา: "Port already in use"

**สาเหตุ**: Port 5432 หรือ 5050 ถูกใช้งานอยู่

**วิธีแก้**:
1. ตรวจสอบว่า PostgreSQL หรือ pgAdmin รันอยู่หรือไม่
2. หยุดการใช้งาน port ที่ขัดแย้ง
3. หรือเปลี่ยน port ใน `docker-compose.yml`

## การใช้งาน

### 1. ตรวจสอบ Docker
```bash
scripts/check-docker.bat
```

### 2. เริ่มต้นฐานข้อมูล
```bash
scripts/start-database.bat
```

### 3. ตรวจสอบสถานะ
```bash
docker-compose ps
```

### 4. หยุดฐานข้อมูล
```bash
docker-compose down
```

### 5. ลบข้อมูลทั้งหมด (ระวัง!)
```bash
docker-compose down -v
```

## การเข้าถึงฐานข้อมูล

### pgAdmin (Web Interface)
- **URL**: http://localhost:5050
- **Email**: admin@ecommerce.com
- **Password**: admin123

### PostgreSQL Direct
- **Host**: localhost
- **Port**: 5432
- **Database**: ecommerce_dev
- **Username**: postgres
- **Password**: password

## คำสั่ง Docker ที่มีประโยชน์

```bash
# ดูสถานะ containers
docker ps

# ดู logs ของ container
docker logs ecommerce_postgres
docker logs ecommerce_pgadmin

# เข้าไปใน PostgreSQL container
docker exec -it ecommerce_postgres psql -U postgres -d ecommerce_dev

# รีสตาร์ท containers
docker-compose restart

# อัปเดต images
docker-compose pull
docker-compose up -d
```

## การแก้ไขปัญหาเพิ่มเติม

### หาก Docker Desktop ไม่เริ่มต้น
1. ตรวจสอบว่า Windows Hyper-V และ WSL2 เปิดใช้งาน
2. รีสตาร์ทเครื่อง
3. ลองติดตั้ง Docker Desktop ใหม่

### หากไม่สามารถรัน containers ได้
1. ตรวจสอบ firewall settings
2. ตรวจสอบ antivirus software
3. ลองรัน Command Prompt เป็น Administrator
