-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: processserve_db
-- ------------------------------------------------------
-- Server version	8.0.44-0ubuntu0.24.04.2

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

--
-- Table structure for table `bids`
--

DROP TABLE IF EXISTS `bids`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bids` (
  `id` varchar(36) NOT NULL,
  `bid_amount` decimal(10,2) NOT NULL,
  `comment` text,
  `created_at` datetime(6) DEFAULT NULL,
  `order_dropoff_id` varchar(255) DEFAULT NULL,
  `process_server_id` varchar(36) NOT NULL,
  `status` enum('PENDING','ACCEPTED','REJECTED','WITHDRAWN') NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKa7vqaoe2q8axyx0c2e3hjbycb` (`order_dropoff_id`),
  CONSTRAINT `FKa7vqaoe2q8axyx0c2e3hjbycb` FOREIGN KEY (`order_dropoff_id`) REFERENCES `order_dropoffs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bids`
--

LOCK TABLES `bids` WRITE;
/*!40000 ALTER TABLE `bids` DISABLE KEYS */;
/*!40000 ALTER TABLE `bids` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_attempts`
--

DROP TABLE IF EXISTS `delivery_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_attempts` (
  `id` varchar(36) NOT NULL,
  `attempt_number` int NOT NULL,
  `attempt_time` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `gps_latitude` decimal(10,8) DEFAULT NULL,
  `gps_longitude` decimal(11,8) DEFAULT NULL,
  `is_valid_attempt` bit(1) DEFAULT NULL,
  `outcome_notes` text,
  `photo_proof_url` varchar(500) DEFAULT NULL,
  `process_server_id` varchar(36) NOT NULL,
  `was_successful` bit(1) DEFAULT NULL,
  `order_dropoff_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKeei4ooiodbj6f91b0md01cjqd` (`order_dropoff_id`),
  CONSTRAINT `FKeei4ooiodbj6f91b0md01cjqd` FOREIGN KEY (`order_dropoff_id`) REFERENCES `order_dropoffs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `id` varchar(255) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(255) NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `is_verified` bit(1) NOT NULL,
  `otp` varchar(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_verifications`
--

LOCK TABLES `email_verifications` WRITE;
/*!40000 ALTER TABLE `email_verifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `email_verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `global_users`
--

DROP TABLE IF EXISTS `global_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `global_users` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified` bit(1) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `is_super_admin` bit(1) DEFAULT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_jmh2dx7l1c06vx3ft7p3dr1e0` (`email`),
  UNIQUE KEY `UK_kvppdjwrrgyd0wjbppribnloj` (`google_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `global_users`
--

LOCK TABLES `global_users` WRITE;
/*!40000 ALTER TABLE `global_users` DISABLE KEYS */;
/*!40000 ALTER TABLE `global_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `is_read` bit(1) DEFAULT NULL,
  `message` text NOT NULL,
  `related_order_id` varchar(36) DEFAULT NULL,
  `tenant_id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `id` varchar(36) NOT NULL,
  `assigned_process_server_id` varchar(36) DEFAULT NULL,
  `attempt_count` int DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `delivered_at` datetime(6) DEFAULT NULL,
  `dropoff_address` text NOT NULL,
  `dropoff_type` enum('GUIDED','AUTOMATED') DEFAULT NULL,
  `dropoff_zip_code` varchar(10) NOT NULL,
  `final_agreed_price` decimal(10,2) DEFAULT NULL,
  `max_attempts` int DEFAULT NULL,
  `recipient_name` varchar(255) NOT NULL,
  `sequence_number` int NOT NULL,
  `status` enum('OPEN','PENDING','BIDDING','ASSIGNED','IN_PROGRESS','DELIVERED','FAILED') NOT NULL,
  `order_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKo1qwipd6w1j6ligr81o0ox5ro` (`order_id`),
  CONSTRAINT `FKo1qwipd6w1j6ligr81o0ox5ro` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_dropoffs`
--

LOCK TABLES `order_dropoffs` WRITE;
/*!40000 ALTER TABLE `order_dropoffs` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_dropoffs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` varchar(36) NOT NULL,
  `assigned_at` datetime(6) DEFAULT NULL,
  `commission_rate_applied` decimal(5,2) DEFAULT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `customer_id` varchar(36) NOT NULL,
  `customer_payment_amount` decimal(10,2) DEFAULT NULL,
  `deadline` datetime(6) NOT NULL,
  `final_agreed_price` decimal(10,2) DEFAULT NULL,
  `has_multiple_dropoffs` bit(1) DEFAULT NULL,
  `order_number` varchar(50) NOT NULL,
  `pricing_config` json DEFAULT NULL,
  `process_server_payout` decimal(10,2) DEFAULT NULL,
  `special_instructions` text,
  `status` enum('DRAFT','OPEN','BIDDING','PARTIALLY_ASSIGNED','ASSIGNED','IN_PROGRESS','COMPLETED','FAILED','CANCELLED') NOT NULL,
  `super_admin_fee` decimal(10,2) DEFAULT NULL,
  `tenant_commission` decimal(10,2) DEFAULT NULL,
  `tenant_id` varchar(36) NOT NULL,
  `tenant_profit` decimal(10,2) DEFAULT NULL,
  `total_dropoffs` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_nthkiu7pgmnqnu86i2jyoe2v7` (`order_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_user_roles`
--

DROP TABLE IF EXISTS `tenant_user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_user_roles` (
  `id` varchar(36) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `role` enum('TENANT_ADMIN','CUSTOMER','PROCESS_SERVER') NOT NULL,
  `tenant_id` varchar(36) NOT NULL,
  `global_user_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKmavlyobstamcbbexav7thamt9` (`global_user_id`),
  CONSTRAINT `FKmavlyobstamcbbexav7thamt9` FOREIGN KEY (`global_user_id`) REFERENCES `global_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_user_roles`
--

LOCK TABLES `tenant_user_roles` WRITE;
/*!40000 ALTER TABLE `tenant_user_roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `tenant_user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenants` (
  `id` varchar(36) NOT NULL,
  `api_key` varchar(64) DEFAULT NULL,
  `business_hours` json DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `domain_url` varchar(255) DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `notification_settings` json DEFAULT NULL,
  `pricing_config` json DEFAULT NULL,
  `subscription_tier` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_4moql6miwoh3w0drxa2gmjbll` (`name`),
  UNIQUE KEY `UK_3en99tewvbc4g3a7ou4mt1ono` (`api_key`),
  UNIQUE KEY `UK_8wq3tpcgttvc5c2ld4qsjg515` (`domain_url`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES ('22ee0d18-8325-4e22-929d-fe4b6a6717ca','a9571dcd-d131-4960-a38d-e5f102fc77cf',NULL,'2025-12-20 19:52:49.625533','testlegal.com',_binary '','Test Legal Services',NULL,NULL,'BASIC');
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-20 20:03:02
