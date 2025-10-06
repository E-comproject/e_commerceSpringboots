# ⚡ Demo Deployment - Quick Start

สำหรับคนที่ต้องการ deploy เร็วๆ แบบย่อ

---

## 📋 สิ่งที่ต้องมี

- ✅ Server Ubuntu 22.04 (2GB RAM, 2 CPU cores)
- ✅ Domain name (optional แต่แนะนำ)
- ✅ ความรู้พื้นฐาน SSH และ Linux commands

---

## 🚀 Deploy ใน 10 Steps

### 1. เข้า Server
```bash
ssh root@YOUR_SERVER_IP
```

### 2. ติดตั้ง Software
```bash
# Update
sudo apt update && sudo apt upgrade -y

# Install All
sudo apt install -y openjdk-21-jdk postgresql nginx certbot python3-certbot-nginx

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2
```

### 3. ตั้งค่า Database
```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE ecommerce_demo;
CREATE USER ecommerce_user WITH PASSWORD 'YourPassword123!';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_demo TO ecommerce_user;
\c ecommerce_demo
GRANT ALL ON SCHEMA public TO ecommerce_user;
\q
```

### 4. Upload Code
```bash
cd /var/www
sudo mkdir ecommerce
sudo chown $USER:$USER ecommerce
cd ecommerce

# Clone your repo หรือ upload ด้วย SCP/SFTP
git clone YOUR_REPO_URL .
```

### 5. ตั้งค่า Backend
```bash
cd /var/www/ecommerce/backend
cp .env.staging.example .env
nano .env

# แก้ไข:
# - DATABASE_URL, DATABASE_USER, DATABASE_PASSWORD
# - API_BASE_URL, FRONTEND_URL
# - CORS_ALLOWED_ORIGINS
# เก็บ OMISE test keys ไว้

# Build
mvn clean package -DskipTests

# สร้าง systemd service
sudo nano /etc/systemd/system/ecommerce-backend.service
```

**Paste service file:**
```ini
[Unit]
Description=E-Commerce Backend
After=postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/ecommerce/backend
EnvironmentFile=/var/www/ecommerce/backend/.env
ExecStart=/usr/bin/java -jar target/ecommerce-application-0.0.1-SNAPSHOT.jar
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Start
sudo chown -R www-data:www-data /var/www/ecommerce
sudo systemctl enable ecommerce-backend
sudo systemctl start ecommerce-backend
sudo systemctl status ecommerce-backend
```

### 6. ตั้งค่า Frontend
```bash
cd /var/www/ecommerce/frontend
cp .env.staging.example .env.production
nano .env.production

# แก้ไข:
# - NEXT_PUBLIC_API_URL
# - NEXT_PUBLIC_WS_URL  
# - NEXT_PUBLIC_APP_URL
# เก็บ OMISE test key ไว้
# ตั้ง NEXT_PUBLIC_APP_MODE=DEMO

# Build & Run
npm install --production
npm run build
pm2 start npm --name "ecommerce-frontend" -- start
pm2 save
pm2 startup
```

### 7. ตั้งค่า Nginx
```bash
sudo nano /etc/nginx/sites-available/ecommerce
```

**Config สำหรับใช้ IP:**
```nginx
server {
    listen 80 default_server;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
    
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
    }
    
    location /ws-chat {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 8. (Optional) Setup SSL
```bash
# ถ้ามี domain
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

### 9. Open Firewall
```bash
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw enable
```

### 10. เสร็จแล้ว!
เปิดเว็บ: `http://YOUR_SERVER_IP` หรือ `https://yourdomain.com`

**ต้องเห็น:**
- ✅ Demo banner สีเหลืองด้านบน
- ✅ หน้าเว็บแสดงปกติ
- ✅ Login/Register ได้

---

## 🧪 ทดสอบ Payment

**Test Card:**
```
Card: 4242 4242 4242 4242
CVV: 123
Expiry: 12/25
```

**Test Phone (TrueMoney):**
```
Phone: 0812345678 (เบอร์ใดก็ได้)
```

---

## 📊 Check Status

```bash
# Backend
sudo systemctl status ecommerce-backend
sudo journalctl -u ecommerce-backend -f

# Frontend  
pm2 status
pm2 logs ecommerce-frontend

# Database
sudo systemctl status postgresql
```

---

## 🔧 Restart Services

```bash
# Backend
sudo systemctl restart ecommerce-backend

# Frontend
pm2 restart ecommerce-frontend

# Nginx
sudo systemctl reload nginx
```

---

## 🆘 ติดปัญหา?

อ่านเพิ่มเติม: `DEMO_DEPLOYMENT_GUIDE.md` (ฉบับเต็ม)

---

**Deploy time: ~30-60 นาที** 🚀
