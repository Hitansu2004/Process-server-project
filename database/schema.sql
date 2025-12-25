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

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '5632b7f0-d598-11f0-8af8-2b08aa3a2611:1-5368';

--
-- Table structure for table `bids`
--

DROP TABLE IF EXISTS `bids`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bids` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `bid_amount` decimal(10,2) NOT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(6) DEFAULT NULL,
  `order_dropoff_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `process_server_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','ACCEPTED','REJECTED','WITHDRAWN') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKa7vqaoe2q8axyx0c2e3hjbycb` (`order_dropoff_id`),
  CONSTRAINT `FKa7vqaoe2q8axyx0c2e3hjbycb` FOREIGN KEY (`order_dropoff_id`) REFERENCES `order_dropoffs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bids`
--

LOCK TABLES `bids` WRITE;
/*!40000 ALTER TABLE `bids` DISABLE KEYS */;
/*!40000 ALTER TABLE `bids` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_participants`
--

DROP TABLE IF EXISTS `chat_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_participants` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_role` enum('CUSTOMER','ADMIN','SERVER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `added_by_user_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `added_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `removed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_user_role` (`order_id`,`user_id`,`user_role`),
  KEY `idx_chat_participants_order` (`order_id`),
  KEY `idx_chat_participants_active` (`order_id`,`is_active`),
  KEY `idx_chat_participants_user` (`user_id`),
  KEY `idx_participants_order_active` (`order_id`,`is_active`),
  CONSTRAINT `chat_participants_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_participants`
--

LOCK TABLES `chat_participants` WRITE;
/*!40000 ALTER TABLE `chat_participants` DISABLE KEYS */;
INSERT INTO `chat_participants` VALUES ('ddecc0c2-edcf-4b0e-9cec-d3b38c56f134','test-order-chat-001','server-001','SERVER',1,'cust-001','2025-12-25 06:39:16',NULL),('e06ffa6f-a711-48df-ab41-6cfdebe9e069','test-order-chat-001','admin-001','ADMIN',1,NULL,'2025-12-25 06:39:16',NULL),('ef39fc14-c4ed-4e42-a7cf-0af4998eae0e','test-order-chat-001','cust-001','CUSTOMER',1,NULL,'2025-12-25 06:39:16',NULL);
/*!40000 ALTER TABLE `chat_participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_book_entries`
--

DROP TABLE IF EXISTS `contact_book_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_book_entries` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner_user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `process_server_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `entry_type` enum('MANUAL','AUTO_ADDED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `nickname` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `activation_status` enum('ACTIVATED','NOT_ACTIVATED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `invitation_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_book_entries`
--

LOCK TABLES `contact_book_entries` WRITE;
/*!40000 ALTER TABLE `contact_book_entries` DISABLE KEYS */;
INSERT INTO `contact_book_entries` VALUES ('2222c559-e097-4d5a-9ba1-7b0818f6440c','user-cust-001','ps-profile-002','MANUAL','Maria Garcia','2025-12-19 12:49:08','ACTIVATED',NULL),('45ffeca3-17b5-42fe-a6b0-a5c405381a26','user-cust-001','ps-profile-008','MANUAL','Barbara Moore','2025-12-19 12:49:09','ACTIVATED',NULL),('4efa46b0-0c7c-4c7a-88fd-ffc817ee4beb','user-cust-001','ps-profile-010','MANUAL','Susan Anderson','2025-12-25 08:06:50','ACTIVATED',NULL),('7642c742-dbc5-416e-97ee-f1e8b7134377','user-cust-001','ps-profile-001','MANUAL','James Mitchell','2025-12-19 12:08:31','ACTIVATED',NULL),('853bd5ab-dc86-4a26-850f-352b48c8342b','user-cust-001','hitansu08@gmail.com','MANUAL','hitansu08 ','2025-12-25 09:21:45','NOT_ACTIVATED','e0657272-85f9-436a-b781-8011f07dd765'),('ee192553-948f-4925-a4fb-fa06d62865bb','user-cust-001','ps-profile-003','MANUAL','Robert Thompson','2025-12-25 08:06:51','ACTIVATED',NULL),('f2d56a3d-0653-407c-ac19-5bffe7d31a27','user-cust-001','ps-profile-006','MANUAL','Patricia Davis','2025-12-25 08:06:48','ACTIVATED',NULL);
/*!40000 ALTER TABLE `contact_book_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_profiles`
--

DROP TABLE IF EXISTS `customer_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_profiles` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_user_role_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `default_zip_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `default_process_server_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenant_user_role_id` (`tenant_user_role_id`),
  KEY `fk_customer_default_ps` (`default_process_server_id`),
  CONSTRAINT `customer_profiles_ibfk_1` FOREIGN KEY (`tenant_user_role_id`) REFERENCES `tenant_user_roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_customer_default_ps` FOREIGN KEY (`default_process_server_id`) REFERENCES `process_server_profiles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_profiles`
--

LOCK TABLES `customer_profiles` WRITE;
/*!40000 ALTER TABLE `customer_profiles` DISABLE KEYS */;
INSERT INTO `customer_profiles` VALUES ('0e7012ed-52a1-4334-9b5f-79e35202ebbb','3861fc53-4e3f-4cfa-b3db-275bf5b1c0ee',NULL,NULL),('c119a9d5-ee9b-457c-80a2-88017b9ded19','93ad1041-5b0d-4437-ba3e-47758f0b3882',NULL,NULL),('cp-001','tur-cust-001','75201',NULL),('cp-002','tur-cust-002','10001',NULL),('cp-003','tur-cust-003','33101',NULL),('cp-004','tur-cust-004','60601',NULL),('cp-005','tur-cust-005','77001',NULL),('d798668a-be15-4ec4-a27e-f107ea4f60e3','b1b3072d-7fc0-4c38-88f8-c28a05a8e743',NULL,NULL);
/*!40000 ALTER TABLE `customer_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_attempts`
--

DROP TABLE IF EXISTS `delivery_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_attempts` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempt_number` int NOT NULL,
  `attempt_time` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `gps_latitude` decimal(10,8) DEFAULT NULL,
  `gps_longitude` decimal(11,8) DEFAULT NULL,
  `is_valid_attempt` bit(1) DEFAULT NULL,
  `outcome_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `photo_proof_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `process_server_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `was_successful` bit(1) DEFAULT NULL,
  `order_dropoff_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKeei4ooiodbj6f91b0md01cjqd` (`order_dropoff_id`),
  CONSTRAINT `FKeei4ooiodbj6f91b0md01cjqd` FOREIGN KEY (`order_dropoff_id`) REFERENCES `order_dropoffs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_attempts`
--

LOCK TABLES `delivery_attempts` WRITE;
/*!40000 ALTER TABLE `delivery_attempts` DISABLE KEYS */;
/*!40000 ALTER TABLE `delivery_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_verifications`
--

DROP TABLE IF EXISTS `email_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_verifications` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_email_otp` (`email`,`otp`,`is_verified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_verifications`
--

LOCK TABLES `email_verifications` WRITE;
/*!40000 ALTER TABLE `email_verifications` DISABLE KEYS */;
INSERT INTO `email_verifications` VALUES ('cd342776-0a50-4fe1-840c-7320af7f1418','hitansu2004@gmail.com','425938','2025-12-19 22:21:04',1,'2025-12-19 22:11:04');
/*!40000 ALTER TABLE `email_verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `global_users`
--

DROP TABLE IF EXISTS `global_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `global_users` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_super_admin` tinyint(1) DEFAULT '0',
  `email_verified` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `google_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `google_id` (`google_id`),
  KEY `idx_google_id` (`google_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `global_users`
--

LOCK TABLES `global_users` WRITE;
/*!40000 ALTER TABLE `global_users` DISABLE KEYS */;
INSERT INTO `global_users` VALUES ('0ce9153f-c9dc-440f-8a5e-014c5ff3d8db','hitansu2004@gmail.com','$2a$10$Uiyb9blOMVkS6bFcJ44XN.DdDmgb8i9ZVFAFfYM3bHuywzCvc27vS','Hitansu','parichha','1234567890',0,1,1,NULL,'2025-12-19 16:36:30','2025-12-19 16:51:48'),('user-cust-001','sarah.anderson@techcorp.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Sarah','Anderson','+1-214-555-0101',0,1,1,NULL,'2025-12-19 11:16:49','2025-12-25 13:11:57'),('user-cust-002','michael.chen@lawfirm.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Michael','Chen','+1-212-555-0202',0,1,1,NULL,'2025-12-19 11:16:49','2025-12-19 11:37:08'),('user-cust-003','jennifer.rodriguez@legalservices.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Jennifer','Rodriguez','+1-305-555-0303',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-cust-004','david.williams@corporate.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','David','Williams','+1-312-555-0404',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-cust-005','emily.johnson@attorneys.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Emily','Johnson','+1-713-555-0505',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-ps-001','james.mitchell@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','James','Mitchell','+1-214-555-1001',0,1,1,NULL,'2025-12-19 11:16:49','2025-12-25 13:32:18'),('user-ps-002','maria.garcia@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Maria','Garcia','+1-212-555-1002',0,1,1,NULL,'2025-12-19 11:16:49','2025-12-19 11:37:08'),('user-ps-003','robert.thompson@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Robert','Thompson','+1-305-555-1003',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-ps-004','linda.martinez@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Linda','Martinez','+1-312-555-1004',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-ps-005','william.brown@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','William','Brown','+1-713-555-1005',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-ps-006','patricia.davis@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Patricia','Davis','+1-602-555-1006',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-ps-007','christopher.wilson@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Christopher','Wilson','+1-619-555-1007',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-ps-008','barbara.moore@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Barbara','Moore','+1-415-555-1008',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-ps-009','daniel.taylor@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Daniel','Taylor','+1-206-555-1009',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-ps-010','susan.anderson@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Susan','Anderson','+1-617-555-1010',0,1,1,NULL,'2025-12-19 11:16:49',NULL);
/*!40000 ALTER TABLE `global_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_dropoffs`
--

DROP TABLE IF EXISTS `order_dropoffs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_dropoffs` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `assigned_process_server_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `attempt_count` int DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `delivered_at` datetime(6) DEFAULT NULL,
  `dropoff_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `dropoff_type` enum('GUIDED','AUTOMATED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dropoff_zip_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `dropoff_state_id` int DEFAULT NULL,
  `dropoff_city_id` int DEFAULT NULL,
  `final_agreed_price` decimal(10,2) DEFAULT NULL,
  `max_attempts` int DEFAULT NULL,
  `recipient_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sequence_number` int NOT NULL,
  `status` enum('OPEN','PENDING','BIDDING','ASSIGNED','IN_PROGRESS','DELIVERED','FAILED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `base_price` decimal(10,2) DEFAULT NULL,
  `remote_location` bit(1) DEFAULT NULL,
  `remote_location_fee` decimal(10,2) DEFAULT NULL,
  `rush_service` bit(1) DEFAULT NULL,
  `rush_service_fee` decimal(10,2) DEFAULT NULL,
  `is_rush` tinyint(1) DEFAULT '0',
  `is_remote` tinyint(1) DEFAULT '0',
  `service_fee` decimal(10,2) DEFAULT '0.00',
  `service_type` enum('PROCESS_SERVICE','CERTIFIED_MAIL') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKo1qwipd6w1j6ligr81o0ox5ro` (`order_id`),
  KEY `idx_dropoff_state` (`dropoff_state_id`),
  KEY `idx_dropoff_city` (`dropoff_city_id`),
  CONSTRAINT `fk_dropoffs_city` FOREIGN KEY (`dropoff_city_id`) REFERENCES `usa_cities` (`id`),
  CONSTRAINT `fk_dropoffs_state` FOREIGN KEY (`dropoff_state_id`) REFERENCES `usa_states` (`id`),
  CONSTRAINT `FKo1qwipd6w1j6ligr81o0ox5ro` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_dropoffs`
--

LOCK TABLES `order_dropoffs` WRITE;
/*!40000 ALTER TABLE `order_dropoffs` DISABLE KEYS */;
INSERT INTO `order_dropoffs` VALUES ('2fa08054-5743-4dd4-8f53-b5f5420b3d8b','ps-profile-001',0,'2025-12-25 18:49:40.316803',NULL,'ksaciasbsa','GUIDED','75201',NULL,NULL,456.00,5,'ksbacsa',2,'ASSIGNED','eb430a88-2dbb-441b-8735-6e338956b61d',75.00,_binary '',30.00,_binary '',50.00,0,0,0.00,'CERTIFIED_MAIL'),('5358efe4-2f46-43fe-8389-7c2d874bc2d1',NULL,0,'2025-12-25 17:20:25.729039',NULL,'a,dnxoasncxoasnc','AUTOMATED','10001',NULL,NULL,NULL,5,'gvhjvjh',1,'OPEN','ade060d0-8eb3-4f5d-88ef-bcb753ffdab1',NULL,_binary '\0',NULL,_binary '\0',NULL,0,0,0.00,'PROCESS_SERVICE'),('7123bd33-058e-4afb-9e47-72f3f0ea26e8',NULL,0,'2025-12-25 18:49:40.312626',NULL,'snckjsa','AUTOMATED','14201',NULL,NULL,0.00,5,'ckjzsn',1,'OPEN','eb430a88-2dbb-441b-8735-6e338956b61d',75.00,_binary '',30.00,_binary '',50.00,0,0,0.00,'CERTIFIED_MAIL'),('7df6acf4-3045-4b76-b397-edcab40857a6','ps-profile-001',0,'2025-12-25 17:20:25.732879',NULL,'cascinacs','GUIDED','75201',NULL,NULL,400.00,5,'kdjshioncs',2,'ASSIGNED','ade060d0-8eb3-4f5d-88ef-bcb753ffdab1',NULL,_binary '\0',NULL,_binary '\0',NULL,0,0,0.00,'PROCESS_SERVICE'),('b3cfd5f4-c004-4515-ba89-9f25025e48b8','',0,'2025-12-19 22:22:50.416276',NULL,'cdcds ds','GUIDED','vs ds ds ',NULL,NULL,12321.00,5,'ckdsbiuc',1,'ASSIGNED','08a65bd1-c606-404f-a9e0-b2999454aed6',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('d224fba9-0070-40c5-aa26-7f05d11832b7',NULL,0,'2025-12-25 18:51:57.278827',NULL,'sacnsalnc','AUTOMATED','95814',NULL,NULL,0.00,5,'saknkwac',1,'OPEN','800c031f-0f73-4c57-9772-f1517189a5d5',75.00,_binary '',30.00,_binary '',50.00,0,0,0.00,'CERTIFIED_MAIL'),('drop-asg-001','ps-profile-001',0,'2025-12-18 17:50:28.000000',NULL,'234 Elm Street, Dallas, TX 75203','GUIDED','75203',NULL,NULL,NULL,3,'Robert Johnson',1,'ASSIGNED','ord-asg-001',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-asg-002','ps-profile-002',0,'2025-12-17 17:50:28.000000',NULL,'567 Fifth Ave, New York, NY 10003','GUIDED','10003',NULL,NULL,NULL,3,'Lisa Anderson',1,'ASSIGNED','ord-asg-002',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-bid-001',NULL,0,'2025-12-17 17:50:28.000000',NULL,'789 Commerce St, Dallas, TX 75202','AUTOMATED','75202',NULL,NULL,NULL,3,'Emily Rodriguez',1,'OPEN','ord-bid-001',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-bid-002',NULL,0,'2025-12-18 17:50:28.000000',NULL,'123 Broadway, New York, NY 10001','AUTOMATED','10001',NULL,NULL,NULL,3,'David Kim',1,'OPEN','ord-bid-002',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-bid-003',NULL,0,'2025-12-19 14:50:28.000000',NULL,'456 Beach Blvd, Miami, FL 33140','AUTOMATED','33140',NULL,NULL,NULL,3,'Maria Santos',1,'OPEN','ord-bid-003',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c1-001','ps-profile-001',2,'2025-12-09 17:01:52.000000','2025-12-14 17:01:52.000000','2345 Oak Street, Apt 4B, Dallas, TX 75202','GUIDED','75202',NULL,NULL,150.00,3,'John Richardson',1,'DELIVERED','ord-c1-001',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c1-002','ps-profile-001',1,'2025-12-16 17:01:52.000000',NULL,'789 Elm Avenue, Fort Worth, TX 76102','GUIDED','76102',NULL,NULL,NULL,3,'Lisa Thompson',1,'IN_PROGRESS','ord-c1-002',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c1-003',NULL,0,'2025-12-18 17:01:52.000000',NULL,'456 Park Lane, Dallas, TX 75203','AUTOMATED','75203',NULL,NULL,NULL,3,'Michael Davis',1,'OPEN','ord-c1-003',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c1-004','ps-profile-001',1,'2025-12-01 17:01:52.000000','2025-12-09 17:01:52.000000','123 Cedar Road, Plano, TX 75201','GUIDED','75201',NULL,NULL,140.00,3,'Sarah Martinez',1,'DELIVERED','ord-c1-004',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c1-005',NULL,0,'2025-12-19 17:01:52.000000',NULL,'890 Maple Drive, Dallas, TX 75202','AUTOMATED','75202',NULL,NULL,NULL,3,'James Wilson',1,'OPEN','ord-c1-005',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c1-006','ps-profile-001',3,'2025-11-27 17:01:52.000000','2025-12-04 17:01:52.000000','234 Pine Street, Irving, TX 76051','GUIDED','76051',NULL,NULL,160.00,3,'Emily Brown',1,'DELIVERED','ord-c1-006',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c1-007','ps-profile-001',2,'2025-12-14 17:01:52.000000',NULL,'567 Birch Avenue, Dallas, TX 75203','GUIDED','75203',NULL,NULL,NULL,3,'Robert Lee',1,'IN_PROGRESS','ord-c1-007',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c1-008',NULL,0,'2025-12-19 17:01:52.000000',NULL,'678 Willow Lane, Fort Worth, TX 76102','AUTOMATED','76102',NULL,NULL,NULL,3,'Amanda Clark',1,'OPEN','ord-c1-008',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c1-009','ps-profile-001',2,'2025-11-21 17:01:52.000000','2025-11-29 17:01:52.000000','345 Spruce Court, Dallas, TX 75201','GUIDED','75201',NULL,NULL,130.00,3,'David Garcia',1,'DELIVERED','ord-c1-009',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c1-010',NULL,0,'2025-12-19 17:01:52.000000',NULL,'901 Ash Boulevard, Plano, TX 75201','AUTOMATED','75201',NULL,NULL,NULL,3,'Jennifer White',1,'OPEN','ord-c1-010',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c2-001','ps-profile-002',1,'2025-12-07 17:01:52.000000','2025-12-13 17:01:52.000000','789 Broadway, Apt 15C, New York, NY 10003','GUIDED','10003',NULL,NULL,175.00,3,'Peter Johnson',1,'DELIVERED','ord-c2-001',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c2-002','ps-profile-002',2,'2025-12-14 17:01:52.000000',NULL,'456 Park Avenue South, New York, NY 10002','GUIDED','10002',NULL,NULL,NULL,3,'Maria Rodriguez',1,'IN_PROGRESS','ord-c2-002',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c2-003',NULL,0,'2025-12-17 17:01:52.000000',NULL,'234 Atlantic Avenue, Brooklyn, NY 11201','AUTOMATED','11201',NULL,NULL,NULL,3,'Thomas Anderson',1,'OPEN','ord-c2-003',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c2-004','ps-profile-002',2,'2025-12-01 17:01:52.000000','2025-12-07 17:01:52.000000','567 Queens Boulevard, Queens, NY 11215','GUIDED','11215',NULL,NULL,145.00,3,'Linda Chen',1,'DELIVERED','ord-c2-004',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c2-005',NULL,0,'2025-12-19 17:01:52.000000',NULL,'890 Madison Avenue, New York, NY 10001','AUTOMATED','10001',NULL,NULL,NULL,3,'Richard Park',1,'OPEN','ord-c2-005',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c2-006','ps-profile-002',1,'2025-12-16 17:01:52.000000',NULL,'123 Lexington Ave, New York, NY 10002','GUIDED','10002',NULL,NULL,NULL,3,'Susan Kim',1,'IN_PROGRESS','ord-c2-006',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c3-001','ps-profile-003',1,'2025-12-05 17:01:52.000000','2025-12-11 17:01:52.000000','456 Ocean Drive, Miami Beach, FL 33139','GUIDED','33139',NULL,NULL,155.00,3,'Carlos Mendez',1,'DELIVERED','ord-c3-001',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c3-002','ps-profile-003',2,'2025-12-13 17:01:52.000000',NULL,'789 Biscayne Boulevard, Miami, FL 33131','GUIDED','33131',NULL,NULL,NULL,3,'Ana Fernandez',1,'IN_PROGRESS','ord-c3-002',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c3-003',NULL,0,'2025-12-18 17:01:52.000000',NULL,'234 Coral Way, Coral Gables, FL 33134','AUTOMATED','33134',NULL,NULL,NULL,3,'Miguel Santos',1,'OPEN','ord-c3-003',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c3-004',NULL,0,'2025-12-19 17:01:52.000000',NULL,'567 SW 8th Street, Miami, FL 33101','AUTOMATED','33101',NULL,NULL,NULL,3,'Isabella Garcia',1,'OPEN','ord-c3-004',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c3-005','ps-profile-003',2,'2025-12-03 17:01:52.000000','2025-12-09 17:01:52.000000','890 Collins Avenue, Miami Beach, FL 33139','GUIDED','33139',NULL,NULL,165.00,3,'Diego Ramirez',1,'DELIVERED','ord-c3-005',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c3-006','ps-profile-003',1,'2025-12-15 17:01:52.000000',NULL,'123 Miracle Mile, Coral Gables, FL 33134','GUIDED','33134',NULL,NULL,NULL,3,'Sofia Martinez',1,'IN_PROGRESS','ord-c3-006',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c3-007',NULL,0,'2025-12-19 17:01:52.000000',NULL,'345 Flagler Street, Miami, FL 33131','AUTOMATED','33131',NULL,NULL,NULL,3,'Juan Lopez',1,'OPEN','ord-c3-007',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c3-008','ps-profile-003',3,'2025-11-27 17:01:52.000000','2025-12-03 17:01:52.000000','678 NW 7th Avenue, Miami, FL 33101','GUIDED','33101',NULL,NULL,180.00,3,'Carmen Diaz',1,'DELIVERED','ord-c3-008',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c4-001','ps-profile-004',1,'2025-12-09 17:01:52.000000','2025-12-15 17:01:52.000000','456 Michigan Avenue, Chicago, IL 60611','GUIDED','60611',NULL,NULL,125.00,3,'William O\'Brien',1,'DELIVERED','ord-c4-001',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c4-002','ps-profile-004',2,'2025-12-16 17:01:52.000000',NULL,'789 State Street, Chicago, IL 60602','GUIDED','60602',NULL,NULL,NULL,3,'Mary Johnson',1,'IN_PROGRESS','ord-c4-002',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c4-003',NULL,0,'2025-12-19 17:01:52.000000',NULL,'234 LaSalle Street, Chicago, IL 60603','AUTOMATED','60603',NULL,NULL,NULL,3,'Patrick Murphy',1,'OPEN','ord-c4-003',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c5-001','ps-profile-005',1,'2025-12-14 17:01:52.000000',NULL,'567 Main Street, Houston, TX 77002','GUIDED','77002',NULL,NULL,NULL,3,'Rebecca Smith',1,'IN_PROGRESS','ord-c5-001',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-c5-002',NULL,0,'2025-12-19 17:01:52.000000',NULL,'890 Travis Street, Houston, TX 77003','AUTOMATED','77003',NULL,NULL,NULL,3,'Christopher Lee',1,'OPEN','ord-c5-002',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-canc-001',NULL,0,'2025-12-16 17:50:28.000000',NULL,'789 Travis St, Houston, TX 77003','AUTOMATED','77003',NULL,NULL,NULL,3,'Patricia Davis',1,'OPEN','ord-canc-001',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-canc-002',NULL,0,'2025-12-14 17:50:28.000000',NULL,'345 Ross Ave, Dallas, TX 75204','AUTOMATED','75204',NULL,NULL,NULL,3,'James Wilson',1,'OPEN','ord-canc-002',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-fail-001','ps-profile-003',3,'2025-12-09 17:50:28.000000',NULL,'890 Collins Ave, Miami, FL 33141','GUIDED','33141',NULL,NULL,NULL,3,'Carlos Mendez',1,'FAILED','ord-fail-001',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE'),('drop-fail-002','ps-profile-004',3,'2025-12-04 17:50:28.000000',NULL,'432 Lake Shore Dr, Chicago, IL 60602','GUIDED','60602',NULL,NULL,NULL,3,'Nancy White',1,'FAILED','ord-fail-002',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE');
/*!40000 ALTER TABLE `order_dropoffs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_messages`
--

DROP TABLE IF EXISTS `order_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_messages` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_role` enum('CUSTOMER','ADMIN','SERVER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `message_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_messages_order_id` (`order_id`),
  KEY `idx_order_messages_created_at` (`created_at`),
  KEY `idx_order_messages_sender` (`sender_id`),
  KEY `idx_messages_unread` (`order_id`,`is_read`),
  CONSTRAINT `order_messages_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_messages`
--

LOCK TABLES `order_messages` WRITE;
/*!40000 ALTER TABLE `order_messages` DISABLE KEYS */;
INSERT INTO `order_messages` VALUES ('9516bb03-ec56-421f-a444-3fa2d2cdeb1b','test-order-chat-001','cust-001','CUSTOMER','Hello! This is my first chat message.',0,'2025-12-25 06:39:16',NULL),('f1998f99-cc43-461b-b8b5-534ee5bf981a','test-order-chat-001','admin-001','ADMIN','Reply from admin',0,'2025-12-25 06:39:16',NULL);
/*!40000 ALTER TABLE `order_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_modifications`
--

DROP TABLE IF EXISTS `order_modifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_modifications` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `modified_by_user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `modification_type` enum('UPDATE_DETAILS','CANCEL','ADD_DROPOFF','REMOVE_DROPOFF','MODIFY_DROPOFF','UPDATE_DEADLINE','UPDATE_INSTRUCTIONS') COLLATE utf8mb4_unicode_ci NOT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `modification_reason` text COLLATE utf8mb4_unicode_ci,
  `modified_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_modifications_order_id` (`order_id`),
  KEY `idx_order_modifications_modified_at` (`modified_at`),
  CONSTRAINT `order_modifications_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_modifications`
--

LOCK TABLES `order_modifications` WRITE;
/*!40000 ALTER TABLE `order_modifications` DISABLE KEYS */;
INSERT INTO `order_modifications` VALUES ('39fc2606-d2dd-4c65-b636-26cef6fbc857','ord-bid-001','test-user-verification','UPDATE_DETAILS','{\"deadline\": \"2025-12-25T18:00\", \"orderType\": \"PROCESS_SERVICE\", \"caseNumber\": \"CASE-TEST-2025-001\", \"documentType\": \"SUBPOENA\", \"dropoffCount\": 1, \"jurisdiction\": \"Superior Court - Test County\", \"specialInstructions\": \"UPDATED: Testing order update - please call ahead\"}','{\"deadline\": \"2025-12-25T18:00\", \"orderType\": \"PROCESS_SERVICE\", \"caseNumber\": \"CASE-TEST-2025-001\", \"documentType\": \"SUBPOENA\", \"dropoffCount\": 1, \"jurisdiction\": \"Superior Court - Test County\", \"specialInstructions\": \"Final verification test\"}','Verifying Requirement 8 implementation','2025-12-25 05:36:44'),('637d19e4-c176-45c2-8a0c-3605854f6916','ord-bid-001','test-user-001','UPDATE_DETAILS','{\"deadline\": \"2025-12-25T18:00\", \"orderType\": \"null\", \"caseNumber\": \"null\", \"documentType\": \"null\", \"dropoffCount\": 1, \"jurisdiction\": \"null\", \"specialInstructions\": \"null\"}','{\"deadline\": \"2025-12-25T18:00\", \"orderType\": \"PROCESS_SERVICE\", \"caseNumber\": \"CASE-TEST-2025-001\", \"documentType\": \"SUBPOENA\", \"dropoffCount\": 1, \"jurisdiction\": \"Superior Court - Test County\", \"specialInstructions\": \"UPDATED: Testing order update - please call ahead\"}','Testing Requirement 8 update functionality','2025-12-25 05:13:26'),('888107e7-9ceb-4d4d-8b9d-8c535c63e7b0','ord-c1-003','test-user-001','CANCEL','{\"status\": \"OPEN\"}','{\"status\": \"CANCELLED\"}','Testing cancellation - client request - Full refund to be processed','2025-12-25 05:14:01'),('8bf55680-32c4-4150-9cb8-efb6ad185bf4','800c031f-0f73-4c57-9772-f1517189a5d5','user-cust-001','CANCEL','{\"status\": \"OPEN\"}','{\"status\": \"CANCELLED\"}','wqcqwc - cqwwcwq','2025-12-25 13:22:06');
/*!40000 ALTER TABLE `order_modifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `assigned_at` datetime(6) DEFAULT NULL,
  `commission_rate_applied` decimal(5,2) DEFAULT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `last_modified_at` timestamp NULL DEFAULT NULL COMMENT 'Timestamp of last modification to order details',
  `modification_count` int DEFAULT '0' COMMENT 'Number of times order has been modified after creation',
  `created_at` datetime(6) DEFAULT NULL,
  `customer_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_payment_amount` decimal(10,2) DEFAULT NULL,
  `deadline` datetime(6) NOT NULL,
  `final_agreed_price` decimal(10,2) DEFAULT NULL,
  `has_multiple_dropoffs` bit(1) DEFAULT NULL,
  `order_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `pricing_config` json DEFAULT NULL,
  `process_server_payout` decimal(10,2) DEFAULT NULL,
  `special_instructions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('DRAFT','OPEN','BIDDING','PARTIALLY_ASSIGNED','ASSIGNED','IN_PROGRESS','COMPLETED','FAILED','CANCELLED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_editable` tinyint(1) DEFAULT '1' COMMENT 'Indicates if order can be edited. FALSE for ASSIGNED/IN_PROGRESS/COMPLETED statuses',
  `super_admin_fee` decimal(10,2) DEFAULT NULL,
  `tenant_commission` decimal(10,2) DEFAULT NULL,
  `tenant_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_profit` decimal(10,2) DEFAULT NULL,
  `total_dropoffs` int DEFAULT NULL,
  `case_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `document_type` enum('CRIMINAL_CASE','CIVIL_COMPLAINT','RESTRAINING_ORDER','HOUSE_ARREST','EVICTION_NOTICE','SUBPOENA','DIVORCE_PAPERS','CHILD_CUSTODY','SMALL_CLAIMS','BANKRUPTCY','OTHER') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jurisdiction` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_type` enum('PROCESS_SERVICE','CERTIFIED_MAIL') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `other_document_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_nthkiu7pgmnqnu86i2jyoe2v7` (`order_number`),
  KEY `idx_orders_is_editable` (`is_editable`),
  KEY `idx_orders_last_modified` (`last_modified_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES ('08a65bd1-c606-404f-a9e0-b2999454aed6','2025-12-19 22:22:50.350268',NULL,NULL,NULL,0,'2025-12-19 22:22:50.376625','tur-cust-001',14169.15,'2025-12-19 22:22:00.000000',NULL,_binary '\0','C-001-ORD13',NULL,12321.00,'cwecwc','ASSIGNED',0,92.41,1848.15,'tenant-main-001',1755.74,1,NULL,NULL,NULL,NULL,NULL),('800c031f-0f73-4c57-9772-f1517189a5d5',NULL,NULL,NULL,'2025-12-25 13:22:06',1,'2025-12-25 18:51:57.272498','tur-cust-001',0.00,'2025-12-31 18:51:00.000000',NULL,_binary '\0','C-001-ORD16',NULL,0.00,'kciNCX','CANCELLED',0,0.00,0.00,'tenant-main-001',0.00,1,'bxiuabXA','EVICTION_NOTICE','XNAKSJN','PROCESS_SERVICE',NULL),('ade060d0-8eb3-4f5d-88ef-bcb753ffdab1',NULL,NULL,NULL,'2025-12-25 11:50:25',1,'2025-12-25 17:20:25.679870','tur-cust-001',460.00,'2025-12-30 17:20:00.000000',NULL,_binary '','C-001-ORD14',NULL,400.00,'asjcnsanc','PARTIALLY_ASSIGNED',0,3.00,60.00,'tenant-main-001',57.00,2,NULL,NULL,NULL,'PROCESS_SERVICE',NULL),('eb430a88-2dbb-441b-8735-6e338956b61d',NULL,NULL,NULL,'2025-12-25 13:19:40',1,'2025-12-25 18:49:40.275887','tur-cust-001',524.40,'2025-12-26 18:48:00.000000',NULL,_binary '','C-001-ORD15',NULL,456.00,'as,caksjnbcasncs','PARTIALLY_ASSIGNED',0,3.42,68.40,'tenant-main-001',64.98,2,'iodjsnvinda','DIVORCE_PAPERS','cascnsaincs','PROCESS_SERVICE',NULL),('ord-asg-001','2025-12-19 05:50:28.000000',NULL,NULL,NULL,0,'2025-12-18 17:50:28.000000','tur-cust-001',NULL,'2025-12-24 14:00:00.000000',NULL,NULL,'ORD-2025-033',NULL,NULL,NULL,'ASSIGNED',0,NULL,NULL,'tenant-main-001',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-asg-002','2025-12-18 17:50:28.000000',NULL,NULL,NULL,0,'2025-12-17 17:50:28.000000','tur-cust-002',NULL,'2025-12-23 15:00:00.000000',NULL,NULL,'ORD-2025-034',NULL,NULL,NULL,'ASSIGNED',0,NULL,NULL,'tenant-main-001',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-bid-001',NULL,NULL,NULL,'2025-12-25 05:36:43',2,'2025-12-17 17:50:28.000000','tur-cust-001',NULL,'2025-12-25 18:00:00.000000',NULL,_binary '\0','ORD-2025-030',NULL,NULL,'Final verification test','BIDDING',1,NULL,NULL,'tenant-main-001',NULL,1,'CASE-TEST-2025-001','SUBPOENA','Superior Court - Test County','PROCESS_SERVICE',NULL),('ord-bid-002',NULL,NULL,NULL,NULL,0,'2025-12-18 17:50:28.000000','tur-cust-002',NULL,'2025-12-26 17:00:00.000000',NULL,NULL,'ORD-2025-031',NULL,NULL,NULL,'BIDDING',1,NULL,NULL,'tenant-main-001',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-bid-003',NULL,NULL,NULL,NULL,0,'2025-12-19 14:50:28.000000','tur-cust-003',NULL,'2025-12-27 16:00:00.000000',NULL,NULL,'ORD-2025-032',NULL,NULL,NULL,'BIDDING',1,NULL,NULL,'tenant-main-001',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-c1-001','2025-12-10 17:01:52.000000',15.00,'2025-12-14 17:01:52.000000',NULL,0,'2025-12-09 17:01:52.000000','tur-cust-001',172.50,'2025-12-24 17:01:52.000000',150.00,_binary '\0','ORD-2025-001',NULL,150.00,NULL,'COMPLETED',0,1.13,22.50,'tenant-main-001',21.37,1,NULL,NULL,NULL,NULL,NULL),('ord-c1-002','2025-12-17 17:01:52.000000',NULL,NULL,NULL,0,'2025-12-16 17:01:52.000000','tur-cust-002',NULL,'2025-12-26 17:01:52.000000',NULL,_binary '\0','ORD-2025-002',NULL,NULL,NULL,'IN_PROGRESS',0,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL),('ord-c1-003',NULL,NULL,NULL,'2025-12-25 05:14:01',1,'2025-12-18 17:01:52.000000','tur-cust-001',NULL,'2025-12-29 17:01:52.000000',NULL,_binary '\0','ORD-2025-003',NULL,NULL,NULL,'CANCELLED',0,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL),('ord-c1-004','2025-12-04 17:01:52.000000',15.00,'2025-12-09 17:01:52.000000',NULL,0,'2025-12-01 17:01:52.000000','tur-cust-001',161.00,'2025-12-22 17:01:52.000000',140.00,_binary '\0','ORD-2025-004',NULL,140.00,NULL,'COMPLETED',0,1.05,21.00,'tenant-main-001',19.95,1,NULL,NULL,NULL,NULL,NULL),('ord-c1-005',NULL,NULL,NULL,NULL,0,'2025-12-19 17:01:52.000000','tur-cust-001',NULL,'2025-12-31 17:01:52.000000',NULL,_binary '\0','ORD-2025-005',NULL,NULL,NULL,'OPEN',1,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL),('ord-c1-006','2025-11-29 17:01:52.000000',15.00,'2025-12-04 17:01:52.000000',NULL,0,'2025-11-27 17:01:52.000000','tur-cust-001',184.00,'2025-12-27 17:01:52.000000',160.00,_binary '\0','ORD-2025-006',NULL,160.00,NULL,'COMPLETED',0,1.20,24.00,'tenant-main-001',22.80,1,NULL,NULL,NULL,NULL,NULL),('ord-c1-007','2025-12-15 17:01:52.000000',NULL,NULL,NULL,0,'2025-12-14 17:01:52.000000','tur-cust-001',NULL,'2025-12-25 17:01:52.000000',NULL,_binary '\0','ORD-2025-007',NULL,NULL,NULL,'IN_PROGRESS',0,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL),('ord-c1-008',NULL,NULL,NULL,NULL,0,'2025-12-19 17:01:52.000000','tur-cust-001',NULL,'2026-01-03 17:01:52.000000',NULL,_binary '\0','ORD-2025-008',NULL,NULL,NULL,'OPEN',1,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL),('ord-c1-009','2025-11-24 17:01:52.000000',15.00,'2025-11-29 17:01:52.000000',NULL,0,'2025-11-21 17:01:52.000000','tur-cust-001',149.50,'2025-12-23 17:01:52.000000',130.00,_binary '\0','ORD-2025-009',NULL,130.00,NULL,'COMPLETED',0,0.98,19.50,'tenant-main-001',18.52,1,NULL,NULL,NULL,NULL,NULL),('ord-c1-010',NULL,NULL,NULL,NULL,0,'2025-12-19 17:01:52.000000','tur-cust-001',NULL,'2026-01-02 17:01:52.000000',NULL,_binary '\0','ORD-2025-010',NULL,NULL,NULL,'OPEN',1,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL),('ord-c2-001','2025-12-08 17:01:52.000000',15.00,'2025-12-13 17:01:52.000000',NULL,0,'2025-12-07 17:01:52.000000','tur-cust-002',201.25,'2025-12-25 17:01:52.000000',175.00,_binary '\0','ORD-2025-011',NULL,175.00,NULL,'COMPLETED',0,1.31,26.25,'tenant-main-001',24.94,1,NULL,NULL,NULL,NULL,NULL),('ord-c2-002','2025-12-15 17:01:52.000000',NULL,NULL,NULL,0,'2025-12-14 17:01:52.000000','tur-cust-002',NULL,'2025-12-28 17:01:52.000000',NULL,_binary '\0','ORD-2025-012',NULL,NULL,NULL,'IN_PROGRESS',0,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL),('ord-c2-003',NULL,NULL,NULL,NULL,0,'2025-12-17 17:01:52.000000','tur-cust-002',NULL,'2025-12-30 17:01:52.000000',NULL,_binary '\0','ORD-2025-013',NULL,NULL,NULL,'OPEN',1,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL),('ord-c2-004','2025-12-02 17:01:52.000000',15.00,'2025-12-07 17:01:52.000000',NULL,0,'2025-12-01 17:01:52.000000','tur-cust-002',166.75,'2025-12-24 17:01:52.000000',145.00,_binary '\0','ORD-2025-014',NULL,145.00,NULL,'COMPLETED',0,1.09,21.75,'tenant-main-001',20.66,1,NULL,NULL,NULL,NULL,NULL),('ord-c2-005',NULL,NULL,NULL,NULL,0,'2025-12-19 17:01:52.000000','tur-cust-002',NULL,'2026-01-01 17:01:52.000000',NULL,_binary '\0','ORD-2025-015',NULL,NULL,NULL,'OPEN',1,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL),('ord-c2-006','2025-12-17 17:01:52.000000',NULL,NULL,NULL,0,'2025-12-16 17:01:52.000000','tur-cust-002',NULL,'2025-12-26 17:01:52.000000',NULL,_binary '\0','ORD-2025-016',NULL,NULL,NULL,'IN_PROGRESS',0,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL),('ord-c3-001','2025-12-06 17:01:52.000000',15.00,'2025-12-11 17:01:52.000000',NULL,0,'2025-12-05 17:01:52.000000','tur-cust-003',178.25,'2025-12-23 17:01:52.000000',155.00,_binary '\0','ORD-2025-017',NULL,155.00,NULL,'COMPLETED',0,1.16,23.25,'tenant-main-001',22.09,1,NULL,NULL,NULL,NULL,NULL),('ord-c3-002','2025-12-14 17:01:52.000000',NULL,NULL,NULL,0,'2025-12-13 17:01:52.000000','tur-cust-003',NULL,'2025-12-27 17:01:52.000000',NULL,_binary '\0','ORD-2025-018',NULL,NULL,NULL,'IN_PROGRESS',0,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL),('ord-c3-003',NULL,NULL,NULL,NULL,0,'2025-12-18 17:01:52.000000','tur-cust-003',NULL,'2025-12-29 17:01:52.000000',NULL,_binary '\0','ORD-2025-019',NULL,NULL,NULL,'OPEN',1,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL),('ord-c3-004',NULL,NULL,NULL,NULL,0,'2025-12-19 17:01:52.000000','tur-cust-003',NULL,'2025-12-31 17:01:52.000000',NULL,_binary '\0','ORD-2025-020',NULL,NULL,NULL,'OPEN',1,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL),('ord-c3-005','2025-12-04 17:01:52.000000',15.00,'2025-12-09 17:01:52.000000',NULL,0,'2025-12-03 17:01:52.000000','tur-cust-003',189.75,'2025-12-22 17:01:52.000000',165.00,_binary '\0','ORD-2025-021',NULL,165.00,NULL,'COMPLETED',0,1.24,24.75,'tenant-main-001',23.51,1,NULL,NULL,NULL,NULL,NULL),('ord-c3-006','2025-12-16 17:01:52.000000',NULL,NULL,NULL,0,'2025-12-15 17:01:52.000000','tur-cust-003',NULL,'2025-12-28 17:01:52.000000',NULL,_binary '\0','ORD-2025-022',NULL,NULL,NULL,'IN_PROGRESS',0,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL),('ord-c3-007',NULL,NULL,NULL,NULL,0,'2025-12-19 17:01:52.000000','tur-cust-003',NULL,'2026-01-03 17:01:52.000000',NULL,_binary '\0','ORD-2025-023',NULL,NULL,NULL,'OPEN',1,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL),('ord-c3-008','2025-11-28 17:01:52.000000',15.00,'2025-12-03 17:01:52.000000',NULL,0,'2025-11-27 17:01:52.000000','tur-cust-003',207.00,'2025-12-24 17:01:52.000000',180.00,_binary '\0','ORD-2025-024',NULL,180.00,NULL,'COMPLETED',0,1.35,27.00,'tenant-main-001',25.65,1,NULL,NULL,NULL,NULL,NULL),('ord-c4-001','2025-12-10 17:01:52.000000',15.00,'2025-12-15 17:01:52.000000',NULL,0,'2025-12-09 17:01:52.000000','tur-cust-004',143.75,'2025-12-26 17:01:52.000000',125.00,_binary '\0','ORD-2025-025',NULL,125.00,NULL,'COMPLETED',0,0.94,18.75,'tenant-main-001',17.81,1,NULL,NULL,NULL,NULL,NULL),('ord-c4-002','2025-12-17 17:01:52.000000',NULL,NULL,NULL,0,'2025-12-16 17:01:52.000000','tur-cust-004',NULL,'2025-12-28 17:01:52.000000',NULL,_binary '\0','ORD-2025-026',NULL,NULL,NULL,'IN_PROGRESS',0,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL),('ord-c4-003',NULL,NULL,NULL,NULL,0,'2025-12-19 17:01:52.000000','tur-cust-004',NULL,'2025-12-30 17:01:52.000000',NULL,_binary '\0','ORD-2025-027',NULL,NULL,NULL,'OPEN',1,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL),('ord-c5-001','2025-12-15 17:01:52.000000',NULL,NULL,NULL,0,'2025-12-14 17:01:52.000000','tur-cust-005',NULL,'2025-12-27 17:01:52.000000',NULL,_binary '\0','ORD-2025-028',NULL,NULL,NULL,'IN_PROGRESS',0,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL),('ord-c5-002',NULL,NULL,NULL,NULL,0,'2025-12-19 17:01:52.000000','tur-cust-005',NULL,'2025-12-31 17:01:52.000000',NULL,_binary '\0','ORD-2025-029',NULL,NULL,NULL,'OPEN',1,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL),('ord-canc-001',NULL,NULL,NULL,NULL,0,'2025-12-16 17:50:28.000000','tur-cust-005',NULL,'2025-12-20 09:00:00.000000',NULL,NULL,'ORD-2025-037',NULL,NULL,NULL,'CANCELLED',0,NULL,NULL,'tenant-main-001',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-canc-002',NULL,NULL,NULL,NULL,0,'2025-12-14 17:50:28.000000','tur-cust-001',NULL,'2025-12-22 11:00:00.000000',NULL,NULL,'ORD-2025-038',NULL,NULL,NULL,'CANCELLED',0,NULL,NULL,'tenant-main-001',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-fail-001','2025-12-10 17:50:28.000000',NULL,'2025-12-14 17:50:28.000000',NULL,0,'2025-12-09 17:50:28.000000','tur-cust-003',NULL,'2025-12-15 12:00:00.000000',NULL,NULL,'ORD-2025-035',NULL,NULL,NULL,'FAILED',0,NULL,NULL,'tenant-main-001',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-fail-002','2025-12-05 17:50:28.000000',NULL,'2025-12-10 17:50:28.000000',NULL,0,'2025-12-04 17:50:28.000000','tur-cust-004',NULL,'2025-12-10 10:00:00.000000',NULL,NULL,'ORD-2025-036',NULL,NULL,NULL,'FAILED',0,NULL,NULL,'tenant-main-001',NULL,NULL,NULL,NULL,NULL,NULL,NULL),('test-order-chat-001',NULL,NULL,NULL,NULL,0,'2025-12-25 12:09:09.000000','cust-001',NULL,'2025-12-31 23:59:59.000000',NULL,NULL,'ORD-TEST-001',NULL,NULL,'Test order for chat','OPEN',1,NULL,NULL,'tenant-001',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `before_order_status_update` BEFORE UPDATE ON `orders` FOR EACH ROW BEGIN
    -- Update is_editable based on new status
    IF NEW.status IN ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED', 'PARTIALLY_ASSIGNED') THEN
        SET NEW.is_editable = FALSE;
    ELSEIF NEW.status IN ('DRAFT', 'OPEN', 'BIDDING') THEN
        SET NEW.is_editable = TRUE;
    END IF;
    
    -- Update last_modified_at if order fields changed
    IF OLD.special_instructions <> NEW.special_instructions
        OR OLD.deadline <> NEW.deadline
        OR OLD.status <> NEW.status THEN
        SET NEW.last_modified_at = CURRENT_TIMESTAMP;
        SET NEW.modification_count = OLD.modification_count + 1;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `process_server_profiles`
--

DROP TABLE IF EXISTS `process_server_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `process_server_profiles` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_user_role_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_global` tinyint(1) DEFAULT '0',
  `operating_zip_codes` json DEFAULT NULL,
  `status` enum('PENDING_APPROVAL','ACTIVE','SUSPENDED','BANNED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `current_rating` decimal(3,2) DEFAULT NULL,
  `total_orders_assigned` int DEFAULT '0',
  `successful_deliveries` int DEFAULT '0',
  `failed_after_max_attempts` int DEFAULT '0',
  `total_attempts` int DEFAULT '0',
  `average_attempts_per_delivery` decimal(4,2) DEFAULT '0.00',
  `is_red_zone` tinyint(1) DEFAULT '0',
  `red_zone_trigger_count` int DEFAULT '0',
  `verification_docs` json DEFAULT NULL,
  `profile_photo_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
-- Dumping data for table `process_server_profiles`
--

LOCK TABLES `process_server_profiles` WRITE;
/*!40000 ALTER TABLE `process_server_profiles` DISABLE KEYS */;
INSERT INTO `process_server_profiles` VALUES ('ps-profile-001','tur-ps-001','tenant-main-001',1,'[\"75201\", \"75202\", \"75203\", \"76102\", \"76051\"]','ACTIVE',4.80,6,4,0,11,2.75,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000'),('ps-profile-002','tur-ps-002','tenant-main-001',1,'[\"10001\", \"10002\", \"10003\", \"11201\", \"11215\"]','ACTIVE',4.90,4,2,0,6,3.00,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000'),('ps-profile-003','tur-ps-003','tenant-main-001',1,'[\"33101\", \"33131\", \"33134\", \"33139\", \"33149\"]','ACTIVE',4.70,5,3,0,9,3.00,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000'),('ps-profile-004','tur-ps-004','tenant-main-001',0,'[\"60601\", \"60602\", \"60603\", \"60606\", \"60611\"]','ACTIVE',4.60,2,1,0,3,3.00,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000'),('ps-profile-005','tur-ps-005','tenant-main-001',0,'[\"77001\", \"77002\", \"77003\", \"77004\", \"77010\"]','ACTIVE',4.50,1,0,0,1,0.00,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000'),('ps-profile-006','tur-ps-006','tenant-main-001',1,'[\"85001\", \"85003\", \"85004\", \"85016\", \"85281\"]','ACTIVE',4.80,0,0,0,0,0.00,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000'),('ps-profile-007','tur-ps-007','tenant-main-001',0,'[\"92101\", \"92102\", \"92103\", \"92109\", \"91910\"]','ACTIVE',4.70,0,0,0,0,0.00,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000'),('ps-profile-008','tur-ps-008','tenant-main-001',1,'[\"94102\", \"94103\", \"94104\", \"94107\", \"94109\"]','ACTIVE',4.90,0,0,0,0,0.00,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000'),('ps-profile-009','tur-ps-009','tenant-main-001',0,'[\"98101\", \"98102\", \"98103\", \"98104\", \"98105\"]','ACTIVE',4.60,0,0,0,0,0.00,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000'),('ps-profile-010','tur-ps-010','tenant-main-001',1,'[\"02101\", \"02108\", \"02109\", \"02110\", \"02115\"]','ACTIVE',4.80,0,0,0,0,0.00,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000');
/*!40000 ALTER TABLE `process_server_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ratings`
--

DROP TABLE IF EXISTS `ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ratings` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `process_server_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `feedback` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ratings`
--

LOCK TABLES `ratings` WRITE;
/*!40000 ALTER TABLE `ratings` DISABLE KEYS */;
/*!40000 ALTER TABLE `ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_user_roles`
--

DROP TABLE IF EXISTS `tenant_user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_user_roles` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `global_user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('TENANT_ADMIN','CUSTOMER','PROCESS_SERVER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `tenant_user_roles_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_user_roles`
--

LOCK TABLES `tenant_user_roles` WRITE;
/*!40000 ALTER TABLE `tenant_user_roles` DISABLE KEYS */;
INSERT INTO `tenant_user_roles` VALUES ('3861fc53-4e3f-4cfa-b3db-275bf5b1c0ee','a8dcf0f8-f5b4-4a58-84ff-52ab56f35da3','tenant-main-001','CUSTOMER',1,'2025-12-19 16:30:23'),('93ad1041-5b0d-4437-ba3e-47758f0b3882','0ce9153f-c9dc-440f-8a5e-014c5ff3d8db','tenant-main-001','CUSTOMER',1,'2025-12-19 16:36:30'),('b1b3072d-7fc0-4c38-88f8-c28a05a8e743','a2264e3e-22da-4dc3-8f19-7523cad178f4','tenant-main-001','CUSTOMER',1,'2025-12-19 16:24:37'),('tur-cust-001','user-cust-001','tenant-main-001','CUSTOMER',1,'2025-12-19 11:16:49'),('tur-cust-002','user-cust-002','tenant-main-001','CUSTOMER',1,'2025-12-19 11:16:49'),('tur-cust-003','user-cust-003','tenant-main-001','CUSTOMER',1,'2025-12-19 11:16:49'),('tur-cust-004','user-cust-004','tenant-main-001','CUSTOMER',1,'2025-12-19 11:16:49'),('tur-cust-005','user-cust-005','tenant-main-001','CUSTOMER',1,'2025-12-19 11:16:49'),('tur-ps-001','user-ps-001','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49'),('tur-ps-002','user-ps-002','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49'),('tur-ps-003','user-ps-003','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49'),('tur-ps-004','user-ps-004','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49'),('tur-ps-005','user-ps-005','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49'),('tur-ps-006','user-ps-006','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49'),('tur-ps-007','user-ps-007','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49'),('tur-ps-008','user-ps-008','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49'),('tur-ps-009','user-ps-009','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49'),('tur-ps-010','user-ps-010','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49');
/*!40000 ALTER TABLE `tenant_user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenants` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `domain_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subdomain` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `api_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `business_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `business_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `business_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `business_category` enum('LEGAL_SERVICES','PROCESS_SERVING','COURIER','DELIVERY','OTHER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'PROCESS_SERVING',
  `business_type` enum('LLC','CORPORATION','SOLE_PROPRIETOR','PARTNERSHIP','NPO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'LLC',
  `contact_person_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_person_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_person_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `license_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timezone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'America/New_York',
  `currency` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `subscription_tier` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `business_hours` json DEFAULT NULL,
  `pricing_config` json DEFAULT NULL,
  `notification_settings` json DEFAULT NULL,
  `created_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES ('tenant-main-001','ProcessServe USA',NULL,'processserve-usa',NULL,NULL,NULL,NULL,'PROCESS_SERVING','LLC',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'America/New_York','USD',NULL,1,NULL,NULL,NULL,'2025-12-19 16:46:49.000000');
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usa_cities`
--

DROP TABLE IF EXISTS `usa_cities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usa_cities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `state_id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `zip_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `county` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cities_state` (`state_id`),
  KEY `idx_cities_zip` (`zip_code`),
  KEY `idx_cities_name` (`name`),
  KEY `idx_cities_state_name` (`state_id`,`name`),
  CONSTRAINT `usa_cities_ibfk_1` FOREIGN KEY (`state_id`) REFERENCES `usa_states` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usa_cities`
--

LOCK TABLES `usa_cities` WRITE;
/*!40000 ALTER TABLE `usa_cities` DISABLE KEYS */;
INSERT INTO `usa_cities` VALUES (1,5,'Los Angeles','90001','Los Angeles',34.0522000,-118.2437000,'2025-12-25 05:57:04'),(2,5,'San Francisco','94102','San Francisco',37.7749000,-122.4194000,'2025-12-25 05:57:04'),(3,5,'San Diego','92101','San Diego',32.7157000,-117.1611000,'2025-12-25 05:57:04'),(4,5,'San Jose','95101','Santa Clara',37.3382000,-121.8863000,'2025-12-25 05:57:04'),(5,5,'Sacramento','95814','Sacramento',38.5816000,-121.4944000,'2025-12-25 05:57:04'),(6,32,'New York','10001','New York',40.7128000,-74.0060000,'2025-12-25 05:57:04'),(7,32,'Buffalo','14201','Erie',42.8864000,-78.8784000,'2025-12-25 05:57:04'),(8,32,'Rochester','14604','Monroe',43.1566000,-77.6088000,'2025-12-25 05:57:04'),(9,32,'Albany','12207','Albany',42.6526000,-73.7562000,'2025-12-25 05:57:04'),(10,43,'Houston','77001','Harris',29.7604000,-95.3698000,'2025-12-25 05:57:04'),(11,43,'Dallas','75201','Dallas',32.7767000,-96.7970000,'2025-12-25 05:57:04'),(12,43,'Austin','78701','Travis',30.2672000,-97.7431000,'2025-12-25 05:57:04'),(13,43,'San Antonio','78201','Bexar',29.4241000,-98.4936000,'2025-12-25 05:57:04'),(14,9,'Miami','33101','Miami-Dade',25.7617000,-80.1918000,'2025-12-25 05:57:04'),(15,9,'Orlando','32801','Orange',28.5383000,-81.3792000,'2025-12-25 05:57:04'),(16,9,'Tampa','33602','Hillsborough',27.9506000,-82.4572000,'2025-12-25 05:57:04'),(17,9,'Jacksonville','32099','Duval',30.3322000,-81.6557000,'2025-12-25 05:57:04'),(18,13,'Chicago','60601','Cook',41.8781000,-87.6298000,'2025-12-25 05:57:04'),(19,13,'Springfield','62701','Sangamon',39.7817000,-89.6501000,'2025-12-25 05:57:04'),(20,13,'Naperville','60540','DuPage',41.7508000,-88.1535000,'2025-12-25 05:57:04'),(21,38,'Philadelphia','19019','Philadelphia',39.9526000,-75.1652000,'2025-12-25 05:57:04'),(22,38,'Pittsburgh','15201','Allegheny',40.4406000,-79.9959000,'2025-12-25 05:57:04'),(23,38,'Harrisburg','17101','Dauphin',40.2732000,-76.8867000,'2025-12-25 05:57:04'),(24,35,'Columbus','43004','Franklin',39.9612000,-82.9988000,'2025-12-25 05:57:04'),(25,35,'Cleveland','44101','Cuyahoga',41.4993000,-81.6944000,'2025-12-25 05:57:04'),(26,35,'Cincinnati','45201','Hamilton',39.1031000,-84.5120000,'2025-12-25 05:57:04'),(27,10,'Atlanta','30301','Fulton',33.7490000,-84.3880000,'2025-12-25 05:57:04'),(28,10,'Savannah','31401','Chatham',32.0809000,-81.0912000,'2025-12-25 05:57:04'),(29,10,'Augusta','30901','Richmond',33.4735000,-82.0105000,'2025-12-25 05:57:04'),(30,47,'Seattle','98101','King',47.6062000,-122.3321000,'2025-12-25 05:57:04'),(31,47,'Spokane','99201','Spokane',47.6588000,-117.4260000,'2025-12-25 05:57:04'),(32,47,'Tacoma','98401','Pierce',47.2529000,-122.4443000,'2025-12-25 05:57:04'),(33,21,'Boston','02101','Suffolk',42.3601000,-71.0589000,'2025-12-25 05:57:04'),(34,21,'Worcester','01601','Worcester',42.2626000,-71.8023000,'2025-12-25 05:57:04'),(35,21,'Cambridge','02138','Middlesex',42.3736000,-71.1097000,'2025-12-25 05:57:04');
/*!40000 ALTER TABLE `usa_cities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usa_states`
--

DROP TABLE IF EXISTS `usa_states`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usa_states` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abbreviation` varchar(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `abbreviation` (`abbreviation`),
  KEY `idx_states_abbr` (`abbreviation`),
  KEY `idx_states_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usa_states`
--

LOCK TABLES `usa_states` WRITE;
/*!40000 ALTER TABLE `usa_states` DISABLE KEYS */;
INSERT INTO `usa_states` VALUES (1,'Alabama','AL','2025-12-25 05:57:04'),(2,'Alaska','AK','2025-12-25 05:57:04'),(3,'Arizona','AZ','2025-12-25 05:57:04'),(4,'Arkansas','AR','2025-12-25 05:57:04'),(5,'California','CA','2025-12-25 05:57:04'),(6,'Colorado','CO','2025-12-25 05:57:04'),(7,'Connecticut','CT','2025-12-25 05:57:04'),(8,'Delaware','DE','2025-12-25 05:57:04'),(9,'Florida','FL','2025-12-25 05:57:04'),(10,'Georgia','GA','2025-12-25 05:57:04'),(11,'Hawaii','HI','2025-12-25 05:57:04'),(12,'Idaho','ID','2025-12-25 05:57:04'),(13,'Illinois','IL','2025-12-25 05:57:04'),(14,'Indiana','IN','2025-12-25 05:57:04'),(15,'Iowa','IA','2025-12-25 05:57:04'),(16,'Kansas','KS','2025-12-25 05:57:04'),(17,'Kentucky','KY','2025-12-25 05:57:04'),(18,'Louisiana','LA','2025-12-25 05:57:04'),(19,'Maine','ME','2025-12-25 05:57:04'),(20,'Maryland','MD','2025-12-25 05:57:04'),(21,'Massachusetts','MA','2025-12-25 05:57:04'),(22,'Michigan','MI','2025-12-25 05:57:04'),(23,'Minnesota','MN','2025-12-25 05:57:04'),(24,'Mississippi','MS','2025-12-25 05:57:04'),(25,'Missouri','MO','2025-12-25 05:57:04'),(26,'Montana','MT','2025-12-25 05:57:04'),(27,'Nebraska','NE','2025-12-25 05:57:04'),(28,'Nevada','NV','2025-12-25 05:57:04'),(29,'New Hampshire','NH','2025-12-25 05:57:04'),(30,'New Jersey','NJ','2025-12-25 05:57:04'),(31,'New Mexico','NM','2025-12-25 05:57:04'),(32,'New York','NY','2025-12-25 05:57:04'),(33,'North Carolina','NC','2025-12-25 05:57:04'),(34,'North Dakota','ND','2025-12-25 05:57:04'),(35,'Ohio','OH','2025-12-25 05:57:04'),(36,'Oklahoma','OK','2025-12-25 05:57:04'),(37,'Oregon','OR','2025-12-25 05:57:04'),(38,'Pennsylvania','PA','2025-12-25 05:57:04'),(39,'Rhode Island','RI','2025-12-25 05:57:04'),(40,'South Carolina','SC','2025-12-25 05:57:04'),(41,'South Dakota','SD','2025-12-25 05:57:04'),(42,'Tennessee','TN','2025-12-25 05:57:04'),(43,'Texas','TX','2025-12-25 05:57:04'),(44,'Utah','UT','2025-12-25 05:57:04'),(45,'Vermont','VT','2025-12-25 05:57:04'),(46,'Virginia','VA','2025-12-25 05:57:04'),(47,'Washington','WA','2025-12-25 05:57:04'),(48,'West Virginia','WV','2025-12-25 05:57:04'),(49,'Wisconsin','WI','2025-12-25 05:57:04'),(50,'Wyoming','WY','2025-12-25 05:57:04');
/*!40000 ALTER TABLE `usa_states` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_invitations`
--

DROP TABLE IF EXISTS `user_invitations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_invitations` (
  `id` varchar(36) NOT NULL,
  `activated_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `invitation_status` enum('PENDING','ACCEPTED','EXPIRED') NOT NULL,
  `invited_by_user_id` varchar(36) NOT NULL,
  `invited_email` varchar(255) NOT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `role` enum('CUSTOMER','PROCESS_SERVER') NOT NULL,
  `tenant_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_invitations`
--

LOCK TABLES `user_invitations` WRITE;
/*!40000 ALTER TABLE `user_invitations` DISABLE KEYS */;
INSERT INTO `user_invitations` VALUES ('e0657272-85f9-436a-b781-8011f07dd765',NULL,'2025-12-25 14:51:45.231151','2025-12-28 14:51:45.188667','hitansu08','PENDING','user-cust-001','hitansu08@gmail.com','','PROCESS_SERVER','tenant-1');
/*!40000 ALTER TABLE `user_invitations` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-25 19:25:08
