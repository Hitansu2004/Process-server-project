package com.processserve.order.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "tenant-service", url = "${tenant.service.url:http://localhost:8082}")
public interface TenantClient {

    @GetMapping("/api/tenants/{id}")
    Map<String, Object> getTenantById(@PathVariable("id") String id);
}
