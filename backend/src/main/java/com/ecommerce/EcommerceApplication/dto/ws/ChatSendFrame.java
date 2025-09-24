package com.ecommerce.EcommerceApplication.dto.ws;

import java.util.List;

public class ChatSendFrame {
    public Long roomId;
    public Long senderUserId;      // dev-mode รับจาก client
    public String role;            // "BUYER" | "SELLER"
    public String content;
    public List<String> attachments;
}
