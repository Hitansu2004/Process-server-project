package com.processserve.order.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "user-service", url = "http://localhost:8082")
public interface UserClient {

        @PostMapping("/api/contact-book/auto-add")
        void autoAddProcessServer(@RequestParam("customerId") String customerId,
                        @RequestParam("processServerId") String processServerId);

        @PostMapping("/api/process-servers/{id}/stats")
        void updateStats(@PathVariable("id") String id, @RequestBody java.util.Map<String, Object> request);

        @org.springframework.web.bind.annotation.GetMapping("/api/users/{id}")
        java.util.Map<String, Object> getUser(@PathVariable("id") String id);

        @org.springframework.web.bind.annotation.GetMapping("/api/customers/by-role/{tenantUserRoleId}")
        java.util.Map<String, Object> getCustomerByTenantUserRoleId(
                        @PathVariable("tenantUserRoleId") String tenantUserRoleId);
}
