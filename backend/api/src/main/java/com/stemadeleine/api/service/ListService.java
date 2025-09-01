package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateListRequest;
import com.stemadeleine.api.dto.UpdateListRequest;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.repository.ContentRepository;
import com.stemadeleine.api.repository.ListRepository;
import com.stemadeleine.api.repository.SectionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ListService {

    private final ListRepository listRepository;
    private final SectionRepository sectionRepository;
    private final ModuleService moduleService;
    private final ContentRepository contentRepository;

    public List createList(CreateListRequest request, User author) {

        Module module = moduleService.createNewModule(
                request.sectionId(),
                request.name(),
                "LIST",
                author
        );

        Content content = Content.builder()
                .ownerId(module.getId())
                .version(1)
                .status(PublishingStatus.DRAFT)
                .isVisible(false)
                .title(request.name())
                .body("")
                .build();
        contentRepository.save(content);

        List list = List.builder()
                .variant(ListVariants.CARD)
                .contents(java.util.List.of(content))
                .build();
        return listRepository.save(list);
    }

    @Transactional
    public Optional<List> updateList(UUID id, UpdateListRequest request) {
        return listRepository.findById(id).map(list -> {
            if (request.getName() != null) list.setName(request.getName());
            if (request.getSectionId() != null) {
                Section section = sectionRepository.findById(request.getSectionId())
                        .orElseThrow(() -> new IllegalArgumentException("Section not found"));
                list.setSection(section);
            }
            return listRepository.save(list);
        });
    }

    @Transactional
    public boolean softDeleteList(UUID id) {
        return listRepository.findById(id).map(list -> {
            list.setStatus(PublishingStatus.DELETED);
            listRepository.save(list);
            return true;
        }).orElse(false);
    }
}

