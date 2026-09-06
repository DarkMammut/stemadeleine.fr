package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.UpdateListDetailsRequest;
import com.stemadeleine.api.dto.UpdateListRequest;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.ListRepository;
import com.stemadeleine.api.repository.SectionRepository;
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

    public List createListWithModule(CreateModuleRequest request, User author) {
        log.info("Création d'une nouvelle liste pour la section : {}", request.sectionId());

        // Récupérer la section à partir de l'UUID
        Section section = sectionRepository.findTopBySectionIdOrderByVersionDesc(request.sectionId())
                .orElseThrow(() -> new RuntimeException("Section not found for id: " + request.sectionId()));

        // Créer directement la timeline (hérite de Module)
        List list = List.builder()
                .moduleId(UUID.randomUUID())
                .variant(ListVariants.CARD)
                .contents(new java.util.ArrayList<>())
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

        List savedList = listRepository.save(list);
        log.info("Liste créée avec succès, ID : {}", savedList.getId());
        return savedList;
    }

    public List updateList(UUID id, UpdateListDetailsRequest request) {
        log.info("Mise à jour des détails de la liste avec l'ID : {}", id);
        return listRepository.findById(id)
                .map(list -> {
                    if (request.getName() != null) {
                        list.setName(request.getName());
                    }
                    if (request.getTitle() != null) {
                        list.setTitle(request.getTitle());
                    }
                    if (request.getVariant() != null) {
                        list.setVariant(request.getVariant());
                    }
                    if (request.getSortOrder() != null) {
                        list.setSortOrder(request.getSortOrder());
                    }
                    log.debug("Détails de la liste mis à jour : {}", list);
                    return listRepository.save(list);
                })
                .orElseThrow(() -> {
                    log.error("Liste non trouvée avec l'ID : {}", id);
                    return new RuntimeException("List not found");
                });
    }

    public List createListVersion(UpdateListRequest request, User author) {
        log.info("Création d'une nouvelle version d'article pour le moduleId : {}", request.moduleId());

        // 1. Récupérer le module
        Module module = moduleService.getModuleByModuleId(request.moduleId())
                .orElseThrow(() -> new RuntimeException("Module not found for id: " + request.moduleId()));

        // 2. Récupérer la dernière version de l'article pour ce module
        List previousList = listRepository.findTopByModuleIdOrderByVersionDesc(request.moduleId())
                .orElse(null);

        // 3. Fusionner les infos du request et de la version précédente
        String name = request.name() != null ? request.name() : (previousList != null ? previousList.getName() : module.getName());
        String title = request.title() != null ? request.title() : (previousList != null ? previousList.getTitle() : module.getTitle());
        ListVariants variant = request.variant() != null ? request.variant() : (previousList != null ? previousList.getVariant() : ListVariants.CARD);
        java.util.List<ListContent> contents = previousList != null ? new java.util.ArrayList<>(previousList.getContents()) : new java.util.ArrayList<>();
        String type = module.getType();
        Integer sortOrder = module.getSortOrder();
        Boolean isVisible = module.getIsVisible();
        PublishingStatus status = PublishingStatus.DRAFT;
        int newVersion = previousList != null ? previousList.getVersion() + 1 : 1;

        List list = List.builder()
                .variant(variant)
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

        contents.forEach(c -> c.setList(list));
        list.setContents(contents);

        List savedList = listRepository.save(list);
        log.info("Nouvelle version de liste créée avec succès, ID : {}", savedList.getId());
        return savedList;
    }

    public Optional<List> getLastVersionByModuleId(UUID moduleId) {
        log.info("Recherche de la dernière version de la liste pour le moduleId : {}", moduleId);
        Optional<List> list = listRepository.findTopByModuleIdOrderByVersionDesc(moduleId)
                .filter(l -> l.getStatus() != PublishingStatus.DELETED);
        log.debug("Liste trouvée : {}", list.isPresent());
        return list;
    }

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
