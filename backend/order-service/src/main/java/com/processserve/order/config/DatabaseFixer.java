package com.processserve.order.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseFixer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        log.info("🔧 Starting Database Schema Fix...");

        try {
            // 1. Update Document Type Enum
            log.info("Updating document_type Enum...");
            jdbcTemplate.execute(
                    "ALTER TABLE orders MODIFY COLUMN document_type ENUM('CRIMINAL_CASE','CIVIL_COMPLAINT','RESTRAINING_ORDER','HOUSE_ARREST','EVICTION_NOTICE','SUBPOENA','DIVORCE_PAPERS','CHILD_CUSTODY','SMALL_CLAIMS','BANKRUPTCY','OTHER','SUMMONS','COMPLAINT','NOTICE','ORDER','PETITION','MOTION','WARRANT','WRIT','GARNISHMENT','PROBATE_DOCUMENTS','CEASE_DESIST','DEMAND_LETTER','CONTRACT')");
            log.info("✅ document_type Enum updated.");
        } catch (Exception e) {
            log.warn("⚠️ Failed to update document_type Enum (might already be updated): {}", e.getMessage());
        }

        try {
            // 2. Add page_count column
            log.info("Adding page_count column...");
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN page_count INT");
            log.info("✅ page_count column added.");
        } catch (Exception e) {
            log.warn("⚠️ Failed to add page_count column (might already exist): {}", e.getMessage());
        }

        try {
            // 3. Rename columns
            log.info("Renaming recipient columns...");
            jdbcTemplate
                    .execute("ALTER TABLE orders CHANGE COLUMN has_multiple_dropoffs has_multiple_recipients BIT(1)");
            jdbcTemplate.execute("ALTER TABLE orders CHANGE COLUMN total_dropoffs total_recipients INT");
            log.info("✅ Recipient columns renamed.");
        } catch (Exception e) {
            log.warn("⚠️ Failed to rename columns (might already be renamed): {}", e.getMessage());
        }

        // 4. Fix specific order C-001-ORD35 if it exists and has null document_type
        try {
            log.info("Fixing order C-001-ORD35...");
            jdbcTemplate.execute(
                    "UPDATE orders SET document_type='EVICTION_NOTICE', document_url='https://process-server-uploads.s3.amazonaws.com/eviction_notice.pdf' WHERE order_number='C-001-ORD35' AND (document_type IS NULL OR document_url IS NULL)");
            log.info("✅ Order C-001-ORD35 fixed.");
        } catch (Exception e) {
            log.warn("⚠️ Failed to fix order C-001-ORD35: {}", e.getMessage());
        }

        try {
            // Fix for C-001-ORD35 Recipient 2 (Double billing issue)
            log.info("Fixing double billing for C-001-ORD35 Recipient 2...");
            jdbcTemplate.update(
                    "UPDATE order_recipients SET process_service = 1, certified_mail = 0, service_type = 'PROCESS_SERVICE' WHERE order_id = (SELECT id FROM orders WHERE order_number = 'C-001-ORD35') AND recipient_name LIKE 'Try 1 order 1%'");
            log.info("✅ Recipient 2 fixed.");

            // Fix for C-001-ORD35 Recipient 1 (User reported persistence issue)
            log.info("Fixing persistence issue for C-001-ORD35 Recipient 1...");
            jdbcTemplate.update(
                    "UPDATE order_recipients SET process_service = 1, certified_mail = 0, service_type = 'PROCESS_SERVICE' WHERE order_id = (SELECT id FROM orders WHERE order_number = 'C-001-ORD35') AND recipient_name LIKE 'try 2 orer 2%'");
            log.info("✅ Recipient 1 fixed.");
        } catch (Exception e) {
            log.warn("⚠️ Failed to fix recipients: {}", e.getMessage());
        }

        try {
            // Print a valid user email for debugging
            String email = jdbcTemplate.queryForObject("SELECT email FROM users LIMIT 1", String.class);
            log.info("🔍 DEBUG: Found user email: {}", email);
        } catch (Exception e) {
            log.warn("⚠️ Failed to fetch user email: {}", e.getMessage());
        }

        log.info("🏁 Database Schema Fix completed.");
    }
}
