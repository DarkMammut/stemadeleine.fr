package com.stemadeleine.api.controller;

import com.stemadeleine.api.dto.CreateModuleRequest;
import com.stemadeleine.api.dto.FormDto;
import com.stemadeleine.api.dto.UpdateFormRequest;
import com.stemadeleine.api.mapper.FormMapper;
import com.stemadeleine.api.model.CustomUserDetails;
import com.stemadeleine.api.model.Field;
import com.stemadeleine.api.model.Form;
import com.stemadeleine.api.model.User;
import com.stemadeleine.api.service.FormService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/forms")
@RequiredArgsConstructor
public class FormController {
    private final FormService formService;
    private final FormMapper formMapper;

    @GetMapping
    public List<FormDto> getAllForms() {
        log.info("GET /api/forms - Récupération de tous les formulaires");
        List<Form> forms = formService.getAllForms();
        log.debug("Nombre de formulaires trouvés : {}", forms.size());
        return forms.stream().map(formMapper::toDto).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<FormDto> getFormById(@PathVariable UUID id) {
        log.info("GET /api/forms/{} - Récupération d'un formulaire par ID", id);
        return formService.getFormById(id)
                .map(form -> {
                    log.debug("Formulaire trouvé : {}", form.getId());
                    return ResponseEntity.ok(formMapper.toDto(form));
                })
                .orElseGet(() -> {
                    log.warn("Formulaire non trouvé avec l'ID : {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping
    public ResponseEntity<FormDto> createForm(
            @RequestBody CreateModuleRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails
    ) {
        if (currentUserDetails == null) {
            log.error("Tentative de création de formulaire sans authentification");
            throw new RuntimeException("User not authenticated");
        }

        log.info("POST /api/forms - Création d'un nouveau formulaire");
        Form form = formService.createFormWithModule(
                request,
                currentUserDetails.account().getUser()
        );
        log.debug("Formulaire créé avec l'ID : {}", form.getId());
        return ResponseEntity.ok(formMapper.toDto(form));
    }

    @PostMapping("/version")
    public ResponseEntity<FormDto> createNewVersionForModule(
            @RequestBody UpdateFormRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUserDetails) {
        if (currentUserDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        User currentUser = currentUserDetails.account().getUser();
        log.info("POST /api/form/version - Création d'une nouvelle version pour le module : {}", request.moduleId());
        Form form = formService.createFormVersion(request, currentUser);
        log.debug("Nouvelle version créée avec l'ID : {}", form.getId());
        return ResponseEntity.ok(formMapper.toDto(form));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FormDto> updateForm(@PathVariable UUID id, @RequestBody Form formDetails) {
        log.info("PUT /api/forms/{} - Mise à jour d'un formulaire", id);
        try {
            Form updatedForm = formService.updateForm(id, formDetails);
            log.debug("Formulaire mis à jour : {}", updatedForm.getId());
            return ResponseEntity.ok(formMapper.toDto(updatedForm));
        } catch (RuntimeException e) {
            log.error("Erreur lors de la mise à jour du formulaire {} : {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteForm(@PathVariable UUID id) {
        log.info("DELETE /api/forms/{} - Suppression d'un formulaire", id);
        formService.softDeleteForm(id);
        log.debug("Formulaire supprimé : {}", id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{formId}/fields")
    public ResponseEntity<List<Field>> getFormFields(@PathVariable UUID formId) {
        log.info("GET /api/forms/{}/fields - Récupération des champs d'un formulaire", formId);
        List<Field> fields = formService.getFormFields(formId);
        log.debug("Nombre de champs trouvés : {}", fields.size());
        return ResponseEntity.ok(fields);
    }

    @GetMapping("/{formId}/fields/visible")
    public ResponseEntity<List<Field>> getVisibleFormFields(@PathVariable UUID formId) {
        log.info("GET /api/forms/{}/fields/visible - Récupération des champs visibles d'un formulaire", formId);
        List<Field> visibleFields = formService.getVisibleFormFields(formId);
        log.debug("Nombre de champs visibles trouvés : {}", visibleFields.size());
        return ResponseEntity.ok(visibleFields);
    }
}
