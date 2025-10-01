'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CreditCard, Smartphone, Building2, QrCode } from 'lucide-react';

import omiseApiService from '@/lib/api/omise';
import { OMISE_PAYMENT_METHODS, OMISE_BANKS, type OmisePaymentFormData, type OmisePaymentResult } from '@/types/omise';

interface OmisePaymentFormProps {
  orderId: number;
  amount: number;
  currency?: string;
  onSuccess: (result: OmisePaymentResult) => void;
  onError: (error: string) => void;
}

export default function OmisePaymentForm({
  orderId,
  amount,
  currency = 'THB',
  onSuccess,
  onError
}: OmisePaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string>('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<OmisePaymentFormData>({
    defaultValues: {
      amount,
      currency,
      paymentMethod: ''
    }
  });

  const watchedPaymentMethod = watch('paymentMethod');

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="w-5 h-5" />;
      case 'promptpay':
        return <QrCode className="w-5 h-5" />;
      case 'truemoney':
        return <Smartphone className="w-5 h-5" />;
      case 'internet_banking':
        return <Building2 className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getBankForPaymentMethod = (paymentMethodId: string) => {
    const bankCode = paymentMethodId.split('_').pop()?.toLowerCase();
    return OMISE_BANKS.find(bank => bank.code === bankCode);
  };

  const onSubmit = async (data: OmisePaymentFormData) => {
    setIsProcessing(true);

    try {
      let token: string | undefined;

      // Handle card payments - create token first
      if (data.paymentMethod === 'OMISE_CREDIT_CARD' || data.paymentMethod === 'OMISE_DEBIT_CARD') {
        if (!data.cardNumber || !data.cardName || !data.expiryMonth || !data.expiryYear || !data.cvv) {
          throw new Error('กรุณากรอกข้อมูลบัตรให้ครบถ้วน');
        }

        const cardToken = await omiseApiService.createCardToken({
          number: data.cardNumber.replace(/\s/g, ''),
          name: data.cardName,
          expiration_month: parseInt(data.expiryMonth),
          expiration_year: parseInt(data.expiryYear),
          security_code: data.cvv
        });

        token = cardToken.id;
      }

      // Create charge
      const chargeRequest = {
        orderId,
        amount: data.amount,
        currency: data.currency,
        paymentMethod: data.paymentMethod,
        description: `Payment for Order #${orderId}`,
        token,
        phoneNumber: data.phoneNumber,
        bankCode: getBankForPaymentMethod(data.paymentMethod)?.code,
        customerEmail: data.customerEmail,
        customerName: data.customerName
      };

      const chargeResponse = await omiseApiService.createCharge(chargeRequest);

      // Handle different payment method responses
      if (chargeResponse.status === 'successful') {
        onSuccess({
          success: true,
          chargeId: chargeResponse.id,
          status: chargeResponse.status
        });
      } else if (chargeResponse.status === 'pending') {
        // For PromptPay, show QR code
        if (chargeResponse.source?.scannable_code) {
          setQrCodeData(chargeResponse.source.scannable_code);
          setShowQrCode(true);
        }

        // For 3D Secure, redirect
        if (chargeResponse.authorize_uri) {
          window.location.href = chargeResponse.authorize_uri;
          return;
        }

        onSuccess({
          success: true,
          chargeId: chargeResponse.id,
          status: chargeResponse.status,
          qrCodeData: chargeResponse.source?.scannable_code,
          requiresAction: chargeResponse.requires_action
        });
      } else {
        throw new Error('Payment failed');
      }

    } catch (error) {
      console.error('Payment error:', error);
      onError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการชำระเงิน');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderCardForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          หมายเลขบัตร
        </label>
        <input
          type="text"
          {...register('cardNumber', {
            required: 'กรุณากรอกหมายเลขบัตร',
            pattern: {
              value: /^[0-9\s]{13,19}$/,
              message: 'หมายเลขบัตรไม่ถูกต้อง'
            }
          })}
          placeholder="1234 5678 9012 3456"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          maxLength={19}
          onChange={(e) => {
            // Format card number with spaces
            const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
            e.target.value = value;
          }}
        />
        {errors.cardNumber && (
          <p className="text-red-500 text-sm mt-1">{errors.cardNumber.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ชื่อผู้ถือบัตร
        </label>
        <input
          type="text"
          {...register('cardName', { required: 'กรุณากรอกชื่อผู้ถือบัตร' })}
          placeholder="ชื่อตามที่ปรากฏบนบัตร"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.cardName && (
          <p className="text-red-500 text-sm mt-1">{errors.cardName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            เดือน
          </label>
          <select
            {...register('expiryMonth', { required: 'กรุณาเลือกเดือน' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">เดือน</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                {String(i + 1).padStart(2, '0')}
              </option>
            ))}
          </select>
          {errors.expiryMonth && (
            <p className="text-red-500 text-sm mt-1">{errors.expiryMonth.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ปี
          </label>
          <select
            {...register('expiryYear', { required: 'กรุณาเลือกปี' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">ปี</option>
            {Array.from({ length: 10 }, (_, i) => {
              const year = new Date().getFullYear() + i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
          {errors.expiryYear && (
            <p className="text-red-500 text-sm mt-1">{errors.expiryYear.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CVV
          </label>
          <input
            type="text"
            {...register('cvv', {
              required: 'กรุณากรอก CVV',
              pattern: {
                value: /^[0-9]{3,4}$/,
                message: 'CVV ไม่ถูกต้อง'
              }
            })}
            placeholder="123"
            maxLength={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.cvv && (
            <p className="text-red-500 text-sm mt-1">{errors.cvv.message}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderTrueMoneyForm = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        หมายเลขโทรศัพท์
      </label>
      <input
        type="tel"
        {...register('phoneNumber', {
          required: 'กรุณากรอกหมายเลขโทรศัพท์',
          pattern: {
            value: /^[0-9]{10}$/,
            message: 'หมายเลขโทรศัพท์ไม่ถูกต้อง'
          }
        })}
        placeholder="0812345678"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {errors.phoneNumber && (
        <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
      )}
    </div>
  );

  if (showQrCode && qrCodeData) {
    return (
      <div className="text-center p-6">
        <h3 className="text-lg font-semibold mb-4">สแกน QR Code เพื่อชำระเงิน</h3>
        <div className="bg-white p-4 rounded-lg inline-block">
          <img
            src={`data:image/png;base64,${qrCodeData}`}
            alt="PromptPay QR Code"
            className="w-64 h-64 mx-auto"
          />
        </div>
        <p className="text-gray-600 mt-4">
          จำนวนเงิน: {formatAmount(amount)}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          กรุณาสแกน QR Code ด้วยแอพธนาคารหรือ Mobile Banking
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">สรุปการชำระเงิน</h3>
        <p className="text-2xl font-bold text-blue-600">{formatAmount(amount)}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          เลือกวิธีการชำระเงิน
        </label>
        <div className="space-y-3">
          {OMISE_PAYMENT_METHODS.filter(method => method.enabled).map((method) => {
            const bank = getBankForPaymentMethod(method.id);
            return (
              <label
                key={method.id}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  watchedPaymentMethod === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  {...register('paymentMethod', { required: 'กรุณาเลือกวิธีการชำระเงิน' })}
                  value={method.id}
                  className="sr-only"
                />
                <div className="flex items-center space-x-3">
                  {getPaymentMethodIcon(method.type)}
                  <span className="font-medium">{bank ? bank.nameTh : method.name}</span>
                </div>
              </label>
            );
          })}
        </div>
        {errors.paymentMethod && (
          <p className="text-red-500 text-sm mt-1">{errors.paymentMethod.message}</p>
        )}
      </div>

      {/* Payment method specific forms */}
      {(watchedPaymentMethod === 'OMISE_CREDIT_CARD' || watchedPaymentMethod === 'OMISE_DEBIT_CARD') && renderCardForm()}
      {watchedPaymentMethod === 'OMISE_TRUEMONEY' && renderTrueMoneyForm()}

      {/* Customer information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            อีเมล
          </label>
          <input
            type="email"
            {...register('customerEmail')}
            placeholder="your@email.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ชื่อลูกค้า
          </label>
          <input
            type="text"
            {...register('customerName')}
            placeholder="ชื่อ-นามสกุล"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isProcessing || !watchedPaymentMethod}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? 'กำลังดำเนินการ...' : `ชำระเงิน ${formatAmount(amount)}`}
      </button>

      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
        <span>🔒</span>
        <span>การชำระเงินของคุณได้รับการรักษาความปลอดภัยโดย Omise</span>
      </div>
    </form>
  );
}