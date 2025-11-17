package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Payment;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.stream.Collectors;

public class PaymentSpecifications {

    public static Specification<Payment> hasStatuses(List<String> statuses) {
        return (root, query, cb) -> {
            if (statuses == null || statuses.isEmpty()) return cb.conjunction();
            List<String> upper = statuses.stream().map(String::toUpperCase).collect(Collectors.toList());
            return root.get("status").in(upper);
        };
    }

    public static Specification<Payment> hasTypes(List<String> types) {
        return (root, query, cb) -> {
            if (types == null || types.isEmpty()) return cb.conjunction();
            List<String> upper = types.stream().map(String::toUpperCase).collect(Collectors.toList());
            return root.get("type").in(upper);
        };
    }

    public static Specification<Payment> hasSearch(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String like = "%" + search.toLowerCase() + "%";
            // join to user optionally
            Join<?, ?> userJoin = null;
            try {
                userJoin = root.join("user", JoinType.LEFT);
            } catch (Exception e) {
                // ignore if join fails; proceed with available fields
            }
            // build predicates for formSlug, receiptUrl and user fields if present
            var pForm = cb.like(cb.lower(cb.coalesce(root.get("formSlug"), cb.literal(""))), like);
            var pReceipt = cb.like(cb.lower(cb.coalesce(root.get("receiptUrl"), cb.literal(""))), like);
            if (userJoin != null) {
                var pUserEmail = cb.like(cb.lower(cb.coalesce(userJoin.get("email"), cb.literal(""))), like);
                var pUserFirst = cb.like(cb.lower(cb.coalesce(userJoin.get("firstname"), cb.literal(""))), like);
                var pUserLast = cb.like(cb.lower(cb.coalesce(userJoin.get("lastname"), cb.literal(""))), like);
                return cb.or(pForm, pReceipt, pUserEmail, pUserFirst, pUserLast);
            }
            return cb.or(pForm, pReceipt);
        };
    }

}
