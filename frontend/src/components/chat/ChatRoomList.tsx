'use client';

import { useEffect } from 'react';
import { MessageCircle, ShoppingBag, User } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { ChatRoomWithLastMessage } from '@/types/chat';

interface ChatRoomListProps {
  onRoomSelect: (roomId: number) => void;
  selectedRoomId?: number;
}

export default function ChatRoomList({ onRoomSelect, selectedRoomId }: ChatRoomListProps) {
  const {
    rooms,
    isLoadingRooms,
    loadRooms,
    currentUser
  } = useChatStore();

  useEffect(() => {
    if (currentUser) {
      loadRooms();
    }
  }, [currentUser, loadRooms]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  const getRoomDisplayInfo = (room: ChatRoomWithLastMessage) => {
    if (currentUser?.role === 'BUYER') {
      return {
        title: `ร้านค้า ID: ${room.shopId}`,
        subtitle: room.orderId ? `คำสั่งซื้อ #${room.orderId}` : 'แชททั่วไป',
        icon: <ShoppingBag size={16} />
      };
    } else {
      return {
        title: `ลูกค้า ID: ${room.buyerUserId}`,
        subtitle: room.orderId ? `คำสั่งซื้อ #${room.orderId}` : 'แชททั่วไป',
        icon: <User size={16} />
      };
    }
  };

  if (!currentUser) {
    return (
      <div className="p-4 text-center text-gray-500">
        กรุณาเข้าสู่ระบบเพื่อใช้งานแชท
      </div>
    );
  }

  if (isLoadingRooms) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
        กำลังโหลดรายการแชท...
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <MessageCircle size={48} className="mx-auto mb-2 text-gray-400" />
        <div className="text-sm">ยังไม่มีการสนทนา</div>
        <div className="text-xs text-gray-400 mt-1">
          {currentUser.role === 'BUYER'
            ? 'เริ่มสนทนากับร้านค้าเมื่อคุณสั่งซื้อสินค้า'
            : 'ลูกค้าจะสามารถติดต่อคุณผ่านระบบแชทได้'
          }
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {rooms.map((room) => {
        const displayInfo = getRoomDisplayInfo(room);
        const isSelected = selectedRoomId === room.id;

        return (
          <div
            key={room.id}
            onClick={() => onRoomSelect(room.id)}
            className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
              isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={`flex-shrink-0 p-2 rounded-full ${
                isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {displayInfo.icon}
              </div>

              {/* Room info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-semibold truncate ${
                    isSelected ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {displayInfo.title}
                  </h3>
                  <div className="text-xs text-gray-500 ml-2">
                    {formatTime(room.createdAt)}
                  </div>
                </div>

                <div className="text-xs text-gray-600 mt-1">
                  {displayInfo.subtitle}
                </div>

                {/* Last message preview */}
                {room.lastMessage && (
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {room.lastMessage.content}
                  </div>
                )}

                {/* Unread indicator */}
                {room.unreadCount && room.unreadCount > 0 && (
                  <div className="inline-block bg-red-500 text-white text-xs rounded-full px-2 py-1 mt-2">
                    {room.unreadCount > 99 ? '99+' : room.unreadCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}