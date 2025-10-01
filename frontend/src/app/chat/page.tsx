'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Settings } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import ChatRoomList from '@/components/chat/ChatRoomList';
import ChatRoom from '@/components/chat/ChatRoom';

export default function ChatPage() {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const { currentUser, setCurrentUser } = useChatStore();

  // Initialize WebSocket connection
  useChatWebSocket();

  // Demo: Set default user for testing (in real app, this would come from auth)
  useEffect(() => {
    if (!currentUser) {
      // Default to buyer for demo - in production this should come from authentication
      setCurrentUser({ id: 1, role: 'BUYER' });
    }
  }, [currentUser, setCurrentUser]);

  const handleRoomSelect = (roomId: number) => {
    setSelectedRoomId(roomId);
  };

  const handleBack = () => {
    setSelectedRoomId(null);
  };

  const switchUser = (userId: number, role: 'BUYER' | 'SELLER') => {
    setCurrentUser({ id: userId, role });
    setSelectedRoomId(null); // Reset selected room when switching user
    setShowUserSelector(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                <MessageCircle size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">แชท</h1>
                <div className="text-sm text-gray-600">
                  ระบบสนทนาระหว่างผู้ซื้อและผู้ขาย
                </div>
              </div>
            </div>

            {/* User switcher for demo */}
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">
                {currentUser
                  ? `${currentUser.role === 'BUYER' ? 'ผู้ซื้อ' : 'ผู้ขาย'} ID: ${currentUser.id}`
                  : 'ไม่ได้เข้าสู่ระบบ'
                }
              </div>
              <button
                onClick={() => setShowUserSelector(!showUserSelector)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="เปลี่ยนผู้ใช้ (สำหรับทดสอบ)"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* User selector dropdown */}
          {showUserSelector && (
            <div className="absolute right-4 mt-2 bg-white border rounded-lg shadow-lg py-2 z-10">
              <div className="px-4 py-2 text-xs text-gray-500 border-b">
                เลือกบทบาทสำหรับทดสอบ
              </div>
              <button
                onClick={() => switchUser(1, 'BUYER')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                ผู้ซื้อ ID: 1
              </button>
              <button
                onClick={() => switchUser(2, 'BUYER')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                ผู้ซื้อ ID: 2
              </button>
              <button
                onClick={() => switchUser(1, 'SELLER')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                ผู้ขาย ID: 1
              </button>
              <button
                onClick={() => switchUser(2, 'SELLER')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                ผู้ขาย ID: 2
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto">
        <div className="flex h-[calc(100vh-120px)]">
          {/* Sidebar - Chat rooms list */}
          <div className={`w-80 bg-white border-r ${
            selectedRoomId ? 'hidden lg:block' : ''
          }`}>
            <div className="h-full overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-gray-900">
                  รายการแชท
                </h2>
              </div>
              <div className="overflow-y-auto">
                <ChatRoomList
                  onRoomSelect={handleRoomSelect}
                  selectedRoomId={selectedRoomId || undefined}
                />
              </div>
            </div>
          </div>

          {/* Main chat area */}
          <div className={`flex-1 bg-white ${
            selectedRoomId ? '' : 'hidden lg:flex'
          }`}>
            {selectedRoomId ? (
              <ChatRoom
                roomId={selectedRoomId}
                onBack={handleBack}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <MessageCircle size={64} className="mx-auto mb-4 text-gray-400" />
                  <div className="text-lg font-medium mb-2">เลือกห้องแชท</div>
                  <div className="text-sm">
                    เลือกห้องแชทจากรายการทางซ้ายเพื่อเริ่มสนทนา
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}