package com.stemadeleine.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Table(name = "form")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Form extends Module {
    @Column(length = 1000)
    private String description;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "media_id", referencedColumnName = "id")
    private Media media;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "form_id", referencedColumnName = "id")
    private List<Field> fields;
}
