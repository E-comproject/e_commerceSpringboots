# 🧪 Deploy บน Render ด้วย Test Mode (ไม่เก็บเงินจริง)

คู่มือนี้สำหรับการ deploy เพื่อ **demo/testing/portfolio** โดยไม่ต้องใช้ Omise production keys

## ✅ ข้อดี Test Mode

- ✅ **ไม่มีการเก็บเงินจริง** - ทดสอบได้ไม่จำกัด
- ✅ **ไม่ต้อง verify ธนาคาร** - ใช้ได้ทันที
- ✅ **ฟรี** - ไม่มีค่าธรรมเนียม transaction
- ✅ **เหมาะสำหรับ portfolio** - แสดงผลงานได้
- ✅ **ปลอดภัย** - ไม่มีความเสี่ยงทางการเงิน

## ⚠️ ข้อจำกัด

- ❌ **ไม่สามารถรับเงินจริง**
- ❌ Payment เป็น simulation เท่านั้น
- ❌ ไม่เหมาะสำหรับ production จริง

---

## 🚀 การ Deploy (Test Mode)

### Step 1: ใช้ Test Keys เดิม

ไม่ต้องสมัคร Omise production account ใช้ test keys ที่มีอยู่แล้ว:

```bash
# Test Keys (from backend/src/main/resources/application.properties)
Public Key: pkey_test_65a692c53l3a7q5cheh
Secret Key: skey_test_656kahkzqaoi7js7rjc
```

### Step 2: Backend Environment Variables

ใน Render Dashboard → Backend Service → Environment:

```bash
# Database
DATABASE_URL=<from_render_postgres>
DATABASE_USER=ecommerce_user
DATABASE_PASSWORD=<from_render_postgres>

# Spring
SPRING_PROFILES_ACTIVE=prod

# JWT (สามารถใช้ค่าเดิมได้สำหรับ test mode)
# Option 1: ใช้ค่าเดิมจาก application.properties (แนะนำสำหรับ test)
JWT_SECRET=base64:3m8p3c1zYvM3gUe9s9XU9c9z0Qm3a1C6c5b7m8r1o2w4x6y8z0A=

# Option 2: สร้างใหม่ถ้าต้องการความปลอดภัยมากขึ้น
# JWT_SECRET=<GENERATE_RANDOM_32_CHARS>

JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# Omise TEST Keys (ไม่เก็บเงินจริง)
OMISE_PUBLIC_KEY=pkey_test_65a692c53l3a7q5cheh
OMISE_SECRET_KEY=skey_test_656kahkzqaoi7js7rjc
OMISE_API_VERSION=2019-05-29

# URLs (update after deployment)
API_BASE_URL=https://your-backend.onrender.com
FRONTEND_URL=https://your-frontend.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend.onrender.com

# Upload
UPLOAD_DIR=/app/uploads
```

### Step 3: Frontend Environment Variables

ใน Render Dashboard → Frontend Service → Environment:

```bash
# API
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
NEXT_PUBLIC_WS_URL=wss://your-backend.onrender.com

# Omise TEST Public Key
NEXT_PUBLIC_OMISE_PUBLIC_KEY=pkey_test_65a692c53l3a7q5cheh

# App URL
NEXT_PUBLIC_APP_URL=https://your-frontend.onrender.com
```

### Step 4: Deploy ตามปกติ

ทำตามขั้นตอนใน `RENDER_DEPLOYMENT.md` หรือ `RENDER_QUICK_START.md`

---

## 💳 ทดสอบ Payment

### Test Card Numbers

Omise มี test cards สำหรับทดสอบ:

#### ✅ Success Payment
```
Card Number: 4242 4242 4242 4242
Expiry Date: 12/25 (หรือวันที่ในอนาคต)
CVV: 123
Name: Test User
```

#### ❌ Failed Payment
```
Card Number: 4000 0000 0000 0002
Expiry: 12/25
CVV: 123
```

#### 🔐 3D Secure Test
```
Card Number: 4000 0000 0000 3220
Expiry: 12/25
CVV: 123
```

### Test Other Payment Methods

**PromptPay QR:**
- จะได้ QR code แบบ test
- สามารถดู QR ได้แต่ไม่ต้องสแกนจ่ายจริง

**TrueMoney Wallet:**
- ระบบจะ redirect ไป test page
- ไม่ต้องมีบัญชี TrueMoney

**Internet Banking:**
- เลือกธนาคารใดก็ได้
- จะ simulate payment สำเร็จ

**COD (Cash on Delivery):**
- ใช้งานได้ปกติ
- ไม่เกี่ยวกับ Omise

---

## 🧪 ทดสอบ Workflow

### 1. User Journey
```
1. Register/Login → ใช้งานได้ปกติ
2. Browse Products → ใช้งานได้ปกติ
3. Add to Cart → ใช้งานได้ปกติ
4. Checkout → ใช้งานได้ปกติ
5. Payment → ใช้ test card (ไม่เก็บเงินจริง)
6. Order Created → สร้าง order สำเร็จ
```

### 2. Test Scenarios

**Scenario 1: Credit Card Success**
- ใช้ card `4242 4242 4242 4242`
- Payment สำเร็จ
- Order status: PAID

**Scenario 2: Credit Card Failed**
- ใช้ card `4000 0000 0000 0002`
- Payment ล้มเหลว
- Order status: PENDING_PAYMENT

**Scenario 3: PromptPay**
- เลือก PromptPay QR
- ดู QR code (ไม่ต้องสแกน)
- สามารถ simulate success ได้

---

## 📊 Monitor Test Transactions

### Omise Dashboard (Test Mode)

1. ไปที่ [Omise Dashboard](https://dashboard.omise.co/)
2. Login ด้วย test account
3. ดู **Test Transactions**:
   - Charges
   - Refunds
   - Transfers

### ข้อมูลที่เห็นได้:
- Transaction history
- Success/Failed rate
- Payment methods used
- Amount (ไม่ใช่เงินจริง)

---

## 🔄 อัพเกรดเป็น Production (อนาคต)

เมื่อต้องการรับเงินจริง:

### 1. สมัคร Omise Production
- Verify ธนาคาร
- ส่งเอกสาร KYC
- รอ approve

### 2. รับ Production Keys
```
Public Key: pkey_live_xxxxx
Secret Key: skey_live_xxxxx
```

### 3. Update Environment Variables
```bash
# เปลี่ยนจาก pkey_test_ เป็น pkey_live_
OMISE_PUBLIC_KEY=pkey_live_xxxxx
OMISE_SECRET_KEY=skey_live_xxxxx
```

### 4. Setup Webhook
```
https://your-backend.onrender.com/api/payments/webhook/omise
```

### 5. Redeploy
- Save environment variables
- Trigger manual deploy
- Test with real card (จำนวนน้อยก่อน!)

---

## 🎯 Best Practices สำหรับ Test Mode

### 1. แสดงให้ชัดเจน
เพิ่ม banner หรือข้อความบนหน้าเว็บ:
```
⚠️ This is a DEMO site. No real payments are processed.
Use test card: 4242 4242 4242 4242
```

### 2. สร้าง Test Data
- สร้าง test users
- สร้าง sample products
- สร้าง test orders

### 3. Document Test Accounts
```
Test User:
- Email: test@example.com
- Password: password123

Test Seller:
- Email: seller@test.com
- Password: password123

Test Admin:
- Email: admin@test.com
- Password: password123
```

### 4. Log Everything
- Enable debug logging
- Monitor errors
- Track user behavior

---

## 💡 Use Cases

### Portfolio/Resume
```
"E-Commerce Platform with Payment Integration"
- Full-stack application
- Payment gateway integration (Omise)
- Real-time chat
- Product variants
- Order management
```

### Demo for Clients
- แสดงความสามารถของระบบ
- ให้ client ทดสอบได้
- ไม่มีความเสี่ยงทางการเงิน

### Learning/Practice
- เรียนรู้ payment integration
- ทดสอบ edge cases
- ทำ load testing

---

## 🚨 Troubleshooting

### Payment Failed แม้ใช้ Test Card

**Check:**
1. Omise keys ถูกต้อง (pkey_test_, skey_test_)
2. Backend logs มี error อะไร
3. Frontend console มี error อะไร
4. Network tab ดู API call

### QR Code ไม่แสดง

**Check:**
1. PromptPay enabled ใน Omise dashboard
2. Test mode รองรับ PromptPay
3. Backend logs

### Webhook ไม่ทำงาน

**Note:**
- Test mode อาจไม่ส่ง webhook
- ต้องใช้ production mode
- หรือทดสอบด้วย Omise test tools

---

## 📚 Resources

### Omise Documentation
- [Test Cards](https://docs.opn.ooo/testing)
- [Test Mode](https://docs.opn.ooo/testing/test-mode)
- [Payment Methods](https://docs.opn.ooo/payments)

### Render Documentation
- [Deploy Guide](RENDER_DEPLOYMENT.md)
- [Quick Start](RENDER_QUICK_START.md)

---

## ✅ Checklist สำหรับ Test Deployment

- [ ] ใช้ test keys (pkey_test_, skey_test_)
- [ ] JWT_SECRET เป็น random string ใหม่
- [ ] Database ตั้งค่าแล้ว
- [ ] URLs ใน environment variables ถูกต้อง
- [ ] CORS ตั้งค่าแล้ว
- [ ] Health check ทำงาน
- [ ] Test payment ด้วย test card
- [ ] แสดง "Test Mode" warning บนหน้าเว็บ

---

**Happy Testing! 🎉**

ระบบจะทำงานเหมือน production แต่ไม่มีการเก็บเงินจริง
