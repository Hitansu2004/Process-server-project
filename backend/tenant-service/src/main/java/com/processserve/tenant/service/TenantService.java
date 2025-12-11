package com.processserve.tenant.service;

import com.processserve.tenant.entity.Tenant;
import com.processserve.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TenantService {

    private final TenantRepository tenantRepository;

    @Transactional
    public Tenant createTenant(String name, String domainUrl) {
        if (tenantRepository.existsByName(name)) {
            throw new RuntimeException("Tenant name already exists");
        }

        Tenant tenant = new Tenant();
        tenant.setId(UUID.randomUUID().toString());
        tenant.setName(name);
        tenant.setDomainUrl(domainUrl);
        tenant.setApiKey(UUID.randomUUID().toString());
        tenant.setIsActive(true);
        tenant.setSubscriptionTier("BASIC");

        return tenantRepository.save(tenant);
    }

    public Tenant getTenantById(String id) {
        return tenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
    }

    public List<Tenant> getAllTenants() {
        return tenantRepository.findAll();
    }

    @Transactional
    public Tenant updateTenantSettings(String id, String businessHours, String pricingConfig,
            String notificationSettings) {
        Tenant tenant = getTenantById(id);

        if (businessHours != null) {
            tenant.setBusinessHours(businessHours);
        }
        if (pricingConfig != null) {
            tenant.setPricingConfig(pricingConfig);
        }
        if (notificationSettings != null) {
            tenant.setNotificationSettings(notificationSettings);
        }

        return tenantRepository.save(tenant);
    }

    @Transactional
    public Tenant updateTenantInfo(String id, String name, String domainUrl, String subscriptionTier) {
        Tenant tenant = getTenantById(id);

        if (name != null && !name.trim().isEmpty()) {
            tenant.setName(name);
        }
        if (domainUrl != null && !domainUrl.trim().isEmpty()) {
            tenant.setDomainUrl(domainUrl);
        }
        if (subscriptionTier != null && !subscriptionTier.trim().isEmpty()) {
            tenant.setSubscriptionTier(subscriptionTier);
        }

        return tenantRepository.save(tenant);
    }

}
