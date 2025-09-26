'use client';

import { useState } from 'react';
import { useChatStore } from '@/store/chatStore';

export default function ChatTestPage() {
  const [buyerId, setBuyerId] = useState(1);
  const [shopId, setShopId] = useState(1);
  const [orderId, setOrderId] = useState<number | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);

  const { createOrGetRoom, setCurrentUser } = useChatStore();

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      const room = await createOrGetRoom(buyerId, shopId, orderId);
      alert(`สร้างห้องแชทสำเร็จ! Room ID: ${room.id}`);
      // Redirect to chat page
      window.location.href = '/chat';
    } catch (error) {
      console.error('Error creating room:', error);
      alert('เกิดข้อผิดพลาดในการสร้างห้องแชท');
    }
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">ทดสอบการสร้างห้องแชท</h1>

          {/* User Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">เลือกบทบาทของคุณ:</label>
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentUser({ id: buyerId, role: 'BUYER' })}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                ผู้ซื้อ ID: {buyerId}
              </button>
              <button
                onClick={() => setCurrentUser({ id: shopId, role: 'SELLER' })}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                ผู้ขาย Shop ID: {shopId}
              </button>
            </div>
          </div>

          {/* Room Creation Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Buyer ID:</label>
              <input
                type="number"
                value={buyerId}
                onChange={(e) => setBuyerId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Shop ID:</label>
              <input
                type="number"
                value={shopId}
                onChange={(e) => setShopId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Order ID (ไม่บังคับ):</label>
              <input
                type="number"
                value={orderId || ''}
                onChange={(e) => setOrderId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="ระบุถ้าต้องการผูกกับออเดอร์"
              />
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isCreating ? 'กำลังสร้าง...' : 'สร้างห้องแชท'}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">ตัวอย่างการสร้างห้องแชท:</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setBuyerId(1);
                  setShopId(1);
                  setOrderId(undefined);
                  handleCreateRoom();
                }}
                className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
              >
                💬 ลูกค้า ID:1 แชทกับร้าน ID:1 (แชททั่วไป)
              </button>
              <button
                onClick={() => {
                  setBuyerId(1);
                  setShopId(2);
                  setOrderId(123);
                  handleCreateRoom();
                }}
                className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
              >
                📦 ลูกค้า ID:1 แชทกับร้าน ID:2 เรื่องออเดอร์ #123
              </button>
              <button
                onClick={() => {
                  setBuyerId(2);
                  setShopId(1);
                  setOrderId(456);
                  handleCreateRoom();
                }}
                className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
              >
                📦 ลูกค้า ID:2 แชทกับร้าน ID:1 เรื่องออเดอร์ #456
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-6 text-center">
            <a
              href="/chat"
              className="text-blue-500 hover:text-blue-700 underline"
            >
              ไปหน้าแชท →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}