package com.stemadeleine.api.model;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "list_content_media")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListContentMedia {

    @EmbeddedId
    private ListContentMediaId id;

    @ManyToOne
    @MapsId("listContentId")
    @JoinColumn(name = "list_content_id", foreignKey = @ForeignKey(name = "list_content_media_list_content_id_fkey"))
    private ListContent listContent;

    @ManyToOne
    @MapsId("mediaId")
    @JoinColumn(name = "media_id", foreignKey = @ForeignKey(name = "list_content_media_media_id_fkey"))
    private Media media;

    @Column(name = "sort_order")
    private Short sortOrder;

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ListContentMediaId implements Serializable {
        private UUID listContentId;
        private UUID mediaId;
    }
}
