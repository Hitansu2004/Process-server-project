package com.processserve.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("auth-service", r -> r
                        .path("/api/auth/**")
                        .uri("lb://AUTH-SERVICE"))
                .route("tenant-service", r -> r
                        .path("/api/tenants/**")
                        .uri("lb://TENANT-SERVICE"))
                .route("order-service", r -> r
                        .path("/api/orders/**", "/api/bids/**")
                        .uri("lb://ORDER-SERVICE"))
                .route("user-service", r -> r
                        .path("/api/users/**", "/api/customers/**", "/api/delivery-persons/**")
                        .uri("lb://USER-SERVICE"))
                .route("notification-service", r -> r
                        .path("/api/notifications/**")
                        .uri("lb://NOTIFICATION-SERVICE"))
                .build();
    }
}
