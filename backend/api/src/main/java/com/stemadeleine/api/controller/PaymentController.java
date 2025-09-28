package com.stemadeleine.api.controller;

import com.stemadeleine.api.model.Payment;
import com.stemadeleine.api.service.HelloAssoImportService;
import com.stemadeleine.api.service.PaymentService;
import com.stemadeleine.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;
    private final HelloAssoImportService helloAssoImportService;
    private final UserService userService;

    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentService.getAllPayments();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable UUID id) {
        return paymentService.getPaymentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Payment> addPayment(@RequestBody Payment payment) {
        payment.setUser(null);
        Payment saved = paymentService.addPayment(payment);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Payment> updatePayment(@PathVariable Long id, @RequestBody Payment paymentDetails) {
        try {
            Payment updated = paymentService.updatePayment(id, paymentDetails);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/import")
    public ResponseEntity<String> importPayments(@RequestParam(value = "orgSlug", required = false) String orgSlug) {
        String slug = (orgSlug != null && !orgSlug.isBlank()) ? orgSlug : "les-amis-de-sainte-madeleine-de-la-jarrie";
        try {
            helloAssoImportService.importPayments(slug);
            return ResponseEntity.ok("Import des paiements terminé avec succès.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur lors de l'import des paiements : " + e.getMessage());
        }
    }
}
