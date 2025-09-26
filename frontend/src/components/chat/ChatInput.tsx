'use client';

import { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';

interface ChatInputProps {
  roomId: number;
  disabled?: boolean;
}

export default function ChatInput({ roomId, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const { sendMessage, isConnected } = useChatStore();

  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📤 Submit button clicked');
    console.log('📝 Message:', message.trim());
    console.log('🔗 Attachments:', attachments);
    console.log('🔌 Connected:', isConnected);
    console.log('⏳ Sending:', isSending);

    // Allow sending if there's either a message or attachments
    if ((!message.trim() && attachments.length === 0) || disabled || !isConnected || isSending) {
      console.log('❌ Cannot send - conditions not met:', {
        hasMessage: !!message.trim(),
        hasAttachments: attachments.length > 0,
        disabled,
        isConnected,
        isSending
      });
      return;
    }

    setIsSending(true);
    try {
      console.log('🚀 Sending message with attachments...');
      await sendMessage(roomId, message.trim(), attachments);
      console.log('✅ Message sent successfully');
      setMessage('');
      setAttachments([]);
      console.log('🧹 Cleared input and attachments');
    } catch (error) {
      console.error('💥 Error sending message:', error);
    } finally {
      setIsSending(false);
      console.log('🏁 Send process finished');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Don't call handleSubmit here - let the form onSubmit handle it
    }
  };

  const handleFileAttachment = () => {
    console.log('📎 File attachment button clicked');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      console.log('📁 File selected:', file?.name, file?.size, file?.type);
      if (!file) return;

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        console.error('❌ File too large:', file.size);
        alert('ไฟล์ใหญ่เกินไป (สูงสุด 5MB)');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.error('❌ Invalid file type:', file.type);
        alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }

      try {
        console.log('🔄 Starting upload process...');
        setIsSending(true);

        // Upload image
        const formData = new FormData();
        formData.append('file', file);

        console.log('🚀 Uploading to http://localhost:8080/api/files/upload/chat');
        const response = await fetch('http://localhost:8080/api/files/upload/chat', {
          method: 'POST',
          body: formData,
        });

        console.log('📡 Upload response status:', response.status);

        if (!response.ok) {
          const error = await response.json();
          console.error('❌ Upload failed:', error);
          throw new Error(error.error || 'อัปโหลดไฟล์ไม่สำเร็จ');
        }

        const data = await response.json();
        console.log('✅ Upload successful:', data);

        // Add image URL to attachments
        setAttachments(prev => {
          const newAttachments = [...prev, data.url];
          console.log('📋 Updated attachments:', newAttachments);
          return newAttachments;
        });

        // Show success message
        console.log('🎉 Image ready to send!');

      } catch (error) {
        console.error('💥 Error uploading file:', error);
        alert(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัปโหลด');
      } finally {
        setIsSending(false);
        console.log('🏁 Upload process finished');
      }
    };

    input.click();
  };

  return (
    <div className="border-t bg-white p-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* File attachment button */}
        <button
          type="button"
          onClick={handleFileAttachment}
          disabled={disabled || !isConnected || isSending}
          className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title={isSending ? "กำลังอัปโหลด..." : "แนบรูปภาพ"}
        >
          {isSending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-500 border-t-transparent"></div>
          ) : (
            <Paperclip size={20} />
          )}
        </button>

        {/* Message input */}
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isSending
                ? 'กำลังส่งข้อความ...'
                : !isConnected
                ? 'กำลังเชื่อมต่อ...'
                : 'พิมพ์ข้อความ... (กด Enter เพื่อส่ง)'
            }
            disabled={disabled || !isConnected || isSending}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            rows={1}
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />

          {/* Show attachments if any */}
          {attachments.length > 0 && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-700 font-medium mb-2">
                📎 รูปภาพที่แนบ ({attachments.length} รูป) - พร้อมส่ง!
              </div>
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="relative bg-white p-2 rounded-lg border shadow-sm"
                  >
                    {attachment.startsWith('/api/files/chat/') ? (
                      // Image preview
                      <div className="relative">
                        <img
                          src={`http://localhost:8080${attachment}`}
                          alt={`แนบรูปภาพ ${index + 1}`}
                          className="h-24 w-24 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            console.log('🗑️ Removing attachment:', attachment);
                            setAttachments(prev => prev.filter((_, i) => i !== index));
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 shadow-lg"
                          title="ลบรูปภาพ"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      // File attachment
                      <div className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                        📎 ไฟล์แนบ {index + 1}
                        <button
                          type="button"
                          onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700 ml-1"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-xs text-blue-600 mt-2">
                💡 พิมพ์ข้อความแล้วกดส่ง หรือส่งรูปภาพอย่างเดียวได้
              </div>
            </div>
          )}
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={(!message.trim() && attachments.length === 0) || disabled || !isConnected || isSending}
          className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
            (!message.trim() && attachments.length === 0) || disabled || !isConnected || isSending
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
          title={
            isSending
              ? "กำลังส่ง..."
              : attachments.length > 0 && !message.trim()
              ? "ส่งรูปภาพ"
              : "ส่งข้อความ"
          }
        >
          {isSending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>

      {/* Connection status */}
      <div className="mt-2 text-xs text-center">
        {!isConnected ? (
          <div className="text-gray-500">
            🔄 กำลังเชื่อมต่อระบบแชท...
            <a href="/websocket-test" className="text-blue-500 ml-2 underline">
              ทดสอบการเชื่อมต่อ
            </a>
          </div>
        ) : (
          <div className="text-green-600">
            ✅ เชื่อมต่อสำเร็จ
          </div>
        )}
      </div>
    </div>
  );
}