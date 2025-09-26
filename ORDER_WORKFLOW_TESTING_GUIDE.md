# Order Workflow API Testing Guide

## 📥 Import Postman Collection

1. เปิด Postman
2. กด **Import**
3. เลือกไฟล์ `Order_Workflow_Postman_Collection.json`
4. Collection จะปรากฏใน Postman ของคุณ

## 🚀 การเตรียมระบบ

### 1. เริ่ม Backend Server
```bash
cd backend
mvn spring-boot:run -Dspring.profiles.active=dev
```
Server จะทำงานที่: `http://localhost:8080`

### 2. เตรียมข้อมูลทดสอบ
ก่อนทดสอบ Order Workflow ต้องมีข้อมูลพื้นฐาน:
- User (ใน database)
- Product/Cart Items
- Order ที่จะทดสอบ

## 🔗 การทดสอบแบบ Step-by-Step

### Phase 1: ทดสอบพื้นฐาน
1. **Get All Order Statuses** - ดูสถานะทั้งหมดที่มี
2. **Create Test Order** - สร้าง order ใหม่สำหรับทดสอบ
3. **Get Order by ID** - ดูข้อมูล order ที่สร้าง

### Phase 2: ทดสอบ Workflow Basic
1. **Get Allowed Transitions** - ดูสถานะที่เปลี่ยนได้
2. **Check Can Transition** - ตรวจสอบการเปลี่ยนสถานะ
3. **Get Order Status History** - ดูประวัติการเปลี่ยนสถานะ

### Phase 3: ทดสอบการเปลี่ยนสถานะ
**ลำดับการทดสอบที่แนะนำ:**

1. **PENDING → PAID**
   ```
   POST /api/orders/{id}/change-status
   Body: {"newStatus": "PAID", "reason": "Payment confirmed", "userId": 1, "role": "ADMIN"}
   ```

2. **PAID → CONFIRMED**
   ```
   POST /api/orders/{id}/confirm
   Body: {"merchantId": 1, "notes": "Order confirmed by merchant"}
   ```

3. **CONFIRMED → PROCESSING**
   ```
   POST /api/orders/{id}/change-status
   Body: {"newStatus": "PROCESSING", "reason": "Started processing", "userId": 1, "role": "MERCHANT"}
   ```

4. **PROCESSING → READY_TO_SHIP**
   ```
   POST /api/orders/{id}/ready-to-ship
   Body: {"merchantId": 1}
   ```

5. **READY_TO_SHIP → SHIPPED**
   ```
   POST /api/orders/{id}/ship
   Body: {"trackingNumber": "TH1234567890", "merchantId": 1}
   ```

6. **SHIPPED → DELIVERED**
   ```
   POST /api/orders/{id}/deliver
   Body: {"deliveryProof": "Delivered to customer at address"}
   ```

7. **DELIVERED → COMPLETED**
   ```
   POST /api/orders/{id}/complete
   Body: {"customerId": 1}
   ```

### Phase 4: ทดสอบ Edge Cases
1. **Cancel Order** - ทดสอบการยกเลิก order
2. **Put Order On Hold** - ทดสอบการระงับ order
3. **Resume Order From Hold** - ทดสอบการยกเลิกระงับ

## 📝 ตัวอย่าง Test Cases

### Test Case 1: Normal Flow
```
PENDING → PAID → CONFIRMED → PROCESSING → READY_TO_SHIP → SHIPPED → DELIVERED → COMPLETED
```

### Test Case 2: Cancellation Flow
```
PENDING → CANCELLED
PAID → CANCELLED (with refund)
```

### Test Case 3: Hold Flow
```
PROCESSING → ON_HOLD → PROCESSING (resume)
```

### Test Case 4: Invalid Transitions
```
PENDING → COMPLETED (should fail)
CANCELLED → SHIPPED (should fail)
```

## 🔍 สิ่งที่ต้องตรวจสอบ

### ✅ Response ที่คาดหวัง:
- Status Code: 200 (success) หรือ 400/404 (error)
- Response Body มีข้อมูลที่ถูกต้อง
- Status History มีการบันทึกการเปลี่ยนแปลง

### ⚠️ Error Cases ที่ควรทดสอบ:
- การเปลี่ยนสถานะที่ไม่ได้รับอนุญาต
- Order ID ที่ไม่มีอยู่
- User ID/Role ที่ไม่ถูกต้อง

## 🐛 การ Debug

### ดู Log ใน Backend:
```bash
# ดู error logs
tail -f backend/logs/application.log | grep ERROR

# หรือดู console output
```

### Database Check:
```sql
-- ดู order และสถานะ
SELECT id, order_number, status, created_at FROM orders;

-- ดู history การเปลี่ยนสถานะ
SELECT * FROM order_status_history WHERE order_id = 1;
```

## 📊 Expected Results

### Order Status Values:
- `PENDING`
- `PAYMENT_PENDING`
- `PAID`
- `PAYMENT_FAILED`
- `CONFIRMED`
- `PROCESSING`
- `READY_TO_SHIP`
- `SHIPPED`
- `OUT_FOR_DELIVERY`
- `DELIVERED`
- `COMPLETED`
- `CANCELLED`
- `REFUNDED`
- `RETURNED`
- `ON_HOLD`
- `DISPUTED`

### HTTP Status Codes:
- `200` - Success
- `400` - Bad Request (invalid transition)
- `404` - Order not found
- `500` - Server error

## 💡 Tips สำหรับการทดสอบ

1. **ใช้ Order ID ที่มีอยู่จริง** - สร้าง order ก่อนแล้วใช้ ID นั้น
2. **ทดสอบตามลำดับ** - เริ่มจาก PENDING และเปลี่ยนสถานะตามลำดับ
3. **เก็บ History** - ดู status history หลังทุกการเปลี่ยนแปลง
4. **ทดสอบ Edge Cases** - ลองการเปลี่ยนสถานะที่ไม่ถูกต้อง

---

✅ **Ready to test!** เริ่มได้เลยจาก Import Postman Collection แล้วเริ่มทดสوบตาม Phase ที่แนะนำ