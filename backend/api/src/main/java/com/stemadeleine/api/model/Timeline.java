package com.stemadeleine.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "timelines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Timeline extends Module {

    @Column(nullable = false, columnDefinition = "varchar(255) default 'TABS'")
    private TimelineVariants variant = TimelineVariants.TABS;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "timeline_id", referencedColumnName = "id")
    private List<Content> contents;
}
