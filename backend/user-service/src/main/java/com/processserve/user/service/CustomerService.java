package com.processserve.user.service;

import com.processserve.user.entity.CustomerProfile;
import com.processserve.user.repository.CustomerProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerService {

    private final CustomerProfileRepository customerRepository;

    public CustomerProfile getProfile(String globalUserId) {
        return customerRepository.findByGlobalUserId(globalUserId)
                .orElseThrow(() -> new RuntimeException("Customer profile not found"));
    }

    public List<CustomerProfile> getAllCustomers() {
        return customerRepository.findAll();
    }
}
