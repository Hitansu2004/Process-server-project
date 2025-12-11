package com.processserve.order.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "user-service")
public interface UserClient {

    @PostMapping("/api/contact-book/auto-add")
    void autoAddProcessServer(@RequestParam("customerId") String customerId,
            @RequestParam("processServerId") String processServerId);
}
