package com.processserve.order.controller;

import com.processserve.order.dto.PlaceBidRequest;
import com.processserve.order.entity.Bid;
import com.processserve.order.service.BidService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bids")
@RequiredArgsConstructor
@Slf4j
public class BidController {

    private final BidService bidService;

    @PostMapping
    public ResponseEntity<?> placeBid(@Valid @RequestBody PlaceBidRequest request) {
        try {
            Bid bid = bidService.placeBid(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(bid);
        } catch (Exception e) {
            log.error("Failed to place bid: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PutMapping("/{bidId}/accept")
    public ResponseEntity<?> acceptBid(@PathVariable String bidId) {
        try {
            bidService.acceptBid(bidId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Bid accepted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to accept bid: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<Bid>> getBidsByOrder(@PathVariable String orderId) {
        List<Bid> bids = bidService.getBidsByOrderId(orderId);
        return ResponseEntity.ok(bids);
    }

    @GetMapping("/process-server/{processServerId}")
    public ResponseEntity<List<com.processserve.order.dto.BidDTO>> getBidsByProcessServer(
            @PathVariable String processServerId) {
        List<com.processserve.order.dto.BidDTO> bids = bidService.getBidsByProcessServerId(processServerId);
        return ResponseEntity.ok(bids);
    }
}
