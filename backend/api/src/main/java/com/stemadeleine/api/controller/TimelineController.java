package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.TimelineDto;
import com.stemadeleine.api.dto.UpdateTimelineRequest;
import com.stemadeleine.api.mapper.TimelineMapper;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.Timeline;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.TimelineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/timelines")
@RequiredArgsConstructor
public class TimelineController {

    private final TimelineService timelineService;
    private final TimelineMapper timelineMapper;

    @GetMapping
    public List<TimelineDto> getAllTimelines() {
        log.info("GET /api/timelines - Retrieving all timelines");
        List<Timeline> timelines = timelineService.getAllTimelines();
        log.debug("Number of timelines found: {}", timelines.size());
        return timelines.stream()
                .map(timelineMapper::toDto)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TimelineDto> getTimelineById(@PathVariable UUID id) {
        log.info("GET /api/timelines/{} - Retrieving timeline by ID", id);
        return timelineService.getTimelineById(id)
                .map(timeline -> {
                    log.debug("Timeline found: {}", timeline.getId());
                    return ResponseEntity.ok(timelineMapper.toDto(timeline));
                })
                .orElseGet(() -> {
                    log.warn("Timeline not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping
    public ResponseEntity<TimelineDto> createTimelineWithModule(@RequestBody CreateModuleRequest request, @AuthenticationPrincipal CustomUserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        User currentUser = currentUserDetails.account().getUser();
        log.info("POST /api/timelines - Création d'une nouvelle timeline pour la section : {}", request.sectionId());
        Timeline timeline = timelineService.createTimelineWithModule(request, currentUser);
        log.debug("Timeline créé avec l'ID : {}", timeline.getId());
        return ResponseEntity.ok(timelineMapper.toDto(timeline));
    }

    @PostMapping("/version")
    public ResponseEntity<TimelineDto> createNewVersionForModule(
            @RequestBody UpdateTimelineRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        User currentUser = currentUserDetails.account().getUser();
        log.info("POST /api/timelines/version - Création d'une nouvelle version pour le module : {}", request.moduleId());
        Timeline timeline = timelineService.createTimelineVersion(request, currentUser);
        log.debug("Nouvelle version créée avec l'ID : {}", timeline.getId());
        return ResponseEntity.ok(timelineMapper.toDto(timeline));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TimelineDto> updateTimeline(@PathVariable UUID id, @RequestBody Timeline timelineDetails) {
        log.info("PUT /api/timelines/{} - Mise à jour d'un timeline", id);
        try {
            Timeline updated = timelineService.updateTimeline(id, timelineDetails);
            log.debug("Timeline mis à jour : {}", updated.getId());
            return ResponseEntity.ok(timelineMapper.toDto(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTimeline(@PathVariable UUID id) {
        log.info("DELETE /api/timelines/{} - Suppression d'un timeline", id);
        timelineService.softDeleteTimeline(id);
        log.debug("Timeline supprimé : {}", id);
        return ResponseEntity.noContent().build();
    }
}
