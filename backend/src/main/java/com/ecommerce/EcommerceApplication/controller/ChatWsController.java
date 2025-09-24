package com.ecommerce.EcommerceApplication.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.ecommerce.EcommerceApplication.dto.ChatMessageDto;
import com.ecommerce.EcommerceApplication.dto.SendMessageReq;
import com.ecommerce.EcommerceApplication.dto.ws.ChatReadFrame;
import com.ecommerce.EcommerceApplication.dto.ws.ChatSendFrame;
import com.ecommerce.EcommerceApplication.service.ChatService;

@Controller
public class ChatWsController {

    private final SimpMessagingTemplate template;
    private final ChatService chatService;

    public ChatWsController(SimpMessagingTemplate template, ChatService chatService) {
        this.template = template;
        this.chatService = chatService;
    }

    // Client ส่งที่ /app/chat.send
    @MessageMapping("/chat.send")
    public void onSend(ChatSendFrame frame) {
        SendMessageReq req = new SendMessageReq();
        req.content = frame.content;
        req.attachments = frame.attachments;

        ChatMessageDto saved = chatService.sendMessage(frame.roomId, frame.senderUserId, frame.role, req);

        // broadcast ให้ห้องนี้
        template.convertAndSend("/topic/chat/" + saved.roomId, saved);
    }

    // Client ส่งที่ /app/chat.read
    @MessageMapping("/chat.read")
    public void onRead(ChatReadFrame frame) {
        chatService.markRead(frame.roomId, frame.userId);
        template.convertAndSend("/topic/chat/" + frame.roomId,
            java.util.Map.of("type","READ","roomId",frame.roomId,"userId",frame.userId));
    }
}
