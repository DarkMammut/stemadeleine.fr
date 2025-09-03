package com.stemadeleine.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "field")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Field {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String label;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FieldInputType inputType;

    @Column(nullable = false)
    private Boolean required = false;

    @Column
    private String placeholder;

    @Column
    private String defaultValue;

    @Column(length = 1000)
    private String options;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(length = 1000)
    private String helpText;

    @Column(nullable = false)
    private Boolean isVisible = true;
}

