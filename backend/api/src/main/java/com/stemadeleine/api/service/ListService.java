package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.UpdateListDetailsRequest;
import com.stemadeleine.api.dto.UpdateListRequest;
import com.stemadeleine.api.model.List;
import com.stemadeleine.api.model.ListVariants;
import com.stemadeleine.api.model.PublishingStatus;
import com.stemadeleine.api.model.Section;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.ListRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ListService {
    private final ListRepository listRepository;
    private final ModuleService moduleService;

    public java.util.List<List> getAllLists() {
        return listRepository.findByStatus(PublishingStatus.DRAFT);
    }

    public Optional<List> getListById(UUID id) {
        return listRepository.findById(id)
                .filter(l -> l.getStatus() == PublishingStatus.DRAFT || l.getStatus() == PublishingStatus.PUBLISHED);
    }

    @Transactional
    public List createListWithModule(CreateModuleRequest request, User author) {
        Section section = moduleService.getDraftSection(request.sectionId());

        List list = List.builder()
                .moduleId(UUID.randomUUID())
                .variant(ListVariants.CARD)
                .contents(new ArrayList<>())
                .section(section)
                .name(request.name())
                .title(request.name())
                .type("LIST")
                .sortOrder(0)
                .isVisible(false)
                .status(PublishingStatus.DRAFT)
                .author(author)
                .version(1)
                .build();

        return listRepository.save(list);
    }

    @Transactional
    public List updateList(UUID id, UpdateListDetailsRequest request) {
        List list = moduleService.findDraftByRowId(listRepository, id)
                .orElseThrow(() -> new RuntimeException("List not found"));

        if (request.getName() != null) list.setName(request.getName());
        if (request.getTitle() != null) list.setTitle(request.getTitle());
        if (request.getVariant() != null) list.setVariant(request.getVariant());
        if (request.getSortOrder() != null) list.setSortOrder(request.getSortOrder());

        return moduleService.saveDraft(list);
    }

    /**
     * Updates the DRAFT of the list in place (no new row).
     */
    @Transactional
    public List createListVersion(UpdateListRequest request, User author) {
        List list = getLastVersionByModuleId(request.moduleId())
                .orElseThrow(() -> new RuntimeException("Draft list not found for moduleId: " + request.moduleId()));

        if (request.name() != null) list.setName(request.name());
        if (request.title() != null) list.setTitle(request.title());
        if (request.variant() != null) list.setVariant(request.variant());
        list.setAuthor(author);

        return moduleService.saveDraft(list);
    }

    /**
     * DRAFT of a list (backoffice).
     */
    public Optional<List> getLastVersionByModuleId(UUID moduleId) {
        return listRepository.findByModuleIdAndStatus(moduleId, PublishingStatus.DRAFT);
    }

    /**
     * PUBLISHED version of a list (public site).
     */
    public Optional<List> getPublishedByModuleId(UUID moduleId) {
        return listRepository.findByModuleIdAndStatus(moduleId, PublishingStatus.PUBLISHED);
    }

    @Transactional
    public boolean softDeleteList(UUID id) {
        if (!listRepository.existsById(id)) {
            return false;
        }
        moduleService.softDeleteModuleByRowId(id);
        return true;
    }
}
