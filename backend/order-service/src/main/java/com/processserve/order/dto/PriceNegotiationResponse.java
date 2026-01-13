package com.processserve.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PriceNegotiationResponse {
    private String id;
    private String orderRecipientId;
    private String proposedBy;
    private BigDecimal proposedAmount;
    private BigDecimal counterOfferAmount;
    private String counterOfferedBy;
    private String status;
    private String proposerNotes;
    private String responderNotes;
    private Integer negotiationRounds;
    private LocalDateTime createdAt;
    private LocalDateTime proposedAt;
    private LocalDateTime counterOfferedAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime rejectedAt;
    private LocalDateTime updatedAt;
    
    // Helper for frontend to show all negotiation history
    private List<NegotiationRound> negotiationHistory;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NegotiationRound {
        private String round; // e.g., "PS Proposal", "Customer Counter", etc.
        private BigDecimal amount;
        private String notes;
        private LocalDateTime timestamp;
        private String status;
    }
}
