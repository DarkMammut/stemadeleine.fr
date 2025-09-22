package com.stemadeleine.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Table(name = "timelines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Timeline extends Module {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TimelineVariants variant = TimelineVariants.TABS;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "timeline_id", referencedColumnName = "id")
    private List<Content> contents;
}
