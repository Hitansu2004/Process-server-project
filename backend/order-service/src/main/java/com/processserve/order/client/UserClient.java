package com.processserve.order.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "user-service")
public interface UserClient {

    @PostMapping("/api/contact-book/auto-add")
    void autoAddProcessServer(@RequestParam("customerId") String customerId,
            @RequestParam("processServerId") String processServerId);

    @PostMapping("/api/process-servers/{id}/stats")
    void updateStats(@PathVariable("id") String id, @RequestBody java.util.Map<String, Object> request);
}
