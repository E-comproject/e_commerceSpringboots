'use client';

import { useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, User, ShoppingBag } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface ChatRoomProps {
  roomId: number;
  onBack?: () => void;
}

export default function ChatRoom({ roomId, onBack }: ChatRoomProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef<Set<number>>(new Set()); // Track which rooms have been loaded

  const {
    messages,
    rooms,
    currentUser,
    isLoadingMessages,
    loadMessages,
    setActiveRoom
  } = useChatStore();

  const roomMessages = messages[roomId] || [];
  const currentRoom = rooms.find(r => r.id === roomId);

  // Set active room when component mounts/changes
  useEffect(() => {
    setActiveRoom(roomId);
    return () => setActiveRoom(null);
  }, [roomId]);

  // Load messages only when roomId changes - using ref to track loaded rooms
  useEffect(() => {
    // Only load if we haven't loaded this room before
    if (!hasLoadedRef.current.has(roomId)) {
      hasLoadedRef.current.add(roomId);
      loadMessages(roomId);
    }
  }, [roomId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [roomMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getRoomDisplayInfo = () => {
    if (!currentRoom || !currentUser) return { title: 'แชท', subtitle: '' };

    if (currentUser.role === 'BUYER') {
      return {
        title: `ร้านค้า ID: ${currentRoom.shopId}`,
        subtitle: currentRoom.orderId ? `คำสั่งซื้อ #${currentRoom.orderId}` : 'แชททั่วไป',
        icon: <ShoppingBag size={20} />
      };
    } else {
      return {
        title: `ลูกค้า ID: ${currentRoom.buyerUserId}`,
        subtitle: currentRoom.orderId ? `คำสั่งซื้อ #${currentRoom.orderId}` : 'แชททั่วไป',
        icon: <User size={20} />
      };
    }
  };

  const displayInfo = getRoomDisplayInfo();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            title="กลับ"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        <div className="flex items-center gap-3 flex-1">
          <div className="bg-gray-100 text-gray-600 p-2 rounded-full">
            {displayInfo.icon}
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              {displayInfo.title}
            </h2>
            {displayInfo.subtitle && (
              <div className="text-xs text-gray-500">
                {displayInfo.subtitle}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <div className="text-gray-500 text-sm">กำลังโหลดข้อความ...</div>
            </div>
          </div>
        ) : roomMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">💬</div>
              <div className="text-sm">ยังไม่มีข้อความในห้องแชทนี้</div>
              <div className="text-xs text-gray-400 mt-1">
                เริ่มบทสนทนาด้วยการส่งข้อความแรก
              </div>
            </div>
          </div>
        ) : (
          <>
            {roomMessages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <ChatInput roomId={roomId} disabled={isLoadingMessages} />
    </div>
  );
}