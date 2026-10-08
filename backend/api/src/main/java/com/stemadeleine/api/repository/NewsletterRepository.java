package com.stemadeleine.api.repository;

import com.stemadeleine.api.model.NewsVariants;
import com.stemadeleine.api.model.Newsletter;
import com.stemadeleine.api.model.PublishingStatus;

public interface NewsletterRepository extends ModuleSubtypeRepository<Newsletter> {

    boolean existsByVariantAndStatus(NewsVariants variant, PublishingStatus status);
}
