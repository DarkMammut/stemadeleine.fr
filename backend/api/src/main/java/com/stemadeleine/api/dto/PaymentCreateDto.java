package com.stemadeleine.api.dto;

import com.stemadeleine.api.model.PaymentStatus;
import com.stemadeleine.api.model.PaymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentCreateDto {
    private Double amount;
    private String currency;
    private LocalDate paymentDate;
    private PaymentStatus status;
    private PaymentType type;
    private String formSlug;
    private String receiptUrl;
    private UUID userId;
}

