package com.stemadeleine.api.controller;

import com.stemadeleine.api.service.SearchService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class SearchController {
    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/api/search")
    public Map<String, Object> search(@RequestParam(name = "q", required = false) String q,
                                      @RequestParam(name = "limit", required = false, defaultValue = "6") int limit) {
        return searchService.searchAll(q, limit);
    }
}

