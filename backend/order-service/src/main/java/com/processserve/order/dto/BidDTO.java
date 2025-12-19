package com.processserve.order.dto;

import com.processserve.order.entity.Bid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BidDTO {
    private String id;
    private String orderId;
    private String orderNumber;
    private BigDecimal bidAmount;
    private Bid.BidStatus status;
    private LocalDateTime createdAt;
}
