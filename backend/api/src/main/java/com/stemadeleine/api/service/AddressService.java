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
        if (address.getName() == null || address.getName().isEmpty()) {
            address.setName("Principal");
        }
        return addressRepository.save(address);
    }

    public Address update(UUID id, Address addressDetails) {
        return addressRepository.findById(id)
                .map(address -> {
                    address.setAddressLine1(addressDetails.getAddressLine1());
                    address.setAddressLine2(addressDetails.getAddressLine2());
                    address.setCity(addressDetails.getCity());
                    address.setState(addressDetails.getState());
                    address.setPostCode(addressDetails.getPostCode());
                    address.setCountry(addressDetails.getCountry());
                    address.setName(
                            addressDetails.getName() == null || addressDetails.getName().isEmpty()
                                    ? "Principal"
                                    : addressDetails.getName()
                    );
                    return addressRepository.save(address);
                })
                .orElseThrow(() -> new RuntimeException("Address not found with id " + id));
    }

    public void delete(UUID id) {
        addressRepository.deleteById(id);
    }
}
