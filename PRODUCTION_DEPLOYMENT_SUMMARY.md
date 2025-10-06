# 🚀 Production Deployment - สรุปและขั้นตอนการ Deploy

## ✅ สิ่งที่เตรียมพร้อมแล้ว

### 1. Backend (Spring Boot)
- ✅ **AppConfig.java** - สร้างแล้ว สำหรับจัดการ environment variables
- ✅ **CorsConfig.java** - สร้างแล้ว สำหรับ CORS configuration แบบ centralized
- ✅ **application.properties** - เพิ่ม configuration สำหรับ production
- ✅ **Controllers** - แก้ไข hardcoded URLs ทั้งหมดแล้ว:
  - FileUploadController
  - UserController
  - OmiseController
  - ChatServiceImpl
- ✅ **.env.example** - สร้างแล้ว สำหรับ reference

### 2. Frontend (Next.js)
- ✅ **.env.example** - สร้างแล้ว สำหรับ development
- ✅ **.env.production.example** - สร้างแล้ว สำหรับ production

### 3. Documentation
- ✅ **DEPLOYMENT_GUIDE.md** - คู่มือ deployment ฉบับสมบูรณ์

---

## 📋 ขั้นตอนการ Deploy (สรุป)

### ขั้นที่ 1: เตรียม Server
```bash
# ติดตั้ง Software ที่จำเป็น
- Java 21
- Node.js 18+
- PostgreSQL 15+
- Nginx
- Certbot (สำหรับ SSL)
```

### ขั้นที่ 2: ตั้งค่า Environment Variables

#### **Backend**
สร้างไฟล์ `backend/.env`:
```bash
# คัดลอกจาก backend/.env.example แล้วแก้ไขค่า
DATABASE_URL=jdbc:postgresql://your-host:5432/ecommerce_prod
DATABASE_USER=your_user
DATABASE_PASSWORD=your_password

JWT_SECRET=<สุ่ม 32+ ตัวอักษร>

# Omise Production Keys
OMISE_PUBLIC_KEY=pkey_live_xxxxx
OMISE_SECRET_KEY=skey_live_xxxxx

# Production URLs
API_BASE_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

#### **Frontend**
สร้างไฟล์ `frontend/.env.production`:
```bash
# คัดลอกจาก frontend/.env.production.example
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
NEXT_PUBLIC_OMISE_PUBLIC_KEY=pkey_live_xxxxx
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### ขั้นที่ 3: Build Applications

#### **Backend**
```bash
cd backend
mvn clean package -DskipTests
# JAR file จะอยู่ที่ target/ecommerce-application-0.0.1-SNAPSHOT.jar
```

#### **Frontend**
```bash
cd frontend
npm install --production
npm run build
```

### ขั้นที่ 4: ตั้งค่า Database
```bash
# สร้าง database และ user
CREATE DATABASE ecommerce_prod;
CREATE USER ecommerce_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_prod TO ecommerce_user;
```

### ขั้นที่ 5: Deploy และ Run

#### **Backend** (ใช้ systemd)
```bash
# สร้างไฟล์ /etc/systemd/system/ecommerce-backend.service
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

# Start service
sudo systemctl enable ecommerce-backend
sudo systemctl start ecommerce-backend
```

#### **Frontend** (ใช้ PM2)
```bash
# Install PM2
npm install -g pm2

# Start frontend
cd /var/www/ecommerce/frontend
pm2 start npm --name "ecommerce-frontend" -- start
pm2 save
pm2 startup
```

### ขั้นที่ 6: ตั้งค่า Nginx
```bash
# ดูตัวอย่างใน DEPLOYMENT_GUIDE.md
# สร้าง config สำหรับ:
- api.yourdomain.com (Backend)
- yourdomain.com (Frontend)

# Enable sites
sudo ln -s /etc/nginx/sites-available/api.yourdomain.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/

# Test และ reload
sudo nginx -t
sudo systemctl reload nginx
```

### ขั้นที่ 7: ตั้งค่า SSL
```bash
# ใช้ Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot --nginx -d api.yourdomain.com
```

---

## 🔒 Security Checklist

- [ ] เปลี่ยน JWT_SECRET เป็นค่าที่ปลอดภัย (random 32+ characters)
- [ ] ใช้ Omise **production keys** (pkey_live_, skey_live_)
- [ ] ตั้งค่า database password ที่แข็งแรง
- [ ] CORS ตั้งค่าเฉพาะ production domain
- [ ] เปิดใช้งาน HTTPS (SSL)
- [ ] ปิด DevController endpoint ใน production
- [ ] ตั้งค่า firewall (ufw/iptables)
- [ ] Log rotation สำหรับ application logs
- [ ] Database backup schedule

---

## 🧪 Testing Checklist

หลัง deploy เสร็จ ต้องทดสอบ:

- [ ] User registration และ login
- [ ] Product listing และ search
- [ ] Shopping cart
- [ ] Order creation
- [ ] Payment methods:
  - [ ] Credit Card
  - [ ] PromptPay QR Code
  - [ ] TrueMoney Wallet
  - [ ] Internet Banking
  - [ ] COD (Cash on Delivery)
- [ ] File upload (product images, profiles, shop logos)
- [ ] WebSocket chat functionality
- [ ] Mobile responsiveness

---

## 📊 Monitoring

ติดตั้ง monitoring tools:

1. **Application logs**
```bash
# Backend
sudo journalctl -u ecommerce-backend -f

# Frontend
pm2 logs ecommerce-frontend
```

2. **Database monitoring**
```sql
-- Check connections
SELECT * FROM pg_stat_activity;

-- Check database size
SELECT pg_database_size('ecommerce_prod');
```

3. **Server resources**
```bash
htop
df -h
free -m
```

---

## 🚨 Troubleshooting

### Backend ไม่ start
```bash
# Check logs
sudo journalctl -u ecommerce-backend -n 100

# Check port
sudo netstat -tulpn | grep 8080

# Check env variables
sudo systemctl show ecommerce-backend | grep Environment
```

### Frontend ไม่ start
```bash
# Check logs
pm2 logs ecommerce-frontend

# Restart
pm2 restart ecommerce-frontend

# Check port
sudo netstat -tulpn | grep 3000
```

### Database connection failed
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U ecommerce_user -d ecommerce_prod

# Check logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### Payment not working
- ตรวจสอบว่าใช้ Omise **production keys** แล้ว
- ตรวจสอบ callback URL ใน Omise dashboard
- ตรวจสอบ webhook configuration
- ตรวจสอบ logs สำหรับ payment errors

---

## 📞 Support

สำหรับความช่วยเหลือเพิ่มเติม:

1. อ่าน **DEPLOYMENT_GUIDE.md** ฉบับเต็ม
2. ตรวจสอบ logs ด้วย `journalctl` และ `pm2 logs`
3. ดู Omise documentation: https://docs.opn.ooo/
4. ติดต่อ Omise support สำหรับปัญหา payment

---

## 🎯 Next Steps After Deployment

1. **Performance Optimization**
   - Enable Redis caching
   - Setup CDN สำหรับ static files
   - Optimize database queries
   - Enable Gzip compression

2. **Monitoring & Analytics**
   - Setup Prometheus + Grafana
   - Integrate Google Analytics
   - Setup error tracking (Sentry)
   - Setup uptime monitoring

3. **Backup Strategy**
   - Automated database backup (daily)
   - Uploaded files backup
   - Configuration backup
   - Test restore procedures

4. **CI/CD Pipeline**
   - Setup GitHub Actions
   - Automated testing
   - Automated deployment
   - Blue-green deployment

---

## 📝 Important Notes

1. **ห้ามใช้ localhost ใน production!**
   - ตรวจสอบว่าทุก URL ใช้ environment variables
   
2. **ห้ามใช้ test keys ของ Omise!**
   - ต้องใช้ production keys (pkey_live_, skey_live_)
   
3. **DDL Auto ต้องเป็น `validate` ใน production**
   - ห้ามใช้ `create`, `update`, หรือ `create-drop`
   
4. **Backup ทุกวัน!**
   - Database
   - Uploaded files
   - Configuration files

---

**Good luck with your deployment! 🚀**
