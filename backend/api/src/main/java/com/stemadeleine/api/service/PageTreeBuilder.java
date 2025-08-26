package com.stemadeleine.api.service;

import com.stemadeleine.api.dto.PageDto;
import com.stemadeleine.api.model.Page;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PageTreeBuilder {

    public List<PageDto> buildTree(List<Page> allPages) {

        List<Page> latestPages = allPages.stream()
                .collect(Collectors.groupingBy(
                        Page::getPageId,
                        Collectors.collectingAndThen(
                                Collectors.maxBy(Comparator.comparingInt(Page::getVersion)),
                                Optional::get
                        )
                ))
                .values()
                .stream()
                .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                .toList();

        Map<UUID, PageDto> dtoMap = latestPages.stream()
                .collect(Collectors.toMap(
                        Page::getId,
                        p -> new PageDto(
                                p.getId(),
                                p.getPageId(),
                                p.getName(),
                                p.getTitle(),
                                p.getSubTitle(),
                                p.getSlug(),
                                p.getDescription(),
                                p.getStatus(),
                                Optional.ofNullable(p.getSortOrder()).orElse(0),
                                p.getIsVisible(),
                                p.getIsDeleted(),
                                new ArrayList<>()
                        )
                ));

        List<PageDto> roots = new ArrayList<>();
        for (Page page : latestPages) {
            PageDto dto = dtoMap.get(page.getId());
            if (page.getParentPage() != null) {
                PageDto parentDto = dtoMap.get(page.getParentPage().getId());
                if (parentDto != null) {
                    parentDto.children().add(dto);
                }
            } else {
                roots.add(dto);
            }
        }

        sortRecursive(roots);
        return roots;
    }

    private void sortRecursive(List<PageDto> pages) {
        pages.sort(Comparator.comparingInt(p -> Optional.ofNullable(p.sortOrder()).orElse(0)));
        for (PageDto p : pages) {
            sortRecursive(p.children());
        }
    }
}