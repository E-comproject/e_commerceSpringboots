'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OmisePaymentForm from '@/components/payment/OmisePaymentForm';
import { type OmisePaymentResult } from '@/types/omise';

export default function PaymentDemoPage() {
  const router = useRouter();
  const [paymentResult, setPaymentResult] = useState<OmisePaymentResult | null>(null);
  const [error, setError] = useState<string>('');

  // Mock order data for demo
  const mockOrder = {
    id: 1,
    orderNumber: 'ORD-001',
    amount: 1299.00,
    currency: 'THB',
    items: [
      { name: 'iPhone 15', price: 35000, quantity: 1 },
      { name: 'AirPods Pro', price: 8900, quantity: 1 }
    ]
  };

  const handlePaymentSuccess = (result: OmisePaymentResult) => {
    console.log('Payment successful:', result);
    setPaymentResult(result);
    setError('');
  };

  const handlePaymentError = (errorMessage: string) => {
    console.error('Payment error:', errorMessage);
    setError(errorMessage);
    setPaymentResult(null);
  };

  const resetDemo = () => {
    setPaymentResult(null);
    setError('');
  };

  if (paymentResult?.success) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ชำระเงินสำเร็จ! 🎉
            </h1>

            <p className="text-gray-600 mb-6">
              การชำระเงินของคุณได้รับการดำเนินการเรียบร้อยแล้ว
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">หมายเลขคำสั่งซื้อ:</span>
                  <p className="font-semibold">{mockOrder.orderNumber}</p>
                </div>
                <div>
                  <span className="text-gray-500">จำนวนเงิน:</span>
                  <p className="font-semibold text-green-600">
                    ฿{mockOrder.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Transaction ID:</span>
                  <p className="font-semibold text-xs">{paymentResult.chargeId}</p>
                </div>
                <div>
                  <span className="text-gray-500">สถานะ:</span>
                  <p className="font-semibold text-green-600">{paymentResult.status}</p>
                </div>
              </div>
            </div>

            {paymentResult.qrCodeData && (
              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  QR Code สำหรับการชำระเงิน (PromptPay)
                </p>
                <div className="bg-white p-4 rounded-lg inline-block border">
                  <img
                    src={`data:image/png;base64,${paymentResult.qrCodeData}`}
                    alt="PromptPay QR Code"
                    className="w-32 h-32"
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={resetDemo}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ทดสอบการชำระเงินอีกครั้ง
              </button>

              <button
                onClick={() => router.push('/')}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                กลับสู่หน้าหลัก
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              🛒 ทดสอบระบบ Payment Gateway (Omise)
            </h1>
            <p className="text-gray-600 mt-1">
              ทดสอบการชำระเงินด้วย Omise Payment Gateway
            </p>
          </div>

          <div className="p-6">
            {/* Mock Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-lg mb-3">รายการสินค้า</h3>
              <div className="space-y-2 mb-4">
                {mockOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.name} x {item.quantity}</span>
                    <span>฿{item.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 font-semibold text-lg">
                <div className="flex justify-between">
                  <span>รวมทั้งหมด:</span>
                  <span className="text-blue-600">฿{mockOrder.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-700 font-medium">เกิดข้อผิดพลาด</span>
                </div>
                <p className="text-red-600 mt-1">{error}</p>
              </div>
            )}

            {/* Payment Form */}
            <OmisePaymentForm
              orderId={mockOrder.id}
              amount={mockOrder.amount}
              currency={mockOrder.currency}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        </div>

        {/* Demo Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">📝 ข้อมูลสำหรับทดสอบ</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>บัตรเครดิต/เดบิต:</strong></p>
            <p>• เลขบัตร: 4242 4242 4242 4242 (Visa) หรือ 5555 5555 5555 4444 (Mastercard)</p>
            <p>• วันหมดอายุ: เดือน/ปีในอนาคต</p>
            <p>• CVV: 123</p>
            <p>• ชื่อ: ชื่อใดก็ได้</p>
            <br />
            <p><strong>TrueMoney:</strong> หมายเลขโทรศัพท์ 10 หลัก</p>
            <p><strong>PromptPay:</strong> จะแสดง QR Code สำหรับการชำระเงิน</p>
            <p><strong>Internet Banking:</strong> จะเปลี่ยนเส้นทางไปยังหน้าธนาคาร</p>
          </div>
        </div>
      </div>
    </div>
  );
}