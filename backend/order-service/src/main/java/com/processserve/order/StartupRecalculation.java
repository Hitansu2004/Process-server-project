package com.processserve.order;

import com.processserve.order.service.OrderRecalculationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class StartupRecalculation {

    private final OrderRecalculationService recalculationService;
    private static boolean hasRun = false;

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        if (!hasRun) {
            log.info("Application started - triggering order recalculation");
            try {
                recalculationService.recalculateAllCompletedOrders();
                hasRun = true;
                log.info("Order recalculation completed successfully");
            } catch (Exception e) {
                log.error("Order recalculation failed", e);
            }
        }
    }
}
