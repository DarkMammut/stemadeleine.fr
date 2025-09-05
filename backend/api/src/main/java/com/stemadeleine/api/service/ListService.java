package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateListRequest;
import com.stemadeleine.api.dto.UpdateListRequest;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.ContentRepository;
import com.stemadeleine.api.repository.ListRepository;
import com.stemadeleine.api.repository.SectionRepository;
import com.stemadeleine.api.utils.JsonUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ListService {
    private final ListRepository listRepository;
    private final SectionRepository sectionRepository;
    private final ModuleService moduleService;
    private final ContentRepository contentRepository;

    public java.util.List<List> getAllLists() {
        log.info("Récupération de toutes les listes non supprimées");
        java.util.List<List> lists = listRepository.findByStatusNot(PublishingStatus.DELETED);
        log.debug("Nombre de listes trouvées : {}", lists.size());
        return lists;
    }

    public Optional<List> getListById(UUID id) {
        log.info("Recherche de la liste avec l'ID : {}", id);
        Optional<List> list = listRepository.findById(id)
                .filter(l -> l.getStatus() != PublishingStatus.DELETED);
        log.debug("Liste trouvée : {}", list.isPresent());
        return list;
    }

    public List createList(CreateListRequest request, User author) {
        log.info("Création d'une nouvelle liste pour la section : {}", request.sectionId());

        Module module = moduleService.createNewModule(
                request.sectionId(),
                request.name(),
                "LIST",
                author
        );
        log.debug("Module créé avec l'ID : {}", module.getId());

        Content content = Content.builder()
                .ownerId(module.getId())
                .version(1)
                .status(PublishingStatus.DRAFT)
                .isVisible(false)
                .title(request.name())
                .body(JsonUtils.createEmptyJsonNode())
                .build();
        Content savedContent = contentRepository.save(content);
        log.debug("Contenu créé avec l'ID : {}", savedContent.getId());

        List list = List.builder()
                .variant(ListVariants.CARD)
                .contents(java.util.List.of(savedContent))
                .moduleId(module.getModuleId())
                .section(module.getSection())
                .name(module.getName())
                .title(module.getTitle())
                .type(module.getType())
                .sortOrder(module.getSortOrder())
                .isVisible(module.getIsVisible())
                .status(module.getStatus())
                .author(author)
                .version(1)
                .build();

        List savedList = listRepository.save(list);
        log.info("Liste créée avec succès, ID : {}", savedList.getId());
        return savedList;
    }

    @Transactional
    public Optional<List> updateList(UUID id, UpdateListRequest request) {
        log.info("Mise à jour de la liste avec l'ID : {}", id);
        return listRepository.findById(id).map(list -> {
            if (request.getName() != null) {
                list.setName(request.getName());
                list.setTitle(request.getName());
            }
            if (request.getSectionId() != null) {
                Section section = sectionRepository.findById(request.getSectionId())
                        .orElseThrow(() -> new IllegalArgumentException("Section not found"));
                list.setSection(section);
            }
            log.debug("Liste mise à jour : {}", list);
            return listRepository.save(list);
        });
    }

    @Transactional
    public List updateListDetails(UUID id, List details) {
        log.info("Mise à jour des détails de la liste avec l'ID : {}", id);
        return listRepository.findById(id)
                .map(list -> {
                    list.setName(details.getName());
                    list.setTitle(details.getTitle());
                    list.setVariant(details.getVariant());
                    list.setContents(details.getContents());
                    list.setSortOrder(details.getSortOrder());
                    list.setIsVisible(details.getIsVisible());
                    log.debug("Détails de la liste mis à jour : {}", list);
                    return listRepository.save(list);
                })
                .orElseThrow(() -> {
                    log.error("Liste non trouvée avec l'ID : {}", id);
                    return new RuntimeException("List not found");
                });
    }

    @Transactional
    public boolean softDeleteList(UUID id) {
        log.info("Suppression logique de la liste avec l'ID : {}", id);
        return listRepository.findById(id).map(list -> {
            list.setStatus(PublishingStatus.DELETED);
            listRepository.save(list);
            log.debug("Liste marquée comme supprimée : {}", id);
            return true;
        }).orElse(false);
    }
}
