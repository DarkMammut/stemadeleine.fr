package com.stemadeleine.api.dto;

import com.stemadeleine.api.model.PaymentStatus;
import com.stemadeleine.api.model.PaymentType;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PaymentUpdateDto {
    private double amount;
    private LocalDate paymentDate;
    private PaymentStatus status;
    private String currency = "EUR";
    private PaymentType type;
    private String formSlug;
    private String receiptUrl;
}



