/**
 * Recalculate order totals from recipients
 * This ensures the dashboard displays correct amounts by syncing order-level
 * totals
 * with the sum of recipient-level prices
 * 
 * Matches frontend calculation logic exactly
 */
private void recalculateOrderTotalsFromRecipients(Order order) {
    if (order.getRecipients() == null || order.getRecipients().isEmpty()) {
        log.debug("No recipients for order {}, skipping recalculation", order.getId());
        return;
    }

    // Calculate subtotal from all recipients
    // Match frontend logic: calculate from service flags for AUTOMATED/OPEN
    // recipients
    BigDecimal subtotal = order.getRecipients().stream()
            .map(recipient -> {
                // Check if this is an AUTOMATED recipient that's OPEN or BIDDING
                boolean isAutomatedPending = recipient.getRecipientType() == OrderRecipient.RecipientType.AUTOMATED &&
                        (recipient.getStatus() == OrderRecipient.RecipientStatus.OPEN ||
                                recipient.getStatus() == OrderRecipient.RecipientStatus.BIDDING);

                // Check if this is a GUIDED recipient without quoted/negotiated price
                boolean isDirectStandard = recipient.getRecipientType() == OrderRecipient.RecipientType.GUIDED &&
                        recipient.getQuotedPrice() == null &&
                        (recipient.getFinalAgreedPrice() == null
                                || recipient.getFinalAgreedPrice().compareTo(BigDecimal.ZERO) == 0);

                if (isAutomatedPending || isDirectStandard) {
                    // Calculate from service options (matching frontend logic)
                    BigDecimal price = BigDecimal.ZERO;
                    if (Boolean.TRUE.equals(recipient.getProcessService())) {
                        price = price.add(new BigDecimal("75"));
                    }
                    if (Boolean.TRUE.equals(recipient.getCertifiedMail())) {
                        price = price.add(new BigDecimal("25"));
                    }
                    if (Boolean.TRUE.equals(recipient.getRushService())) {
                        price = price.add(new BigDecimal("50"));
                    }
                    if (Boolean.TRUE.equals(recipient.getRemoteLocation())) {
                        price = price.add(new BigDecimal("40"));
                    }
                    return price;
                } else {
                    // Use stored finalAgreedPrice for assigned/completed recipients
                    return recipient.getFinalAgreedPrice() != null ? recipient.getFinalAgreedPrice() : BigDecimal.ZERO;
                }
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    // Calculate processing fee (3% of subtotal)
    BigDecimal processingFeeRate = new BigDecimal("0.03");
    BigDecimal processingFee = subtotal.multiply(processingFeeRate)
            .setScale(2, java.math.RoundingMode.HALF_UP);

    // Total amount = subtotal + processing fee
    BigDecimal totalAmount = subtotal.add(processingFee);

    // Update order's customer payment amount
    // Within transaction - changes will be auto-saved
    if (order.getCustomerPaymentAmount() == null ||
            order.getCustomerPaymentAmount().compareTo(totalAmount) != 0) {
        order.setCustomerPaymentAmount(totalAmount);
        order.setFinalAgreedPrice(subtotal);

        log.info("Recalculated totals for order {}: Subtotal=${}, ProcessingFee=${}, Total=${}",
                order.getOrderNumber(), subtotal, processingFee, totalAmount);
    }
}
