# 💳 Payment System Guide

## Overview

ระบบการชำระเงินที่รองรับหลายช่องทาง พร้อมการติดตาม webhook และการจัดการสถานะอย่างครบครอง

## 🏗️ Architecture

```
Order ──→ Payment ──→ Gateway ──→ Webhook ──→ Status Update
  ↓         ↓           ↓            ↓           ↓
Cart    Process     External     Callback   Completion
```

## 🔧 Features

### ✅ Payment Methods Supported
- **Credit Card** - บัตรเครดิต
- **Debit Card** - บัตรเดบิต
- **Bank Transfer** - โอนผ่านธนาคาร
- **PromptPay** - พร้อมเพย์
- **TrueMoney** - ทรูมันนี่
- **Rabbit LINE Pay** - แรบบิท ไลน์ เพย์
- **Cash on Delivery** - เก็บเงินปลายทาง
- **PayPal** - เพย์พาล
- **Stripe** - สไตรป์

### ✅ Payment Status Flow
```
PENDING → PROCESSING → COMPLETED ✅
    ↓         ↓            ↓
CANCELLED  FAILED      REFUNDED
```

## 🚀 API Usage

### 1. Create Payment
```bash
POST /api/payments
Content-Type: application/json

{
  "orderId": 123,
  "paymentMethod": "CREDIT_CARD",
  "amount": 1299.00,
  "currency": "THB",
  "paymentDetails": "{\"cardToken\":\"tok_xxx\"}"
}
```

### 2. Process Payment
```bash
POST /api/payments/{paymentId}/process
Content-Type: application/json

{
  "gatewayData": "payment_method_nonce_from_client"
}
```

### 3. Get Payment Status
```bash
GET /api/payments/{paymentId}

Response:
{
  "id": 1,
  "paymentNumber": "PAY1234567890",
  "orderId": 123,
  "status": "COMPLETED",
  "amount": 1299.00,
  "paymentMethod": "CREDIT_CARD",
  "gatewayTransactionId": "TXN123456",
  "createdAt": "2024-01-15T10:30:00",
  "paidAt": "2024-01-15T10:31:30"
}
```

### 4. Get Order Payments
```bash
GET /api/payments/order/{orderId}

Response:
[
  {
    "id": 1,
    "paymentNumber": "PAY1234567890",
    "status": "COMPLETED",
    "amount": 1299.00,
    "paymentMethod": "CREDIT_CARD"
  }
]
```

### 5. Check Payment Status
```bash
GET /api/payments/order/{orderId}/paid-status

Response: true
```

## 🔒 Admin Functions

### Update Payment Status
```bash
PUT /api/payments/{paymentId}/status?status=COMPLETED&reason=Manual

Response:
{
  "id": 1,
  "status": "COMPLETED",
  "statusDisplayName": "Payment Completed"
}
```

### Refund Payment
```bash
POST /api/payments/{paymentId}/refund?refundAmount=500.00&reason=Customer%20Request

Response:
{
  "id": 2,
  "status": "REFUNDED",
  "amount": -500.00,
  "refundedAt": "2024-01-16T14:22:10"
}
```

### Payment Statistics
```bash
GET /api/payments/statistics

Response:
{
  "totalPayments": 1250,
  "pendingPayments": 45,
  "completedPayments": 1180,
  "failedPayments": 25,
  "totalAmount": 2500000.00,
  "totalRevenue": 2450000.00
}
```

## 🔄 Webhook Integration

### Webhook Endpoint
```bash
POST /api/payments/webhook
Content-Type: application/json

{
  "transactionId": "TXN123456",
  "paymentNumber": "PAY1234567890",
  "status": "success",
  "amount": 1299.00,
  "currency": "THB",
  "gatewayTransactionId": "gw_12345",
  "signature": "webhook_signature_for_verification"
}
```

## 🛡️ Security Features

### 1. Payment Details Encryption
- Payment details เก็บเป็น JSON และควรเข้ารหัส
- ไม่เก็บข้อมูลบัตรเครดิตจริง (ใช้ token)

### 2. Webhook Verification
- ตรวจสอบ signature จาก gateway
- Validate payment amount และ order

### 3. Status Validation
- ตรวจสอบการเปลี่ยนสถานะที่ถูกต้อง
- ป้องกันการ double payment

## 🧪 Testing

### Sample Test Cases
```java
@Test
void createPayment_Success() {
    CreatePaymentReq req = new CreatePaymentReq();
    req.orderId = 123L;
    req.paymentMethod = PaymentMethod.CREDIT_CARD;
    req.amount = new BigDecimal("1299.00");

    PaymentDto result = paymentService.createPayment(req);

    assertThat(result.status).isEqualTo(PaymentStatus.PENDING);
    assertThat(result.amount).isEqualTo(new BigDecimal("1299.00"));
}

@Test
void processPayment_Success() {
    // Create payment first
    PaymentDto payment = createTestPayment();

    // Process payment
    PaymentDto result = paymentService.processPayment(payment.id, "gateway_data");

    assertThat(result.status).isEqualTo(PaymentStatus.COMPLETED);
    assertThat(result.paidAt).isNotNull();
}
```

## 📊 Database Schema

### Payments Table
```sql
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'THB',
    gateway_transaction_id VARCHAR(255),
    gateway_response JSONB,
    payment_details JSONB,
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    failed_at TIMESTAMP,
    refunded_at TIMESTAMP
);
```

## 🔮 Future Enhancements

### Phase 2 Features
- **Installment Payments** - ผ่อนชำระ
- **Recurring Payments** - ชำระแบบสมัครสมาชิก
- **Multi-currency** - หลายสกุลเงิน
- **Payment Links** - ลิงก์ชำระเงิน
- **QR Code Payments** - ชำระผ่าน QR

### Gateway Integrations
- **Omise** - Thai payment gateway
- **2C2P** - Regional payment solutions
- **SCB Easy** - Siam Commercial Bank
- **Kasikorn K PLUS** - Kasikorn Bank

## 📞 Support

### Error Handling
```json
{
  "error": "PAYMENT_FAILED",
  "message": "Insufficient funds",
  "paymentId": 123,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Status Codes
- **200** - Success
- **400** - Bad Request (invalid data)
- **404** - Payment not found
- **409** - Payment already processed
- **500** - Internal server error

---

🎯 **Payment System** พร้อมใช้งานแล้ว! สามารถรองรับการชำระเงินหลากหลายช่องทางและจัดการสถานะอย่างครบครอง