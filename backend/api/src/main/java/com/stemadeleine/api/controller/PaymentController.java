package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.PaymentCreateDto;
import com.stemadeleine.api.dto.PaymentUpdateDto;
import com.stemadeleine.api.dto.PaymentUserDto;
import com.stemadeleine.api.model.Payment;
import com.stemadeleine.api.model.PaymentStatus;
import com.stemadeleine.api.model.PaymentType;
import com.stemadeleine.api.service.HelloAssoImportService;
import com.stemadeleine.api.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;
    private final HelloAssoImportService helloAssoImportService;

    @GetMapping
    public Page<Payment> getAllPayments(Pageable pageable,
                                        @RequestParam(value = "status", required = false) List<String> statuses,
                                        @RequestParam(value = "type", required = false) List<String> types,
                                        @RequestParam(value = "sortField", required = false) String sortField,
                                        @RequestParam(value = "sortDir", required = false) String sortDir,
                                        @RequestParam(value = "search", required = false) String search) {
        // apply sortField and sortDir if provided by building a new Pageable
        org.springframework.data.domain.Pageable appliedPageable = pageable;
        if (sortField != null && !sortField.isBlank()) {
            // whitelist allowed sort fields to avoid accidental injection or invalid properties
            java.util.Set<String> allowedFields = java.util.Set.of("paymentDate", "amount", "id");
            if (allowedFields.contains(sortField)) {
                org.springframework.data.domain.Sort.Direction direction = org.springframework.data.domain.Sort.Direction.ASC;
                if ("desc".equalsIgnoreCase(sortDir)) direction = org.springframework.data.domain.Sort.Direction.DESC;
                appliedPageable = org.springframework.data.domain.PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), org.springframework.data.domain.Sort.by(direction, sortField));
            }
        }

        // delegate to service which accepts lists (can be null) and optional search
        return paymentService.getAllPayments(appliedPageable, statuses, types, search);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable UUID id) {
        return paymentService.getPaymentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Payment> addPayment(@RequestBody PaymentCreateDto paymentDto) {
        try {
            Payment saved = paymentService.createPayment(paymentDto);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Payment> updatePayment(@PathVariable UUID id, @RequestBody PaymentUpdateDto paymentDetails) {
        try {
            Payment updated = paymentService.updatePayment(id, paymentDetails);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(404).build();
        }
    }

    @PutMapping("/{id}/user")
    public ResponseEntity<Payment> updatePaymentUser(@PathVariable UUID id, @RequestBody PaymentUserDto payload) {
        try {
            Payment updated = paymentService.updatePaymentUser(id, payload.getUserId());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(404).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable UUID id) {
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

    @GetMapping("/total/{formSlug}")
    public ResponseEntity<Double> getTotalAmountByFormSlug(@PathVariable String formSlug) {
        double total = paymentService.getTotalAmountByFormSlug(formSlug);
        return ResponseEntity.ok(total);
    }

    @GetMapping("/enums")
    public Map<String, Object> getPaymentEnums() {
        Map<String, Object> enums = new HashMap<>();
        enums.put("status", Arrays.stream(PaymentStatus.values()).map(Enum::name).toList());
        enums.put("type", Arrays.stream(PaymentType.values()).map(Enum::name).toList());
        return enums;
    }
}
