package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.UpdateFormRequest;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.FieldRepository;
import com.stemadeleine.api.repository.FormRepository;
import com.stemadeleine.api.repository.SectionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FormService {
    private final FormRepository formRepository;
    private final ModuleService moduleService;
    private final FieldRepository fieldRepository;
    private final SectionRepository sectionRepository;

    public List<Form> getAllForms() {
        log.info("Récupération de tous les formulaires non supprimés");
        List<Form> forms = formRepository.findByStatusNot(PublishingStatus.DELETED);
        log.debug("Nombre de formulaires trouvés : {}", forms.size());
        return forms;
    }

    public Optional<Form> getFormById(UUID id) {
        log.info("Recherche du formulaire avec l'ID : {}", id);
        Optional<Form> form = formRepository.findById(id)
                .filter(f -> f.getStatus() != PublishingStatus.DELETED);
        log.debug("Formulaire trouvé : {}", form.isPresent());
        return form;
    }

    public Form createFormWithModule(CreateModuleRequest request, User author) {
        log.info("Création d'un nouveau formulaire pour la section : {}", request.sectionId());

        // Récupérer la section à partir de l'UUID
        Section section = sectionRepository.findTopBySectionIdOrderByVersionDesc(request.sectionId())
                .orElseThrow(() -> new RuntimeException("Section not found for id: " + request.sectionId()));

        // Créer directement le form (hérite de Module)
        Form form = Form.builder()
                .moduleId(UUID.randomUUID())
                .section(section)
                .name(request.name())
                .title(request.name())
                .type("FORM")
                .sortOrder(0)
                .isVisible(false)
                .status(PublishingStatus.DRAFT)
                .author(author)
                .version(1)
                .description("New Form")
                .fields(new java.util.ArrayList<>())
                .build();

        Form savedForm = formRepository.save(form);
        log.info("Formulaire créé avec succès, ID : {}", savedForm.getId());
        return savedForm;
    }

    @Transactional
    public Form updateForm(UUID id, Form details) {
        log.info("Mise à jour du formulaire avec l'ID : {}", id);
        return formRepository.findById(id)
                .map(form -> {
                    form.setTitle(details.getTitle());
                    form.setDescription(details.getDescription());
                    form.setFields(details.getFields());
                    form.setIsVisible(details.getIsVisible());
                    form.setName(details.getName());
                    form.setSortOrder(details.getSortOrder());
                    form.setMedia(details.getMedia());
                    log.debug("Formulaire mis à jour : {}", form);
                    return formRepository.save(form);
                })
                .orElseThrow(() -> {
                    log.error("Formulaire non trouvé avec l'ID : {}", id);
                    return new RuntimeException("Form not found");
                });
    }

    public void softDeleteForm(UUID id) {
        log.info("Suppression logique du formulaire avec l'ID : {}", id);
        formRepository.findById(id).ifPresent(form -> {
            form.setStatus(PublishingStatus.DELETED);
            formRepository.save(form);
            log.debug("Formulaire marqué comme supprimé : {}", id);
        });
    }

    public List<Field> getFormFields(UUID formId) {
        log.info("Récupération des champs du formulaire avec l'ID : {}", formId);
        List<Field> fields = fieldRepository.findAllByOrderBySortOrderAsc();
        log.debug("Nombre de champs trouvés : {}", fields.size());
        return fields;
    }

    public List<Field> getVisibleFormFields(UUID formId) {
        log.info("Récupération des champs visibles du formulaire avec l'ID : {}", formId);
        List<Field> fields = fieldRepository.findByIsVisibleTrue();
        log.debug("Nombre de champs visibles trouvés : {}", fields.size());
        return fields;
    }

    public Form createFormVersion(UpdateFormRequest request, User author) {
        log.info("Création d'une nouvelle version de Form pour le moduleId : {}", request.moduleId());

        // 1. Récupérer le module (pour structure ou fallback)
        Module module = moduleService.getModuleByModuleId(request.moduleId())
                .orElseThrow(() -> new RuntimeException("Module not found for id: " + request.moduleId()));

        // 2. Récupérer la dernière version du Form pour ce module
        Form previousForm = formRepository.findTopByModuleIdOrderByVersionDesc(request.moduleId()).orElse(null);

        // 3. Fusionner les infos du request et de la version précédente
        String name = request.name() != null ? request.name() : (previousForm != null ? previousForm.getName() : module.getName());
        String title = request.title() != null ? request.title() : (previousForm != null ? previousForm.getTitle() : module.getTitle());
        String description = request.description() != null ? request.description() : (previousForm != null ? previousForm.getDescription() : "Nouvelle version de formulaire");
        Media media = previousForm != null ? previousForm.getMedia() : null;
        List<Field> fields = previousForm != null ? previousForm.getFields() : List.of();
        String type = module.getType();
        Integer sortOrder = module.getSortOrder();
        Boolean isVisible = module.getIsVisible();
        PublishingStatus status = PublishingStatus.DRAFT;
        int newVersion = previousForm != null ? previousForm.getVersion() + 1 : 1;

        Form form = Form.builder()
                .moduleId(module.getModuleId())
                .name(name)
                .title(title)
                .description(description)
                .media(media)
                .fields(fields)
                .author(author)
                .type(type)
                .sortOrder(sortOrder)
                .isVisible(isVisible)
                .status(status)
                .version(newVersion)
                .build();

        Form savedForm = formRepository.save(form);
        log.info("Nouvelle version de Form créée avec succès, ID : {}", savedForm.getId());
        return savedForm;
    }
}
