package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.UpdateFormRequest;
import com.stemadeleine.api.model.Field;
import com.stemadeleine.api.model.Form;
import com.stemadeleine.api.model.PublishingStatus;
import com.stemadeleine.api.model.Section;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.repository.FieldRepository;
import com.stemadeleine.api.repository.FormRepository;
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

    public List<Form> getAllForms() {
        log.info("Récupération de tous les formulaires non supprimés");
        List<Form> forms = formRepository.findByStatus(PublishingStatus.DRAFT);
        log.debug("Nombre de formulaires trouvés : {}", forms.size());
        return forms;
    }

    public Optional<Form> getFormById(UUID id) {
        log.info("Recherche du formulaire avec l'ID : {}", id);
        Optional<Form> form = formRepository.findById(id)
                .filter(f -> f.getStatus() == PublishingStatus.DRAFT || f.getStatus() == PublishingStatus.PUBLISHED);
        log.debug("Formulaire trouvé : {}", form.isPresent());
        return form;
    }

    public Form createFormWithModule(CreateModuleRequest request, User author) {
        log.info("Création d'un nouveau formulaire pour la section : {}", request.sectionId());

        // Récupérer la section à partir de l'UUID
        Section section = moduleService.getDraftSection(request.sectionId());

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
        Form form = moduleService.findDraftByRowId(formRepository, id)
                .orElseThrow(() -> new RuntimeException("Form not found"));

        form.setTitle(details.getTitle());
        form.setDescription(details.getDescription());
        form.setFields(details.getFields());
        form.setIsVisible(details.getIsVisible());
        form.setName(details.getName());
        form.setSortOrder(details.getSortOrder());
        form.setMedia(details.getMedia());

        return moduleService.saveDraft(form);
    }

    @Transactional
    public void softDeleteForm(UUID id) {
        moduleService.softDeleteModuleByRowId(id);
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

    /**
     * Updates the DRAFT of the form in place (no new row).
     */
    @Transactional
    public Form createFormVersion(UpdateFormRequest request, User author) {
        Form form = formRepository.findByModuleIdAndStatus(request.moduleId(), PublishingStatus.DRAFT)
                .orElseThrow(() -> new RuntimeException("Draft form not found for moduleId: " + request.moduleId()));

        if (request.name() != null) form.setName(request.name());
        if (request.title() != null) form.setTitle(request.title());
        if (request.description() != null) form.setDescription(request.description());
        form.setAuthor(author);

        return moduleService.saveDraft(form);
    }
}
