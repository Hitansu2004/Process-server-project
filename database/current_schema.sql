Warning: A partial dump from a server that has GTIDs will by default include the GTIDs of all transactions, even those that changed suppressed parts of the database. If you don't want to restore GTIDs, pass --set-gtid-purged=OFF. To make a complete dump, pass --all-databases --triggers --routines --events. 
Warning: A dump from a server that has GTIDs enabled will by default include the GTIDs of all transactions, even those that were executed during its extraction and might not be represented in the dumped data. This might result in an inconsistent data dump. 
In order to ensure a consistent backup of the database, pass --single-transaction or --lock-all-tables or --source-data. 
-- MySQL dump 10.13  Distrib 9.5.0, for macos14.8 (x86_64)
--
-- Host: localhost    Database: processserve_db
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '5632b7f0-d598-11f0-8af8-2b08aa3a2611:1-4442';

--
-- Table structure for table `bids`
--

DROP TABLE IF EXISTS `bids`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bids` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bid_amount` decimal(10,2) NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(6) DEFAULT NULL,
  `order_dropoff_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `process_server_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','ACCEPTED','REJECTED','WITHDRAWN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKa7vqaoe2q8axyx0c2e3hjbycb` (`order_dropoff_id`),
  CONSTRAINT `FKa7vqaoe2q8axyx0c2e3hjbycb` FOREIGN KEY (`order_dropoff_id`) REFERENCES `order_dropoffs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contact_book_entries`
--

DROP TABLE IF EXISTS `contact_book_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_book_entries` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner_user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `process_server_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entry_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nickname` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `customer_profiles`
--

DROP TABLE IF EXISTS `customer_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_profiles` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_user_role_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `default_zip_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenant_user_role_id` (`tenant_user_role_id`),
  CONSTRAINT `customer_profiles_ibfk_1` FOREIGN KEY (`tenant_user_role_id`) REFERENCES `tenant_user_roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `delivery_attempts`
--

DROP TABLE IF EXISTS `delivery_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_attempts` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempt_number` int NOT NULL,
  `attempt_time` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `gps_latitude` decimal(10,8) DEFAULT NULL,
  `gps_longitude` decimal(11,8) DEFAULT NULL,
  `is_valid_attempt` bit(1) DEFAULT NULL,
  `outcome_notes` text COLLATE utf8mb4_unicode_ci,
  `photo_proof_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `process_server_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `was_successful` bit(1) DEFAULT NULL,
  `order_dropoff_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKeei4ooiodbj6f91b0md01cjqd` (`order_dropoff_id`),
  CONSTRAINT `FKeei4ooiodbj6f91b0md01cjqd` FOREIGN KEY (`order_dropoff_id`) REFERENCES `order_dropoffs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `global_users`
--

DROP TABLE IF EXISTS `global_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `global_users` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_super_admin` tinyint(1) DEFAULT '0',
  `email_verified` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `order_dropoffs`
--

DROP TABLE IF EXISTS `order_dropoffs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_dropoffs` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assigned_process_server_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `attempt_count` int DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `delivered_at` datetime(6) DEFAULT NULL,
  `dropoff_address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `dropoff_type` enum('GUIDED','AUTOMATED') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dropoff_zip_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `final_agreed_price` decimal(10,2) DEFAULT NULL,
  `max_attempts` int DEFAULT NULL,
  `recipient_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sequence_number` int NOT NULL,
  `status` enum('OPEN','PENDING','BIDDING','ASSIGNED','IN_PROGRESS','DELIVERED','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKo1qwipd6w1j6ligr81o0ox5ro` (`order_id`),
  CONSTRAINT `FKo1qwipd6w1j6ligr81o0ox5ro` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assigned_at` datetime(6) DEFAULT NULL,
  `commission_rate_applied` decimal(5,2) DEFAULT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `customer_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_payment_amount` decimal(10,2) DEFAULT NULL,
  `deadline` datetime(6) NOT NULL,
  `final_agreed_price` decimal(10,2) DEFAULT NULL,
  `has_multiple_dropoffs` bit(1) DEFAULT NULL,
  `order_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pickup_address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `pickup_zip_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pricing_config` json DEFAULT NULL,
  `process_server_payout` decimal(10,2) DEFAULT NULL,
  `special_instructions` text COLLATE utf8mb4_unicode_ci,
  `status` enum('DRAFT','OPEN','BIDDING','PARTIALLY_ASSIGNED','ASSIGNED','IN_PROGRESS','COMPLETED','FAILED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `super_admin_fee` decimal(10,2) DEFAULT NULL,
  `tenant_commission` decimal(10,2) DEFAULT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_profit` decimal(10,2) DEFAULT NULL,
  `total_dropoffs` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_nthkiu7pgmnqnu86i2jyoe2v7` (`order_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `process_server_profiles`
--

DROP TABLE IF EXISTS `process_server_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `process_server_profiles` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_user_role_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_global` tinyint(1) DEFAULT '0',
  `operating_zip_codes` json DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_rating` decimal(3,2) DEFAULT NULL,
  `total_orders_assigned` int DEFAULT '0',
  `successful_deliveries` int DEFAULT '0',
  `failed_after_max_attempts` int DEFAULT '0',
  `total_attempts` int DEFAULT '0',
  `average_attempts_per_delivery` decimal(4,2) DEFAULT '0.00',
  `is_red_zone` tinyint(1) DEFAULT '0',
  `red_zone_trigger_count` int DEFAULT '0',
  `verification_docs` json DEFAULT NULL,
  `last_delivery_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenant_user_role_id` (`tenant_user_role_id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `process_server_profiles_ibfk_1` FOREIGN KEY (`tenant_user_role_id`) REFERENCES `tenant_user_roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `process_server_profiles_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ratings`
--

DROP TABLE IF EXISTS `ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ratings` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `process_server_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `feedback` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tenant_user_roles`
--

DROP TABLE IF EXISTS `tenant_user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_user_roles` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `global_user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `tenant_user_roles_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenants` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `domain_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subdomain` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `api_key` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subscription_tier` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `business_hours` json DEFAULT NULL,
  `pricing_config` json DEFAULT NULL,
  `notification_settings` json DEFAULT NULL,
  `created_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-12 15:22:46
