package com.stemadeleine.api.controller;

import com.stemadeleine.api.model.Membership;
import com.stemadeleine.api.model.Payment;
import com.stemadeleine.api.repository.MembershipRepository;
import com.stemadeleine.api.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {
    private final PaymentRepository paymentRepository;
    private final MembershipRepository membershipRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@RequestParam(value = "year", required = false) Integer year) {
        int currentYear = year != null ? year : LocalDate.now().getYear();

        // active members: use repository aggregate if available
        Long activeMembersLong = null;
        try {
            activeMembersLong = membershipRepository.countActiveForYear(currentYear);
        } catch (Exception e) {
            // fallback to in-memory computation
            List<Membership> memberships = membershipRepository.findAll();
            activeMembersLong = memberships.stream()
                    .filter(m -> Boolean.TRUE.equals(m.getActive()))
                    .filter(m -> {
                        if (m.getDateFin() != null) return m.getDateFin().getYear() == currentYear;
                        if (m.getDateAdhesion() != null) return m.getDateAdhesion().getYear() == currentYear;
                        return false;
                    }).count();
        }
        long activeMembers = activeMembersLong != null ? activeMembersLong : 0L;

        double membershipAmount;
        double donationsAmount;
        long donorsCount;
        try {
            Double mem = paymentRepository.sumAmountByType(com.stemadeleine.api.model.PaymentType.MEMBERSHIP);
            Double don = paymentRepository.sumAmountByType(com.stemadeleine.api.model.PaymentType.DONATION);
            Long dc = paymentRepository.countDistinctUsersByType(com.stemadeleine.api.model.PaymentType.DONATION);
            membershipAmount = mem == null ? 0.0 : mem;
            donationsAmount = don == null ? 0.0 : don;
            donorsCount = dc == null ? 0L : dc;
        } catch (Exception e) {
            // fallback: compute in-memory
            List<Payment> payments = paymentRepository.findAll();
            membershipAmount = payments.stream().filter(p -> p.getType() != null && p.getType().name().equalsIgnoreCase("MEMBERSHIP")).mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0.0).sum();
            donationsAmount = payments.stream().filter(p -> p.getType() != null && p.getType().name().equalsIgnoreCase("DONATION")).mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0.0).sum();
            donorsCount = payments.stream().filter(p -> p.getType() != null && p.getType().name().equalsIgnoreCase("DONATION") && p.getUser() != null).map(p -> p.getUser().getId()).distinct().count();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("activeMembers", activeMembers);
        response.put("membershipAmount", membershipAmount);
        response.put("donorsCount", donorsCount);
        response.put("donationsAmount", donationsAmount);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/donations")
    public ResponseEntity<Map<String, Object>> getDonationsByYear(@RequestParam(value = "year", required = false) Integer year) {
        int y = year != null ? year : LocalDate.now().getYear();
        // Build monthly totals using repository aggregation if available
        double[] monthly = new double[12];
        try {
            List<Object[]> rows = paymentRepository.sumMonthlyByTypeAndYear(com.stemadeleine.api.model.PaymentType.DONATION, y);
            for (Object[] row : rows) {
                if (row == null || row.length < 2) continue;
                int monthIdx = parseMonthFromRowValue(row[0]);
                double sumValue = parseDoubleFromRowValue(row[1]);
                int idx = monthIdx - 1; // month value should be 1..12
                if (idx >= 0 && idx < 12) monthly[idx] = sumValue;
            }
        } catch (Exception e) {
            log.error("Error while running sumMonthlyByTypeAndYear aggregation", e);
            // fallback to fetching donations and aggregate in memory
            List<Payment> donationsForYear = null;
            try {
                donationsForYear = paymentRepository.findByTypeAndYear(com.stemadeleine.api.model.PaymentType.DONATION, y);
            } catch (Exception ex) {
                log.warn("sumMonthlyByTypeAndYear failed and findByTypeAndYear also failed, falling back to findAll() and in-memory aggregation", ex);
                // if that fails too (DB doesn't support function('year')), fetch all and filter in memory
                List<Payment> all = paymentRepository.findAll();
                donationsForYear = new java.util.ArrayList<>();
                for (Payment p : all) {
                    if (p.getType() != null && p.getType() == com.stemadeleine.api.model.PaymentType.DONATION && p.getPaymentDate() != null && p.getPaymentDate().getYear() == y) {
                        donationsForYear.add(p);
                    }
                }
            }
            if (donationsForYear == null) {
                log.warn("donationsForYear is null after fallbacks, returning zeroed monthly array");
                donationsForYear = java.util.Collections.emptyList();
            }

            for (Payment p : donationsForYear) {
                if (p.getPaymentDate() == null) continue;
                LocalDate d = p.getPaymentDate();
                int m = d.getMonthValue() - 1;
                monthly[m] += p.getAmount() != null ? p.getAmount() : 0.0;
            }
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("year", y);
        resp.put("monthlyTotals", monthly);
        resp.put("total", Arrays.stream(monthly).sum());
        return ResponseEntity.ok(resp);
    }

    private int parseMonthFromRowValue(Object v) {
        if (v == null) return -1;
        if (v instanceof Number) return ((Number) v).intValue();
        if (v instanceof java.math.BigInteger) return ((java.math.BigInteger) v).intValue();
        if (v instanceof java.math.BigDecimal) return ((java.math.BigDecimal) v).intValue();
        try {
            return Integer.parseInt(v.toString());
        } catch (Exception ex) {
            log.warn("Could not parse month value from aggregation row: {}", v);
            return -1;
        }
    }

    private double parseDoubleFromRowValue(Object v) {
        if (v == null) return 0.0;
        if (v instanceof Number) return ((Number) v).doubleValue();
        if (v instanceof java.math.BigDecimal) return ((java.math.BigDecimal) v).doubleValue();
        try {
            return Double.parseDouble(v.toString());
        } catch (Exception ex) {
            log.warn("Could not parse sum value from aggregation row: {}", v);
            return 0.0;
        }
    }
}
