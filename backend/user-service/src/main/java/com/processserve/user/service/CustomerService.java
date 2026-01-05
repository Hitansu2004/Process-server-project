package com.processserve.user.service;

import com.processserve.user.dto.CustomerDTO;
import com.processserve.user.entity.CustomerProfile;
import com.processserve.user.entity.TenantUserRole;
import com.processserve.user.repository.CustomerProfileRepository;
import com.processserve.user.repository.TenantUserRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerService {

    private final CustomerProfileRepository customerRepository;
    private final TenantUserRoleRepository tenantUserRoleRepository;

    public CustomerProfile createProfile(String tenantUserRoleId) {
        // Check if profile already exists
        if (customerRepository.findByTenantUserRoleId(tenantUserRoleId).isPresent()) {
            throw new RuntimeException("Customer profile already exists for this tenant user role");
        }

        CustomerProfile profile = new CustomerProfile();
        profile.setId(java.util.UUID.randomUUID().toString());
        profile.setTenantUserRoleId(tenantUserRoleId);

        return customerRepository.save(profile);
    }

    public CustomerProfile getProfile(String globalUserId) {
        return customerRepository.findByGlobalUserId(globalUserId)
                .orElseThrow(() -> new RuntimeException("Customer profile not found"));
    }

    public List<CustomerProfile> getAllCustomers() {
        return customerRepository.findAll();
    }

    public List<CustomerDTO> getAllCustomersEnriched() {
        List<CustomerProfile> profiles = customerRepository.findAll();

        return profiles.stream()
                .map(this::enrichCustomerProfile)
                .filter(dto -> dto != null) // Filter out any failed enrichments
                .collect(Collectors.toList());
    }

    public List<CustomerDTO> getCustomersByTenantEnriched(String tenantId) {
        // Get all tenant user roles for CUSTOMER role in this tenant
        List<TenantUserRole> customerRoles = tenantUserRoleRepository
                .findByTenantIdAndRole(tenantId, TenantUserRole.UserRole.CUSTOMER);

        return customerRoles.stream()
                .map(role -> {
                    try {
                        if (role.getGlobalUser() == null) {
                            log.warn("TenantUserRole {} has no associated GlobalUser", role.getId());
                            return null;
                        }
                        // Find customer profile for this role
                        return customerRepository.findByTenantUserRoleId(role.getId())
                                .map(profile -> enrichCustomerProfileWithRole(profile, role))
                                .orElse(null);
                    } catch (Exception e) {
                        log.error("Error enriching customer for role {}: {}", role.getId(), e.getMessage());
                        return null;
                    }
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }

    private CustomerDTO enrichCustomerProfile(CustomerProfile profile) {
        try {
            // Get the tenant user role
            TenantUserRole role = tenantUserRoleRepository.findById(profile.getTenantUserRoleId())
                    .orElse(null);

            if (role == null || role.getGlobalUser() == null) {
                log.warn("Could not find role or user for customer profile {}", profile.getId());
                return null;
            }

            return enrichCustomerProfileWithRole(profile, role);
        } catch (Exception e) {
            log.error("Error enriching customer profile {}: {}", profile.getId(), e.getMessage());
            return null;
        }
    }

    private CustomerDTO enrichCustomerProfileWithRole(CustomerProfile profile, TenantUserRole role) {
        return CustomerDTO.builder()
                .id(profile.getId())
                .globalUserId(role.getGlobalUser().getId())
                .firstName(role.getGlobalUser().getFirstName())
                .lastName(role.getGlobalUser().getLastName())
                .email(role.getGlobalUser().getEmail())
                .phoneNumber(role.getGlobalUser().getPhoneNumber())
                .tenantId(role.getTenantId())
                .createdAt(role.getCreatedAt()) // When customer joined this tenant
                .totalOrders(0) // Will be calculated by frontend from orders
                .companyName(null) // Not in current schema
                .build();
    }

    public void setDefaultProcessServer(String customerId, String processServerId) {
        CustomerProfile profile = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer profile not found"));

        profile.setDefaultProcessServerId(processServerId);
        customerRepository.save(profile);
        log.info("Set default process server {} for customer {}", processServerId, customerId);
    }

    public String getDefaultProcessServer(String customerId) {
        return customerRepository.findById(customerId)
                .map(CustomerProfile::getDefaultProcessServerId)
                .orElse(null);
    }

    public CustomerDTO getCustomerByTenantUserRoleId(String tenantUserRoleId) {
        TenantUserRole role = tenantUserRoleRepository.findById(tenantUserRoleId)
                .orElseThrow(() -> new RuntimeException("Tenant user role not found"));

        if (role.getGlobalUser() == null) {
            throw new RuntimeException("Global user not found for this role");
        }

        // Try to find profile, but if not exists, just return basic info
        CustomerProfile profile = customerRepository.findByTenantUserRoleId(tenantUserRoleId)
                .orElse(new CustomerProfile(null, tenantUserRoleId, null, null));

        return enrichCustomerProfileWithRole(profile, role);
    }
}
