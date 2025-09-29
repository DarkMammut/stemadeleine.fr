package com.stemadeleine.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "helloasso_payment_id", unique = true)
    private String helloAssoPaymentId;

    private Double amount;

    private String currency;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "form_slug")
    private String formSlug;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type")
    private PaymentType type = PaymentType.MEMBERSHIP;

    @Column(name = "receipt_url")
    private String receiptUrl;
}
