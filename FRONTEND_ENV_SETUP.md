# Frontend Environment Variables Setup

## ตรวจสอบ Backend Service URL ก่อน
1. ไปที่ Render Dashboard > Backend Service
2. ดู URL จริงของ service (อาจจะเป็น `https://YOUR-BACKEND-NAME.onrender.com`)

## Environment Variables ที่ต้องตั้งใน Frontend Service

ไปที่ Render Dashboard > Frontend Service > Settings > Environment Variables:

```bash
# Backend API URL (แก้ให้ตรงกับ URL จริงของ backend service)
NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-NAME.onrender.com/api

# WebSocket URL (แก้ให้ตรงกับ backend service)
NEXT_PUBLIC_WS_URL=wss://YOUR-BACKEND-NAME.onrender.com

# Omise Public Key (test mode)
NEXT_PUBLIC_OMISE_PUBLIC_KEY=pkey_test_65a692c53l3a7q5cheh

# Frontend URL (แก้ให้ตรงกับ frontend service URL จริง)
NEXT_PUBLIC_APP_URL=https://YOUR-FRONTEND-NAME.onrender.com
```

## อัพเดท Backend CORS Settings

ถ้า frontend URL เปลี่ยน ต้องไปอัพเดท backend environment variables ด้วย:

```bash
CORS_ALLOWED_ORIGINS=https://YOUR-FRONTEND-NAME.onrender.com
```

## ตัวอย่างการตั้งค่าจริง

ถ้า backend service ชื่อ `ecommerce-api-xyz` และ frontend ชื่อ `ecommerce-web-abc`:

### Frontend ENV:
```
NEXT_PUBLIC_API_URL=https://ecommerce-api-xyz.onrender.com/api
NEXT_PUBLIC_WS_URL=wss://ecommerce-api-xyz.onrender.com
NEXT_PUBLIC_OMISE_PUBLIC_KEY=pkey_test_65a692c53l3a7q5cheh
NEXT_PUBLIC_APP_URL=https://ecommerce-web-abc.onrender.com
```

### Backend ENV (update):
```
CORS_ALLOWED_ORIGINS=https://ecommerce-web-abc.onrender.com
FRONTEND_URL=https://ecommerce-web-abc.onrender.com
```

## หลัง Deploy Frontend

1. รอให้ build เสร็จ (ดูใน Logs)
2. ทดสอบเปิดหน้าแรก
3. ทดสอบ API calls (ดูใน Network tab)
4. ถ้ามี CORS error ให้ตรวจสอบ CORS_ALLOWED_ORIGINS ใน backend

## Troubleshooting

### ถ้า API calls ไม่ทำงาน:
1. ตรวจสอบ NEXT_PUBLIC_API_URL ว่าถูกต้อง
2. ดู Browser Console errors
3. ตรวจสอบ Network tab ว่า request ไปที่ URL ไหน

### ถ้ามี CORS error:
1. ตรวจสอบ CORS_ALLOWED_ORIGINS ใน backend
2. Restart backend service หลังแก้ environment variables
