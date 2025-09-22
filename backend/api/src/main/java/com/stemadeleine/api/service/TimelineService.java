package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.UpdateTimelineRequest;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.SectionRepository;
import com.stemadeleine.api.repository.TimelineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TimelineService {

    private final TimelineRepository timelineRepository;
    private final ModuleService moduleService;
    private final SectionRepository sectionRepository;

    public List<Timeline> getAllTimelines() {
        log.info("Récupération de toutes les timelines non supprimées");
        List<Timeline> timelines = timelineRepository.findByStatusNot(PublishingStatus.DELETED);
        log.debug("Nombre de timelines trouvées : {}", timelines.size());
        return timelines;
    }

    public Optional<Timeline> getTimelineById(UUID id) {
        log.info("Recherche de la timeline avec l'ID : {}", id);
        Optional<Timeline> timeline = timelineRepository.findById(id)
                .filter(t -> t.getStatus() != PublishingStatus.DELETED);
        log.debug("Timeline trouvée : {}", timeline.isPresent());
        return timeline;
    }

    public Timeline updateTimeline(UUID id, Timeline timelineDetails) {
        log.info("Mise à jour de la timeline avec l'ID : {}", id);
        return timelineRepository.findById(id)
                .map(timeline -> {
                    timeline.setTitle(timelineDetails.getTitle());
                    timeline.setSortOrder(timelineDetails.getSortOrder());
                    timeline.setIsVisible(timelineDetails.getIsVisible());
                    timeline.setVariant(timelineDetails.getVariant());
                    if (timelineDetails.getContents() != null) {
                        timeline.setContents(timelineDetails.getContents());
                    }
                    log.debug("Timeline mis à jour : {}", timeline);
                    return timelineRepository.save(timeline);
                })
                .orElseThrow(() -> {
                    log.error("Timeline non trouvé avec l'ID : {}", id);
                    return new RuntimeException("Timeline not found");
                });
    }

    public void softDeleteTimeline(UUID id) {
        log.info("Suppression logique de la timeline avec l'ID : {}", id);
        timelineRepository.findById(id).ifPresent(timeline -> {
            timeline.setStatus(PublishingStatus.DELETED);
            timelineRepository.save(timeline);
            log.debug("Timeline marquée comme supprimée : {}", id);
        });
    }

    public Timeline createTimelineWithModule(CreateModuleRequest request, User author) {
        log.info("Création d'une nouvelle timeline pour la section : {}", request.sectionId());

        // Récupérer la section à partir de l'UUID
        Section section = sectionRepository.findTopBySectionIdOrderByVersionDesc(request.sectionId())
                .orElseThrow(() -> new RuntimeException("Section not found for id: " + request.sectionId()));

        // Créer directement la timeline (hérite de Module)
        Timeline timeline = Timeline.builder()
                .moduleId(UUID.randomUUID())
                .variant(TimelineVariants.TABS)
                .contents(new java.util.ArrayList<>())
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

        Timeline savedTimeline = timelineRepository.save(timeline);
        log.debug("Timeline créée avec l'ID : {}", savedTimeline.getId());

        // Mettre à jour la timeline avec le contenu créé (liste modifiable)
        savedTimeline.setContents(new java.util.ArrayList<>(List.of()));
        Timeline finalTimeline = timelineRepository.save(savedTimeline);
        log.info("Timeline créée avec succès, ID : {}", finalTimeline.getId());
        return finalTimeline;
    }

    public Timeline createTimelineVersion(UpdateTimelineRequest request, User author) {
        log.info("Création d'une nouvelle version d'timeline pour le moduleId : {}", request.moduleId());

        // 1. Récupérer le module
        Module module = moduleService.getModuleByModuleId(request.moduleId())
                .orElseThrow(() -> new RuntimeException("Module not found for id: " + request.moduleId()));

        // 2. Récupérer la dernière version de l'timeline pour ce module
        Timeline previousTimeline = timelineRepository.findTopByModuleIdOrderByVersionDesc(request.moduleId())
                .orElse(null);

        // 3. Fusionner les infos du request et de la version précédente
        String name = request.name() != null ? request.name() : (previousTimeline != null ? previousTimeline.getName() : module.getName());
        String title = request.title() != null ? request.title() : (previousTimeline != null ? previousTimeline.getTitle() : module.getTitle());
        TimelineVariants variant = request.variant() != null ? request.variant() : (previousTimeline != null ? previousTimeline.getVariant() : TimelineVariants.TABS);
        List<Content> contents = previousTimeline != null ? new java.util.ArrayList<>(previousTimeline.getContents()) : new java.util.ArrayList<>();
        String type = module.getType();
        Integer sortOrder = module.getSortOrder();
        Boolean isVisible = module.getIsVisible();
        PublishingStatus status = PublishingStatus.DRAFT;
        int newVersion = previousTimeline != null ? previousTimeline.getVersion() + 1 : 1;

        Timeline timeline = Timeline.builder()
                .variant(variant)
                .contents(contents)
                .moduleId(module.getModuleId())
                .section(module.getSection())
                .name(name)
                .title(title)
                .type(type)
                .sortOrder(sortOrder)
                .isVisible(isVisible)
                .status(status)
                .author(author)
                .version(newVersion)
                .build();

        Timeline savedTimeline = timelineRepository.save(timeline);
        log.info("Nouvelle version d'timeline créée avec succès, ID : {}", savedTimeline.getId());
        return savedTimeline;
    }
}
