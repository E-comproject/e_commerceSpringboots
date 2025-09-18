package com.ecommerce.EcommerceApplication.dto;

public record PaymentIntentResponse(
  Long paymentId, String clientSecret, String providerSession
) {}