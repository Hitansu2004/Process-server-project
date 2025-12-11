package com.processserve.user.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "order-service")
public interface OrderClient {

    @GetMapping("/api/orders/validate-rating")
    boolean validateRatingEligibility(@RequestParam("orderId") String orderId,
            @RequestParam("customerId") String customerId,
            @RequestParam("processServerId") String processServerId);
}
