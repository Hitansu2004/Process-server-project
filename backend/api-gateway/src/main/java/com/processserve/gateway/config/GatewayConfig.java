package com.processserve.gateway.config;

import com.processserve.gateway.filter.AuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

        @Autowired
        private AuthenticationFilter authenticationFilter;

        @Bean
        public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
                return builder.routes()
                                .route("auth-service", r -> r
                                                .path("/api/auth/**")
                                                .uri("lb://AUTH-SERVICE"))
                                .route("tenant-service", r -> r
                                                .path("/api/tenants/**")
                                                .filters(f -> f.filter(authenticationFilter
                                                                .apply(new AuthenticationFilter.Config())))
                                                .uri("lb://TENANT-SERVICE"))
                                .route("order-service", r -> r
                                                .path("/api/orders/**", "/api/bids/**", "/api/geography/**")
                                                .filters(f -> f.filter(authenticationFilter
                                                                .apply(new AuthenticationFilter.Config())))
                                                .uri("lb://ORDER-SERVICE"))
                                .route("user-service", r -> r
                                                .path("/api/users/**", "/api/customers/**", "/api/delivery-persons/**",
                                                                "/api/contact-book/**", "/api/process-servers/**",
                                                                "/api/invitations/**")
                                                .filters(f -> f.filter(authenticationFilter
                                                                .apply(new AuthenticationFilter.Config())))
                                                .uri("lb://USER-SERVICE"))
                                .route("notification-service", r -> r
                                                .path("/api/notifications/**")
                                                .filters(f -> f.filter(authenticationFilter
                                                                .apply(new AuthenticationFilter.Config())))
                                                .uri("lb://NOTIFICATION-SERVICE"))
                                .build();
        }
}
