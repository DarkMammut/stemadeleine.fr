package com.stemadeleine.api.dto;

import com.stemadeleine.api.model.PaymentStatus;
import com.stemadeleine.api.model.PaymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HelloAssoPaymentDto {
    private String paymentId;
    private String payerFirstname;
    private String payerLastname;
    private String payerEmail;
    private LocalDate payerBirthDate;
    private Double amount;
    private String currency;
    private LocalDate paymentDate;
    private PaymentStatus status;
    private String formSlug;
    private PaymentType type;
    private String receiptUrl;
    private String payerAddressLine1;
    private String payerAddressLine2;
    private String payerCity;
    private String payerState;
    private String payerPostCode;
    private String payerCountry;
}
