package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.PaymentCreateDto;
import com.stemadeleine.api.dto.PaymentUpdateDto;
import com.stemadeleine.api.model.Payment;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.PaymentRepository;
import com.stemadeleine.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Optional<Payment> getPaymentById(UUID id) {
        return paymentRepository.findById(id);
    }

    @Transactional
    public Payment createPayment(PaymentCreateDto dto) {
        Payment payment = Payment.builder()
                .amount(dto.getAmount())
                .currency(dto.getCurrency() != null ? dto.getCurrency() : "EUR")
                .paymentDate(dto.getPaymentDate())
                .status(dto.getStatus())
                .type(dto.getType())
                .formSlug(dto.getFormSlug())
                .receiptUrl(dto.getReceiptUrl())
                .build();

        // Associer l'utilisateur si fourni
        if (dto.getUserId() != null) {
            Optional<User> user = userRepository.findById(dto.getUserId());
            user.ifPresent(payment::setUser);
        }

        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment addPayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment updatePayment(UUID id, PaymentUpdateDto dto) {
        Payment payment = paymentRepository.findById(id).orElseThrow();
        payment.setAmount(dto.getAmount());
        payment.setPaymentDate(dto.getPaymentDate());
        payment.setStatus(dto.getStatus());
        payment.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "EUR");
        if (dto.getType() != null) payment.setType(dto.getType());
        if (dto.getFormSlug() != null) payment.setFormSlug(dto.getFormSlug());
        if (dto.getReceiptUrl() != null) payment.setReceiptUrl(dto.getReceiptUrl());
        return paymentRepository.save(payment);
    }

    @Transactional
    public void deletePayment(UUID id) {
        paymentRepository.deleteById(id);
    }

    public double getTotalAmountByFormSlug(String formSlug) {
        return paymentRepository.findAll().stream()
                .filter(p -> formSlug.equals(p.getFormSlug()))
                .mapToDouble(Payment::getAmount)
                .sum();
    }

    @Transactional
    public Payment updatePaymentUser(UUID paymentId, UUID userId) {
        Payment payment = paymentRepository.findById(paymentId).orElseThrow();
        if (userId == null) {
            payment.setUser(null);
        } else {
            Optional<User> user = userRepository.findById(userId);
            user.ifPresent(payment::setUser);
        }
        return paymentRepository.save(payment);
    }
}
