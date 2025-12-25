package com.processserve.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CityResponse {
    private Integer id;
    private String name;
    private String zipCode;
    private String county;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer stateId;
    private String stateName;
    private String stateAbbreviation;
}
