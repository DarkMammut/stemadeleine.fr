package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateFormRequest;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
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

    public Form createFormWithModule(CreateFormRequest request, User author) {
        log.info("Création d'un nouveau formulaire pour la section : {}", request.sectionId());

        Module module = moduleService.createNewModule(
                request.sectionId(),
                request.name(),
                "FORM",
                author
        );
        log.debug("Module créé avec l'ID : {}", module.getId());

        Field field = Field.builder()
                .label("Name")
                .inputType(FieldInputType.TEXT)
                .required(true)
                .placeholder("Enter your name")
                .sortOrder(1)
                .isVisible(true)
                .build();
        Field savedField = fieldRepository.save(field);
        log.debug("Champ par défaut créé avec l'ID : {}", savedField.getId());

        Form form = Form.builder()
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
                .description("New Form")
                .fields(List.of(savedField))
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
}
