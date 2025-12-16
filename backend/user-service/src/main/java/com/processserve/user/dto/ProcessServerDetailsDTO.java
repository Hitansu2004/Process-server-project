package com.processserve.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProcessServerDetailsDTO {
    private String id;
    private String name;
    private String firstName;
    private String lastName;
    private String email;
    private String tenantUserRoleId;
    private String profilePhotoUrl;
    private BigDecimal currentRating;
    private Double successRate;
    private Integer totalOrdersAssigned;
    private Integer successfulDeliveries;
}
