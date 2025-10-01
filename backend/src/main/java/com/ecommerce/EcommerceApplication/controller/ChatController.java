package com.ecommerce.EcommerceApplication.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.EcommerceApplication.dto.ChatMessageDto;
import com.ecommerce.EcommerceApplication.dto.ChatRoomDto;
import com.ecommerce.EcommerceApplication.service.ChatService;

@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {

  private final ChatService chatService;
  public ChatController(ChatService chatService) { this.chatService = chatService; }

  @PostMapping("/rooms")
  public ChatRoomDto getOrCreate(@RequestParam Long buyerId, @RequestParam Long shopId,
                                 @RequestParam(required = false) Long orderId) {
    return chatService.getOrCreateRoom(buyerId, shopId, orderId);
  }

  @GetMapping("/rooms/buyer")
  public Page<ChatRoomDto> roomsForBuyer(@RequestParam Long buyerId,
                                         @RequestParam(defaultValue="0") int page,
                                         @RequestParam(defaultValue="20") int size) {
    return chatService.listRoomsForBuyer(buyerId, PageRequest.of(page, size));
  }

  @GetMapping("/rooms/seller")
  public Page<ChatRoomDto> roomsForSeller(@RequestParam Long shopId,
                                          @RequestParam(defaultValue="0") int page,
                                          @RequestParam(defaultValue="20") int size) {
    return chatService.listRoomsForShop(shopId, PageRequest.of(page, size));
  }

  @GetMapping("/rooms/{roomId}/messages")
  public Page<ChatMessageDto> messages(@PathVariable Long roomId,
                                       @RequestParam(defaultValue="0") int page,
                                       @RequestParam(defaultValue="50") int size) {
    return chatService.listMessages(roomId, PageRequest.of(page, size));
  }
}
