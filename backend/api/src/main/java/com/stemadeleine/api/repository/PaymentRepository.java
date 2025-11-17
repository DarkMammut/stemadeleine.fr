package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.Payment;
import com.stemadeleine.api.model.PaymentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID>, JpaSpecificationExecutor<Payment> {

    @Query("select coalesce(sum(p.amount), 0) from Payment p where (:type is null or p.type = :type)")
    Double sumAmountByType(@Param("type") PaymentType type);

    @Query("select count(distinct p.user.id) from Payment p where p.type = :type and p.user is not null")
    Long countDistinctUsersByType(@Param("type") PaymentType type);

    @Query("select p from Payment p where p.type = :type and YEAR(p.paymentDate) = :year")
    List<Payment> findByTypeAndYear(@Param("type") PaymentType type, @Param("year") Integer year);

    @Query("select MONTH(p.paymentDate) as m, coalesce(sum(p.amount),0) as s from Payment p where p.type = :type and YEAR(p.paymentDate) = :year group by MONTH(p.paymentDate) order by MONTH(p.paymentDate)")
    List<Object[]> sumMonthlyByTypeAndYear(@Param("type") PaymentType type, @Param("year") Integer year);
}
