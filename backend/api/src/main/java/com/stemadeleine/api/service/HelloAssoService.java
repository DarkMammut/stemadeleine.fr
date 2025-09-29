package com.stemadeleine.api.service;

import com.stemadeleine.api.config.HelloAssoProperties;
import com.stemadeleine.api.dto.HelloAssoFormDto;
import com.stemadeleine.api.dto.HelloAssoMembershipItemDto;
import com.stemadeleine.api.dto.HelloAssoPaymentDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

@Slf4j
@Service
public class HelloAssoService {
    private final HelloAssoProperties properties;
    private final WebClient webClient;

    // Ajout du cache pour le token et son expiration
    private final AtomicReference<String> accessTokenCache = new AtomicReference<>(null);
    private final AtomicReference<Instant> accessTokenExpiry = new AtomicReference<>(Instant.EPOCH);

    @Autowired
    public HelloAssoService(HelloAssoProperties properties) {
        this.properties = properties;
        this.webClient = WebClient.builder()
                .baseUrl(properties.getApiUrl())
                .build();
    }

    public Mono<String> getAccessToken() {
        Instant now = Instant.now();
        String cachedToken = accessTokenCache.get();
        Instant expiry = accessTokenExpiry.get();
        if (cachedToken != null && now.isBefore(expiry)) {
            return Mono.just(cachedToken);
        }
        return webClient.post()
                .uri("/oauth2/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .bodyValue("grant_type=client_credentials&client_id=" + properties.getClientId() +
                        "&client_secret=" + properties.getClientSecret() + "&scope=api")
                .retrieve()
                .bodyToMono(Map.class)
                .map(body -> {
                    String token = (String) body.get("access_token");
                    Object expiresInObj = body.get("expires_in");
                    long expiresIn = 3600; // valeur par défaut 1h
                    if (expiresInObj != null) {
                        try {
                            expiresIn = Long.parseLong(String.valueOf(expiresInObj));
                        } catch (Exception e) {
                            log.warn("Impossible de parser expires_in: {}", expiresInObj);
                        }
                    }
                    Instant expiryTime = Instant.now().plusSeconds(expiresIn - 30); // marge de 30s
                    accessTokenCache.set(token);
                    accessTokenExpiry.set(expiryTime);
                    return token;
                });
    }

    public Mono<Map<String, Object>> getOrganizationInfo(String orgSlug) {
        return getAccessToken().flatMap(token ->
                webClient.get()
                        .uri("/v5/organizations/" + orgSlug)
                        .header("Authorization", "Bearer " + token)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .map(body -> (Map<String, Object>) body)
        );
    }

    public Mono<List<HelloAssoMembershipItemDto>> getMembershipItems(String orgSlug, String formSlug) {
        return getMembershipItemsPaginated(orgSlug, formSlug, null, List.of());
    }

    private Mono<List<HelloAssoMembershipItemDto>> getMembershipItemsPaginated(String orgSlug, String formSlug, String continuationToken, List<HelloAssoMembershipItemDto> accumulated) {
        final String uri = continuationToken == null
                ? "/v5/organizations/" + orgSlug + "/forms/membership/" + formSlug + "/items"
                : "/v5/organizations/" + orgSlug + "/forms/membership/" + formSlug + "/items?continuationtoken=" + continuationToken;
        return getAccessToken().flatMap(token ->
                webClient.get()
                        .uri(uri)
                        .header("Authorization", "Bearer " + token)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .flatMap(body -> {
                            log.info("Réponse brute HelloAsso (membership items): {}", body);
                            Object dataObj = body.get("data");
                            log.info("Contenu de data (membership): {}", dataObj);
                            List<HelloAssoMembershipItemDto> pageItems = List.of();
                            if (dataObj instanceof List<?> dataList) {
                                pageItems = dataList.stream().map(item -> {
                                    Map<String, Object> itemMap = (Map<String, Object>) item;
                                    HelloAssoMembershipItemDto dto = new HelloAssoMembershipItemDto();
                                    dto.setId(itemMap.get("id") != null ? Long.valueOf(String.valueOf(itemMap.get("id"))) : null);
                                    Map<String, Object> payerMap = (Map<String, Object>) itemMap.get("payer");
                                    if (payerMap != null) {
                                        HelloAssoMembershipItemDto.Payer payer = new HelloAssoMembershipItemDto.Payer();
                                        payer.setFirstName(String.valueOf(payerMap.get("firstName")));
                                        payer.setLastName(String.valueOf(payerMap.get("lastName")));
                                        payer.setEmail(String.valueOf(payerMap.get("email")));
                                        dto.setPayer(payer);
                                    }
                                    Object answersObj = itemMap.get("answers");
                                    if (answersObj instanceof List<?> answersList) {
                                        List<HelloAssoMembershipItemDto.Answer> answers = answersList.stream().map(answer -> {
                                            Map<String, Object> answerMap = (Map<String, Object>) answer;
                                            HelloAssoMembershipItemDto.Answer ans = new HelloAssoMembershipItemDto.Answer();
                                            ans.setName(String.valueOf(answerMap.get("name")));
                                            ans.setValue(String.valueOf(answerMap.get("value")));
                                            return ans;
                                        }).toList();
                                        dto.setAnswers(answers);
                                    }
                                    return dto;
                                }).toList();
                            }
                            List<HelloAssoMembershipItemDto> allItems = new java.util.ArrayList<>(accumulated);
                            allItems.addAll(pageItems);
                            String nextToken = null;
                            Object paginationObj = body.get("pagination");
                            if (paginationObj instanceof Map<?, ?> paginationMap) {
                                Object tokenObj = paginationMap.get("continuationToken");
                                if (tokenObj != null && !String.valueOf(tokenObj).isEmpty()) {
                                    nextToken = String.valueOf(tokenObj);
                                }
                            }
                            if (nextToken != null) {
                                return getMembershipItemsPaginated(orgSlug, formSlug, nextToken, allItems);
                            } else {
                                return Mono.just(allItems);
                            }
                        })
        );
    }

    public Mono<List<HelloAssoFormDto>> getForms(String orgSlug) {
        return getFormsPaginated(orgSlug, null, List.of());
    }

    private Mono<List<HelloAssoFormDto>> getFormsPaginated(String orgSlug, String continuationToken, List<HelloAssoFormDto> accumulated) {
        final String uri = continuationToken == null
                ? "/v5/organizations/" + orgSlug + "/forms?type=Donation"
                : "/v5/organizations/" + orgSlug + "/forms?type=Donation&continuationtoken=" + continuationToken;
        return getAccessToken().flatMap(token ->
                webClient.get()
                        .uri(uri)
                        .header("Authorization", "Bearer " + token)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .flatMap(body -> {
                            log.info("Réponse brute HelloAsso (donation forms): {}", body);
                            Object dataObj = body.get("data");
                            log.info("Contenu de data (forms): {}", dataObj);
                            List<HelloAssoFormDto> pageItems = List.of();
                            if (dataObj instanceof List<?> dataList) {
                                pageItems = dataList.stream().map(form -> {
                                    Map<String, Object> formMap = (Map<String, Object>) form;
                                    HelloAssoFormDto dto = new HelloAssoFormDto();
                                    dto.setFormSlug(String.valueOf(formMap.get("formSlug")));
                                    dto.setTitle(String.valueOf(formMap.get("title")));
                                    dto.setDescription(String.valueOf(formMap.get("description")));
                                    dto.setUrl(String.valueOf(formMap.get("url")));
                                    dto.setFormType(String.valueOf(formMap.get("formType")));
                                    dto.setState(String.valueOf(formMap.get("state")));
                                    dto.setCurrency(String.valueOf(formMap.get("currency")));
                                    return dto;
                                }).toList();
                            }
                            List<HelloAssoFormDto> allItems = new java.util.ArrayList<>(accumulated);
                            allItems.addAll(pageItems);
                            String nextToken = null;
                            Object paginationObj = body.get("pagination");
                            long totalPages = 0;
                            long totalCount = 0;
                            if (paginationObj instanceof Map<?, ?> paginationMap) {
                                Object tokenObj = paginationMap.get("continuationToken");
                                if (tokenObj != null && !String.valueOf(tokenObj).isEmpty()) {
                                    nextToken = String.valueOf(tokenObj);
                                }
                                Object totalPagesObj = paginationMap.get("totalPages");
                                Object totalCountObj = paginationMap.get("totalCount");
                                try {
                                    totalPages = totalPagesObj != null ? Long.parseLong(String.valueOf(totalPagesObj)) : 0;
                                    totalCount = totalCountObj != null ? Long.parseLong(String.valueOf(totalCountObj)) : 0;
                                } catch (Exception e) {
                                    // ignore parse error
                                }
                            }
                            // STOP si data est vide OU totalPages/totalCount == -1
                            if ((dataObj instanceof List<?> && ((List<?>) dataObj).isEmpty()) || totalPages == -1 || totalCount == -1) {
                                return Mono.just(allItems);
                            }
                            if (nextToken != null) {
                                return getFormsPaginated(orgSlug, nextToken, allItems);
                            } else {
                                return Mono.just(allItems);
                            }
                        })
        );
    }

    public Mono<List<HelloAssoPaymentDto>> getPayments(String orgSlug) {
        return getPaymentsPaginated(orgSlug, null, List.of());
    }

    private Mono<List<HelloAssoPaymentDto>> getPaymentsPaginated(String orgSlug, String continuationToken, List<HelloAssoPaymentDto> accumulated) {
        final String uri = continuationToken == null
                ? "/v5/organizations/" + orgSlug + "/payments"
                : "/v5/organizations/" + orgSlug + "/payments?continuationtoken=" + continuationToken;
        return getAccessToken().flatMap(token ->
                webClient.get()
                        .uri(uri)
                        .header("Authorization", "Bearer " + token)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .flatMap(body -> {
                            log.info("Réponse brute HelloAsso (payments): {}", body);
                            Object dataObj = body.get("data");
                            log.info("Contenu de data (payments): {}", dataObj);
                            List<HelloAssoPaymentDto> pageItems = List.of();
                            if (dataObj instanceof List<?> dataList) {
                                pageItems = dataList.stream().map(payment -> {
                                    Map<String, Object> paymentMap = (Map<String, Object>) payment;
                                    HelloAssoPaymentDto dto = new HelloAssoPaymentDto();
                                    dto.setPaymentId(String.valueOf(paymentMap.get("id")));
                                    // Payer
                                    Map<String, Object> payerMap = (Map<String, Object>) paymentMap.get("payer");
                                    if (payerMap != null) {
                                        dto.setPayerFirstname(String.valueOf(payerMap.get("firstName")));
                                        dto.setPayerLastname(String.valueOf(payerMap.get("lastName")));
                                        dto.setPayerEmail(String.valueOf(payerMap.get("email")));
                                        Object birthDateObj = payerMap.get("dateOfBirth");
                                        if (birthDateObj != null && !String.valueOf(birthDateObj).equals("null")) {
                                            String birthDateStr = String.valueOf(birthDateObj);
                                            try {
                                                if (birthDateStr.length() >= 10) {
                                                    dto.setPayerBirthDate(LocalDate.parse(birthDateStr.substring(0, 10)));
                                                } else {
                                                    log.warn("Format de birthDate inattendu: {}", birthDateStr);
                                                }
                                            } catch (Exception e) {
                                                log.warn("Erreur lors du parsing de birthDate: {}", birthDateStr);
                                            }
                                        }
                                        dto.setPayerAddressLine1(payerMap.get("address") != null ? String.valueOf(payerMap.get("address")) : null);
                                        dto.setPayerAddressLine2(payerMap.get("address2") != null ? String.valueOf(payerMap.get("address2")) : null);
                                        dto.setPayerState(payerMap.get("state") != null ? String.valueOf(payerMap.get("state")) : null);
                                        dto.setPayerCity(payerMap.get("city") != null ? String.valueOf(payerMap.get("city")) : null);
                                        dto.setPayerPostCode(payerMap.get("zipCode") != null ? String.valueOf(payerMap.get("zipCode")) : null);
                                        dto.setPayerCountry(payerMap.get("country") != null ? String.valueOf(payerMap.get("country")) : "France");
                                    }
                                    // Items (pour type, currency, amount)
                                    List<Map<String, Object>> items = (List<Map<String, Object>>) paymentMap.get("items");
                                    if (items != null && !items.isEmpty()) {
                                        Map<String, Object> item = items.get(0);
                                        dto.setAmount(item.get("amount") != null ? Double.valueOf(String.valueOf(item.get("amount"))) : null);
                                        dto.setCurrency(item.get("currency") != null ? String.valueOf(item.get("currency")) : "EUR");
                                        dto.setType(item.get("type") != null ? String.valueOf(item.get("type")) : "Unknown"); // type
                                    } else {
                                        dto.setAmount(paymentMap.get("amount") != null ? Double.valueOf(String.valueOf(paymentMap.get("amount"))) : null);
                                        dto.setCurrency("EUR");
                                        dto.setType("Unknown");
                                    }
                                    // form_slug
                                    Map<String, Object> orderMap = (Map<String, Object>) paymentMap.get("order");
                                    if (orderMap != null) {
                                        dto.setFormSlug(orderMap.get("formSlug") != null ? String.valueOf(orderMap.get("formSlug")) : "");
                                    } else {
                                        dto.setFormSlug("");
                                    }
                                    // receipt_url
                                    dto.setReceiptUrl(paymentMap.get("paymentReceiptUrl") != null ? String.valueOf(paymentMap.get("paymentReceiptUrl")) : "");
                                    // status
                                    dto.setStatus(String.valueOf(paymentMap.get("state")));
                                    // date
                                    String dateStr = String.valueOf(paymentMap.get("date"));
                                    if (dateStr != null && !dateStr.equals("null")) {
                                        try {
                                            dto.setPaymentDate(LocalDate.parse(dateStr.substring(0, 10)));
                                        } catch (Exception e) {
                                            log.warn("Format de date inattendu: {}", dateStr);
                                        }
                                    }
                                    return dto;
                                }).toList();
                            }
                            List<HelloAssoPaymentDto> allItems = new java.util.ArrayList<>(accumulated);
                            allItems.addAll(pageItems);
                            String nextToken = null;
                            Object paginationObj = body.get("pagination");
                            long totalPages = 0;
                            long totalCount = 0;
                            if (paginationObj instanceof Map<?, ?> paginationMap) {
                                Object tokenObj = paginationMap.get("continuationToken");
                                if (tokenObj != null && !String.valueOf(tokenObj).isEmpty()) {
                                    nextToken = String.valueOf(tokenObj);
                                }
                                Object totalPagesObj = paginationMap.get("totalPages");
                                Object totalCountObj = paginationMap.get("totalCount");
                                try {
                                    totalPages = totalPagesObj != null ? Long.parseLong(String.valueOf(totalPagesObj)) : 0;
                                    totalCount = totalCountObj != null ? Long.parseLong(String.valueOf(totalCountObj)) : 0;
                                } catch (Exception e) {
                                    // ignore parse error
                                }
                            }
                            // STOP si data est vide OU totalPages/totalCount == -1
                            if ((dataObj instanceof List<?> && ((List<?>) dataObj).isEmpty()) || totalPages == -1 || totalCount == -1) {
                                return Mono.just(allItems);
                            }
                            if (nextToken != null) {
                                return getPaymentsPaginated(orgSlug, nextToken, allItems);
                            } else {
                                return Mono.just(allItems);
                            }
                        })
        );
    }
}
