package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.CreateFormRequest;
import com.stemadeleine.api.model.Module;
import com.stemadeleine.api.model.*;
import com.stemadeleine.api.repository.FieldRepository;
import com.stemadeleine.api.repository.FormRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FormService {
    private final FormRepository formRepository;
    private final ModuleService moduleService;
    private final FieldRepository fieldRepository;

    public List<Form> getAllForms() {
        return formRepository.findByStatusNot(PublishingStatus.DELETED);
    }

    public Optional<Form> getFormById(UUID id) {
        return formRepository.findById(id)
                .filter(form -> form.getStatus() != PublishingStatus.DELETED);
    }

    public Form createFormWithModule(CreateFormRequest request, User author) {

        Module module = moduleService.createNewModule(
                request.sectionId(),
                request.name(),
                "FORM",
                author
        );

        Field field = Field.builder()
                .label("Name")
                .inputType(FieldInputType.TEXT)
                .required(true)
                .placeholder("Enter your name")
                .sortOrder(1)
                .isVisible(true)
                .build();
        fieldRepository.save(field);

        Form form = Form.builder()
                .description("New Form")
                .fields(List.of(field))
                .status(PublishingStatus.DRAFT)
                .isVisible(true)
                .build();

        return formRepository.save(form);
    }

    public List<Field> getFormFields(UUID formId) {
        return fieldRepository.findAllByOrderBySortOrderAsc();
    }

    public List<Field> getVisibleFormFields(UUID formId) {
        return fieldRepository.findByIsVisibleTrue();
    }

    public Form updateForm(UUID id, Form details) {
        return formRepository.findById(id)
                .map(form -> {
                    form.setTitle(details.getTitle());
                    form.setDescription(details.getDescription());
                    form.setFields(details.getFields());
                    form.setIsVisible(details.getIsVisible());
                    form.setName(details.getName());
                    return formRepository.save(form);
                })
                .orElseThrow(() -> new RuntimeException("Form not found"));
    }

    public void softDeleteForm(UUID id) {
        formRepository.findById(id).ifPresent(form -> {
            form.setStatus(PublishingStatus.DELETED);
            formRepository.save(form);
        });
    }
}
