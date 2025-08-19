package com.stemadeleine.api.service;

import com.stemadeleine.api.model.Address;
import com.stemadeleine.api.repository.AddressRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AddressService {

    private final AddressRepository addressRepository;

    public AddressService(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    public List<Address> findAll() {
        return addressRepository.findAll();
    }

    public Optional<Address> findById(UUID id) {
        return addressRepository.findById(id);
    }

    public Address save(Address address) {
        return addressRepository.save(address);
    }

    public Address update(UUID id, Address addressDetails) {
        return addressRepository.findById(id)
                .map(address -> {
                    address.setStreet(addressDetails.getStreet());
                    address.setCity(addressDetails.getCity());
                    address.setZipcode(addressDetails.getZipcode());
                    address.setCountry(addressDetails.getCountry());
                    return addressRepository.save(address);
                })
                .orElseThrow(() -> new RuntimeException("Address not found with id " + id));
    }

    public void delete(UUID id) {
        addressRepository.deleteById(id);
    }
}
