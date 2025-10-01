package com.ecommerce.EcommerceApplication;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@SpringBootApplication
public class EcommerceApplication {

    public static void main(String[] args) {
        SpringApplication.run(EcommerceApplication.class, args);
    }

    @Configuration
    @EnableWebSocketMessageBroker
    static class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

        public WebSocketConfig() {
            System.out.println("🏗️ WebSocketConfig inner class created!");
        }

        @Override
        public void configureMessageBroker(MessageBrokerRegistry config) {
            System.out.println("📢 Configuring Message Broker...");
            config.enableSimpleBroker("/topic");
            config.setApplicationDestinationPrefixes("/app");
            System.out.println("✅ Message Broker configured: /topic, /app");
        }

        @Override
        public void registerStompEndpoints(StompEndpointRegistry registry) {
            System.out.println("🌐 Registering STOMP endpoints...");

            registry.addEndpoint("/ws-chat")
                    .setAllowedOriginPatterns("*")  // Use patterns instead of origins
                    .withSockJS();

            System.out.println("✅ STOMP endpoint registered: /ws-chat");
            System.out.println("📍 SockJS info endpoint: http://localhost:8080/ws-chat/info");
        }
    }
}
