package com.stemadeleine.api.service;

import com.stemadeleine.api.model.ListContentMedia;
import com.stemadeleine.api.model.ListContentMedia.ListContentMediaId;
import com.stemadeleine.api.repository.ListContentMediaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ListContentMediaService {

    private final ListContentMediaRepository listContentMediaRepository;

    public ListContentMediaService(ListContentMediaRepository listContentMediaRepository) {
        this.listContentMediaRepository = listContentMediaRepository;
    }

    public List<ListContentMedia> findAll() {
        return listContentMediaRepository.findAll();
    }

    public Optional<ListContentMedia> findById(ListContentMediaId id) {
        return listContentMediaRepository.findById(id);
    }

    public ListContentMedia save(ListContentMedia listContentMedia) {
        return listContentMediaRepository.save(listContentMedia);
    }

    public ListContentMedia update(ListContentMediaId id, ListContentMedia details) {
        return listContentMediaRepository.findById(id)
                .map(lcm -> {
                    lcm.setSortOrder(details.getSortOrder());
                    lcm.setListContent(details.getListContent());
                    lcm.setMedia(details.getMedia());
                    return listContentMediaRepository.save(lcm);
                })
                .orElseThrow(() -> new RuntimeException("ListContentMedia not found with id " + id));
    }

    public void delete(ListContentMediaId id) {
        listContentMediaRepository.deleteById(id);
    }
}
