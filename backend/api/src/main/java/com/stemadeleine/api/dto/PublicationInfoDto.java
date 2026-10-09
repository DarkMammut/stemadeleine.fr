package com.stemadeleine.api.dto;

import java.time.OffsetDateTime;

/**
 * Versions of the DRAFT and PUBLISHED rows of a page, section or module.
 * The published fields are null when the item has never been published.
 * hasUnpublishedChanges also takes into account the whole subtree (child pages, sections, modules, contents).
 */
public record PublicationInfoDto(
        Integer draftVersion,
        OffsetDateTime draftUpdatedAt,
        Integer publishedVersion,
        OffsetDateTime publishedUpdatedAt,
        boolean hasUnpublishedChanges
) {
}
