mysqldump: [Warning] Using a password on the command line interface can be insecure.
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
mysqldump: Error: 'Access denied; you need (at least one of) the PROCESS privilege(s) for this operation' when trying to dump tablespaces

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
-- Dumping data for table `bids`
--

LOCK TABLES `bids` WRITE;
/*!40000 ALTER TABLE `bids` DISABLE KEYS */;
/*!40000 ALTER TABLE `bids` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `contact_book_entries`
--

LOCK TABLES `contact_book_entries` WRITE;
/*!40000 ALTER TABLE `contact_book_entries` DISABLE KEYS */;
INSERT INTO `contact_book_entries` (`id`, `owner_user_id`, `process_server_id`, `entry_type`, `nickname`, `created_at`) VALUES ('2222c559-e097-4d5a-9ba1-7b0818f6440c','user-cust-001','ps-profile-002','MANUAL','Maria Garcia','2025-12-19 12:49:08'),('45ffeca3-17b5-42fe-a6b0-a5c405381a26','user-cust-001','ps-profile-008','MANUAL','Barbara Moore','2025-12-19 12:49:09'),('7642c742-dbc5-416e-97ee-f1e8b7134377','user-cust-001','ps-profile-001','MANUAL','James Mitchell','2025-12-19 12:08:31');
/*!40000 ALTER TABLE `contact_book_entries` ENABLE KEYS */;
UNLOCK TABLES;

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
  `default_process_server_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
INSERT INTO `customer_profiles` (`id`, `tenant_user_role_id`, `default_zip_code`, `default_process_server_id`) VALUES ('0e7012ed-52a1-4334-9b5f-79e35202ebbb','3861fc53-4e3f-4cfa-b3db-275bf5b1c0ee',NULL,NULL),('c119a9d5-ee9b-457c-80a2-88017b9ded19','93ad1041-5b0d-4437-ba3e-47758f0b3882',NULL,NULL),('cp-001','tur-cust-001','75201',NULL),('cp-002','tur-cust-002','10001',NULL),('cp-003','tur-cust-003','33101',NULL),('cp-004','tur-cust-004','60601',NULL),('cp-005','tur-cust-005','77001',NULL),('d798668a-be15-4ec4-a27e-f107ea4f60e3','b1b3072d-7fc0-4c38-88f8-c28a05a8e743',NULL,NULL);
/*!40000 ALTER TABLE `customer_profiles` ENABLE KEYS */;
UNLOCK TABLES;

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
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
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
INSERT INTO `email_verifications` (`id`, `email`, `otp`, `expires_at`, `is_verified`, `created_at`) VALUES ('cd342776-0a50-4fe1-840c-7320af7f1418','hitansu2004@gmail.com','425938','2025-12-19 22:21:04',1,'2025-12-19 22:11:04');
/*!40000 ALTER TABLE `email_verifications` ENABLE KEYS */;
UNLOCK TABLES;

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
  `google_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
INSERT INTO `global_users` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `phone_number`, `is_super_admin`, `email_verified`, `is_active`, `google_id`, `created_at`, `last_login`) VALUES ('0ce9153f-c9dc-440f-8a5e-014c5ff3d8db','hitansu2004@gmail.com','$2a$10$Uiyb9blOMVkS6bFcJ44XN.DdDmgb8i9ZVFAFfYM3bHuywzCvc27vS','Hitansu','parichha','1234567890',0,1,1,NULL,'2025-12-19 16:36:30','2025-12-19 16:51:48'),('user-cust-001','sarah.anderson@techcorp.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Sarah','Anderson','+1-214-555-0101',0,1,1,NULL,'2025-12-19 11:16:49','2025-12-19 16:51:56'),('user-cust-002','michael.chen@lawfirm.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Michael','Chen','+1-212-555-0202',0,1,1,NULL,'2025-12-19 11:16:49','2025-12-19 11:37:08'),('user-cust-003','jennifer.rodriguez@legalservices.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Jennifer','Rodriguez','+1-305-555-0303',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-cust-004','david.williams@corporate.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','David','Williams','+1-312-555-0404',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-cust-005','emily.johnson@attorneys.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Emily','Johnson','+1-713-555-0505',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-ps-001','james.mitchell@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','James','Mitchell','+1-214-555-1001',0,1,1,NULL,'2025-12-19 11:16:49','2025-12-19 16:55:04'),('user-ps-002','maria.garcia@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Maria','Garcia','+1-212-555-1002',0,1,1,NULL,'2025-12-19 11:16:49','2025-12-19 11:37:08'),('user-ps-003','robert.thompson@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Robert','Thompson','+1-305-555-1003',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-ps-004','linda.martinez@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Linda','Martinez','+1-312-555-1004',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-ps-005','william.brown@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','William','Brown','+1-713-555-1005',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-ps-006','patricia.davis@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Patricia','Davis','+1-602-555-1006',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-ps-007','christopher.wilson@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Christopher','Wilson','+1-619-555-1007',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-ps-008','barbara.moore@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Barbara','Moore','+1-415-555-1008',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-ps-009','daniel.taylor@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Daniel','Taylor','+1-206-555-1009',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-ps-010','susan.anderson@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Susan','Anderson','+1-617-555-1010',0,1,1,NULL,'2025-12-19 11:16:49',NULL);
/*!40000 ALTER TABLE `global_users` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `order_dropoffs`
--

LOCK TABLES `order_dropoffs` WRITE;
/*!40000 ALTER TABLE `order_dropoffs` DISABLE KEYS */;
INSERT INTO `order_dropoffs` (`id`, `assigned_process_server_id`, `attempt_count`, `created_at`, `delivered_at`, `dropoff_address`, `dropoff_type`, `dropoff_zip_code`, `final_agreed_price`, `max_attempts`, `recipient_name`, `sequence_number`, `status`, `order_id`) VALUES ('b3cfd5f4-c004-4515-ba89-9f25025e48b8','',0,'2025-12-19 22:22:50.416276',NULL,'cdcds ds','GUIDED','vs ds ds ',12321.00,5,'ckdsbiuc',1,'ASSIGNED','08a65bd1-c606-404f-a9e0-b2999454aed6'),('drop-asg-001','ps-profile-001',0,'2025-12-18 17:50:28.000000',NULL,'234 Elm Street, Dallas, TX 75203','GUIDED','75203',NULL,3,'Robert Johnson',1,'ASSIGNED','ord-asg-001'),('drop-asg-002','ps-profile-002',0,'2025-12-17 17:50:28.000000',NULL,'567 Fifth Ave, New York, NY 10003','GUIDED','10003',NULL,3,'Lisa Anderson',1,'ASSIGNED','ord-asg-002'),('drop-bid-001',NULL,0,'2025-12-17 17:50:28.000000',NULL,'789 Commerce St, Dallas, TX 75202','AUTOMATED','75202',NULL,3,'Emily Rodriguez',1,'OPEN','ord-bid-001'),('drop-bid-002',NULL,0,'2025-12-18 17:50:28.000000',NULL,'123 Broadway, New York, NY 10001','AUTOMATED','10001',NULL,3,'David Kim',1,'OPEN','ord-bid-002'),('drop-bid-003',NULL,0,'2025-12-19 14:50:28.000000',NULL,'456 Beach Blvd, Miami, FL 33140','AUTOMATED','33140',NULL,3,'Maria Santos',1,'OPEN','ord-bid-003'),('drop-c1-001','ps-profile-001',2,'2025-12-09 17:01:52.000000','2025-12-14 17:01:52.000000','2345 Oak Street, Apt 4B, Dallas, TX 75202','GUIDED','75202',150.00,3,'John Richardson',1,'DELIVERED','ord-c1-001'),('drop-c1-002','ps-profile-001',1,'2025-12-16 17:01:52.000000',NULL,'789 Elm Avenue, Fort Worth, TX 76102','GUIDED','76102',NULL,3,'Lisa Thompson',1,'IN_PROGRESS','ord-c1-002'),('drop-c1-003',NULL,0,'2025-12-18 17:01:52.000000',NULL,'456 Park Lane, Dallas, TX 75203','AUTOMATED','75203',NULL,3,'Michael Davis',1,'OPEN','ord-c1-003'),('drop-c1-004','ps-profile-001',1,'2025-12-01 17:01:52.000000','2025-12-09 17:01:52.000000','123 Cedar Road, Plano, TX 75201','GUIDED','75201',140.00,3,'Sarah Martinez',1,'DELIVERED','ord-c1-004'),('drop-c1-005',NULL,0,'2025-12-19 17:01:52.000000',NULL,'890 Maple Drive, Dallas, TX 75202','AUTOMATED','75202',NULL,3,'James Wilson',1,'OPEN','ord-c1-005'),('drop-c1-006','ps-profile-001',3,'2025-11-27 17:01:52.000000','2025-12-04 17:01:52.000000','234 Pine Street, Irving, TX 76051','GUIDED','76051',160.00,3,'Emily Brown',1,'DELIVERED','ord-c1-006'),('drop-c1-007','ps-profile-001',2,'2025-12-14 17:01:52.000000',NULL,'567 Birch Avenue, Dallas, TX 75203','GUIDED','75203',NULL,3,'Robert Lee',1,'IN_PROGRESS','ord-c1-007'),('drop-c1-008',NULL,0,'2025-12-19 17:01:52.000000',NULL,'678 Willow Lane, Fort Worth, TX 76102','AUTOMATED','76102',NULL,3,'Amanda Clark',1,'OPEN','ord-c1-008'),('drop-c1-009','ps-profile-001',2,'2025-11-21 17:01:52.000000','2025-11-29 17:01:52.000000','345 Spruce Court, Dallas, TX 75201','GUIDED','75201',130.00,3,'David Garcia',1,'DELIVERED','ord-c1-009'),('drop-c1-010',NULL,0,'2025-12-19 17:01:52.000000',NULL,'901 Ash Boulevard, Plano, TX 75201','AUTOMATED','75201',NULL,3,'Jennifer White',1,'OPEN','ord-c1-010'),('drop-c2-001','ps-profile-002',1,'2025-12-07 17:01:52.000000','2025-12-13 17:01:52.000000','789 Broadway, Apt 15C, New York, NY 10003','GUIDED','10003',175.00,3,'Peter Johnson',1,'DELIVERED','ord-c2-001'),('drop-c2-002','ps-profile-002',2,'2025-12-14 17:01:52.000000',NULL,'456 Park Avenue South, New York, NY 10002','GUIDED','10002',NULL,3,'Maria Rodriguez',1,'IN_PROGRESS','ord-c2-002'),('drop-c2-003',NULL,0,'2025-12-17 17:01:52.000000',NULL,'234 Atlantic Avenue, Brooklyn, NY 11201','AUTOMATED','11201',NULL,3,'Thomas Anderson',1,'OPEN','ord-c2-003'),('drop-c2-004','ps-profile-002',2,'2025-12-01 17:01:52.000000','2025-12-07 17:01:52.000000','567 Queens Boulevard, Queens, NY 11215','GUIDED','11215',145.00,3,'Linda Chen',1,'DELIVERED','ord-c2-004'),('drop-c2-005',NULL,0,'2025-12-19 17:01:52.000000',NULL,'890 Madison Avenue, New York, NY 10001','AUTOMATED','10001',NULL,3,'Richard Park',1,'OPEN','ord-c2-005'),('drop-c2-006','ps-profile-002',1,'2025-12-16 17:01:52.000000',NULL,'123 Lexington Ave, New York, NY 10002','GUIDED','10002',NULL,3,'Susan Kim',1,'IN_PROGRESS','ord-c2-006'),('drop-c3-001','ps-profile-003',1,'2025-12-05 17:01:52.000000','2025-12-11 17:01:52.000000','456 Ocean Drive, Miami Beach, FL 33139','GUIDED','33139',155.00,3,'Carlos Mendez',1,'DELIVERED','ord-c3-001'),('drop-c3-002','ps-profile-003',2,'2025-12-13 17:01:52.000000',NULL,'789 Biscayne Boulevard, Miami, FL 33131','GUIDED','33131',NULL,3,'Ana Fernandez',1,'IN_PROGRESS','ord-c3-002'),('drop-c3-003',NULL,0,'2025-12-18 17:01:52.000000',NULL,'234 Coral Way, Coral Gables, FL 33134','AUTOMATED','33134',NULL,3,'Miguel Santos',1,'OPEN','ord-c3-003'),('drop-c3-004',NULL,0,'2025-12-19 17:01:52.000000',NULL,'567 SW 8th Street, Miami, FL 33101','AUTOMATED','33101',NULL,3,'Isabella Garcia',1,'OPEN','ord-c3-004'),('drop-c3-005','ps-profile-003',2,'2025-12-03 17:01:52.000000','2025-12-09 17:01:52.000000','890 Collins Avenue, Miami Beach, FL 33139','GUIDED','33139',165.00,3,'Diego Ramirez',1,'DELIVERED','ord-c3-005'),('drop-c3-006','ps-profile-003',1,'2025-12-15 17:01:52.000000',NULL,'123 Miracle Mile, Coral Gables, FL 33134','GUIDED','33134',NULL,3,'Sofia Martinez',1,'IN_PROGRESS','ord-c3-006'),('drop-c3-007',NULL,0,'2025-12-19 17:01:52.000000',NULL,'345 Flagler Street, Miami, FL 33131','AUTOMATED','33131',NULL,3,'Juan Lopez',1,'OPEN','ord-c3-007'),('drop-c3-008','ps-profile-003',3,'2025-11-27 17:01:52.000000','2025-12-03 17:01:52.000000','678 NW 7th Avenue, Miami, FL 33101','GUIDED','33101',180.00,3,'Carmen Diaz',1,'DELIVERED','ord-c3-008'),('drop-c4-001','ps-profile-004',1,'2025-12-09 17:01:52.000000','2025-12-15 17:01:52.000000','456 Michigan Avenue, Chicago, IL 60611','GUIDED','60611',125.00,3,'William O\'Brien',1,'DELIVERED','ord-c4-001'),('drop-c4-002','ps-profile-004',2,'2025-12-16 17:01:52.000000',NULL,'789 State Street, Chicago, IL 60602','GUIDED','60602',NULL,3,'Mary Johnson',1,'IN_PROGRESS','ord-c4-002'),('drop-c4-003',NULL,0,'2025-12-19 17:01:52.000000',NULL,'234 LaSalle Street, Chicago, IL 60603','AUTOMATED','60603',NULL,3,'Patrick Murphy',1,'OPEN','ord-c4-003'),('drop-c5-001','ps-profile-005',1,'2025-12-14 17:01:52.000000',NULL,'567 Main Street, Houston, TX 77002','GUIDED','77002',NULL,3,'Rebecca Smith',1,'IN_PROGRESS','ord-c5-001'),('drop-c5-002',NULL,0,'2025-12-19 17:01:52.000000',NULL,'890 Travis Street, Houston, TX 77003','AUTOMATED','77003',NULL,3,'Christopher Lee',1,'OPEN','ord-c5-002'),('drop-canc-001',NULL,0,'2025-12-16 17:50:28.000000',NULL,'789 Travis St, Houston, TX 77003','AUTOMATED','77003',NULL,3,'Patricia Davis',1,'OPEN','ord-canc-001'),('drop-canc-002',NULL,0,'2025-12-14 17:50:28.000000',NULL,'345 Ross Ave, Dallas, TX 75204','AUTOMATED','75204',NULL,3,'James Wilson',1,'OPEN','ord-canc-002'),('drop-fail-001','ps-profile-003',3,'2025-12-09 17:50:28.000000',NULL,'890 Collins Ave, Miami, FL 33141','GUIDED','33141',NULL,3,'Carlos Mendez',1,'FAILED','ord-fail-001'),('drop-fail-002','ps-profile-004',3,'2025-12-04 17:50:28.000000',NULL,'432 Lake Shore Dr, Chicago, IL 60602','GUIDED','60602',NULL,3,'Nancy White',1,'FAILED','ord-fail-002');
/*!40000 ALTER TABLE `order_dropoffs` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` (`id`, `assigned_at`, `commission_rate_applied`, `completed_at`, `created_at`, `customer_id`, `customer_payment_amount`, `deadline`, `final_agreed_price`, `has_multiple_dropoffs`, `order_number`, `pricing_config`, `process_server_payout`, `special_instructions`, `status`, `super_admin_fee`, `tenant_commission`, `tenant_id`, `tenant_profit`, `total_dropoffs`) VALUES ('08a65bd1-c606-404f-a9e0-b2999454aed6','2025-12-19 22:22:50.350268',NULL,NULL,'2025-12-19 22:22:50.376625','tur-cust-001',14169.15,'2025-12-19 22:22:00.000000',NULL,_binary '\0','C-001-ORD13',NULL,12321.00,'cwecwc','ASSIGNED',92.41,1848.15,'tenant-main-001',1755.74,1),('ord-asg-001','2025-12-19 05:50:28.000000',NULL,NULL,'2025-12-18 17:50:28.000000','tur-cust-001',NULL,'2025-12-24 14:00:00.000000',NULL,NULL,'ORD-2025-033',NULL,NULL,NULL,'ASSIGNED',NULL,NULL,'tenant-main-001',NULL,NULL),('ord-asg-002','2025-12-18 17:50:28.000000',NULL,NULL,'2025-12-17 17:50:28.000000','tur-cust-002',NULL,'2025-12-23 15:00:00.000000',NULL,NULL,'ORD-2025-034',NULL,NULL,NULL,'ASSIGNED',NULL,NULL,'tenant-main-001',NULL,NULL),('ord-bid-001',NULL,NULL,NULL,'2025-12-17 17:50:28.000000','tur-cust-001',NULL,'2025-12-25 18:00:00.000000',NULL,NULL,'ORD-2025-030',NULL,NULL,NULL,'BIDDING',NULL,NULL,'tenant-main-001',NULL,NULL),('ord-bid-002',NULL,NULL,NULL,'2025-12-18 17:50:28.000000','tur-cust-002',NULL,'2025-12-26 17:00:00.000000',NULL,NULL,'ORD-2025-031',NULL,NULL,NULL,'BIDDING',NULL,NULL,'tenant-main-001',NULL,NULL),('ord-bid-003',NULL,NULL,NULL,'2025-12-19 14:50:28.000000','tur-cust-003',NULL,'2025-12-27 16:00:00.000000',NULL,NULL,'ORD-2025-032',NULL,NULL,NULL,'BIDDING',NULL,NULL,'tenant-main-001',NULL,NULL),('ord-c1-001','2025-12-10 17:01:52.000000',15.00,'2025-12-14 17:01:52.000000','2025-12-09 17:01:52.000000','tur-cust-001',172.50,'2025-12-24 17:01:52.000000',150.00,_binary '\0','ORD-2025-001',NULL,150.00,NULL,'COMPLETED',1.13,22.50,'tenant-main-001',21.37,1),('ord-c1-002','2025-12-17 17:01:52.000000',NULL,NULL,'2025-12-16 17:01:52.000000','tur-cust-002',NULL,'2025-12-26 17:01:52.000000',NULL,_binary '\0','ORD-2025-002',NULL,NULL,NULL,'IN_PROGRESS',NULL,NULL,'tenant-main-001',NULL,1),('ord-c1-003',NULL,NULL,NULL,'2025-12-18 17:01:52.000000','tur-cust-001',NULL,'2025-12-29 17:01:52.000000',NULL,_binary '\0','ORD-2025-003',NULL,NULL,NULL,'OPEN',NULL,NULL,'tenant-main-001',NULL,1),('ord-c1-004','2025-12-04 17:01:52.000000',15.00,'2025-12-09 17:01:52.000000','2025-12-01 17:01:52.000000','tur-cust-001',161.00,'2025-12-22 17:01:52.000000',140.00,_binary '\0','ORD-2025-004',NULL,140.00,NULL,'COMPLETED',1.05,21.00,'tenant-main-001',19.95,1),('ord-c1-005',NULL,NULL,NULL,'2025-12-19 17:01:52.000000','tur-cust-001',NULL,'2025-12-31 17:01:52.000000',NULL,_binary '\0','ORD-2025-005',NULL,NULL,NULL,'OPEN',NULL,NULL,'tenant-main-001',NULL,1),('ord-c1-006','2025-11-29 17:01:52.000000',15.00,'2025-12-04 17:01:52.000000','2025-11-27 17:01:52.000000','tur-cust-001',184.00,'2025-12-27 17:01:52.000000',160.00,_binary '\0','ORD-2025-006',NULL,160.00,NULL,'COMPLETED',1.20,24.00,'tenant-main-001',22.80,1),('ord-c1-007','2025-12-15 17:01:52.000000',NULL,NULL,'2025-12-14 17:01:52.000000','tur-cust-001',NULL,'2025-12-25 17:01:52.000000',NULL,_binary '\0','ORD-2025-007',NULL,NULL,NULL,'IN_PROGRESS',NULL,NULL,'tenant-main-001',NULL,1),('ord-c1-008',NULL,NULL,NULL,'2025-12-19 17:01:52.000000','tur-cust-001',NULL,'2026-01-03 17:01:52.000000',NULL,_binary '\0','ORD-2025-008',NULL,NULL,NULL,'OPEN',NULL,NULL,'tenant-main-001',NULL,1),('ord-c1-009','2025-11-24 17:01:52.000000',15.00,'2025-11-29 17:01:52.000000','2025-11-21 17:01:52.000000','tur-cust-001',149.50,'2025-12-23 17:01:52.000000',130.00,_binary '\0','ORD-2025-009',NULL,130.00,NULL,'COMPLETED',0.98,19.50,'tenant-main-001',18.52,1),('ord-c1-010',NULL,NULL,NULL,'2025-12-19 17:01:52.000000','tur-cust-001',NULL,'2026-01-02 17:01:52.000000',NULL,_binary '\0','ORD-2025-010',NULL,NULL,NULL,'OPEN',NULL,NULL,'tenant-main-001',NULL,1),('ord-c2-001','2025-12-08 17:01:52.000000',15.00,'2025-12-13 17:01:52.000000','2025-12-07 17:01:52.000000','tur-cust-002',201.25,'2025-12-25 17:01:52.000000',175.00,_binary '\0','ORD-2025-011',NULL,175.00,NULL,'COMPLETED',1.31,26.25,'tenant-main-001',24.94,1),('ord-c2-002','2025-12-15 17:01:52.000000',NULL,NULL,'2025-12-14 17:01:52.000000','tur-cust-002',NULL,'2025-12-28 17:01:52.000000',NULL,_binary '\0','ORD-2025-012',NULL,NULL,NULL,'IN_PROGRESS',NULL,NULL,'tenant-main-001',NULL,1),('ord-c2-003',NULL,NULL,NULL,'2025-12-17 17:01:52.000000','tur-cust-002',NULL,'2025-12-30 17:01:52.000000',NULL,_binary '\0','ORD-2025-013',NULL,NULL,NULL,'OPEN',NULL,NULL,'tenant-main-001',NULL,1),('ord-c2-004','2025-12-02 17:01:52.000000',15.00,'2025-12-07 17:01:52.000000','2025-12-01 17:01:52.000000','tur-cust-002',166.75,'2025-12-24 17:01:52.000000',145.00,_binary '\0','ORD-2025-014',NULL,145.00,NULL,'COMPLETED',1.09,21.75,'tenant-main-001',20.66,1),('ord-c2-005',NULL,NULL,NULL,'2025-12-19 17:01:52.000000','tur-cust-002',NULL,'2026-01-01 17:01:52.000000',NULL,_binary '\0','ORD-2025-015',NULL,NULL,NULL,'OPEN',NULL,NULL,'tenant-main-001',NULL,1),('ord-c2-006','2025-12-17 17:01:52.000000',NULL,NULL,'2025-12-16 17:01:52.000000','tur-cust-002',NULL,'2025-12-26 17:01:52.000000',NULL,_binary '\0','ORD-2025-016',NULL,NULL,NULL,'IN_PROGRESS',NULL,NULL,'tenant-main-001',NULL,1),('ord-c3-001','2025-12-06 17:01:52.000000',15.00,'2025-12-11 17:01:52.000000','2025-12-05 17:01:52.000000','tur-cust-003',178.25,'2025-12-23 17:01:52.000000',155.00,_binary '\0','ORD-2025-017',NULL,155.00,NULL,'COMPLETED',1.16,23.25,'tenant-main-001',22.09,1),('ord-c3-002','2025-12-14 17:01:52.000000',NULL,NULL,'2025-12-13 17:01:52.000000','tur-cust-003',NULL,'2025-12-27 17:01:52.000000',NULL,_binary '\0','ORD-2025-018',NULL,NULL,NULL,'IN_PROGRESS',NULL,NULL,'tenant-main-001',NULL,1),('ord-c3-003',NULL,NULL,NULL,'2025-12-18 17:01:52.000000','tur-cust-003',NULL,'2025-12-29 17:01:52.000000',NULL,_binary '\0','ORD-2025-019',NULL,NULL,NULL,'OPEN',NULL,NULL,'tenant-main-001',NULL,1),('ord-c3-004',NULL,NULL,NULL,'2025-12-19 17:01:52.000000','tur-cust-003',NULL,'2025-12-31 17:01:52.000000',NULL,_binary '\0','ORD-2025-020',NULL,NULL,NULL,'OPEN',NULL,NULL,'tenant-main-001',NULL,1),('ord-c3-005','2025-12-04 17:01:52.000000',15.00,'2025-12-09 17:01:52.000000','2025-12-03 17:01:52.000000','tur-cust-003',189.75,'2025-12-22 17:01:52.000000',165.00,_binary '\0','ORD-2025-021',NULL,165.00,NULL,'COMPLETED',1.24,24.75,'tenant-main-001',23.51,1),('ord-c3-006','2025-12-16 17:01:52.000000',NULL,NULL,'2025-12-15 17:01:52.000000','tur-cust-003',NULL,'2025-12-28 17:01:52.000000',NULL,_binary '\0','ORD-2025-022',NULL,NULL,NULL,'IN_PROGRESS',NULL,NULL,'tenant-main-001',NULL,1),('ord-c3-007',NULL,NULL,NULL,'2025-12-19 17:01:52.000000','tur-cust-003',NULL,'2026-01-03 17:01:52.000000',NULL,_binary '\0','ORD-2025-023',NULL,NULL,NULL,'OPEN',NULL,NULL,'tenant-main-001',NULL,1),('ord-c3-008','2025-11-28 17:01:52.000000',15.00,'2025-12-03 17:01:52.000000','2025-11-27 17:01:52.000000','tur-cust-003',207.00,'2025-12-24 17:01:52.000000',180.00,_binary '\0','ORD-2025-024',NULL,180.00,NULL,'COMPLETED',1.35,27.00,'tenant-main-001',25.65,1),('ord-c4-001','2025-12-10 17:01:52.000000',15.00,'2025-12-15 17:01:52.000000','2025-12-09 17:01:52.000000','tur-cust-004',143.75,'2025-12-26 17:01:52.000000',125.00,_binary '\0','ORD-2025-025',NULL,125.00,NULL,'COMPLETED',0.94,18.75,'tenant-main-001',17.81,1),('ord-c4-002','2025-12-17 17:01:52.000000',NULL,NULL,'2025-12-16 17:01:52.000000','tur-cust-004',NULL,'2025-12-28 17:01:52.000000',NULL,_binary '\0','ORD-2025-026',NULL,NULL,NULL,'IN_PROGRESS',NULL,NULL,'tenant-main-001',NULL,1),('ord-c4-003',NULL,NULL,NULL,'2025-12-19 17:01:52.000000','tur-cust-004',NULL,'2025-12-30 17:01:52.000000',NULL,_binary '\0','ORD-2025-027',NULL,NULL,NULL,'OPEN',NULL,NULL,'tenant-main-001',NULL,1),('ord-c5-001','2025-12-15 17:01:52.000000',NULL,NULL,'2025-12-14 17:01:52.000000','tur-cust-005',NULL,'2025-12-27 17:01:52.000000',NULL,_binary '\0','ORD-2025-028',NULL,NULL,NULL,'IN_PROGRESS',NULL,NULL,'tenant-main-001',NULL,1),('ord-c5-002',NULL,NULL,NULL,'2025-12-19 17:01:52.000000','tur-cust-005',NULL,'2025-12-31 17:01:52.000000',NULL,_binary '\0','ORD-2025-029',NULL,NULL,NULL,'OPEN',NULL,NULL,'tenant-main-001',NULL,1),('ord-canc-001',NULL,NULL,NULL,'2025-12-16 17:50:28.000000','tur-cust-005',NULL,'2025-12-20 09:00:00.000000',NULL,NULL,'ORD-2025-037',NULL,NULL,NULL,'CANCELLED',NULL,NULL,'tenant-main-001',NULL,NULL),('ord-canc-002',NULL,NULL,NULL,'2025-12-14 17:50:28.000000','tur-cust-001',NULL,'2025-12-22 11:00:00.000000',NULL,NULL,'ORD-2025-038',NULL,NULL,NULL,'CANCELLED',NULL,NULL,'tenant-main-001',NULL,NULL),('ord-fail-001','2025-12-10 17:50:28.000000',NULL,'2025-12-14 17:50:28.000000','2025-12-09 17:50:28.000000','tur-cust-003',NULL,'2025-12-15 12:00:00.000000',NULL,NULL,'ORD-2025-035',NULL,NULL,NULL,'FAILED',NULL,NULL,'tenant-main-001',NULL,NULL),('ord-fail-002','2025-12-05 17:50:28.000000',NULL,'2025-12-10 17:50:28.000000','2025-12-04 17:50:28.000000','tur-cust-004',NULL,'2025-12-10 10:00:00.000000',NULL,NULL,'ORD-2025-036',NULL,NULL,NULL,'FAILED',NULL,NULL,'tenant-main-001',NULL,NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

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
  `profile_photo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
INSERT INTO `process_server_profiles` (`id`, `tenant_user_role_id`, `tenant_id`, `is_global`, `operating_zip_codes`, `status`, `current_rating`, `total_orders_assigned`, `successful_deliveries`, `failed_after_max_attempts`, `total_attempts`, `average_attempts_per_delivery`, `is_red_zone`, `red_zone_trigger_count`, `verification_docs`, `profile_photo_url`, `last_delivery_at`, `created_at`, `updated_at`) VALUES ('ps-profile-001','tur-ps-001','tenant-main-001',1,'[\"75201\", \"75202\", \"75203\", \"76102\", \"76051\"]','ACTIVE',4.80,6,4,0,11,2.75,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000'),('ps-profile-002','tur-ps-002','tenant-main-001',1,'[\"10001\", \"10002\", \"10003\", \"11201\", \"11215\"]','ACTIVE',4.90,4,2,0,6,3.00,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000'),('ps-profile-003','tur-ps-003','tenant-main-001',1,'[\"33101\", \"33131\", \"33134\", \"33139\", \"33149\"]','ACTIVE',4.70,5,3,0,9,3.00,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000'),('ps-profile-004','tur-ps-004','tenant-main-001',0,'[\"60601\", \"60602\", \"60603\", \"60606\", \"60611\"]','ACTIVE',4.60,2,1,0,3,3.00,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000'),('ps-profile-005','tur-ps-005','tenant-main-001',0,'[\"77001\", \"77002\", \"77003\", \"77004\", \"77010\"]','ACTIVE',4.50,1,0,0,1,0.00,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000'),('ps-profile-006','tur-ps-006','tenant-main-001',1,'[\"85001\", \"85003\", \"85004\", \"85016\", \"85281\"]','ACTIVE',4.80,0,0,0,0,0.00,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000'),('ps-profile-007','tur-ps-007','tenant-main-001',0,'[\"92101\", \"92102\", \"92103\", \"92109\", \"91910\"]','ACTIVE',4.70,0,0,0,0,0.00,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000'),('ps-profile-008','tur-ps-008','tenant-main-001',1,'[\"94102\", \"94103\", \"94104\", \"94107\", \"94109\"]','ACTIVE',4.90,0,0,0,0,0.00,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000'),('ps-profile-009','tur-ps-009','tenant-main-001',0,'[\"98101\", \"98102\", \"98103\", \"98104\", \"98105\"]','ACTIVE',4.60,0,0,0,0,0.00,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000'),('ps-profile-010','tur-ps-010','tenant-main-001',1,'[\"02101\", \"02108\", \"02109\", \"02110\", \"02115\"]','ACTIVE',4.80,0,0,0,0,0.00,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000');
/*!40000 ALTER TABLE `process_server_profiles` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `tenant_user_roles`
--

LOCK TABLES `tenant_user_roles` WRITE;
/*!40000 ALTER TABLE `tenant_user_roles` DISABLE KEYS */;
INSERT INTO `tenant_user_roles` (`id`, `global_user_id`, `tenant_id`, `role`, `is_active`, `created_at`) VALUES ('3861fc53-4e3f-4cfa-b3db-275bf5b1c0ee','a8dcf0f8-f5b4-4a58-84ff-52ab56f35da3','tenant-main-001','CUSTOMER',1,'2025-12-19 16:30:23'),('93ad1041-5b0d-4437-ba3e-47758f0b3882','0ce9153f-c9dc-440f-8a5e-014c5ff3d8db','tenant-main-001','CUSTOMER',1,'2025-12-19 16:36:30'),('b1b3072d-7fc0-4c38-88f8-c28a05a8e743','a2264e3e-22da-4dc3-8f19-7523cad178f4','tenant-main-001','CUSTOMER',1,'2025-12-19 16:24:37'),('tur-cust-001','user-cust-001','tenant-main-001','CUSTOMER',1,'2025-12-19 11:16:49'),('tur-cust-002','user-cust-002','tenant-main-001','CUSTOMER',1,'2025-12-19 11:16:49'),('tur-cust-003','user-cust-003','tenant-main-001','CUSTOMER',1,'2025-12-19 11:16:49'),('tur-cust-004','user-cust-004','tenant-main-001','CUSTOMER',1,'2025-12-19 11:16:49'),('tur-cust-005','user-cust-005','tenant-main-001','CUSTOMER',1,'2025-12-19 11:16:49'),('tur-ps-001','user-ps-001','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49'),('tur-ps-002','user-ps-002','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49'),('tur-ps-003','user-ps-003','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49'),('tur-ps-004','user-ps-004','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49'),('tur-ps-005','user-ps-005','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49'),('tur-ps-006','user-ps-006','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49'),('tur-ps-007','user-ps-007','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49'),('tur-ps-008','user-ps-008','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49'),('tur-ps-009','user-ps-009','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49'),('tur-ps-010','user-ps-010','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49');
/*!40000 ALTER TABLE `tenant_user_roles` ENABLE KEYS */;
UNLOCK TABLES;

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
  `business_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `business_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `business_address` text COLLATE utf8mb4_unicode_ci,
  `business_category` enum('LEGAL_SERVICES','PROCESS_SERVING','COURIER','DELIVERY','OTHER') COLLATE utf8mb4_unicode_ci DEFAULT 'PROCESS_SERVING',
  `business_type` enum('LLC','CORPORATION','SOLE_PROPRIETOR','PARTNERSHIP','NPO') COLLATE utf8mb4_unicode_ci DEFAULT 'LLC',
  `contact_person_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_person_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_person_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `license_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timezone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'America/New_York',
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'USD',
  `subscription_tier` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
INSERT INTO `tenants` (`id`, `name`, `domain_url`, `subdomain`, `api_key`, `business_email`, `business_phone`, `business_address`, `business_category`, `business_type`, `contact_person_name`, `contact_person_email`, `contact_person_phone`, `tax_id`, `license_number`, `logo_url`, `website_url`, `timezone`, `currency`, `subscription_tier`, `is_active`, `business_hours`, `pricing_config`, `notification_settings`, `created_at`) VALUES ('tenant-main-001','ProcessServe USA',NULL,'processserve-usa',NULL,NULL,NULL,NULL,'PROCESS_SERVING','LLC',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'America/New_York','USD',NULL,1,NULL,NULL,NULL,'2025-12-19 16:46:49.000000');
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'processserve_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-19 22:44:09
