package com.stemadeleine.api.service;

import com.stemadeleine.api.model.Payment;
import com.stemadeleine.api.repository.PaymentRepository;
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

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Optional<Payment> getPaymentById(UUID id) {
        return paymentRepository.findById(id);
    }

    @Transactional
    public Payment addPayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment updatePayment(Long id, Payment paymentDetails) {
        Payment payment = paymentRepository.findById(id).orElseThrow();
        payment.setHelloAssoPaymentId(paymentDetails.getHelloAssoPaymentId());
        payment.setUser(paymentDetails.getUser());
        payment.setAmount(paymentDetails.getAmount());
        payment.setCurrency(paymentDetails.getCurrency());
        payment.setPaymentDate(paymentDetails.getPaymentDate());
        payment.setStatus(paymentDetails.getStatus());
        payment.setFormSlug(paymentDetails.getFormSlug());
        payment.setType(paymentDetails.getType());
        payment.setReceiptUrl(paymentDetails.getReceiptUrl());
        return paymentRepository.save(payment);
    }

    @Transactional
    public void deletePayment(Long id) {
        paymentRepository.deleteById(id);
    }
}
