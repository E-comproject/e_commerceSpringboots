# 🎭 Demo Deployment Guide

คู่มือ deploy แอปพลิเคชันแบบ **DEMO MODE** สำหรับการทดสอบและแสดงผลงาน

---

## 🎯 สิ่งที่ได้จาก Demo Mode

✅ Deploy บน production server ได้ทันที  
✅ คนอื่นเข้าถึงและทดสอบได้  
✅ ทุกฟีเจอร์ทำงานครบ (payment, cart, chat, orders)  
✅ เหมาะสำหรับ portfolio, MVP, หรือ stakeholder demo  
✅ ไม่ต้องรอ payment gateway approval  

❌ ไม่สามารถรับเงินจริงได้ (จะแสดง banner เตือน)

---

## 📦 ขั้นตอนการ Deploy (Step by Step)

### ขั้นที่ 1: เตรียม Server

#### 1.1 เช่า Server (เลือก 1 อย่าง):
- **DigitalOcean** Droplet ($6-12/month)
- **AWS** EC2 t3.micro ($10-15/month)
- **Google Cloud** Compute Engine
- **Hostinger VPS** Thailand
- **True Cloud** Thailand

**Recommended Specs:**
- CPU: 2 cores
- RAM: 2-4 GB
- Storage: 25+ GB SSD
- OS: Ubuntu 22.04 LTS

#### 1.2 เชื่อมต่อ Server:
```bash
# ผ่าน SSH
ssh root@your-server-ip

# หรือใช้ PuTTY สำหรับ Windows
```

#### 1.3 ติดตั้ง Software:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Java 21
sudo apt install -y openjdk-21-jdk

# Verify Java
java -version

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node
node -v
npm -v

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Install PM2 for Node.js
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

---

### ขั้นที่ 2: ตั้งค่า Database

```bash
# Switch to postgres user
sudo -u postgres psql

# สร้าง database และ user
CREATE DATABASE ecommerce_demo;
CREATE USER ecommerce_user WITH ENCRYPTED PASSWORD 'YourSecurePassword123!';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_demo TO ecommerce_user;

# Grant schema permissions (สำคัญ!)
\c ecommerce_demo
GRANT ALL ON SCHEMA public TO ecommerce_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ecommerce_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ecommerce_user;

# Exit
\q
```

**ทดสอบ connection:**
```bash
psql -h localhost -U ecommerce_user -d ecommerce_demo
# ใส่ password ที่ตั้งไว้
# ถ้าเข้าได้แสดงว่า OK
\q
```

---

### ขั้นที่ 3: ตั้งค่า Domain (Optional แต่แนะนำ)

#### 3.1 ซื้อ Domain:
- Namecheap.com
- GoDaddy.com
- CloudFlare.com
- ไทยสแควร์.com

#### 3.2 ตั้งค่า DNS Records:
```
Type: A Record
Name: @ (หรือ www)
Value: YOUR_SERVER_IP
TTL: 3600

Type: A Record  
Name: api
Value: YOUR_SERVER_IP
TTL: 3600
```

รอ DNS propagate (15-60 นาที)

#### 3.3 ถ้าไม่มี Domain:
ใช้ IP address ได้เลย เช่น:
- Frontend: http://YOUR_IP:3000
- Backend: http://YOUR_IP:8080

---

### ขั้นที่ 4: Upload Code ไป Server

#### วิธีที่ 1: ใช้ Git (แนะนำ)
```bash
# บน server
cd /var/www
sudo mkdir ecommerce
sudo chown $USER:$USER ecommerce
cd ecommerce

# Clone repo
git clone YOUR_REPO_URL .

# หรือถ้ามี code อยู่แล้ว
git init
git remote add origin YOUR_REPO_URL
git pull origin main
```

#### วิธีที่ 2: Upload ด้วย SCP/SFTP
```bash
# จาก local machine
scp -r C:\merge_dev\e_commerceSpringboots/* user@server:/var/www/ecommerce/

# หรือใช้ WinSCP, FileZilla
```

---

### ขั้นที่ 5: ตั้งค่า Backend Environment

```bash
cd /var/www/ecommerce/backend

# สร้างไฟล์ .env จาก template
cp .env.staging.example .env

# แก้ไขไฟล์
nano .env
```

**แก้ไขค่าเหล่านี้ใน .env:**
```bash
# Database (เปลี่ยนเป็นค่าจริง)
DATABASE_URL=jdbc:postgresql://localhost:5432/ecommerce_demo
DATABASE_USER=ecommerce_user
DATABASE_PASSWORD=YourSecurePassword123!

# JWT Secret (สุ่มใหม่!)
JWT_SECRET=your_random_secret_at_least_32_chars_long_here

# Omise (ใช้ test keys)
OMISE_PUBLIC_KEY=pkey_test_65a692c53l3a7q5cheh
OMISE_SECRET_KEY=skey_test_656kahkzqaoi7js7rjc

# URLs (แก้เป็น domain หรือ IP จริง)
API_BASE_URL=https://api.yourdomain.com
# หรือ
API_BASE_URL=http://YOUR_SERVER_IP:8080

FRONTEND_URL=https://yourdomain.com
# หรือ
FRONTEND_URL=http://YOUR_SERVER_IP:3000

CORS_ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:3000
# หรือ
CORS_ALLOWED_ORIGINS=http://YOUR_SERVER_IP:3000

# Upload directory
UPLOAD_DIR=uploads

# App mode
APP_MODE=DEMO
```

**Save:** Ctrl+O, Enter, Ctrl+X

---

### ขั้นที่ 6: Build และ Run Backend

```bash
cd /var/www/ecommerce/backend

# Build with Maven
./mvnw clean package -DskipTests

# หรือถ้ามี Maven installed
mvn clean package -DskipTests

# สร้าง upload directories
mkdir -p uploads/{products,profiles,shops,chat}

# Test run (ทดสอบก่อน)
java -jar target/ecommerce-application-0.0.1-SNAPSHOT.jar

# ถ้า run ได้ กด Ctrl+C แล้วสร้าง systemd service
```

#### สร้าง Systemd Service:
```bash
sudo nano /etc/systemd/system/ecommerce-backend.service
```

**Paste:**
```ini
[Unit]
Description=E-Commerce Backend Service
After=postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/ecommerce/backend
EnvironmentFile=/var/www/ecommerce/backend/.env
ExecStart=/usr/bin/java -Xms512m -Xmx1g -jar /var/www/ecommerce/backend/target/ecommerce-application-0.0.1-SNAPSHOT.jar
Restart=always
RestartSec=10
StandardOutput=append:/var/log/ecommerce/backend.log
StandardError=append:/var/log/ecommerce/backend-error.log

[Install]
WantedBy=multi-user.target
```

**Start service:**
```bash
# สร้าง log directory
sudo mkdir -p /var/log/ecommerce
sudo chown www-data:www-data /var/log/ecommerce

# Set permissions
sudo chown -R www-data:www-data /var/www/ecommerce

# Reload systemd
sudo systemctl daemon-reload

# Enable และ start
sudo systemctl enable ecommerce-backend
sudo systemctl start ecommerce-backend

# Check status
sudo systemctl status ecommerce-backend

# Check logs
sudo tail -f /var/log/ecommerce/backend.log
```

**ทดสอบ Backend:**
```bash
# Test API
curl http://localhost:8080/api/products

# ถ้าได้ response แสดงว่า OK
```

---

### ขั้นที่ 7: ตั้งค่า Frontend Environment

```bash
cd /var/www/ecommerce/frontend

# สร้างไฟล์ .env.production
cp .env.staging.example .env.production

# แก้ไข
nano .env.production
```

**แก้ไขค่า:**
```bash
# API URLs (ใช้ domain หรือ IP จริง)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com

# หรือถ้าใช้ IP
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:8080/api
NEXT_PUBLIC_WS_URL=ws://YOUR_SERVER_IP:8080

# Omise (test key)
NEXT_PUBLIC_OMISE_PUBLIC_KEY=pkey_test_65a692c53l3a7q5cheh

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
# หรือ
NEXT_PUBLIC_APP_URL=http://YOUR_SERVER_IP:3000

# Demo mode (สำคัญ!)
NEXT_PUBLIC_APP_MODE=DEMO
```

---

### ขั้นที่ 8: Build และ Run Frontend

```bash
cd /var/www/ecommerce/frontend

# Install dependencies
npm install --production

# Build
npm run build

# Test run
npm start

# ถ้า OK กด Ctrl+C แล้วใช้ PM2
```

#### ใช้ PM2:
```bash
cd /var/www/ecommerce/frontend

# Start with PM2
pm2 start npm --name "ecommerce-frontend" -- start

# Save PM2 config
pm2 save

# Setup auto-start on boot
pm2 startup systemd

# ทำตามคำสั่งที่ขึ้นมา (จะมี sudo ...)

# Check status
pm2 status
pm2 logs ecommerce-frontend
```

**ทดสอบ Frontend:**
```bash
# เปิด browser ไปที่
http://YOUR_SERVER_IP:3000

# ถ้าเห็นหน้าเว็บแสดงว่า OK
```

---

### ขั้นที่ 9: ตั้งค่า Nginx (Reverse Proxy)

```bash
sudo nano /etc/nginx/sites-available/ecommerce
```

**Config สำหรับใช้ IP (ไม่มี domain):**
```nginx
server {
    listen 80 default_server;
    server_name _;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket
    location /ws-chat {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
    
    # Uploaded files
    location /api/files {
        alias /var/www/ecommerce/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

**หรือ Config สำหรับมี Domain:**
```nginx
# Backend API (api.yourdomain.com)
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /ws-chat {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}

# Frontend (yourdomain.com)
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable site:**
```bash
# Link config
sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/

# Remove default
sudo rm /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

### ขั้นที่ 10: ตั้งค่า SSL (ถ้ามี Domain)

```bash
# Install SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# ตอบคำถาม:
# - Email: your-email@example.com
# - Agree to terms: Y
# - Redirect HTTP to HTTPS: 2 (Yes)

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## ✅ Checklist หลัง Deploy

- [ ] Backend ทำงาน: `sudo systemctl status ecommerce-backend`
- [ ] Frontend ทำงาน: `pm2 status`
- [ ] Database connect ได้
- [ ] เข้าเว็บได้ (http หรือ https)
- [ ] **เห็น Demo Banner สีเหลือง** ที่บอกว่าเป็น demo mode
- [ ] Register user ได้
- [ ] Login ได้
- [ ] เพิ่มสินค้าลง cart ได้
- [ ] Checkout ได้
- [ ] Payment methods แสดงครบ
- [ ] Upload รูปได้

---

## 🧪 วิธีทดสอบ Payment ใน Demo Mode

### 1. Credit Card (Test)
```
Card Number: 4242 4242 4242 4242
CVV: 123
Expiry: 12/25 (หรืออนาคตใดก็ได้)
Name: Test User
```

**Result:** จะชำระสำเร็จ (simulated)

### 2. PromptPay QR Code
- เลือก PromptPay
- จะได้ QR code และ link
- ระบบจะ simulate การชำระ (รอ 10 นาทีหรือกด "ตรวจสอบสถานะ")

### 3. TrueMoney Wallet
```
Phone: 0812345678 (เบอร์ใดก็ได้)
```
- จะเปิดหน้าต่าง authorization
- Simulate การยืนยัน

### 4. Internet Banking
- เลือกธนาคารใดก็ได้
- จะได้ link ไปยังหน้าจำลองธนาคาร
- Simulate การชำระ

### 5. COD (Cash on Delivery)
- ทำงานปกติ ไม่ต้องชำระ

---

## 📊 Monitoring & Logs

### Backend Logs:
```bash
# Real-time logs
sudo journalctl -u ecommerce-backend -f

# Last 100 lines
sudo journalctl -u ecommerce-backend -n 100

# Errors only
sudo journalctl -u ecommerce-backend -p err
```

### Frontend Logs:
```bash
# PM2 logs
pm2 logs ecommerce-frontend

# PM2 status
pm2 status
pm2 monit
```

### Database Logs:
```bash
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### Nginx Logs:
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🚨 Troubleshooting

### Backend ไม่ start:
```bash
# Check logs
sudo journalctl -u ecommerce-backend -n 50

# ปัญหาที่เจอบ่อย:
# 1. Port 8080 ถูกใช้อยู่
sudo netstat -tulpn | grep 8080

# 2. Database connection failed
psql -h localhost -U ecommerce_user -d ecommerce_demo

# 3. Permissions
sudo chown -R www-data:www-data /var/www/ecommerce
```

### Frontend ไม่ start:
```bash
# Check PM2
pm2 logs ecommerce-frontend

# Restart
pm2 restart ecommerce-frontend

# Rebuild
cd /var/www/ecommerce/frontend
npm run build
pm2 restart ecommerce-frontend
```

### ไม่เห็น Demo Banner:
```bash
# Check environment variable
cd /var/www/ecommerce/frontend
cat .env.production | grep APP_MODE

# ต้องมี: NEXT_PUBLIC_APP_MODE=DEMO

# Rebuild
npm run build
pm2 restart ecommerce-frontend
```

### Images ไม่โหลด:
```bash
# Check permissions
ls -la /var/www/ecommerce/backend/uploads
sudo chown -R www-data:www-data /var/www/ecommerce/backend/uploads
sudo chmod -R 755 /var/www/ecommerce/backend/uploads

# Check Nginx config
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🎉 เสร็จแล้ว!

เว็บของคุณพร้อม demo แล้ว!

**Demo URL:**
- ถ้ามี domain: https://yourdomain.com
- ถ้าใช้ IP: http://YOUR_SERVER_IP

**แจ้ง user ว่า:**
- ✅ เว็บพร้อมทดสอบแล้ว
- ⚠️ Demo mode - ไม่มีการหักเงินจริง
- 🔒 ใช้ test card: 4242 4242 4242 4242

---

## 🔄 อัพเกรดเป็น Production ในอนาคต

เมื่อได้ Omise live keys แล้ว:

```bash
# 1. อัพเดท Backend .env
vi /var/www/ecommerce/backend/.env
# เปลี่ยน OMISE keys เป็น live keys
# เปลี่ยน APP_MODE=PRODUCTION

# 2. อัพเดท Frontend .env.production
vi /var/www/ecommerce/frontend/.env.production
# เปลี่ยน OMISE key เป็น live key
# เปลี่ยน NEXT_PUBLIC_APP_MODE=PRODUCTION

# 3. Restart services
sudo systemctl restart ecommerce-backend
cd /var/www/ecommerce/frontend && npm run build
pm2 restart ecommerce-frontend

# 4. Demo banner จะหายไป
```

---

**Good luck with your demo deployment! 🚀**
