package com.stemadeleine.api.controller;

import com.stemadeleine.api.model.UserAddress;
import com.stemadeleine.api.model.UserAddress.UserAddressId;
import com.stemadeleine.api.service.UserAddressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-addresses")
public class UserAddressController {

    private final UserAddressService service;

    public UserAddressController(UserAddressService service) {
        this.service = service;
    }

    @GetMapping
    public List<UserAddress> getAll() {
        return service.findAll();
    }

    @GetMapping("/user/{userId}/address/{addressId}")
    public ResponseEntity<UserAddress> getById(@PathVariable String userId, @PathVariable String addressId, @RequestParam String type) {
        UserAddressId id = new UserAddressId(java.util.UUID.fromString(userId),
                java.util.UUID.fromString(addressId),
                type);
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<UserAddress> create(@RequestBody UserAddress userAddress) {
        return ResponseEntity.ok(service.save(userAddress));
    }

    @PutMapping("/user/{userId}/address/{addressId}")
    public ResponseEntity<UserAddress> update(@PathVariable String userId, @PathVariable String addressId,
                                              @RequestParam String type,
                                              @RequestBody UserAddress updated) {
        UserAddressId id = new UserAddressId(java.util.UUID.fromString(userId),
                java.util.UUID.fromString(addressId),
                type);
        return ResponseEntity.ok(service.update(id, updated));
    }

    @DeleteMapping("/user/{userId}/address/{addressId}")
    public ResponseEntity<Void> delete(@PathVariable String userId, @PathVariable String addressId,
                                       @RequestParam String type) {
        UserAddressId id = new UserAddressId(java.util.UUID.fromString(userId),
                java.util.UUID.fromString(addressId),
                type);
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
