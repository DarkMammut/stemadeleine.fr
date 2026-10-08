package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.UpdateTimelineRequest;
import com.stemadeleine.api.model.PublishingStatus;
import com.stemadeleine.api.model.Section;
import com.stemadeleine.api.model.Timeline;
import com.stemadeleine.api.model.TimelineVariants;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.TimelineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TimelineService {

    private final TimelineRepository timelineRepository;
    private final ModuleService moduleService;

    public List<Timeline> getAllTimelines() {
        return timelineRepository.findByStatus(PublishingStatus.DRAFT);
    }

    public Optional<Timeline> getTimelineById(UUID id) {
        return timelineRepository.findById(id)
                .filter(t -> t.getStatus() == PublishingStatus.DRAFT || t.getStatus() == PublishingStatus.PUBLISHED);
    }

    @Transactional
    public Timeline updateTimeline(UUID id, Timeline timelineDetails) {
        Timeline timeline = moduleService.findDraftByRowId(timelineRepository, id)
                .orElseThrow(() -> new RuntimeException("Timeline not found"));

        timeline.setTitle(timelineDetails.getTitle());
        timeline.setSortOrder(timelineDetails.getSortOrder());
        timeline.setIsVisible(timelineDetails.getIsVisible());
        timeline.setVariant(timelineDetails.getVariant());
        if (timelineDetails.getContents() != null) {
            timeline.setContents(timelineDetails.getContents());
        }

        return moduleService.saveDraft(timeline);
    }

    @Transactional
    public void softDeleteTimeline(UUID id) {
        moduleService.softDeleteModuleByRowId(id);
    }

    @Transactional
    public Timeline createTimelineWithModule(CreateModuleRequest request, User author) {
        Section section = moduleService.getDraftSection(request.sectionId());

        Timeline timeline = Timeline.builder()
                .moduleId(UUID.randomUUID())
                .variant(TimelineVariants.TABS)
                .contents(new ArrayList<>())
                .section(section)
                .name(request.name())
                .title(request.name())
                .type("TIMELINE")
                .sortOrder(0)
                .isVisible(false)
                .status(PublishingStatus.DRAFT)
                .author(author)
                .version(1)
                .build();

        return timelineRepository.save(timeline);
    }

    /**
     * Updates the DRAFT of the timeline in place (no new row).
     */
    @Transactional
    public Timeline createTimelineVersion(UpdateTimelineRequest request, User author) {
        Timeline timeline = timelineRepository.findByModuleIdAndStatus(request.moduleId(), PublishingStatus.DRAFT)
                .orElseThrow(() -> new RuntimeException("Draft timeline not found for moduleId: " + request.moduleId()));

        if (request.name() != null) timeline.setName(request.name());
        if (request.title() != null) timeline.setTitle(request.title());
        if (request.variant() != null) timeline.setVariant(request.variant());
        timeline.setAuthor(author);

        return moduleService.saveDraft(timeline);
    }
}
