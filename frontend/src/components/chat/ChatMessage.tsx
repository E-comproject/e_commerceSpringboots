'use client';

import { ChatMessage as ChatMessageType } from '@/types/chat';
import { useChatStore } from '@/store/chatStore';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const { currentUser } = useChatStore();

  const isOwn = currentUser?.id === message.senderUserId;
  const senderLabel = message.senderRole === 'BUYER' ? 'ลูกค้า' : 'ผู้ขาย';

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOwn
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 text-gray-800'
      }`}>
        {/* Sender info (only show for other's messages) */}
        {!isOwn && (
          <div className="text-xs text-gray-600 mb-1 font-semibold">
            {senderLabel}
          </div>
        )}

        {/* Message content */}
        <div className="text-sm">
          {message.content}
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.attachments.map((attachment, index) => {
              console.log('Rendering attachment:', attachment);
              // Check if attachment is an image
              if (attachment.startsWith('/api/files/chat/')) {
                return (
                  <div key={index}>
                    <img
                      src={`http://localhost:8080${attachment}`}
                      alt={`รูปภาพ ${index + 1}`}
                      className="max-w-full max-h-60 rounded cursor-pointer hover:opacity-90 transition-opacity"
                      onLoad={() => console.log('Image loaded:', attachment)}
                      onError={(e) => console.error('Image failed to load:', attachment, e)}
                      onClick={() => {
                        // Open image in new tab
                        window.open(`http://localhost:8080${attachment}`, '_blank');
                      }}
                    />
                  </div>
                );
              } else {
                // Regular file attachment
                return (
                  <div key={index} className="text-xs">
                    <a
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`underline ${isOwn ? 'text-blue-100' : 'text-blue-600'}`}
                    >
                      📎 ไฟล์แนบ {index + 1}
                    </a>
                  </div>
                );
              }
            })}
          </div>
        )}

        {/* Timestamp */}
        <div className={`text-xs mt-1 ${
          isOwn ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {formatTime(message.createdAt)}
          {isOwn && (
            <span className="ml-2">
              {message.isRead ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}