package com.processserve.user.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "auth-service")
public interface AuthClient {

    @GetMapping("/api/auth/roles/{id}")
    Map<String, Object> getRoleDetails(@PathVariable("id") String id);
}
