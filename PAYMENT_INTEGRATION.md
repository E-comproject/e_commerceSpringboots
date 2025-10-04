# Payment Integration Guide

## ✅ Components พร้อมใช้งานแล้ว

สร้างไว้ที่ `frontend/src/components/payment/`:
- ✅ PaymentMethodSelector - เลือก payment method
- ✅ CreditCardForm - ฟอร์มบัตรเครดิต (รองรับ Omise.js)
- ✅ PromptPayQR - แสดง QR Code พร้อมเพย์
- ✅ InternetBankingSelect - เลือกธนาคาร

## 📝 วิธีใช้งาน

### 1. Import Components

```typescript
import {
  PaymentMethodSelector,
  PaymentMethodType,
  CreditCardForm,
  PromptPayQR,
  InternetBankingSelect
} from '@/components/payment';
```

### 2. เพิ่ม State

```typescript
const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('COD');
const [paymentToken, setPaymentToken] = useState<string>('');
const [orderId, setOrderId] = useState<number | null>(null);
```

### 3. แทนที่ Step 2 ใน Checkout

```typescript
{/* Step 2: Payment Method */}
{currentStep === 2 && (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <PaymentMethodSelector
      selectedMethod={paymentMethod}
      onSelectMethod={setPaymentMethod}
    />

    {/* Show payment form based on selected method */}
    <div className="mt-6">
      {paymentMethod === 'OMISE_CREDIT_CARD' && (
        <CreditCardForm
          onTokenCreated={(token) => {
            setPaymentToken(token);
            // Create order with payment
            handlePaymentWithToken(token);
          }}
          loading={submitting}
        />
      )}

      {paymentMethod === 'OMISE_PROMPTPAY' && orderId && (
        <PromptPayQR
          amount={calculateTotal()}
          orderId={orderId}
          onPaymentComplete={() => {
            router.push(`/orders/${orderId}?success=true`);
          }}
          onPaymentFailed={(error) => {
            setError(error);
          }}
        />
      )}

      {paymentMethod === 'OMISE_INTERNET_BANKING' && (
        <InternetBankingSelect
          amount={calculateTotal()}
          orderId={orderId || 0}
          onBankSelected={(bankCode) => {
            handleInternetBanking(bankCode);
          }}
          loading={submitting}
        />
      )}
    </div>
  </div>
)}
```

### 4. Payment Flow สำหรับแต่ละ Method

#### A. Cash on Delivery (COD)
```typescript
const handleCODCheckout = async () => {
  const checkoutData = {
    shippingAddressJson: JSON.stringify(shippingAddress),
    billingAddressJson: JSON.stringify(shippingAddress),
    shippingFee: calculateShipping(),
    taxAmount: 0,
    notes: notes.trim() || undefined,
  };

  const response = await api.post('/orders/checkout', checkoutData);
  router.push(`/orders/${response.data.id}?success=true`);
};
```

#### B. Credit Card (Omise)
```typescript
const handlePaymentWithToken = async (token: string) => {
  try {
    // 1. Create order first
    const orderResponse = await api.post('/orders/checkout', {
      shippingAddressJson: JSON.stringify(shippingAddress),
      billingAddressJson: JSON.stringify(shippingAddress),
      shippingFee: calculateShipping(),
      taxAmount: 0,
      notes: notes.trim() || undefined,
    });

    const orderId = orderResponse.data.id;

    // 2. Create payment charge with token
    const chargeResponse = await api.post('/payments/omise/charges', {
      amount: calculateTotal(),
      currency: 'THB',
      paymentMethod: 'OMISE_CREDIT_CARD',
      orderId: orderId,
      token: token,
      description: `Order #${orderId}`,
    });

    // 3. Check if payment successful
    if (chargeResponse.data.paid) {
      router.push(`/orders/${orderId}?success=true`);
    } else if (chargeResponse.data.authorize_uri) {
      // 3D Secure - redirect to bank
      window.location.href = chargeResponse.data.authorize_uri;
    }
  } catch (error) {
    setError('การชำระเงินไม่สำเร็จ');
  }
};
```

#### C. PromptPay
```typescript
const handlePromptPayCheckout = async () => {
  // 1. Create order first
  const orderResponse = await api.post('/orders/checkout', {...});
  const orderId = orderResponse.data.id;

  // 2. Set orderId to show PromptPayQR component
  setOrderId(orderId);

  // 3. PromptPayQR component will create charge automatically
  // and handle payment completion
};
```

#### D. Internet Banking
```typescript
const handleInternetBanking = async (bankCode: string) => {
  try {
    // 1. Create charge
    const chargeResponse = await api.post('/payments/omise/charges', {
      amount: calculateTotal(),
      currency: 'THB',
      paymentMethod: 'OMISE_INTERNET_BANKING_' + bankCode.toUpperCase(),
      orderId: orderId,
      bankCode: bankCode,
    });

    // 2. Redirect to bank
    if (chargeResponse.data.authorize_uri) {
      window.location.href = chargeResponse.data.authorize_uri;
    }
  } catch (error) {
    setError('เกิดข้อผิดพลาด');
  }
};
```

## 🔄 Workflow แนะนำ

### สำหรับ COD:
```
Step 1 (Address) → Step 2 (Payment: COD) → Step 3 (Review) → Create Order → Success
```

### สำหรับ Credit Card:
```
Step 1 (Address) → Step 2 (Payment: Card + Form) → Create Token → Create Order + Charge → Success
```

### สำหรับ PromptPay:
```
Step 1 (Address) → Step 2 (Payment: PromptPay) → Create Order → Show QR → Wait Payment → Success
```

### สำหรับ Internet Banking:
```
Step 1 (Address) → Step 2 (Payment: Banking + Select Bank) → Create Order → Redirect to Bank → Success
```

## 🎯 ขั้นตอนต่อไป

1. แทนที่ Step 2 ใน `checkout/page.tsx` ด้วย PaymentMethodSelector
2. เพิ่ม conditional rendering สำหรับแต่ละ payment method
3. อัพเดท `handlePlaceOrder()` ให้รองรับ payment flow ต่างๆ
4. เพิ่ม error handling และ loading states
5. ทดสอบกับ Omise test keys

## 🔑 Omise Test Cards

ใช้สำหรับทดสอบ:
- **Success:** 4242 4242 4242 4242
- **3D Secure:** 4000 0000 0000 0002
- **Insufficient Funds:** 4000 0000 0000 0341
- **CVV:** ใส่อะไรก็ได้ 3-4 หลัก
- **Expiry:** อนาคต เช่น 12/2025
