# 🚀 Deploy โดยไม่มี Omise Live Keys

## สถานการณ์: ยังไม่มี Omise Production Keys

คุณสามารถ deploy ได้ 3 แบบ:

---

## ✅ ทางเลือกที่ 1: Staging/Demo Environment (แนะนำที่สุด)

Deploy บน production server แต่ใช้ **test keys** เพื่อให้คนอื่นเข้าถึงและทดสอบได้

### ข้อดี:
- ✅ Deploy ได้ทันที ไม่ต้องรอ Omise approval
- ✅ คนอื่นเข้าถึงและทดสอบได้
- ✅ แสดง demo ให้ลูกค้าหรือ stakeholders ดูได้
- ✅ Payment จะทำงาน แต่เป็นโหมดทดสอบ (ไม่ตัดเงินจริง)

### ข้อเสีย:
- ❌ ไม่สามารถรับเงินจริงได้
- ❌ ต้องแจ้ง user ว่าเป็น demo mode

### วิธี Deploy:

#### 1. ใช้ไฟล์ staging environment:
```bash
# Backend
cp backend/.env.staging.example backend/.env

# แก้ไข URLs และ passwords ให้ตรงกับ server จริง
vi backend/.env

# Frontend  
cp frontend/.env.staging.example frontend/.env.production

# แก้ไข URLs ให้ตรงกับ domain จริง
vi frontend/.env.production
```

#### 2. เพิ่ม Banner แจ้ง Demo Mode

สร้างไฟล์ `frontend/src/components/DemoBanner.tsx`:
```typescript
'use client';

export default function DemoBanner() {
  const isDemoMode = process.env.NEXT_PUBLIC_APP_MODE === 'DEMO';
  
  if (!isDemoMode) return null;
  
  return (
    <div className="bg-yellow-500 text-black px-4 py-2 text-center font-semibold">
      ⚠️ โหมด DEMO - การชำระเงินเป็นการทดสอบเท่านั้น ไม่มีการหักเงินจริง
    </div>
  );
}
```

เพิ่มใน `frontend/src/app/layout.tsx`:
```typescript
import DemoBanner from '@/components/DemoBanner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <DemoBanner />
        {children}
      </body>
    </html>
  );
}
```

#### 3. Build และ Deploy ตามปกติ:
```bash
# Backend
cd backend
mvn clean package
# Deploy JAR file

# Frontend
cd frontend
npm run build
# Deploy with PM2
```

### 🧪 การทดสอบในโหมด Demo:

**Test Credit Cards (ใช้ได้กับ test keys):**
- Card: `4242 4242 4242 4242`
- CVV: `123`
- Expiry: อนาคตใดก็ได้ (เช่น 12/25)

**Test PromptPay/TrueMoney:**
- จะได้ QR code และ link ทดสอบ
- ระบบจะ simulate การชำระเงิน

---

## ✅ ทางเลือกที่ 2: ใช้เฉพาะ COD (Cash on Delivery)

Deploy แล้วรับเฉพาะ COD ก่อน รอได้ Omise live keys ค่อยเปิด online payment

### ข้อดี:
- ✅ ใช้งานจริงได้ทันที
- ✅ รับเงินจริงได้ (เก็บเงินปลายทาง)
- ✅ ไม่ต้องรอ payment gateway

### ข้อเสีย:
- ❌ รับเฉพาะ COD อย่างเดียว
- ❌ ต้อง handle เงินสดและการจัดส่ง
- ❌ มีความเสี่ยง (ลูกค้าปฏิเสธรับสินค้า)

### วิธี Deploy:

#### 1. แก้ไข Payment Method Selector ให้แสดงเฉพาะ COD:

`frontend/src/components/payment/PaymentMethodSelector.tsx`:
```typescript
// เพิ่ม environment check
const isProductionWithoutLiveKeys = process.env.NEXT_PUBLIC_APP_MODE === 'COD_ONLY';

const paymentMethods = [
  {
    id: 'COD',
    name: 'เก็บเงินปลายทาง (COD)',
    icon: Package,
    description: 'ชำระเงินสดเมื่อได้รับสินค้า',
  },
  // แสดงตัวอื่นเฉพาะเมื่อไม่ใช่ COD_ONLY mode
  ...(isProductionWithoutLiveKeys ? [] : [
    {
      id: 'OMISE_CREDIT_CARD',
      name: 'บัตรเครดิต/เดบิต',
      // ...
    },
    // ... methods อื่นๆ
  ])
];
```

#### 2. Environment Variables:
```bash
# frontend/.env.production
NEXT_PUBLIC_APP_MODE=COD_ONLY
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

#### 3. แสดงข้อความแจ้ง:
```typescript
// เพิ่มใน checkout page
{isProductionWithoutLiveKeys && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
    <p className="text-blue-800">
      ℹ️ ขณะนี้รับชำระเฉพาะเงินสดปลายทาง (COD) เท่านั้น
      <br />
      เร็วๆ นี้จะเปิดรับชำระผ่านบัตรเครดิต พร้อมเพย์ และ TrueMoney
    </p>
  </div>
)}
```

---

## ✅ ทางเลือกที่ 3: รอสมัคร Omise Live Account ก่อน Deploy

### ขั้นตอนการสมัคร Omise:

#### 1. สมัครบัญชี:
- ไปที่: https://dashboard.omise.co/signup
- เลือก "Thailand"
- กรอกข้อมูลธุรกิจ

#### 2. เอกสารที่ต้องเตรียม:
- ✅ ทะเบียนการค้า หรือ ใบจดทะเบียนบริษัท
- ✅ บัตรประชาชนผู้มีอำนาจลงนาม
- ✅ หนังสือรับรองบริษัท (ไม่เกิน 6 เดือน)
- ✅ ข้อมูลบัญชีธนาคาร (สำหรับรับเงิน)
- ✅ เว็บไซต์/แอปที่จะใช้งาน
- ✅ รายละเอียดสินค้า/บริการ

#### 3. ระยะเวลาการอนุมัติ:
- ⏱️ ประมาณ 3-7 วันทำการ
- 📧 จะได้รับ live keys ทาง email

#### 4. เมื่อได้ live keys แล้ว:
```bash
# แทนที่ test keys ด้วย live keys
OMISE_PUBLIC_KEY=pkey_live_xxxxx
OMISE_SECRET_KEY=skey_live_xxxxx

# Restart backend
sudo systemctl restart ecommerce-backend
```

---

## 📊 เปรียบเทียบทางเลือก

| ทางเลือก | รับเงินจริง | Deploy ได้ทันที | ใช้งานง่าย | แนะนำ |
|---------|-----------|---------------|----------|------|
| **1. Staging/Demo** | ❌ | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| **2. COD Only** | ✅ | ✅ | ⭐⭐⭐ | ⭐⭐⭐ |
| **3. รอ Live Keys** | ✅ | ❌ | ✅ | ⭐⭐ |

---

## 🎯 คำแนะนำ

### สำหรับ MVP/Demo/Portfolio:
→ ใช้ **ทางเลือกที่ 1 (Staging/Demo)** 
- Deploy ได้ทันที
- แสดง portfolio ได้
- ทุกฟีเจอร์ทำงานได้

### สำหรับธุรกิจจริง:
→ **ขั้นที่ 1:** Deploy แบบ COD Only ก่อน
→ **ขั้นที่ 2:** สมัคร Omise พร้อมๆ กัน
→ **ขั้นที่ 3:** เมื่อได้ live keys แล้ว เปิด online payment

---

## 🔄 การอัพเกรดจาก Test Keys เป็น Live Keys

เมื่อได้ live keys แล้ว ทำตามนี้:

### 1. อัพเดท Environment Variables:
```bash
# Backend
vi /var/www/ecommerce/backend/.env

# แก้ไข
OMISE_PUBLIC_KEY=pkey_live_xxxxx
OMISE_SECRET_KEY=skey_live_xxxxx
```

### 2. อัพเดท Frontend:
```bash
# Frontend
vi /var/www/ecommerce/frontend/.env.production

# แก้ไข
NEXT_PUBLIC_OMISE_PUBLIC_KEY=pkey_live_xxxxx
NEXT_PUBLIC_APP_MODE=PRODUCTION

# Rebuild
cd /var/www/ecommerce/frontend
npm run build
pm2 restart ecommerce-frontend
```

### 3. Restart Backend:
```bash
sudo systemctl restart ecommerce-backend
```

### 4. ทดสอบ Payment:
- ใช้บัตรจริง (จะหักเงินจริง)
- ทดสอบด้วยเงินจำนวนน้อยก่อน (เช่น 1 บาท)
- ตรวจสอบใน Omise Dashboard

---

## 📱 Contact Omise

- 🌐 Website: https://www.omise.co/
- 📧 Email: support@omise.co
- 📞 Tel: +66 (0) 2 117 1188
- 💬 Live Chat: มีใน dashboard

---

## ⚠️ สิ่งที่ต้องระวัง

1. **ห้ามใช้ test keys ใน production โดยไม่แจ้ง user**
   - ต้องมี banner บอกว่าเป็น demo mode

2. **Webhook URL**
   - ต้องตั้งค่าใน Omise Dashboard
   - ทั้ง test และ live environment

3. **Test Mode vs Live Mode**
   - Transaction ใน test mode ไม่ transfer ไปยัง live
   - ต้องทดสอบใหม่เมื่อเปลี่ยนเป็น live keys

4. **Security**
   - **ห้าม** commit live keys ลง git
   - เก็บใน environment variables เท่านั้น
   - ใช้ .gitignore กับ .env files

---

**สรุป:** ถ้ายังไม่มี live keys แนะนำให้ **deploy แบบ Staging/Demo** ก่อน เพื่อให้คนอื่นเข้าถึงและทดสอบได้ พร้อมๆ กันก็สมัคร Omise ไป เมื่อได้ live keys แล้วค่อยอัพเกรด! 🚀
