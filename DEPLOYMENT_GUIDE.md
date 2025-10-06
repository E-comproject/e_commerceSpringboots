# 🚀 Production Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] จัดเตรียม Production Server (VPS/Cloud)
- [ ] ติดตั้ง Java 21+
- [ ] ติดตั้ง Node.js 18+
- [ ] ติดตั้ง PostgreSQL 15+
- [ ] ติดตั้ง Nginx (สำหรับ reverse proxy)
- [ ] จัดเตรียม domain name และ SSL certificate

### 2. Database Configuration
- [ ] สร้าง production database
- [ ] ตั้งค่า database user และ password ที่ปลอดภัย
- [ ] เปิด port 5432 (หรือตาม config)
- [ ] Backup database อัตโนมัติ
- [ ] ตั้งค่า connection pool

### 3. Security
- [ ] เปลี่ยน JWT secret key
- [ ] ตั้งค่า CORS สำหรับ production domain
- [ ] ปิดการใช้งาน DevController และ test endpoints
- [ ] ตรวจสอบ sensitive data ใน logs
- [ ] ตั้งค่า rate limiting
- [ ] ตั้งค่า HTTPS

### 4. Payment Gateway (Omise)
- [ ] สมัคร Omise production account
- [ ] ได้รับ production API keys
- [ ] ทดสอบ payment flow ใน test mode
- [ ] เปลี่ยนเป็น production keys
- [ ] ตั้งค่า webhook URL

### 5. File Storage
- [ ] ตั้งค่า uploads directory
- [ ] กำหนด file size limits
- [ ] ตั้งค่า backup สำหรับ uploaded files
- [ ] พิจารณาใช้ S3/Cloud Storage

---

## 🔧 Backend Configuration

### 1. Application Properties

สร้างไฟล์ `application-prod.yml` หรือใช้ environment variables:

```yaml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  application:
    name: ecommerce-backend
  
  datasource:
    url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/ecommerce_prod}
    username: ${DATABASE_USER:postgres}
    password: ${DATABASE_PASSWORD:your_secure_password}
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000
  
  jpa:
    hibernate:
      ddl-auto: validate  # IMPORTANT: Use validate in production!
    show-sql: false
    properties:
      hibernate:
        format_sql: false
        dialect: org.hibernate.dialect.PostgreSQLDialect
  
  servlet:
    multipart:
      max-file-size: 5MB
      max-request-size: 10MB

jwt:
  secret: ${JWT_SECRET:CHANGE_THIS_TO_SECURE_RANDOM_STRING_MIN_32_CHARS}
  expiration: ${JWT_EXPIRATION:86400000}
  refresh-expiration: ${JWT_REFRESH_EXPIRATION:604800000}

omise:
  public-key: ${OMISE_PUBLIC_KEY:your_production_public_key}
  secret-key: ${OMISE_SECRET_KEY:your_production_secret_key}
  api-version: ${OMISE_API_VERSION:2019-05-29}
  webhook-secret: ${OMISE_WEBHOOK_SECRET:your_webhook_secret}

app:
  cors:
    allowed-origins: ${CORS_ALLOWED_ORIGINS:https://yourdomain.com}
  api:
    base-url: ${API_BASE_URL:https://api.yourdomain.com}
  frontend:
    url: ${FRONTEND_URL:https://yourdomain.com}

logging:
  level:
    root: INFO
    com.ecommerce: INFO
  file:
    name: /var/log/ecommerce/app.log
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
```

### 2. Environment Variables

สร้างไฟล์ `.env` หรือตั้งค่าใน server:

```bash
# Database
DATABASE_URL=jdbc:postgresql://your-db-host:5432/ecommerce_prod
DATABASE_USER=ecommerce_user
DATABASE_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_super_secure_random_string_at_least_32_characters_long_here
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# Omise Payment Gateway
OMISE_PUBLIC_KEY=pkey_live_xxxxx
OMISE_SECRET_KEY=skey_live_xxxxx
OMISE_WEBHOOK_SECRET=whsec_xxxxx

# Application URLs
API_BASE_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# File Upload Path
UPLOAD_DIR=/var/www/ecommerce/uploads
```

### 3. แก้ไข Hardcoded URLs

ต้องแก้ไขไฟล์เหล่านี้:

**Backend Files ที่ต้องแก้:**
1. `FileUploadController.java` - แก้ไข hardcoded URL
2. `UserController.java` - แก้ไข image URL
3. `ChatServiceImpl.java` - แก้ไข profile image URL
4. `ReviewServiceImpl.java` - แก้ไข profile image URL
5. `CartController.java` - แก้ไข product image URL
6. `OmiseController.java` - แก้ไข return URI
7. ทุก `@CrossOrigin` annotations - ใช้ ${cors.allowed.origins}

### 4. Build Backend

```bash
cd backend

# Build JAR file
mvn clean package -DskipTests

# หรือรวม tests
mvn clean package

# ไฟล์ JAR จะอยู่ที่
# target/ecommerce-application-0.0.1-SNAPSHOT.jar
```

### 5. Run Backend in Production

```bash
# วิธีที่ 1: Direct run with profile
java -jar target/ecommerce-application-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod

# วิธีที่ 2: With environment variables
export SPRING_PROFILES_ACTIVE=prod
java -jar -Xms512m -Xmx2g target/ecommerce-application-0.0.1-SNAPSHOT.jar

# วิธีที่ 3: Background process
nohup java -jar target/ecommerce-application-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod > app.log 2>&1 &

# วิธีที่ 4: Using systemd (recommended)
# สร้างไฟล์ /etc/systemd/system/ecommerce-backend.service
```

---

## ⚛️ Frontend Configuration

### 1. Environment Variables

สร้างไฟล์ `.env.production`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com

# Omise Payment
NEXT_PUBLIC_OMISE_PUBLIC_KEY=pkey_live_xxxxx

# Application URLs
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. Update next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.yourdomain.com',
        port: '',
        pathname: '/api/files/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
  // Optimize for production
  reactStrictMode: true,
  swcMinify: true,
  
  // Optional: If using standalone output
  output: 'standalone',
}

module.exports = nextConfig
```

### 3. Build Frontend

```bash
cd frontend

# Install dependencies
npm install --production

# Build for production
npm run build

# ผลลัพธ์จะอยู่ใน .next/ directory
```

### 4. Run Frontend in Production

```bash
# วิธีที่ 1: Next.js standalone server
npm start

# วิธีที่ 2: PM2 (recommended)
pm2 start npm --name "ecommerce-frontend" -- start
pm2 save
pm2 startup

# วิธีที่ 3: Using Nginx + Static export
npm run build
# จากนั้นใช้ Nginx serve static files
```

---

## 🌐 Nginx Configuration

### 1. Backend Reverse Proxy

`/etc/nginx/sites-available/api.yourdomain.com`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy settings
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # WebSocket
    location /ws-chat {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Uploaded files
    location /api/files {
        alias /var/www/ecommerce/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Frontend

`/etc/nginx/sites-available/yourdomain.com`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Next.js proxy
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

---

## 🔄 Systemd Services

### Backend Service

`/etc/systemd/system/ecommerce-backend.service`:

```ini
[Unit]
Description=E-Commerce Backend Service
After=postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/ecommerce/backend
Environment="SPRING_PROFILES_ACTIVE=prod"
EnvironmentFile=/var/www/ecommerce/backend/.env
ExecStart=/usr/bin/java -Xms512m -Xmx2g -jar /var/www/ecommerce/backend/target/ecommerce-application-0.0.1-SNAPSHOT.jar
Restart=always
RestartSec=10
StandardOutput=append:/var/log/ecommerce/backend.log
StandardError=append:/var/log/ecommerce/backend-error.log

[Install]
WantedBy=multi-user.target
```

### Frontend Service (PM2 recommended)

```bash
# Install PM2
npm install -g pm2

# Start frontend
cd /var/www/ecommerce/frontend
pm2 start npm --name "ecommerce-frontend" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
```

---

## 📦 Deployment Steps

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Java 21
sudo apt install -y openjdk-21-jdk

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Database Setup

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE ecommerce_prod;
CREATE USER ecommerce_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_prod TO ecommerce_user;
\q

# Run migrations (first time only)
# Make sure to have your schema ready
```

### 3. Deploy Backend

```bash
# Create directories
sudo mkdir -p /var/www/ecommerce/backend
sudo mkdir -p /var/www/ecommerce/uploads/{products,profiles,shops,chat}
sudo mkdir -p /var/log/ecommerce

# Copy files
sudo cp target/ecommerce-application-0.0.1-SNAPSHOT.jar /var/www/ecommerce/backend/
sudo cp .env /var/www/ecommerce/backend/

# Set permissions
sudo chown -R www-data:www-data /var/www/ecommerce
sudo chmod -R 755 /var/www/ecommerce/uploads

# Start service
sudo systemctl enable ecommerce-backend
sudo systemctl start ecommerce-backend
sudo systemctl status ecommerce-backend
```

### 4. Deploy Frontend

```bash
# Create directory
sudo mkdir -p /var/www/ecommerce/frontend

# Copy files
sudo cp -r .next node_modules package.json .env.production /var/www/ecommerce/frontend/

# Set permissions
sudo chown -R www-data:www-data /var/www/ecommerce/frontend

# Start with PM2
cd /var/www/ecommerce/frontend
pm2 start npm --name "ecommerce-frontend" -- start
pm2 save
```

### 5. Configure Nginx

```bash
# Copy nginx configs
sudo ln -s /etc/nginx/sites-available/api.yourdomain.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 6. Setup SSL

```bash
# Get SSL certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

---

## 🔍 Post-Deployment Checklist

### 1. Testing
- [ ] ทดสอบ backend API endpoints
- [ ] ทดสอบ frontend loading
- [ ] ทดสอบ user registration และ login
- [ ] ทดสอบ product listing และ detail
- [ ] ทดสอบ cart และ checkout
- [ ] ทดสอบ payment (ใช้ test mode ก่อน)
- [ ] ทดสอบ file upload
- [ ] ทดสอบ WebSocket chat
- [ ] ทดสอบบน mobile device

### 2. Monitoring
- [ ] ตั้งค่า log rotation
- [ ] ตั้งค่า monitoring (Prometheus, Grafana)
- [ ] ตั้งค่า error tracking (Sentry)
- [ ] ตั้งค่า uptime monitoring
- [ ] ตั้งค่า database backup schedule

### 3. Performance
- [ ] Enable Gzip compression
- [ ] Setup CDN สำหรับ static files
- [ ] Enable caching
- [ ] Optimize database queries
- [ ] Setup connection pooling

---

## 🚨 Troubleshooting

### Backend ไม่ start
```bash
# Check logs
sudo journalctl -u ecommerce-backend -f

# Check if port is in use
sudo netstat -tulpn | grep 8080

# Check Java version
java -version
```

### Frontend ไม่ start
```bash
# Check PM2 logs
pm2 logs ecommerce-frontend

# Check if port is in use
sudo netstat -tulpn | grep 3000

# Restart
pm2 restart ecommerce-frontend
```

### Database connection failed
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U ecommerce_user -d ecommerce_prod

# Check firewall
sudo ufw status
```

---

## 📱 Contact & Support

สำหรับคำถามเพิ่มเติมหรือต้องการความช่วยเหลือ:
- GitHub Issues: [your-repo]/issues
- Email: support@yourdomain.com

---

**สำคัญ:** อย่าลืม backup database และ uploaded files เป็นประจำ!
