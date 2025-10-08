export interface ChatMessage {
  id: number;
  roomId: number;
  senderUserId: number;
  message: string;
  sentAt: string;
  senderUsername?: string;
  senderProfileImage?: string | null;
}

export interface ChatRoom {
  id: number;
  buyerUserId: number;
  shopId: number;
  createdAt: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}
