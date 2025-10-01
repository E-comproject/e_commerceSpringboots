import axios from 'axios';
import { ChatRoom, ChatMessage, ChatRoomWithLastMessage } from '@/types/chat';

const API_BASE = 'http://localhost:8080/api';

export const chatApi = {
  // Create or get existing chat room
  async getOrCreateRoom(buyerId: number, shopId: number, orderId?: number): Promise<ChatRoom> {
    const params = new URLSearchParams({
      buyerId: buyerId.toString(),
      shopId: shopId.toString(),
    });

    if (orderId) {
      params.append('orderId', orderId.toString());
    }

    const response = await axios.post(`${API_BASE}/chat/rooms?${params.toString()}`);
    return response.data;
  },

  // Get chat rooms for buyer
  async getRoomsForBuyer(buyerId: number, page: number = 0, size: number = 20): Promise<{
    content: ChatRoom[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
  }> {
    const response = await axios.get(`${API_BASE}/chat/rooms/buyer`, {
      params: { buyerId, page, size }
    });
    return response.data;
  },

  // Get chat rooms for seller (shop)
  async getRoomsForSeller(shopId: number, page: number = 0, size: number = 20): Promise<{
    content: ChatRoom[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
  }> {
    const response = await axios.get(`${API_BASE}/chat/rooms/seller`, {
      params: { shopId, page, size }
    });
    return response.data;
  },

  // Get messages for a room
  async getMessages(roomId: number, page: number = 0, size: number = 50): Promise<{
    content: ChatMessage[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
  }> {
    const response = await axios.get(`${API_BASE}/chat/rooms/${roomId}/messages`, {
      params: { page, size }
    });
    return response.data;
  },
};