-- MySQL dump 10.13  Distrib 8.0.42, for Linux (x86_64)
--
-- Host: localhost    Database: processserve_db
-- ------------------------------------------------------
-- Server version	8.0.42-0ubuntu0.24.10.1

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
INSERT INTO `bids` VALUES ('7b2292c6-eac6-11f0-aa3a-fa163e03686f',95.00,'Available this week, familiar with Chicago area','2026-01-05 11:30:00.000000','7b225edf-eac6-11f0-aa3a-fa163e03686f','user-ps-002','PENDING',NULL),('7b229680-eac6-11f0-aa3a-fa163e03686f',85.00,'Can serve same day if accepted today','2026-01-05 14:15:00.000000','7b225edf-eac6-11f0-aa3a-fa163e03686f','user-ps-003','PENDING',NULL),('7b229836-eac6-11f0-aa3a-fa163e03686f',90.00,'Experienced with eviction notices, available immediately','2026-01-05 16:00:00.000000','7b225edf-eac6-11f0-aa3a-fa163e03686f','user-ps-001','PENDING',NULL),('dbb2772a-eac5-11f0-aa3a-fa163e03686f',95.00,'Available this week, familiar with Chicago area','2026-01-05 11:30:00.000000','dbb23ecf-eac5-11f0-aa3a-fa163e03686f','user-ps-002','PENDING',NULL),('dbb27bae-eac5-11f0-aa3a-fa163e03686f',85.00,'Can serve same day if accepted today','2026-01-05 14:15:00.000000','dbb23ecf-eac5-11f0-aa3a-fa163e03686f','user-ps-003','PENDING',NULL),('dbb27d79-eac5-11f0-aa3a-fa163e03686f',90.00,'Experienced with eviction notices, available immediately','2026-01-05 16:00:00.000000','dbb23ecf-eac5-11f0-aa3a-fa163e03686f','user-ps-001','PENDING',NULL);
/*!40000 ALTER TABLE `bids` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_participants`
--

DROP TABLE IF EXISTS `chat_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_participants` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_role` enum('CUSTOMER','ADMIN','SERVER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `added_by_user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
INSERT INTO `chat_participants` VALUES ('0ab0b2bf-819c-4626-94ec-afe2a21b6212','e1ca70d6-a5af-485d-a948-b1dd0ce36f56','tur-cust-001','CUSTOMER',1,'SYSTEM','2026-01-05 12:10:38',NULL),('0b946898-008f-45d9-bae3-f618ebc15617','cac6d156-7ad6-4f96-afb5-565490aa2ec7','012c48ba-563d-4d01-a338-e4a11cebf9ed','CUSTOMER',1,'SYSTEM','2025-12-28 04:54:10',NULL),('0bd606ff-4581-4748-84e9-d88ad3e45cf3','332bf9ec-0921-4d8e-86f4-0aedc07c667e','bf498344-9a8b-4130-a193-5bb5ad89cbdb','CUSTOMER',1,'SYSTEM','2025-12-25 18:25:34',NULL),('0bf01421-4663-48b1-8de7-8be3b7fb1d76','d6b96bd3-2deb-4b62-b018-e9996b599de1','tur-cust-001','CUSTOMER',1,'SYSTEM','2026-01-05 11:47:05',NULL),('1ad3492d-7d81-44d4-9058-497218b85deb','e1ca70d6-a5af-485d-a948-b1dd0ce36f56','admin-1','ADMIN',1,'SYSTEM','2026-01-05 12:10:38',NULL),('1dad2e39-671d-46d6-8a06-501548a2f2b2','cd29181e-b623-48e5-8df0-537dc0075979','012c48ba-563d-4d01-a338-e4a11cebf9ed','CUSTOMER',1,'SYSTEM','2026-01-07 18:57:28',NULL),('251498c9-1ca7-4f67-a176-1c8c8ec61703','d3cbaf28-db4b-4979-900f-0fd34a5a75d0','admin-1','ADMIN',1,'SYSTEM','2025-12-25 18:42:23',NULL),('2a9a7b88-21ac-4af5-969a-de5701b9a00a','bccea943-aa72-472d-91fd-1b1529275c70','012c48ba-563d-4d01-a338-e4a11cebf9ed','CUSTOMER',1,'SYSTEM','2026-01-02 17:50:00',NULL),('2c0c0f6c-3b55-4269-a3c3-d9929fb70ec4','7da4fd92-3fb3-464d-a487-f064e7f3bdac','012c48ba-563d-4d01-a338-e4a11cebf9ed','CUSTOMER',1,'SYSTEM','2026-01-06 17:34:11',NULL),('2c48500e-46f5-4124-8fab-2bd25ef9ae83','44719b87-1b44-4c2c-a955-76743394aae3','admin-1','ADMIN',1,'SYSTEM','2025-12-25 18:25:17',NULL),('2ee8f700-38e7-4194-93fc-45ebfc11f189','9f0fb1b4-b362-4634-9013-26198057e76f','admin-1','ADMIN',1,'SYSTEM','2025-12-25 18:33:12',NULL),('2fc4a69a-e85b-4bd7-a72a-05c4b398c94b','467f6800-6480-48f7-903e-52a9925da3ce','admin-1','ADMIN',1,'SYSTEM','2026-01-02 17:16:08',NULL),('30dcb506-2950-4d37-94f7-61f97d8f3837','2820a6ff-cc0a-49d6-b263-2e3f1be729cb','tur-cust-001','CUSTOMER',1,'SYSTEM','2026-01-05 19:28:52',NULL),('34d73bb2-6647-452b-9389-a0dfbd55abc6','a536032b-864c-4c4b-908c-40b84e9b076e','admin-1','ADMIN',1,'SYSTEM','2026-01-05 10:29:48',NULL),('43320e29-fdc5-4980-b221-28b19fd2f713','41acd051-423b-4e55-ad9c-78baa81a3d31','tur-cust-001','CUSTOMER',1,'SYSTEM','2026-01-05 19:07:49',NULL),('472a0137-1684-405a-bf70-ac1a1ccb7afb','5ef1b714-9d73-4b04-942c-7fa37c79338a','admin-1','ADMIN',1,'SYSTEM','2026-01-05 10:53:05',NULL),('4d1406fe-53b6-4601-8fb3-3f1f021afad3','7da4fd92-3fb3-464d-a487-f064e7f3bdac','admin-1','ADMIN',1,'SYSTEM','2026-01-06 17:34:11',NULL),('4edd731b-a767-43d6-ba08-c788246e129d','dbf19310-da42-4947-b330-e00ce6c9c91a','admin-1','ADMIN',1,'SYSTEM','2026-01-05 10:42:55',NULL),('57ece2a8-2b18-4c81-a8e6-4005e05046bc','a536032b-864c-4c4b-908c-40b84e9b076e','tur-cust-001','CUSTOMER',1,'SYSTEM','2026-01-05 10:29:48',NULL),('5a26b908-6154-42bc-b42c-dbf0d9f11630','5ef1b714-9d73-4b04-942c-7fa37c79338a','tur-cust-001','CUSTOMER',1,'SYSTEM','2026-01-05 10:53:05',NULL),('63a5d7f6-4f14-4ae6-8ee7-2bea75eedb12','41acd051-423b-4e55-ad9c-78baa81a3d31','admin-1','ADMIN',1,'SYSTEM','2026-01-05 19:07:49',NULL),('69adff9c-9d14-4a23-8db2-c9852447e924','99922325-5c17-4cb1-b669-b0cc2a4b7a42','admin-1','ADMIN',1,'SYSTEM','2026-01-09 07:06:25',NULL),('6b093509-6629-45e9-8d5e-0ede142424ea','cac6d156-7ad6-4f96-afb5-565490aa2ec7','admin-1','ADMIN',1,'SYSTEM','2025-12-28 04:54:10',NULL),('6bc2c6d1-c9ef-4bc8-9255-483f03812605','332bf9ec-0921-4d8e-86f4-0aedc07c667e','admin-1','ADMIN',1,'SYSTEM','2025-12-25 18:25:34',NULL),('6da73c62-c3c0-49d6-87ae-9fe3c0df84af','e2d408f3-98f0-4536-a379-f1a900a4dbe9','admin-1','ADMIN',1,'SYSTEM','2026-01-05 12:31:14',NULL),('702bb640-007d-4293-bded-9a821ca23610','8c21462f-a940-4478-b6f3-5257ba915c9f','tur-cust-001','CUSTOMER',1,'SYSTEM','2026-01-05 10:40:59',NULL),('7e13c8d6-01d7-494b-a3cf-9d3586880622','e2d408f3-98f0-4536-a379-f1a900a4dbe9','tur-cust-001','CUSTOMER',1,'SYSTEM','2026-01-05 12:31:14',NULL),('8340a014-ffe0-411e-8978-4c76e60a46f2','4ec7b1c6-dba5-4205-ad09-039b7aad8e09','admin-1','ADMIN',1,'SYSTEM','2026-01-05 02:54:27',NULL),('85e9e56b-971e-4609-99a5-6b18d8c5e314','8c21462f-a940-4478-b6f3-5257ba915c9f','admin-1','ADMIN',1,'SYSTEM','2026-01-05 10:40:59',NULL),('8afccb69-bc50-4482-9dd5-c818b047ad4a','d7deb2b2-3591-4f63-83a7-89ce2588c9a9','admin-1','ADMIN',1,'SYSTEM','2026-01-06 17:54:58',NULL),('8b5f6385-90e6-47b7-88f0-a9e7fd191c3f','63f5732c-f157-4d0c-b48d-fa1285a1bfbe','tur-cust-001','CUSTOMER',1,'SYSTEM','2026-01-05 10:46:53',NULL),('8e66be1b-5fae-42a3-ac13-780423fcf22a','63f5732c-f157-4d0c-b48d-fa1285a1bfbe','admin-1','ADMIN',1,'SYSTEM','2026-01-05 10:46:53',NULL),('8e86ad0d-2eed-48dc-9c85-233c9e064642','2820a6ff-cc0a-49d6-b263-2e3f1be729cb','admin-1','ADMIN',1,'SYSTEM','2026-01-05 19:28:52',NULL),('8eed6190-c451-4bc8-84b4-b68510b76669','afb4950f-b8e7-4552-91ea-15a1140d95ee','admin-1','ADMIN',1,'SYSTEM','2026-01-07 19:02:47',NULL),('96e61728-2ba1-4113-9161-8ddd8ea91436','cb65d472-72f0-45aa-b65a-a6931822ed6b','admin-1','ADMIN',1,'SYSTEM','2026-01-05 11:20:30',NULL),('983dbb6b-3106-48c8-9eb2-871138583106','4d790b6b-3458-4088-9b85-ea9669e2c54f','admin-1','ADMIN',1,'SYSTEM','2026-01-02 17:38:14',NULL),('99a35366-94fd-402b-adaf-fc54c5572fce','1134d2e8-6033-4084-9331-1625fcdc2dd6','admin-1','ADMIN',1,'SYSTEM','2025-12-26 12:03:42',NULL),('9d428f80-e143-4fd8-a104-20774aa42f41','cd29181e-b623-48e5-8df0-537dc0075979','admin-1','ADMIN',1,'SYSTEM','2026-01-07 18:57:28',NULL),('9da7658b-d883-4ff6-9b3f-0f8c74ce087e','afb4950f-b8e7-4552-91ea-15a1140d95ee','012c48ba-563d-4d01-a338-e4a11cebf9ed','CUSTOMER',1,'SYSTEM','2026-01-07 19:02:47',NULL),('a18de110-eae7-4946-bd38-f91eb0614934','9a00bd25-a07c-4961-b9c3-ce74862e9af5','8ea3aa94-8ca4-4070-98af-41de94fdecec','CUSTOMER',1,'SYSTEM','2025-12-25 18:37:20',NULL),('a3fc9750-854d-4641-b3de-00164b43988e','cd6d6f56-2da8-4850-a08b-1992cea76515','012c48ba-563d-4d01-a338-e4a11cebf9ed','CUSTOMER',1,'SYSTEM','2026-01-07 18:43:17',NULL),('a488b939-02e7-45ad-9c02-ef37ccc15036','dbf19310-da42-4947-b330-e00ce6c9c91a','tur-cust-001','CUSTOMER',1,'SYSTEM','2026-01-05 10:42:55',NULL),('a5cc259c-0e56-40f4-8d85-4876ceb10951','44719b87-1b44-4c2c-a955-76743394aae3','5a138dfb-b5c5-4772-8684-49ea7fede3d6','CUSTOMER',1,'SYSTEM','2025-12-25 18:25:17',NULL),('abaedb2a-85bc-4c78-bed5-e27ec3bc0bcd','d3cbaf28-db4b-4979-900f-0fd34a5a75d0','28f2e4ca-4845-4b26-8de4-cd73fe9b9ba9','CUSTOMER',1,'SYSTEM','2025-12-25 18:42:23',NULL),('b16f697e-7a95-407f-8e6f-8e277881eff6','8693ce4a-d80a-422d-8113-9f78520050f5','admin-1','ADMIN',1,'SYSTEM','2025-12-25 18:41:07',NULL),('b2906440-c9b8-469d-aeb6-adb9c8c8d1e2','8693ce4a-d80a-422d-8113-9f78520050f5','98bdad35-7dd9-4997-b945-f4b88c9b8718','CUSTOMER',1,'SYSTEM','2025-12-25 18:41:07',NULL),('b668f9c6-1c69-4e10-81ac-6164078c1ce4','fb1147d8-3e47-4541-b99f-399912900184','tur-cust-001','CUSTOMER',1,'SYSTEM','2026-01-05 11:09:47',NULL),('b683fe8c-8af2-4614-acdb-fac11b3cd956','4d790b6b-3458-4088-9b85-ea9669e2c54f','012c48ba-563d-4d01-a338-e4a11cebf9ed','CUSTOMER',1,'SYSTEM','2026-01-02 17:38:14',NULL),('c6c6710f-c185-4bdc-bbb5-8cc5e000fc2e','4ec7b1c6-dba5-4205-ad09-039b7aad8e09','012c48ba-563d-4d01-a338-e4a11cebf9ed','CUSTOMER',1,'SYSTEM','2026-01-05 02:54:27',NULL),('cce3ab70-32c4-4cc5-b86d-2731432072e3','fb1147d8-3e47-4541-b99f-399912900184','admin-1','ADMIN',1,'SYSTEM','2026-01-05 11:09:47',NULL),('d1e28789-11bb-493a-80ad-7d24cf426984','cb65d472-72f0-45aa-b65a-a6931822ed6b','tur-cust-001','CUSTOMER',1,'SYSTEM','2026-01-05 11:20:30',NULL),('d73640db-aeaf-4192-86ad-640fc6a89d34','9a00bd25-a07c-4961-b9c3-ce74862e9af5','admin-1','ADMIN',1,'SYSTEM','2025-12-25 18:37:20',NULL),('d73f57c2-bbe1-47c5-88ff-69ad98024e4c','467f6800-6480-48f7-903e-52a9925da3ce','012c48ba-563d-4d01-a338-e4a11cebf9ed','CUSTOMER',1,'SYSTEM','2026-01-02 17:16:08',NULL),('dd9653f0-161c-4261-bf71-71cf6380f4d5','9f0fb1b4-b362-4634-9013-26198057e76f','3512a367-7c69-4eb7-9c13-0f0dbfccef12','CUSTOMER',1,'SYSTEM','2025-12-25 18:33:12',NULL),('ddecc0c2-edcf-4b0e-9cec-d3b38c56f134','test-order-chat-001','server-001','SERVER',1,'cust-001','2025-12-25 06:39:16',NULL),('e06ffa6f-a711-48df-ab41-6cfdebe9e069','test-order-chat-001','admin-001','ADMIN',1,NULL,'2025-12-25 06:39:16',NULL),('e7dbb803-77a9-427f-812e-f19a95484d91','d7deb2b2-3591-4f63-83a7-89ce2588c9a9','012c48ba-563d-4d01-a338-e4a11cebf9ed','CUSTOMER',1,'SYSTEM','2026-01-06 17:54:58',NULL),('ee66e8a2-abf2-45e3-8d27-703f3efd185f','65978682-f187-4f68-8bd0-c4a9e9024fcc','admin-1','ADMIN',1,'SYSTEM','2026-01-09 07:24:21',NULL),('ef39fc14-c4ed-4e42-a7cf-0af4998eae0e','test-order-chat-001','cust-001','CUSTOMER',1,NULL,'2025-12-25 06:39:16',NULL),('f338f3b4-8b8b-4dd7-881f-eeeb36ab2ff3','65978682-f187-4f68-8bd0-c4a9e9024fcc','tur-cust-001','CUSTOMER',1,'SYSTEM','2026-01-09 07:24:21',NULL),('f56ad12f-4dcb-4dc5-b438-209d592acb12','d6b96bd3-2deb-4b62-b018-e9996b599de1','admin-1','ADMIN',1,'SYSTEM','2026-01-05 11:47:05',NULL),('fa7252e0-c5fc-4b81-a0de-bacf033660ea','1134d2e8-6033-4084-9331-1625fcdc2dd6','tur-cust-001','CUSTOMER',1,'SYSTEM','2025-12-26 12:03:42',NULL),('fba68585-103b-497c-a02b-69ba825343b1','bccea943-aa72-472d-91fd-1b1529275c70','admin-1','ADMIN',1,'SYSTEM','2026-01-02 17:50:00',NULL),('fbbd2309-720b-4aee-bb07-b8fdc0e654f8','cd6d6f56-2da8-4850-a08b-1992cea76515','admin-1','ADMIN',1,'SYSTEM','2026-01-07 18:43:17',NULL),('fdd4ea70-d850-4bd7-b21c-691aa6810f50','99922325-5c17-4cb1-b669-b0cc2a4b7a42','tur-cust-001','CUSTOMER',1,'SYSTEM','2026-01-09 07:06:25',NULL);
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
  `entry_type` enum('MANUAL','AUTO_ADDED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nickname` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `activation_status` enum('ACTIVATED','NOT_ACTIVATED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `invitation_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_book_entries`
--

LOCK TABLES `contact_book_entries` WRITE;
/*!40000 ALTER TABLE `contact_book_entries` DISABLE KEYS */;
INSERT INTO `contact_book_entries` VALUES ('2222c559-e097-4d5a-9ba1-7b0818f6440c','user-cust-001','ps-profile-002','MANUAL','Maria Garcia','2025-12-19 12:49:08','ACTIVATED',NULL),('45ffeca3-17b5-42fe-a6b0-a5c405381a26','user-cust-001','ps-profile-008','MANUAL','Barbara Moore','2025-12-19 12:49:09','ACTIVATED',NULL),('4efa46b0-0c7c-4c7a-88fd-ffc817ee4beb','user-cust-001','ps-profile-010','MANUAL','Susan Anderson','2025-12-25 08:06:50','ACTIVATED',NULL),('59f626da-0ea5-4a6a-9f67-f3fb85cfb073','c0342272-6987-4b22-ab64-de2160e39adb','ps-profile-001','MANUAL','James Mitchell','2026-01-02 17:15:37','ACTIVATED',NULL),('7642c742-dbc5-416e-97ee-f1e8b7134377','user-cust-001','ps-profile-001','MANUAL','James Mitchell','2025-12-19 12:08:31','ACTIVATED',NULL),('853bd5ab-dc86-4a26-850f-352b48c8342b','user-cust-001','84856e52-e25d-11f0-aa3a-fa163e03686f','MANUAL','hitansu08 ','2025-12-25 09:21:45','ACTIVATED','e0657272-85f9-436a-b781-8011f07dd765'),('d1e51695-4dfd-4aab-8250-8fedf65017bc','c0342272-6987-4b22-ab64-de2160e39adb','ps-profile-002','MANUAL','Maria Garcia','2026-01-02 17:15:33','ACTIVATED',NULL),('e9752ae0-d5b6-4f01-a402-237cabd206ef','c0342272-6987-4b22-ab64-de2160e39adb','ps-profile-008','MANUAL','Barbara Moore','2026-01-02 17:15:36','ACTIVATED',NULL),('ee192553-948f-4925-a4fb-fa06d62865bb','user-cust-001','ps-profile-003','MANUAL','Robert Thompson','2025-12-25 08:06:51','ACTIVATED',NULL),('f2d56a3d-0653-407c-ac19-5bffe7d31a27','user-cust-001','ps-profile-006','MANUAL','Patricia Davis','2025-12-25 08:06:48','ACTIVATED',NULL);
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
INSERT INTO `customer_profiles` VALUES ('0e7012ed-52a1-4334-9b5f-79e35202ebbb','3861fc53-4e3f-4cfa-b3db-275bf5b1c0ee',NULL,NULL),('0eab7b05-539a-4e65-9da0-56caa6611d84','ff8779bb-c685-4210-8794-f24d7663f9b4',NULL,NULL),('10b98fdd-38c9-4574-9be1-ab5c0a83e612','7c1a53c4-7097-420a-8d36-9a1e4eabe458',NULL,NULL),('1fe1c419-cbf2-404f-823c-ff8a761740a8','7dffd602-28fa-4580-94af-14fea15c167a',NULL,NULL),('3f449fd0-a4f0-4ead-b2dc-24607862628d','3472e41e-6650-4895-b5ff-3bb552587085',NULL,NULL),('4a421ceb-8d86-4f42-a690-a622b7184e61','0583a0f7-b791-4c9e-b326-6e9f657d9bd1',NULL,NULL),('4c4073f4-1615-431c-a970-4c966a75041b','012c48ba-563d-4d01-a338-e4a11cebf9ed',NULL,NULL),('79a9ab5d-65e2-44ae-acdf-437a83a5bf8d','13405660-c46e-44df-9428-727d227a82db',NULL,NULL),('8cd81a98-afc6-44cf-a4de-3a4b2d8d6e80','49930601-f881-40f6-ab44-0bc3bcf3220b',NULL,NULL),('8f40c16e-47fa-4cac-bf54-2c70772b7f1b','a34b202e-ae56-44f5-99b6-53f8b9a094da',NULL,NULL),('b4adf5d0-b791-4410-9fe9-091a0fa71819','fab36909-ded1-44fb-ab98-b274db393cd1',NULL,NULL),('c119a9d5-ee9b-457c-80a2-88017b9ded19','93ad1041-5b0d-4437-ba3e-47758f0b3882',NULL,NULL),('c5f85e8d-8f4a-44b7-98bc-b97ee1626cdb','f00e43bf-a27d-4733-b08a-3d5df6252edb',NULL,NULL),('cc88ee38-aed1-4af7-912b-1885fd5c07f7','0b18c0df-c441-44f1-a6b2-531d8b8dff12',NULL,NULL),('cp-001','tur-cust-001','75201',NULL),('cp-002','tur-cust-002','10001',NULL),('cp-003','tur-cust-003','33101',NULL),('cp-004','tur-cust-004','60601',NULL),('cp-005','tur-cust-005','77001',NULL),('d798668a-be15-4ec4-a27e-f107ea4f60e3','b1b3072d-7fc0-4c38-88f8-c28a05a8e743',NULL,NULL);
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
INSERT INTO `delivery_attempts` VALUES ('7b207238-eac6-11f0-aa3a-fa163e03686f',1,'2025-12-20 10:15:00.000000','2025-12-20 10:30:00.000000',NULL,NULL,_binary '','Recipient not available - office closed early',NULL,'user-ps-001',_binary '\0','7b203c10-eac6-11f0-aa3a-fa163e03686f'),('7b207557-eac6-11f0-aa3a-fa163e03686f',2,'2025-12-22 14:30:00.000000','2025-12-22 14:45:00.000000',NULL,NULL,_binary '','Successfully served to Michael Rodriguez in person at office',NULL,'user-ps-001',_binary '','7b203c10-eac6-11f0-aa3a-fa163e03686f'),('7b216794-eac6-11f0-aa3a-fa163e03686f',1,'2026-01-05 15:45:00.000000','2026-01-05 16:00:00.000000',NULL,NULL,_binary '','Address correct but recipient not home. Left notice.',NULL,'user-ps-002',_binary '\0','7b210607-eac6-11f0-aa3a-fa163e03686f'),('7b242ad2-eac6-11f0-aa3a-fa163e03686f',1,'2025-12-23 09:30:00.000000','2025-12-23 09:45:00.000000',NULL,NULL,_binary '','No answer at door, no lights on',NULL,'user-ps-001',_binary '\0','7b23ec47-eac6-11f0-aa3a-fa163e03686f'),('7b242e26-eac6-11f0-aa3a-fa163e03686f',2,'2025-12-26 14:15:00.000000','2025-12-26 14:30:00.000000',NULL,NULL,_binary '','Neighbor says recipient moved out 2 weeks ago',NULL,'user-ps-001',_binary '\0','7b23ec47-eac6-11f0-aa3a-fa163e03686f'),('7b242fb6-eac6-11f0-aa3a-fa163e03686f',3,'2025-12-28 16:00:00.000000','2025-12-28 16:15:00.000000',NULL,NULL,_binary '','Confirmed address is vacant, recipient no longer at location',NULL,'user-ps-001',_binary '\0','7b23ec47-eac6-11f0-aa3a-fa163e03686f'),('dbb0c3e7-eac5-11f0-aa3a-fa163e03686f',1,'2025-12-20 10:15:00.000000','2025-12-20 10:30:00.000000',NULL,NULL,_binary '','Recipient not available - office closed early',NULL,'user-ps-001',_binary '\0','dbb09100-eac5-11f0-aa3a-fa163e03686f'),('dbb0c7c0-eac5-11f0-aa3a-fa163e03686f',2,'2025-12-22 14:30:00.000000','2025-12-22 14:45:00.000000',NULL,NULL,_binary '','Successfully served to Michael Rodriguez in person at office',NULL,'user-ps-001',_binary '','dbb09100-eac5-11f0-aa3a-fa163e03686f'),('dbb155f9-eac5-11f0-aa3a-fa163e03686f',1,'2026-01-05 15:45:00.000000','2026-01-05 16:00:00.000000',NULL,NULL,_binary '','Address correct but recipient not home. Left notice.',NULL,'user-ps-002',_binary '\0','dbb125ae-eac5-11f0-aa3a-fa163e03686f'),('dbb40740-eac5-11f0-aa3a-fa163e03686f',1,'2025-12-23 09:30:00.000000','2025-12-23 09:45:00.000000',NULL,NULL,_binary '','No answer at door, no lights on',NULL,'user-ps-001',_binary '\0','dbb3d38d-eac5-11f0-aa3a-fa163e03686f'),('dbb409f3-eac5-11f0-aa3a-fa163e03686f',2,'2025-12-26 14:15:00.000000','2025-12-26 14:30:00.000000',NULL,NULL,_binary '','Neighbor says recipient moved out 2 weeks ago',NULL,'user-ps-001',_binary '\0','dbb3d38d-eac5-11f0-aa3a-fa163e03686f'),('dbb40b19-eac5-11f0-aa3a-fa163e03686f',3,'2025-12-28 16:00:00.000000','2025-12-28 16:15:00.000000',NULL,NULL,_binary '','Confirmed address is vacant, recipient no longer at location',NULL,'user-ps-001',_binary '\0','dbb3d38d-eac5-11f0-aa3a-fa163e03686f');
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
INSERT INTO `email_verifications` VALUES ('2517556c-ada2-4f47-919f-dde38003b7aa','bhattarai@gmail.com','874937','2025-12-28 05:02:18',1,'2025-12-28 04:52:18'),('277e30f2-acb0-4529-84b8-7ec730c3e649','hitansu08@gmail.com','928872','2025-12-26 13:04:11',1,'2025-12-26 12:54:11'),('cd342776-0a50-4fe1-840c-7320af7f1418','hitansu2004@gmail.com','425938','2025-12-19 22:21:04',1,'2025-12-19 22:11:04');
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
INSERT INTO `global_users` VALUES ('0ce9153f-c9dc-440f-8a5e-014c5ff3d8db','hitansu2004@gmail.com','$2a$10$Uiyb9blOMVkS6bFcJ44XN.DdDmgb8i9ZVFAFfYM3bHuywzCvc27vS','Hitansu','parichha','1234567890',0,1,1,NULL,'2025-12-19 16:36:30','2025-12-26 12:05:58'),('1bafa4de-d4f2-416e-a8e8-7893fe37377e','ps_test_914f6c@example.com','$2a$10$q6zK8LrVcPuw3b.EodTph.vM5hhGoicg8Jr/AxNyaH3WYXkYmfbSe','Test','Server','0987654321',0,0,1,NULL,'2025-12-25 18:37:11','2025-12-25 18:37:12'),('28f2e4ca-4845-4b26-8de4-cd73fe9b9ba9','cust_test_c6b6b1@example.com','$2a$10$bqqHKUNDG1pbtU/zMk/VG.ncO7RvrtlOiypS1N40ze6FLH1L4z8re','Test','Customer','1234567890',0,0,1,NULL,'2025-12-25 18:42:12','2025-12-25 18:42:14'),('2a7dbd34-f12e-438d-bf3b-025e5fd13cf9','cust_test_0a4645@example.com','$2a$10$5NW8ZuDTPCrLYAZLG4SRBO5YF4a8LXgwp6I5lmZZeobl7Jev/abbK','Test','Customer','1234567890',0,0,1,NULL,'2025-12-25 18:31:25','2025-12-25 18:31:27'),('3512a367-7c69-4eb7-9c13-0f0dbfccef12','cust_test_c9c739@example.com','$2a$10$OA5F3NAp7mZuhUmr86o4z.Gh1VE7QfrZRueB9GHrbg6GtldUjUGkK','Test','Customer','1234567890',0,0,1,NULL,'2025-12-25 18:33:03','2025-12-25 18:33:04'),('4d6cedfd-1535-4609-8704-c1772656d4b4','test.cust.1766687070@example.com','$2a$10$z.aT.jhnsOPIUNv3KKebIuefI1oBpCFwWt0kIZNTB.GVRTaJLORne','Test','Customer','1234567890',0,0,1,NULL,'2025-12-25 18:24:33','2025-12-25 18:24:36'),('5a138dfb-b5c5-4772-8684-49ea7fede3d6','test.cust.1766687111@example.com','$2a$10$GojG1wcgZ3jpS6BKoVhPWuT4GqVtO.IfSFbNVr3d4zIHrM/YFIuZ6','Test','Customer','1234567890',0,0,1,NULL,'2025-12-25 18:25:13','2025-12-25 18:25:15'),('5e1405b8-b38f-4544-b6bd-2b8f5050d953','test.ps.1766687111@example.com','$2a$10$4FBmdylLisX6YhSvOt1Fjeu7bV0TAloBIZtogEzO7DQUKffuFvPzu','Test','Server','0987654321',0,0,1,NULL,'2025-12-25 18:25:18','2025-12-25 18:25:20'),('698f70fe-fd95-4447-85fe-d9ad3e1fdcc2','cust_test_bd97fa@example.com','$2a$10$etYe2pnz8WRe9rE/4SXOe.ZL8pmnfK4wOWlX/O1xP13tiMwgX88Mq','Test','Customer','1234567890',0,0,1,NULL,'2025-12-25 18:31:59','2025-12-25 18:32:01'),('77cf4474-c68e-4287-b8a7-c2d20806a635','hitansu08@gmail.com','$2a$10$qlThwzlzBi2jY9pBtQHM/uk05Akj9K7h4plFvf/dZrIQ5awMkJy/2','hitansu','08','1234567890',0,1,1,NULL,'2025-12-26 12:07:03','2025-12-26 12:41:06'),('85c185fe-9b3c-450b-b822-c0410c5c9043','ps_test_ed3534@example.com','$2a$10$yj16ewNRSINdrtsuLRxhl.ckPpAgZ6f1me0lXw3UYE.VEDhhbglaC','Test','Server','0987654321',0,0,1,NULL,'2025-12-25 18:31:28','2025-12-25 18:31:29'),('8ea3aa94-8ca4-4070-98af-41de94fdecec','cust_test_11bde5@example.com','$2a$10$uhgtA6iQ/I/NE5.POxX3R.WKiBmGHqt5W5t4giBKcGjAps8xd35Ju','Test','Customer','1234567890',0,0,1,NULL,'2025-12-25 18:37:08','2025-12-25 18:37:09'),('98bdad35-7dd9-4997-b945-f4b88c9b8718','cust_test_9389b4@example.com','$2a$10$IowJ6FRQ6Y5/3tAXGyKs7u0EqBgxw2CgHinw/tzzDiYE/Xxy2ih4G','Test','Customer','1234567890',0,0,1,NULL,'2025-12-25 18:40:56','2025-12-25 18:40:58'),('9d983b0f-3388-436b-95e8-4dfcb28c04df','ps_test_e866c3@example.com','$2a$10$N4rWe96WtcEatdgCcwpesu/BXgtoSXTjw1E0/xNTy12lwsTWQJBbG','Test','Server','0987654321',0,0,1,NULL,'2025-12-25 18:33:05','2025-12-25 18:33:06'),('bf498344-9a8b-4130-a193-5bb5ad89cbdb','test.cust.1766687129@example.com','$2a$10$WdHmOukg9umHMOBNLdwN4eGvL7wuSxniS8cGimNHFL6XxByLdkFCu','Test','Customer','1234567890',0,0,1,NULL,'2025-12-25 18:25:31','2025-12-25 18:25:33'),('c0342272-6987-4b22-ab64-de2160e39adb','bhattarai@gmail.com','$2a$10$kY0Zn00wwWD/F76tU2h5P.Z07NJ4AsFSAHyvnow94bAm7Nf2hbFl6','Sam','Am','844-444-3434',0,1,1,NULL,'2025-12-28 04:51:46','2026-01-07 18:54:06'),('d4926c23-6af8-4341-a042-193c8efcd955','test.ps.1766687129@example.com','$2a$10$7EnfGLovsoJtySSuF.ZgV.BsXd12FpWxn4DkzL8noBgyKGJfZ7ZrC','Test','Server','0987654321',0,0,1,NULL,'2025-12-25 18:25:35','2025-12-25 18:25:37'),('dc229e6b-b2da-4ec8-a692-8bd84477db26','ps_test_42284a@example.com','$2a$10$qhVKMxU2Y2nS83HHyLIY4.6fnCVaoBpY.MC1c./bAJpN77U8zMkjK','Test','Server','0987654321',0,0,1,NULL,'2025-12-25 18:41:00','2025-12-25 18:41:01'),('e922553a-bdfd-49f0-a968-189e8897e227','ps_test_08708d@example.com','$2a$10$lX1QuveBXTMHRspXc5nWgeic1Amq8M3Ae4DvwxUDlbL.2xUOFXOp.','Test','Server','0987654321',0,0,1,NULL,'2025-12-25 18:42:15','2025-12-25 18:42:16'),('f1ebe85f-ddd1-4aab-860a-338cbf7cc861','ps_test_89e905@example.com','$2a$10$R7xdEqMxU2jIshp6d0GEG.8IW4rtG6aQ6v9INZ/usJx03EquWq.Ny','Test','Server','0987654321',0,0,1,NULL,'2025-12-25 18:32:02','2025-12-25 18:32:04'),('fa0a3be8-58eb-4810-b4d2-313a25d9a17f','verify_tenant_fix_1766751826@example.com','$2a$10$MICjpmcHhcrJfryxdjs8t.MlkRw96xWFBYq9gGN/oj9TADkf4oW4G','Verify','Tenant','1234567890',0,0,1,NULL,'2025-12-26 12:25:46',NULL),('user-admin-001','admin@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Admin','User',NULL,0,0,1,NULL,'2025-12-26 14:20:09','2025-12-30 04:29:22'),('user-cust-001','sarah.anderson@techcorp.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Sarah','Anderson','+1-214-555-0101',0,1,1,NULL,'2025-12-19 11:16:49','2026-01-09 09:03:13'),('user-cust-002','michael.chen@lawfirm.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Michael','Chen','+1-212-555-0202',0,1,1,NULL,'2025-12-19 11:16:49','2025-12-19 11:37:08'),('user-cust-003','jennifer.rodriguez@legalservices.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Jennifer','Rodriguez','+1-305-555-0303',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-cust-004','david.williams@corporate.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','David','Williams','+1-312-555-0404',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-cust-005','emily.johnson@attorneys.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Emily','Johnson','+1-713-555-0505',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-ps-001','james.mitchell@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','James','Mitchell','+1-214-555-1001',0,1,1,NULL,'2025-12-19 11:16:49','2026-01-07 12:16:05'),('user-ps-002','maria.garcia@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Maria','Garcia','+1-212-555-1002',0,1,1,NULL,'2025-12-19 11:16:49','2025-12-19 11:37:08'),('user-ps-003','robert.thompson@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Robert','Thompson','+1-305-555-1003',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-ps-004','linda.martinez@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Linda','Martinez','+1-312-555-1004',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-ps-005','william.brown@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','William','Brown','+1-713-555-1005',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-ps-006','patricia.davis@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Patricia','Davis','+1-602-555-1006',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-ps-007','christopher.wilson@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Christopher','Wilson','+1-619-555-1007',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-ps-008','barbara.moore@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Barbara','Moore','+1-415-555-1008',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-ps-009','daniel.taylor@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Daniel','Taylor','+1-206-555-1009',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-ps-010','susan.anderson@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Susan','Anderson','+1-617-555-1010',0,1,1,NULL,'2025-12-19 11:16:49',NULL),('user-superadmin-001','superadmin@processserve.com','$2b$10$eorjPSxgA.yhGYhrshzWh.zfhdDu55QK9g3MINUQ1XBCGCWgUslz.','Super','Admin',NULL,1,1,1,NULL,'2025-12-26 15:16:08','2025-12-26 15:20:02');
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
  `service_type` enum('PROCESS_SERVICE','CERTIFIED_MAIL') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `document_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uses_order_document` tinyint(1) DEFAULT '1',
  `can_edit` tinyint(1) DEFAULT '1',
  `last_edited_at` timestamp NULL DEFAULT NULL,
  `last_edited_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `certified_mail` bit(1) DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `price_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `process_server_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `process_service` bit(1) DEFAULT NULL,
  `quoted_price` decimal(10,2) DEFAULT NULL,
  `special_instructions` text COLLATE utf8mb4_unicode_ci,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
INSERT INTO `order_dropoffs` VALUES ('037bcdc9-dfec-4f5b-9d58-b817530230dc',NULL,0,'2025-12-25 18:25:16.732016',NULL,'123 Test St, Test City, TX','GUIDED','75001',NULL,NULL,75.00,5,'John Doe',1,'ASSIGNED','44719b87-1b44-4c2c-a955-76743394aae3',75.00,_binary '\0',0.00,_binary '\0',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('08ef56f0-bd2c-4783-85bd-62eb22f4420e','ps-profile-001',0,'2026-01-02 17:16:07.904337',NULL,'625 Heritage Ln','AUTOMATED','75201',NULL,NULL,1000.00,5,'Sam I Am',1,'OPEN','467f6800-6480-48f7-903e-52a9925da3ce',75.00,_binary '\0',0.00,_binary '',50.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('1d712479-f3b8-4325-b3cd-178d7d5c9c6f',NULL,0,'2025-12-28 04:54:09.931530',NULL,'Test','AUTOMATED','95101',NULL,NULL,0.00,5,'Sam',1,'OPEN','cac6d156-7ad6-4f96-afb5-565490aa2ec7',75.00,_binary '',30.00,_binary '',50.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('1f598606-2bac-4576-ba07-930f38118e91',NULL,0,'2025-12-25 18:25:33.825018',NULL,'123 Test St, Test City, TX','GUIDED','75001',NULL,NULL,75.00,5,'John Doe',1,'ASSIGNED','332bf9ec-0921-4d8e-86f4-0aedc07c667e',75.00,_binary '\0',0.00,_binary '\0',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('317cd098-ba8b-4c69-8bc3-c4256ae8b358','ps-profile-001',0,'2026-01-06 17:54:58.156822',NULL,'124 Buckin Ln','GUIDED','232323',NULL,NULL,430.00,5,'Sam I am',1,'ASSIGNED','d7deb2b2-3591-4f63-83a7-89ce2588c9a9',400.00,_binary '',30.00,_binary '\0',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,'2026-01-06 18:07:58','c0342272-6987-4b22-ab64-de2160e39adb',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('3a2013da-164c-4a4f-8491-089a28b5adcd','ps-profile-001',0,'2026-01-07 18:43:16.772744',NULL,'asdf, 3434, Colorado 75022','GUIDED','75022',NULL,NULL,0.00,5,'asdf adsf',2,'ASSIGNED','cd6d6f56-2da8-4850-a08b-1992cea76515',0.00,_binary '\0',0.00,_binary '\0',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('4106f03a-5462-45d8-9391-d35673dc2475','ps-profile-002',0,'2026-01-02 17:38:13.641870',NULL,'asdf','GUIDED','75201',NULL,NULL,3434.00,5,'asdfa',2,'ASSIGNED','4d790b6b-3458-4088-9b85-ea9669e2c54f',75.00,_binary '\0',0.00,_binary '',50.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('43089564-3b93-4c39-a40a-91146e533616','ps-profile-002',0,'2026-01-09 07:24:21.436738',NULL,'asdsaddas','GUIDED','asdas',NULL,NULL,50.00,5,'dasdasd dasdas',2,'ASSIGNED','65978682-f187-4f68-8bd0-c4a9e9024fcc',0.00,_binary '\0',0.00,_binary '',50.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('4803b72f-8376-44de-b3be-42dd75df414f',NULL,0,'2026-01-02 17:50:00.191610',NULL,'asdf','AUTOMATED','77001',NULL,NULL,0.00,5,'asdf',2,'OPEN','bccea943-aa72-472d-91fd-1b1529275c70',75.00,_binary '\0',0.00,_binary '\0',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('5a3392d7-5483-44df-8ca4-be2d8f88c12d','ps-profile-001',0,'2026-01-09 07:06:24.578697',NULL,'dasdasd','GUIDED','213123',NULL,NULL,80.00,5,'dsadasd dasdas',2,'ASSIGNED','99922325-5c17-4cb1-b669-b0cc2a4b7a42',0.00,_binary '',30.00,_binary '',50.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('5ebcb301-83e4-41d8-822d-870fdd4fa27e',NULL,0,'2026-01-07 18:57:28.142421',NULL,'asdf, 3434, Colorado 3434','AUTOMATED','3434',NULL,NULL,0.00,5,'sdf asdf',1,'OPEN','cd29181e-b623-48e5-8df0-537dc0075979',0.00,_binary '',0.00,_binary '',0.00,0,0,0.00,'CERTIFIED_MAIL',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('62366953-34f6-442c-81a6-cc564997a2f6',NULL,0,'2026-01-06 17:34:10.578700',NULL,'625 Heritage Ln','AUTOMATED','75022',NULL,NULL,0.00,5,'Mam I Am',1,'OPEN','7da4fd92-3fb3-464d-a487-f064e7f3bdac',0.00,_binary '',0.00,_binary '',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('75d9d148-4aa4-46b6-975f-1d8b6f62e5b2','ps-profile-002',0,'2026-01-05 02:54:27.220041',NULL,'asdf','GUIDED','77001',NULL,NULL,0.08,5,'sfasdf',1,'ASSIGNED','4ec7b1c6-dba5-4205-ad09-039b7aad8e09',75.00,_binary '',30.00,_binary '',50.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('7b203c10-eac6-11f0-aa3a-fa163e03686f','user-ps-001',2,'2025-12-15 09:30:00.000000','2025-12-22 14:30:00.000000','350 S Grand Ave, Suite 1200','GUIDED','90071',NULL,NULL,120.00,NULL,'Michael Rodriguez',1,'DELIVERED','7b1ff7e7-eac6-11f0-aa3a-fa163e03686f',120.00,_binary '\0',0.00,_binary '\0',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('7b210607-eac6-11f0-aa3a-fa163e03686f','user-ps-002',1,'2026-01-03 11:20:00.000000',NULL,'2847 Mission Street','GUIDED','94110',NULL,NULL,150.00,NULL,'Jennifer Chen',1,'IN_PROGRESS','7b20c80e-eac6-11f0-aa3a-fa163e03686f',100.00,_binary '\0',0.00,_binary '',50.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('7b21db4c-eac6-11f0-aa3a-fa163e03686f','user-ps-001',0,'2026-01-04 14:00:00.000000',NULL,'45 Rockefeller Plaza','GUIDED','10111',NULL,NULL,85.00,NULL,'David Thompson',1,'ASSIGNED','7b21a15d-eac6-11f0-aa3a-fa163e03686f',85.00,_binary '\0',0.00,_binary '\0',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('7b21df45-eac6-11f0-aa3a-fa163e03686f','user-ps-003',0,'2026-01-04 14:00:00.000000',NULL,'156 Fifth Avenue, Apt 12B','AUTOMATED','10010',NULL,NULL,110.00,NULL,'Sarah Williams',2,'ASSIGNED','7b21a15d-eac6-11f0-aa3a-fa163e03686f',110.00,_binary '\0',0.00,_binary '\0',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('7b225edf-eac6-11f0-aa3a-fa163e03686f',NULL,0,'2026-01-05 10:00:00.000000',NULL,'3456 N Clark Street, Unit 2F','AUTOMATED','60657',NULL,NULL,0.00,NULL,'Robert Martinez',1,'BIDDING','7b221159-eac6-11f0-aa3a-fa163e03686f',0.00,_binary '\0',0.00,_binary '\0',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('7b230ce1-eac6-11f0-aa3a-fa163e03686f',NULL,0,'2026-01-06 09:00:00.000000',NULL,'2401 Collins Avenue','AUTOMATED','33140',NULL,NULL,0.00,NULL,'Maria Garcia',1,'OPEN','7b22c2c1-eac6-11f0-aa3a-fa163e03686f',0.00,_binary '\0',0.00,_binary '',50.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('7b231197-eac6-11f0-aa3a-fa163e03686f',NULL,0,'2026-01-06 09:00:00.000000',NULL,'15800 SW 288th Street','AUTOMATED','33033',NULL,NULL,0.00,NULL,'Carlos Hernandez',2,'OPEN','7b22c2c1-eac6-11f0-aa3a-fa163e03686f',0.00,_binary '',30.00,_binary '',50.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('7b2385f7-eac6-11f0-aa3a-fa163e03686f','user-ps-001',0,'2026-01-04 16:30:00.000000',NULL,'1600 Smith Street','GUIDED','77002',NULL,NULL,95.00,NULL,'James Wilson',1,'OPEN','7b235654-eac6-11f0-aa3a-fa163e03686f',95.00,_binary '\0',0.00,_binary '\0',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('7b23ec47-eac6-11f0-aa3a-fa163e03686f','user-ps-001',3,'2025-12-18 08:00:00.000000',NULL,'401 5th Avenue','GUIDED','98104',NULL,NULL,105.00,NULL,'Thomas Anderson',1,'FAILED','7b23b613-eac6-11f0-aa3a-fa163e03686f',105.00,_binary '\0',0.00,_binary '\0',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('7bb75b28-a049-482d-aad1-f2c84d4924d0',NULL,0,'2026-01-02 17:50:00.190583',NULL,'d','AUTOMATED','75201',NULL,NULL,0.00,5,'d',1,'OPEN','bccea943-aa72-472d-91fd-1b1529275c70',75.00,_binary '\0',0.00,_binary '',50.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('8c6c0f7e-f7f1-4a58-938e-80e67a2f811a',NULL,0,'2026-01-09 07:24:21.435698',NULL,'dasdasd','AUTOMATED','dasdasd',NULL,NULL,0.00,5,'sDASD DASDASD',1,'OPEN','65978682-f187-4f68-8bd0-c4a9e9024fcc',0.00,_binary '\0',0.00,_binary '\0',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('9e54be02-6a5e-4108-845b-7da0e451ffbe',NULL,0,'2025-12-25 18:37:19.703222',NULL,'123 Main St, New York, NY 10001','GUIDED','10001',NULL,NULL,75.00,5,'John Doe',1,'ASSIGNED','9a00bd25-a07c-4961-b9c3-ce74862e9af5',75.00,_binary '\0',0.00,_binary '\0',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('a6e96f88-74ab-4b53-bcd7-b704e4495e3a',NULL,0,'2026-01-06 17:54:58.165180',NULL,'DD','AUTOMATED','33333',NULL,NULL,0.00,5,'DD',2,'OPEN','d7deb2b2-3591-4f63-83a7-89ce2588c9a9',0.00,_binary '\0',0.00,_binary '\0',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('bd28a56d-827f-47ab-b670-1f1db84d443b',NULL,0,'2026-01-07 18:43:16.770437',NULL,'asdf, 75022, Arizona 75022','AUTOMATED','75022',NULL,NULL,0.00,5,'asdf asdf',1,'OPEN','cd6d6f56-2da8-4850-a08b-1992cea76515',0.00,_binary '\0',0.00,_binary '\0',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('c023d473-3a98-4205-b179-9fe4ddfad4f2',NULL,0,'2026-01-02 17:38:13.640330',NULL,'asdf','AUTOMATED','75201',NULL,NULL,0.00,5,'asdfasdf',1,'OPEN','4d790b6b-3458-4088-9b85-ea9669e2c54f',75.00,_binary '\0',0.00,_binary '\0',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('c99f15a2-d496-4559-a22d-37e91186d64e',NULL,0,'2025-12-25 18:33:12.245575',NULL,'123 Main St, New York, NY 10001','GUIDED','10001',NULL,NULL,75.00,5,'John Doe',1,'ASSIGNED','9f0fb1b4-b362-4634-9013-26198057e76f',75.00,_binary '\0',0.00,_binary '\0',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('d912640c-73ef-4fd7-917d-ff2175396369',NULL,0,'2025-12-25 18:42:22.514020',NULL,'123 Main St, New York, NY 10001','GUIDED','10001',NULL,NULL,75.00,5,'John Doe',1,'ASSIGNED','d3cbaf28-db4b-4979-900f-0fd34a5a75d0',75.00,_binary '\0',0.00,_binary '\0',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('dbb09100-eac5-11f0-aa3a-fa163e03686f','user-ps-001',2,'2025-12-15 09:30:00.000000','2025-12-22 14:30:00.000000','350 S Grand Ave, Suite 1200','GUIDED','90071',NULL,NULL,120.00,NULL,'Michael Rodriguez',1,'DELIVERED','dbb06751-eac5-11f0-aa3a-fa163e03686f',120.00,_binary '\0',0.00,_binary '\0',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('dbb125ae-eac5-11f0-aa3a-fa163e03686f','user-ps-002',1,'2026-01-03 11:20:00.000000',NULL,'2847 Mission Street','GUIDED','94110',NULL,NULL,150.00,NULL,'Jennifer Chen',1,'IN_PROGRESS','dbb0f81d-eac5-11f0-aa3a-fa163e03686f',100.00,_binary '\0',0.00,_binary '',50.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('dbb1d215-eac5-11f0-aa3a-fa163e03686f','user-ps-001',0,'2026-01-04 14:00:00.000000',NULL,'45 Rockefeller Plaza','GUIDED','10111',NULL,NULL,85.00,NULL,'David Thompson',1,'ASSIGNED','dbb18e73-eac5-11f0-aa3a-fa163e03686f',85.00,_binary '\0',0.00,_binary '\0',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('dbb1d62c-eac5-11f0-aa3a-fa163e03686f','user-ps-003',0,'2026-01-04 14:00:00.000000',NULL,'156 Fifth Avenue, Apt 12B','AUTOMATED','10010',NULL,NULL,110.00,NULL,'Sarah Williams',2,'ASSIGNED','dbb18e73-eac5-11f0-aa3a-fa163e03686f',110.00,_binary '\0',0.00,_binary '\0',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('dbb23ecf-eac5-11f0-aa3a-fa163e03686f',NULL,0,'2026-01-05 10:00:00.000000',NULL,'3456 N Clark Street, Unit 2F','AUTOMATED','60657',NULL,NULL,0.00,NULL,'Robert Martinez',1,'BIDDING','dbb204a8-eac5-11f0-aa3a-fa163e03686f',0.00,_binary '\0',0.00,_binary '\0',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('dbb2ebc7-eac5-11f0-aa3a-fa163e03686f',NULL,0,'2026-01-06 09:00:00.000000',NULL,'2401 Collins Avenue','AUTOMATED','33140',NULL,NULL,0.00,NULL,'Maria Garcia',1,'OPEN','dbb2a3ec-eac5-11f0-aa3a-fa163e03686f',0.00,_binary '\0',0.00,_binary '',50.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('dbb2ef4a-eac5-11f0-aa3a-fa163e03686f',NULL,0,'2026-01-06 09:00:00.000000',NULL,'15800 SW 288th Street','AUTOMATED','33033',NULL,NULL,0.00,NULL,'Carlos Hernandez',2,'OPEN','dbb2a3ec-eac5-11f0-aa3a-fa163e03686f',0.00,_binary '',30.00,_binary '',50.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('dbb35938-eac5-11f0-aa3a-fa163e03686f','user-ps-001',0,'2026-01-04 16:30:00.000000',NULL,'1600 Smith Street','GUIDED','77002',NULL,NULL,95.00,NULL,'James Wilson',1,'OPEN','dbb32473-eac5-11f0-aa3a-fa163e03686f',95.00,_binary '\0',0.00,_binary '\0',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('dbb3d38d-eac5-11f0-aa3a-fa163e03686f','user-ps-001',3,'2025-12-18 08:00:00.000000',NULL,'401 5th Avenue','GUIDED','98104',NULL,NULL,105.00,NULL,'Thomas Anderson',1,'FAILED','dbb38a22-eac5-11f0-aa3a-fa163e03686f',105.00,_binary '\0',0.00,_binary '\0',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('drop-asg-002','ps-profile-002',0,'2025-12-17 17:50:28.000000',NULL,'567 Fifth Ave, New York, NY 10003','GUIDED','10003',NULL,NULL,NULL,3,'Lisa Anderson',1,'ASSIGNED','ord-asg-002',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('drop-bid-002',NULL,0,'2025-12-18 17:50:28.000000',NULL,'123 Broadway, New York, NY 10001','AUTOMATED','10001',NULL,NULL,NULL,3,'David Kim',1,'OPEN','ord-bid-002',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('drop-bid-003',NULL,0,'2025-12-19 14:50:28.000000',NULL,'456 Beach Blvd, Miami, FL 33140','AUTOMATED','33140',NULL,NULL,NULL,3,'Maria Santos',1,'OPEN','ord-bid-003',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('drop-c1-002','ps-profile-001',1,'2025-12-16 17:01:52.000000',NULL,'789 Elm Avenue, Fort Worth, TX 76102','GUIDED','76102',NULL,NULL,NULL,3,'Lisa Thompson',1,'IN_PROGRESS','ord-c1-002',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('drop-c2-001','ps-profile-002',1,'2025-12-07 17:01:52.000000','2025-12-13 17:01:52.000000','789 Broadway, Apt 15C, New York, NY 10003','GUIDED','10003',NULL,NULL,175.00,3,'Peter Johnson',1,'DELIVERED','ord-c2-001',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('drop-c2-002','ps-profile-002',2,'2025-12-14 17:01:52.000000',NULL,'456 Park Avenue South, New York, NY 10002','GUIDED','10002',NULL,NULL,NULL,3,'Maria Rodriguez',1,'IN_PROGRESS','ord-c2-002',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('drop-c2-003',NULL,0,'2025-12-17 17:01:52.000000',NULL,'234 Atlantic Avenue, Brooklyn, NY 11201','AUTOMATED','11201',NULL,NULL,NULL,3,'Thomas Anderson',1,'OPEN','ord-c2-003',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('drop-c2-004','ps-profile-002',2,'2025-12-01 17:01:52.000000','2025-12-07 17:01:52.000000','567 Queens Boulevard, Queens, NY 11215','GUIDED','11215',NULL,NULL,145.00,3,'Linda Chen',1,'DELIVERED','ord-c2-004',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('drop-c2-005',NULL,0,'2025-12-19 17:01:52.000000',NULL,'890 Madison Avenue, New York, NY 10001','AUTOMATED','10001',NULL,NULL,NULL,3,'Richard Park',1,'OPEN','ord-c2-005',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('drop-c2-006','ps-profile-002',1,'2025-12-16 17:01:52.000000',NULL,'123 Lexington Ave, New York, NY 10002','GUIDED','10002',NULL,NULL,NULL,3,'Susan Kim',1,'IN_PROGRESS','ord-c2-006',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('drop-c3-001','ps-profile-003',1,'2025-12-05 17:01:52.000000','2025-12-11 17:01:52.000000','456 Ocean Drive, Miami Beach, FL 33139','GUIDED','33139',NULL,NULL,155.00,3,'Carlos Mendez',1,'DELIVERED','ord-c3-001',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('drop-c3-002','ps-profile-003',2,'2025-12-13 17:01:52.000000',NULL,'789 Biscayne Boulevard, Miami, FL 33131','GUIDED','33131',NULL,NULL,NULL,3,'Ana Fernandez',1,'IN_PROGRESS','ord-c3-002',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('drop-c3-003',NULL,0,'2025-12-18 17:01:52.000000',NULL,'234 Coral Way, Coral Gables, FL 33134','AUTOMATED','33134',NULL,NULL,NULL,3,'Miguel Santos',1,'OPEN','ord-c3-003',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('drop-c3-004',NULL,0,'2025-12-19 17:01:52.000000',NULL,'567 SW 8th Street, Miami, FL 33101','AUTOMATED','33101',NULL,NULL,NULL,3,'Isabella Garcia',1,'OPEN','ord-c3-004',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('drop-c3-005','ps-profile-003',2,'2025-12-03 17:01:52.000000','2025-12-09 17:01:52.000000','890 Collins Avenue, Miami Beach, FL 33139','GUIDED','33139',NULL,NULL,165.00,3,'Diego Ramirez',1,'DELIVERED','ord-c3-005',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('drop-c3-006','ps-profile-003',1,'2025-12-15 17:01:52.000000',NULL,'123 Miracle Mile, Coral Gables, FL 33134','GUIDED','33134',NULL,NULL,NULL,3,'Sofia Martinez',1,'IN_PROGRESS','ord-c3-006',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('drop-c3-007',NULL,0,'2025-12-19 17:01:52.000000',NULL,'345 Flagler Street, Miami, FL 33131','AUTOMATED','33131',NULL,NULL,NULL,3,'Juan Lopez',1,'OPEN','ord-c3-007',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('drop-c3-008','ps-profile-003',3,'2025-11-27 17:01:52.000000','2025-12-03 17:01:52.000000','678 NW 7th Avenue, Miami, FL 33101','GUIDED','33101',NULL,NULL,180.00,3,'Carmen Diaz',1,'DELIVERED','ord-c3-008',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('drop-c4-001','ps-profile-004',1,'2025-12-09 17:01:52.000000','2025-12-15 17:01:52.000000','456 Michigan Avenue, Chicago, IL 60611','GUIDED','60611',NULL,NULL,125.00,3,'William O\'Brien',1,'DELIVERED','ord-c4-001',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('drop-c4-002','ps-profile-004',2,'2025-12-16 17:01:52.000000',NULL,'789 State Street, Chicago, IL 60602','GUIDED','60602',NULL,NULL,NULL,3,'Mary Johnson',1,'IN_PROGRESS','ord-c4-002',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('drop-c4-003',NULL,0,'2025-12-19 17:01:52.000000',NULL,'234 LaSalle Street, Chicago, IL 60603','AUTOMATED','60603',NULL,NULL,NULL,3,'Patrick Murphy',1,'OPEN','ord-c4-003',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('drop-c5-001','ps-profile-005',1,'2025-12-14 17:01:52.000000',NULL,'567 Main Street, Houston, TX 77002','GUIDED','77002',NULL,NULL,NULL,3,'Rebecca Smith',1,'IN_PROGRESS','ord-c5-001',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('drop-c5-002',NULL,0,'2025-12-19 17:01:52.000000',NULL,'890 Travis Street, Houston, TX 77003','AUTOMATED','77003',NULL,NULL,NULL,3,'Christopher Lee',1,'OPEN','ord-c5-002',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('drop-canc-001',NULL,0,'2025-12-16 17:50:28.000000',NULL,'789 Travis St, Houston, TX 77003','AUTOMATED','77003',NULL,NULL,NULL,3,'Patricia Davis',1,'OPEN','ord-canc-001',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('drop-fail-001','ps-profile-003',3,'2025-12-09 17:50:28.000000',NULL,'890 Collins Ave, Miami, FL 33141','GUIDED','33141',NULL,NULL,NULL,3,'Carlos Mendez',1,'FAILED','ord-fail-001',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('drop-fail-002','ps-profile-004',3,'2025-12-04 17:50:28.000000',NULL,'432 Lake Shore Dr, Chicago, IL 60602','GUIDED','60602',NULL,NULL,NULL,3,'Nancy White',1,'FAILED','ord-fail-002',NULL,NULL,NULL,NULL,NULL,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('e2a8ae34-59d6-420d-8514-fb1470807c42',NULL,0,'2026-01-07 19:02:47.161229',NULL,'aasdf','AUTOMATED','75022',NULL,NULL,0.00,5,'sdf',1,'OPEN','afb4950f-b8e7-4552-91ea-15a1140d95ee',0.00,_binary '\0',0.00,_binary '\0',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ea20c77e-5b23-4f82-a324-abd2fa15ee53',NULL,0,'2025-12-25 18:41:07.195570',NULL,'123 Main St, New York, NY 10001','GUIDED','10001',NULL,NULL,75.00,5,'John Doe',1,'ASSIGNED','8693ce4a-d80a-422d-8113-9f78520050f5',75.00,_binary '\0',0.00,_binary '\0',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ef5ba1fa-41b9-49ec-a17c-c148978eeb7e',NULL,0,'2026-01-09 07:06:24.577632',NULL,'dasdasd','AUTOMATED','312312',NULL,NULL,0.00,5,'dasdasd asdasd',1,'OPEN','99922325-5c17-4cb1-b669-b0cc2a4b7a42',0.00,_binary '\0',0.00,_binary '',0.00,0,0,0.00,'PROCESS_SERVICE',NULL,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `order_dropoffs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_history`
--

DROP TABLE IF EXISTS `order_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_history` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dropoff_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `changed_by_user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `changed_by_role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `change_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `field_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `old_value` text COLLATE utf8mb4_unicode_ci,
  `new_value` text COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_history_order` (`order_id`),
  KEY `idx_order_history_dropoff` (`dropoff_id`),
  KEY `idx_order_history_created_at` (`created_at` DESC),
  CONSTRAINT `order_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_history_ibfk_2` FOREIGN KEY (`dropoff_id`) REFERENCES `order_dropoffs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_history`
--

LOCK TABLES `order_history` WRITE;
/*!40000 ALTER TABLE `order_history` DISABLE KEYS */;
INSERT INTO `order_history` VALUES ('056b94d7-ed40-4b27-abe3-a88dfc191678','1134d2e8-6033-4084-9331-1625fcdc2dd6',NULL,'user-cust-001','CUSTOMER','EDITED','documentType','CIVIL_COMPLAINT','RESTRAINING_ORDER','Updated document type from \'CIVIL_COMPLAINT\' to \'RESTRAINING_ORDER\'','2026-01-05 17:56:09'),('0a591303-93c0-4c0a-9c03-379f462a1b44','2820a6ff-cc0a-49d6-b263-2e3f1be729cb','dd279ef3-2aec-4fcb-a1c7-5be8ec8256fe','user-cust-001','CUSTOMER','EDITED','rushService','true','false','Updated rush service from \'true\' to \'false\'','2026-01-05 19:57:21'),('0df5cc83-8f8d-4b8c-bd9e-25152e2829e5','1134d2e8-6033-4084-9331-1625fcdc2dd6',NULL,'user-cust-001','CUSTOMER','EDITED','otherDocumentType',NULL,'','Updated other document type from \'empty\' to \'\'','2026-01-05 17:56:09'),('1755279f-83ee-418f-afad-07e540e9ce42','2820a6ff-cc0a-49d6-b263-2e3f1be729cb','33d77b99-9e7d-4d26-804b-d13a6b9ada69','user-cust-001','CUSTOMER','EDITED','remoteLocation','true','false','Updated remote location from \'true\' to \'false\'','2026-01-05 19:56:53'),('1bd9dd9f-e33f-4d24-8009-f22ccf453bcd','eb430a88-2dbb-441b-8735-6e338956b61d','2fa08054-5743-4dd4-8f53-b5f5420b3d8b','user-cust-001','CUSTOMER','EDITED','recipientName','ksbacsa','rec1','Updated recipient name from \'ksbacsa\' to \'rec1\'','2026-01-05 15:50:18'),('1c78bd0f-3e1f-4cf1-9fe5-6ce9c24fbaab','2820a6ff-cc0a-49d6-b263-2e3f1be729cb','dd279ef3-2aec-4fcb-a1c7-5be8ec8256fe','user-cust-001','CUSTOMER','EDITED','finalAgreedPrice','646.96','566.96','Updated final agreed price from \'646.96\' to \'566.96\'','2026-01-05 19:57:21'),('1e1d4869-f7f8-4575-9a6d-5de8c62f794a','eb430a88-2dbb-441b-8735-6e338956b61d',NULL,'user-cust-001','CUSTOMER','EDITED','otherDocumentType',NULL,'','Updated other document type from \'empty\' to \'\'','2026-01-05 16:58:22'),('2a884157-9106-409a-a864-720fb5d94723','eb430a88-2dbb-441b-8735-6e338956b61d',NULL,'user-cust-001','CUSTOMER','EDITED','documentType','DIVORCE_PAPERS','SMALL_CLAIMS','Updated document type from \'DIVORCE_PAPERS\' to \'SMALL_CLAIMS\'','2026-01-05 16:58:22'),('3ced7b53-55d6-4926-806f-15bc5a9f631b','eb430a88-2dbb-441b-8735-6e338956b61d','2fa08054-5743-4dd4-8f53-b5f5420b3d8b','user-cust-001','CUSTOMER','EDITED','recipientName','rec1','rec1.1','Updated recipient name from \'rec1\' to \'rec1.1\'','2026-01-05 16:19:19'),('3e4ec5de-3fc4-4aa3-8f99-14db0e6cac7e','2820a6ff-cc0a-49d6-b263-2e3f1be729cb',NULL,'user-cust-001','CUSTOMER','EDITED','otherDocumentType',NULL,'','Updated other document type from \'empty\' to \'\'','2026-01-05 19:29:15'),('47fb3243-9094-4cfb-821e-fe6b61b9343d','eb430a88-2dbb-441b-8735-6e338956b61d','2fa08054-5743-4dd4-8f53-b5f5420b3d8b','user-cust-001','CUSTOMER','EDITED','serviceType','CERTIFIED_MAIL','PROCESS_SERVICE','Updated service type from \'CERTIFIED_MAIL\' to \'PROCESS_SERVICE\'','2026-01-05 16:19:19'),('4ef585f2-c9c2-487f-b0f6-d858b8051627','2820a6ff-cc0a-49d6-b263-2e3f1be729cb',NULL,'user-cust-001','CUSTOMER','EDITED','deadline','2026-01-07T00:53','2026-01-06T13:53','Updated deadline from \'2026-01-07T00:53\' to \'2026-01-06T13:53\'','2026-01-05 19:29:15'),('4f0d0d70-e2a6-495e-9078-c49b13ce3c55','2820a6ff-cc0a-49d6-b263-2e3f1be729cb','dd279ef3-2aec-4fcb-a1c7-5be8ec8256fe','user-cust-001','CUSTOMER','EDITED','finalAgreedPrice','566.96','646.96','Updated final agreed price from \'566.96\' to \'646.96\'','2026-01-05 19:57:39'),('5a6b287c-4da0-450a-828c-b8aa7c2d5433','d7deb2b2-3591-4f63-83a7-89ce2588c9a9',NULL,'c0342272-6987-4b22-ab64-de2160e39adb','CUSTOMER','EDITED','deadline','2026-01-08T11:37','2026-01-08T23:37','Updated deadline from \'2026-01-08T11:37\' to \'2026-01-08T23:37\'','2026-01-06 18:08:35'),('5c1169d8-8e5d-4159-9375-9ee6f29ce4b6','eb430a88-2dbb-441b-8735-6e338956b61d',NULL,'user-cust-001','CUSTOMER','EDITED','deadline','2025-12-26T07:48','2025-12-25T20:48','Updated deadline from \'2025-12-26T07:48\' to \'2025-12-25T20:48\'','2026-01-05 16:58:22'),('5d24b92e-b3b7-42bc-8514-6ff1cd9ff043','2820a6ff-cc0a-49d6-b263-2e3f1be729cb','dd279ef3-2aec-4fcb-a1c7-5be8ec8256fe','user-cust-001','CUSTOMER','EDITED','rushService','false','true','Updated rush service from \'false\' to \'true\'','2026-01-05 19:52:56'),('63e5a5e2-1586-4e66-a77d-5a3853398995','1134d2e8-6033-4084-9331-1625fcdc2dd6',NULL,'user-cust-001','CUSTOMER','EDITED','jurisdiction','juri 1','juri 1.1','Updated jurisdiction from \'juri 1\' to \'juri 1.1\'','2026-01-05 17:56:09'),('64057466-e32b-45cd-9dcf-9c78111b82e7','2820a6ff-cc0a-49d6-b263-2e3f1be729cb','dd279ef3-2aec-4fcb-a1c7-5be8ec8256fe','user-cust-001','CUSTOMER','EDITED','remoteLocation','false','true','Updated remote location from \'false\' to \'true\'','2026-01-05 19:57:39'),('71ac55df-5b53-4f82-87cb-d7fad6fb7ed6','1134d2e8-6033-4084-9331-1625fcdc2dd6',NULL,'user-cust-001','CUSTOMER','EDITED','caseNumber','case no 12345','case no 1234','Updated case number from \'case no 12345\' to \'case no 1234\'','2026-01-05 17:56:09'),('736dcb8e-f508-4938-bd93-349a6b2cf09e','2820a6ff-cc0a-49d6-b263-2e3f1be729cb','dd279ef3-2aec-4fcb-a1c7-5be8ec8256fe','user-cust-001','CUSTOMER','EDITED','finalAgreedPrice','596.96','646.96','Updated final agreed price from \'596.96\' to \'646.96\'','2026-01-05 19:52:56'),('744cadc8-1d03-4fc7-88c8-235cf5ef3273','2820a6ff-cc0a-49d6-b263-2e3f1be729cb','dd279ef3-2aec-4fcb-a1c7-5be8ec8256fe','user-cust-001','CUSTOMER','EDITED','remoteLocation','true','false','Updated remote location from \'true\' to \'false\'','2026-01-05 19:57:21'),('83af6c07-128e-4d6d-93d8-2dea1b4df3e2','eb430a88-2dbb-441b-8735-6e338956b61d','2fa08054-5743-4dd4-8f53-b5f5420b3d8b','user-cust-001','CUSTOMER','EDITED','dropoffZipCode','75201','752201','Updated dropoff zip code from \'75201\' to \'752201\'','2026-01-05 16:19:19'),('8cf4909f-1791-4de7-beb5-6dd5582f4292','2820a6ff-cc0a-49d6-b263-2e3f1be729cb','dd279ef3-2aec-4fcb-a1c7-5be8ec8256fe','user-cust-001','CUSTOMER','EDITED','rushService','true','false','Updated rush service from \'true\' to \'false\'','2026-01-05 20:01:00'),('9e0097c0-fb8f-43e6-a1b2-aef296e22cce','1134d2e8-6033-4084-9331-1625fcdc2dd6',NULL,'user-cust-001','CUSTOMER','EDITED','deadline','2026-01-01T17:32','2026-01-01T06:32','Updated deadline from \'2026-01-01T17:32\' to \'2026-01-01T06:32\'','2026-01-05 17:56:09'),('a2bdfa32-d1c6-42b7-97a7-24449f6a15ab','2820a6ff-cc0a-49d6-b263-2e3f1be729cb','33d77b99-9e7d-4d26-804b-d13a6b9ada69','user-cust-001','CUSTOMER','EDITED','rushService','false','true','Updated rush service from \'false\' to \'true\'','2026-01-05 19:57:30'),('b2db1b0e-c413-4d19-92c5-85ba1d0f89aa','eb430a88-2dbb-441b-8735-6e338956b61d','2fa08054-5743-4dd4-8f53-b5f5420b3d8b','user-cust-001','CUSTOMER','EDITED','dropoffAddress','ksaciasbsa','Add 1','Updated dropoff address from \'ksaciasbsa\' to \'Add 1\'','2026-01-05 16:19:19'),('b9642331-97b8-4c2f-a9e9-9382eb944436','2820a6ff-cc0a-49d6-b263-2e3f1be729cb',NULL,'user-cust-001','CUSTOMER','EDITED','documentType','RESTRAINING_ORDER','HOUSE_ARREST','Updated document type from \'RESTRAINING_ORDER\' to \'HOUSE_ARREST\'','2026-01-05 19:29:15'),('c14b9c74-76ad-4dcf-b37e-b707045f7648','d7deb2b2-3591-4f63-83a7-89ce2588c9a9',NULL,'c0342272-6987-4b22-ab64-de2160e39adb','CUSTOMER','EDITED','documentType','OTHER','CHILD_CUSTODY','Updated document type from \'OTHER\' to \'CHILD_CUSTODY\'','2026-01-06 18:08:35'),('c18e08f9-d9f3-4c59-bdf2-086aed3b1323','2820a6ff-cc0a-49d6-b263-2e3f1be729cb','dd279ef3-2aec-4fcb-a1c7-5be8ec8256fe','user-cust-001','CUSTOMER','EDITED','finalAgreedPrice','646.96','596.96','Updated final agreed price from \'646.96\' to \'596.96\'','2026-01-05 20:01:00'),('cdde8a51-3482-4402-85fa-1ce828b466d7','1134d2e8-6033-4084-9331-1625fcdc2dd6',NULL,'user-cust-001','CUSTOMER','EDITED','specialInstructions','test after deployment ','test after deployment 1','Updated special instructions from \'test after deployment \' to \'test after deployment 1\'','2026-01-05 17:56:09'),('d2648897-dafb-4c92-85ed-a1480410ee84','2820a6ff-cc0a-49d6-b263-2e3f1be729cb','33d77b99-9e7d-4d26-804b-d13a6b9ada69','user-cust-001','CUSTOMER','EDITED','rushService','true','false','Updated rush service from \'true\' to \'false\'','2026-01-05 19:56:53'),('d6c86f8a-a8be-4527-8349-9e9d30336735','2820a6ff-cc0a-49d6-b263-2e3f1be729cb','dd279ef3-2aec-4fcb-a1c7-5be8ec8256fe','user-cust-001','CUSTOMER','EDITED','rushService','false','true','Updated rush service from \'false\' to \'true\'','2026-01-05 19:57:39'),('e1d9cf31-ee01-4f7e-9b33-2c086e87ce31','d7deb2b2-3591-4f63-83a7-89ce2588c9a9','317cd098-ba8b-4c69-8bc3-c4256ae8b358','c0342272-6987-4b22-ab64-de2160e39adb','CUSTOMER','EDITED','remoteLocation','false','true','Updated remote location from \'false\' to \'true\'','2026-01-06 18:07:58');
/*!40000 ALTER TABLE `order_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_messages`
--

DROP TABLE IF EXISTS `order_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_messages` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_role` enum('CUSTOMER','ADMIN','SERVER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `modified_by_user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `modification_type` enum('UPDATE_DETAILS','CANCEL','ADD_DROPOFF','REMOVE_DROPOFF','MODIFY_DROPOFF','UPDATE_DEADLINE','UPDATE_INSTRUCTIONS') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `modification_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
INSERT INTO `order_modifications` VALUES ('1ca9d130-9a35-4602-a335-5cdda28b4196','467f6800-6480-48f7-903e-52a9925da3ce','c0342272-6987-4b22-ab64-de2160e39adb','UPDATE_DETAILS','{\"deadline\": \"2025-12-18T04:35\", \"orderType\": \"PROCESS_SERVICE\", \"caseNumber\": \"CV-121212\", \"documentType\": \"CIVIL_COMPLAINT\", \"dropoffCount\": 1, \"jurisdiction\": \"Test List\", \"specialInstructions\": \"\"}','{\"deadline\": \"2025-12-17T04:35\", \"orderType\": \"PROCESS_SERVICE\", \"caseNumber\": \"CV-121212\", \"documentType\": \"CIVIL_COMPLAINT\", \"dropoffCount\": 1, \"jurisdiction\": \"Test List\", \"specialInstructions\": \"\"}','Hello','2026-01-02 17:32:23'),('2223bc21-d8f4-4ad1-b656-fb522dd7ccd9','332bf9ec-0921-4d8e-86f4-0aedc07c667e','system','CANCEL','{\"status\": \"ASSIGNED\"}','{\"status\": \"CANCELLED\"}','Test Cleanup','2025-12-25 18:25:40'),('258d285e-6080-4dd2-910a-6f1f4afb3180','1134d2e8-6033-4084-9331-1625fcdc2dd6','user-cust-001','UPDATE_DETAILS','{\"deadline\": \"2026-01-01T17:32\", \"orderType\": \"PROCESS_SERVICE\", \"caseNumber\": \"case no 12345\", \"documentType\": \"CIVIL_COMPLAINT\", \"dropoffCount\": 2, \"jurisdiction\": \"juri 1\", \"specialInstructions\": \"test after deployment \"}','{\"deadline\": \"2026-01-01T06:32\", \"orderType\": \"PROCESS_SERVICE\", \"caseNumber\": \"case no 1234\", \"documentType\": \"RESTRAINING_ORDER\", \"dropoffCount\": 2, \"jurisdiction\": \"juri 1.1\", \"specialInstructions\": \"test after deployment 1\"}',NULL,'2026-01-05 17:56:09'),('39fc2606-d2dd-4c65-b636-26cef6fbc857','ord-bid-001','test-user-verification','UPDATE_DETAILS','{\"deadline\": \"2025-12-25T18:00\", \"orderType\": \"PROCESS_SERVICE\", \"caseNumber\": \"CASE-TEST-2025-001\", \"documentType\": \"SUBPOENA\", \"dropoffCount\": 1, \"jurisdiction\": \"Superior Court - Test County\", \"specialInstructions\": \"UPDATED: Testing order update - please call ahead\"}','{\"deadline\": \"2025-12-25T18:00\", \"orderType\": \"PROCESS_SERVICE\", \"caseNumber\": \"CASE-TEST-2025-001\", \"documentType\": \"SUBPOENA\", \"dropoffCount\": 1, \"jurisdiction\": \"Superior Court - Test County\", \"specialInstructions\": \"Final verification test\"}','Verifying Requirement 8 implementation','2025-12-25 05:36:44'),('55da7e3b-a37f-445d-a2dc-6ce13b3916d7','eb430a88-2dbb-441b-8735-6e338956b61d','user-cust-001','UPDATE_DETAILS','{\"deadline\": \"2025-12-26T18:48\", \"orderType\": \"PROCESS_SERVICE\", \"caseNumber\": \"iodjsnvinda\", \"documentType\": \"DIVORCE_PAPERS\", \"dropoffCount\": 2, \"jurisdiction\": \"cascnsaincs\", \"specialInstructions\": \"as,caksjnbcasncs\"}','{\"deadline\": \"2025-12-26T07:48\", \"orderType\": \"PROCESS_SERVICE\", \"caseNumber\": \"case 001\", \"documentType\": \"DIVORCE_PAPERS\", \"dropoffCount\": 2, \"jurisdiction\": \"juri 1\", \"specialInstructions\": \"edit 2\"}',NULL,'2026-01-05 16:30:44'),('637d19e4-c176-45c2-8a0c-3605854f6916','ord-bid-001','test-user-001','UPDATE_DETAILS','{\"deadline\": \"2025-12-25T18:00\", \"orderType\": \"null\", \"caseNumber\": \"null\", \"documentType\": \"null\", \"dropoffCount\": 1, \"jurisdiction\": \"null\", \"specialInstructions\": \"null\"}','{\"deadline\": \"2025-12-25T18:00\", \"orderType\": \"PROCESS_SERVICE\", \"caseNumber\": \"CASE-TEST-2025-001\", \"documentType\": \"SUBPOENA\", \"dropoffCount\": 1, \"jurisdiction\": \"Superior Court - Test County\", \"specialInstructions\": \"UPDATED: Testing order update - please call ahead\"}','Testing Requirement 8 update functionality','2025-12-25 05:13:26'),('7555538e-fb53-4d9d-a5d1-9a223266c7a7','cac6d156-7ad6-4f96-afb5-565490aa2ec7','c0342272-6987-4b22-ab64-de2160e39adb','CANCEL','{\"status\": \"OPEN\"}','{\"status\": \"CANCELLED\"}','Don\'t need it - ','2026-01-02 17:08:27'),('888107e7-9ceb-4d4d-8b9d-8c535c63e7b0','ord-c1-003','test-user-001','CANCEL','{\"status\": \"OPEN\"}','{\"status\": \"CANCELLED\"}','Testing cancellation - client request - Full refund to be processed','2025-12-25 05:14:01'),('8bf55680-32c4-4150-9cb8-efb6ad185bf4','800c031f-0f73-4c57-9772-f1517189a5d5','user-cust-001','CANCEL','{\"status\": \"OPEN\"}','{\"status\": \"CANCELLED\"}','wqcqwc - cqwwcwq','2025-12-25 13:22:06'),('9bc118d2-ea82-4449-893a-a61d35021e67','d7deb2b2-3591-4f63-83a7-89ce2588c9a9','c0342272-6987-4b22-ab64-de2160e39adb','UPDATE_DETAILS','{\"deadline\": \"2026-01-08T11:37\", \"orderType\": \"PROCESS_SERVICE\", \"caseNumber\": \"77777\", \"documentType\": \"OTHER\", \"dropoffCount\": 2, \"jurisdiction\": \"LA\", \"specialInstructions\": \"I want to deliver it today\"}','{\"deadline\": \"2026-01-08T23:37\", \"orderType\": \"PROCESS_SERVICE\", \"caseNumber\": \"77777\", \"documentType\": \"CHILD_CUSTODY\", \"dropoffCount\": 2, \"jurisdiction\": \"LA\", \"specialInstructions\": \"I want to deliver it today\"}',NULL,'2026-01-06 18:08:35'),('e9ac88f9-89cf-4dc4-842a-ebe62f4bc691','7da4fd92-3fb3-464d-a487-f064e7f3bdac','c0342272-6987-4b22-ab64-de2160e39adb','CANCEL','{\"status\": \"OPEN\"}','{\"status\": \"CANCELLED\"}','sdfgsdfg - ','2026-01-06 17:35:13'),('f3eaad7e-1fd6-4fe3-bb3a-2b5425cfd3e2','eb430a88-2dbb-441b-8735-6e338956b61d','user-cust-001','UPDATE_DETAILS','{\"deadline\": \"2025-12-26T07:48\", \"orderType\": \"PROCESS_SERVICE\", \"caseNumber\": \"case 001\", \"documentType\": \"DIVORCE_PAPERS\", \"dropoffCount\": 2, \"jurisdiction\": \"juri 1\", \"specialInstructions\": \"edit 2\"}','{\"deadline\": \"2025-12-25T20:48\", \"orderType\": \"PROCESS_SERVICE\", \"caseNumber\": \"case 001\", \"documentType\": \"SMALL_CLAIMS\", \"dropoffCount\": 2, \"jurisdiction\": \"juri 1\", \"specialInstructions\": \"edit 2\"}',NULL,'2026-01-05 16:58:22'),('f8fc6937-e98d-44d3-a9dc-6a0f3690db2a','2820a6ff-cc0a-49d6-b263-2e3f1be729cb','user-cust-001','UPDATE_DETAILS','{\"deadline\": \"2026-01-07T00:53\", \"orderType\": \"PROCESS_SERVICE\", \"caseNumber\": \"2 dropoff check\", \"documentType\": \"RESTRAINING_ORDER\", \"dropoffCount\": 2, \"jurisdiction\": \"ushxciuas\", \"specialInstructions\": \"salkcnioasc\"}','{\"deadline\": \"2026-01-06T13:53\", \"orderType\": \"PROCESS_SERVICE\", \"caseNumber\": \"2 dropoff check\", \"documentType\": \"HOUSE_ARREST\", \"dropoffCount\": 2, \"jurisdiction\": \"ushxciuas\", \"specialInstructions\": \"salkcnioasc\"}',NULL,'2026-01-05 19:29:15');
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
  `deadline` datetime DEFAULT NULL,
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
  `order_type` enum('PROCESS_SERVICE','CERTIFIED_MAIL') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `other_document_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `document_url` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `page_count` int DEFAULT NULL,
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
INSERT INTO `orders` VALUES ('332bf9ec-0921-4d8e-86f4-0aedc07c667e','2025-12-25 18:25:33.815760',NULL,NULL,'2025-12-25 18:25:40',1,'2025-12-25 18:25:33.822653','bf498344-9a8b-4130-a193-5bb5ad89cbdb',86.25,'2025-12-31 00:00:00',NULL,_binary '\0','Ccbdb-ORD1',NULL,75.00,NULL,'CANCELLED',0,0.56,11.25,'tenant-main-001',10.69,1,'CASE-1766687129','SUBPOENA','Test County','PROCESS_SERVICE',NULL,NULL,NULL),('44719b87-1b44-4c2c-a955-76743394aae3','2025-12-25 18:25:16.588401',NULL,NULL,NULL,0,'2025-12-25 18:25:16.679029','5a138dfb-b5c5-4772-8684-49ea7fede3d6',86.25,'2025-12-31 00:00:00',NULL,_binary '\0','Ce3d6-ORD1',NULL,75.00,NULL,'ASSIGNED',1,0.56,11.25,'tenant-main-001',10.69,1,'CASE-1766687111','SUBPOENA','Test County','PROCESS_SERVICE',NULL,NULL,NULL),('467f6800-6480-48f7-903e-52a9925da3ce',NULL,NULL,NULL,'2026-01-02 17:32:23',1,'2026-01-02 17:16:07.892613','012c48ba-563d-4d01-a338-e4a11cebf9ed',0.00,'2025-12-17 00:00:00',NULL,_binary '\0','Cf9ed-ORD2',NULL,0.00,'','OPEN',1,0.00,0.00,'tenant-main-001',0.00,1,'CV-121212','CIVIL_COMPLAINT','Test List','PROCESS_SERVICE',NULL,NULL,NULL),('4d790b6b-3458-4088-9b85-ea9669e2c54f',NULL,NULL,NULL,NULL,0,'2026-01-02 17:38:13.638004','012c48ba-563d-4d01-a338-e4a11cebf9ed',3949.10,'2026-01-14 00:00:00',NULL,_binary '','Cf9ed-ORD3',NULL,3434.00,'asdfasd','PARTIALLY_ASSIGNED',1,25.76,515.10,'tenant-main-001',489.35,2,'23232','RESTRAINING_ORDER','2323','PROCESS_SERVICE',NULL,NULL,NULL),('4ec7b1c6-dba5-4205-ad09-039b7aad8e09','2026-01-05 02:54:27.205237',NULL,NULL,NULL,0,'2026-01-05 02:54:27.214640','012c48ba-563d-4d01-a338-e4a11cebf9ed',0.09,'2026-01-04 00:00:00',NULL,_binary '\0','Cf9ed-ORD5',NULL,0.08,'','ASSIGNED',1,0.00,0.01,'tenant-main-001',0.01,1,'CV-111','SMALL_CLAIMS','','PROCESS_SERVICE',NULL,NULL,NULL),('52a4a386-0ee4-421a-a1ea-8dc7f38834d0',NULL,NULL,NULL,'2026-01-09 08:42:54',0,'2026-01-09 08:42:40.187676','tur-cust-001',0.00,'2026-01-10 00:00:00',NULL,_binary '\0','C-001-ORD14',NULL,0.00,NULL,'DRAFT',1,0.00,0.00,'tenant-main-001',0.00,0,'jhghj',NULL,'kj km','PROCESS_SERVICE',NULL,NULL,NULL),('65978682-f187-4f68-8bd0-c4a9e9024fcc',NULL,NULL,NULL,NULL,0,'2026-01-09 07:24:21.434018','tur-cust-001',57.50,'2026-01-10 00:00:00',NULL,_binary '','C-001-ORD11',NULL,50.00,NULL,'PARTIALLY_ASSIGNED',1,0.38,7.50,'tenant-main-001',7.13,2,'asdasd','OTHER','dasdasd','PROCESS_SERVICE',NULL,NULL,NULL),('6bb5cd3c-8237-465a-b777-b7702cc76166',NULL,NULL,NULL,'2026-01-09 08:41:50',0,'2026-01-09 07:49:21.909691','tur-cust-001',0.00,'2026-01-10 00:00:00',NULL,_binary '\0','C-001-ORD13',NULL,0.00,NULL,'DRAFT',1,0.00,0.00,'tenant-main-001',0.00,0,'aDSASD',NULL,'DASDAS','PROCESS_SERVICE',NULL,NULL,NULL),('7b1ff7e7-eac6-11f0-aa3a-fa163e03686f','2025-12-16 11:00:00.000000',NULL,'2025-12-22 14:45:00.000000',NULL,0,'2025-12-15 09:30:00.000000','tur-cust-001',NULL,'2025-12-28 00:00:00',NULL,NULL,'C-001-ORD1',NULL,NULL,'Please serve during business hours','COMPLETED',1,NULL,NULL,'tenant-main-001',NULL,1,'CV-2025-12345','RESTRAINING_ORDER','Los Angeles County Superior Court',NULL,NULL,NULL,NULL),('7b20c80e-eac6-11f0-aa3a-fa163e03686f','2026-01-04 09:00:00.000000',NULL,NULL,NULL,0,'2026-01-03 11:20:00.000000','tur-cust-001',NULL,'2026-01-10 00:00:00',NULL,NULL,'C-001-ORD3',NULL,NULL,'Rush delivery needed','IN_PROGRESS',1,NULL,NULL,'tenant-main-001',NULL,1,'SC-2026-00567','SUBPOENA','San Francisco County Court',NULL,NULL,NULL,NULL),('7b21a15d-eac6-11f0-aa3a-fa163e03686f','2026-01-05 10:30:00.000000',NULL,NULL,NULL,0,'2026-01-04 14:00:00.000000','tur-cust-001',NULL,'2026-01-15 00:00:00',NULL,NULL,'C-001-ORD4',NULL,NULL,'Two witnesses need to be served','ASSIGNED',1,NULL,NULL,'tenant-main-001',NULL,2,'CR-2026-08901','CIVIL_COMPLAINT','New York County Supreme Court',NULL,NULL,NULL,NULL),('7b221159-eac6-11f0-aa3a-fa163e03686f',NULL,NULL,NULL,NULL,0,'2026-01-05 10:00:00.000000','tur-cust-001',NULL,'2026-01-12 00:00:00',NULL,NULL,'C-001-ORD6',NULL,NULL,'Tenant eviction notice','BIDDING',1,NULL,NULL,'tenant-main-001',NULL,1,'EV-2026-1234','EVICTION_NOTICE','Cook County Circuit Court',NULL,NULL,NULL,NULL),('7b22c2c1-eac6-11f0-aa3a-fa163e03686f',NULL,NULL,NULL,NULL,0,'2026-01-06 05:00:00.000000','tur-cust-001',NULL,'2026-01-20 00:00:00',NULL,NULL,'C-001-ORD7',NULL,NULL,'Family court documents - handle with care','OPEN',1,NULL,NULL,'tenant-main-001',NULL,2,'FAM-2026-5678','DIVORCE_PAPERS','Miami-Dade County Court',NULL,NULL,NULL,NULL),('7b235654-eac6-11f0-aa3a-fa163e03686f','2026-01-05 08:00:00.000000',NULL,NULL,NULL,0,'2026-01-04 16:30:00.000000','tur-cust-001',NULL,'2026-01-18 00:00:00',NULL,NULL,'C-001-ORD5',NULL,NULL,'Property seizure documentation','CANCELLED',1,NULL,NULL,'tenant-main-001',NULL,1,'CV-2025-9876','BANKRUPTCY','Harris County District Court',NULL,NULL,NULL,NULL),('7b23b613-eac6-11f0-aa3a-fa163e03686f','2025-12-19 10:00:00.000000',NULL,NULL,NULL,0,'2025-12-18 08:00:00.000000','tur-cust-001',NULL,'2025-12-30 00:00:00',NULL,NULL,'C-001-ORD2',NULL,NULL,'Multiple attempts may be needed','FAILED',1,NULL,NULL,'tenant-main-001',NULL,1,'CV-2025-11223','CRIMINAL_CASE','King County Superior Court',NULL,NULL,NULL,NULL),('7da4fd92-3fb3-464d-a487-f064e7f3bdac',NULL,NULL,NULL,'2026-01-06 17:35:13',1,'2026-01-06 17:34:10.548081','012c48ba-563d-4d01-a338-e4a11cebf9ed',0.00,'2026-01-06 00:00:00',NULL,_binary '\0','C-e4a11cebf9ed-ORD6',NULL,0.00,'Please deliver it asap. ','CANCELLED',0,0.00,0.00,'tenant-main-001',0.00,1,'1111','CRIMINAL_CASE','Los Angeles','PROCESS_SERVICE',NULL,'7da4fd92-3fb3-464d-a487-f064e7f3bdac_762f839a-559a-42bf-9d95-086f87f4760b.pdf',NULL),('8693ce4a-d80a-422d-8113-9f78520050f5','2025-12-25 18:41:07.173411',NULL,NULL,NULL,0,'2025-12-25 18:41:07.186492','98bdad35-7dd9-4997-b945-f4b88c9b8718',86.25,'2025-12-31 00:00:00',NULL,_binary '\0','C8718-ORD1',NULL,75.00,NULL,'ASSIGNED',1,0.56,11.25,'tenant-main-001',10.69,1,'CASE-1766688065','SUBPOENA','Test County','PROCESS_SERVICE',NULL,NULL,NULL),('960b847e-91dc-435b-8037-dc0da72272bc',NULL,NULL,NULL,'2026-01-09 09:36:31',0,'2026-01-09 09:15:21.134423','tur-cust-001',0.00,'2026-01-10 00:00:00',NULL,_binary '\0','C-001-ORD16',NULL,0.00,NULL,'DRAFT',1,0.00,0.00,'tenant-main-001',0.00,0,'saSs',NULL,'aSa','PROCESS_SERVICE',NULL,NULL,NULL),('99922325-5c17-4cb1-b669-b0cc2a4b7a42',NULL,NULL,NULL,NULL,0,'2026-01-09 07:06:24.575905','tur-cust-001',92.00,'2026-01-11 00:00:00',NULL,_binary '','C-001-ORD9',NULL,80.00,NULL,'PARTIALLY_ASSIGNED',1,0.60,12.00,'tenant-main-001',11.40,2,'Case no 0007','OTHER','County','PROCESS_SERVICE',NULL,NULL,NULL),('9a00bd25-a07c-4961-b9c3-ce74862e9af5','2025-12-25 18:37:19.679920',NULL,NULL,NULL,0,'2025-12-25 18:37:19.695249','8ea3aa94-8ca4-4070-98af-41de94fdecec',86.25,'2025-12-31 00:00:00',NULL,_binary '\0','Cecec-ORD1',NULL,75.00,NULL,'ASSIGNED',1,0.56,11.25,'tenant-main-001',10.69,1,'CASE-1766687837','SUBPOENA','Test County','PROCESS_SERVICE',NULL,NULL,NULL),('9f0fb1b4-b362-4634-9013-26198057e76f','2025-12-25 18:33:12.214426',NULL,NULL,NULL,0,'2025-12-25 18:33:12.238255','3512a367-7c69-4eb7-9c13-0f0dbfccef12',86.25,'2025-12-31 00:00:00',NULL,_binary '\0','Cef12-ORD1',NULL,75.00,NULL,'ASSIGNED',1,0.56,11.25,'tenant-main-001',10.69,1,'CASE-1766687591','SUBPOENA','Test County','PROCESS_SERVICE',NULL,NULL,NULL),('a448a782-9555-47e1-b9e3-e91c7efed025',NULL,NULL,NULL,'2026-01-09 07:48:28',0,'2026-01-09 07:48:05.728865','tur-cust-001',0.00,'2026-01-10 00:00:00',NULL,_binary '\0','C-001-ORD12',NULL,0.00,NULL,'DRAFT',1,0.00,0.00,'tenant-main-001',0.00,0,'fsfasd',NULL,'dasdsad','PROCESS_SERVICE',NULL,NULL,NULL),('aeae22ce-6ff9-40f4-8232-70cf174bfd79',NULL,NULL,NULL,'2026-01-09 09:07:54',0,'2026-01-09 09:07:42.687456','tur-cust-001',0.00,'2026-01-10 00:00:00',NULL,_binary '\0','C-001-ORD15',NULL,0.00,NULL,'DRAFT',1,0.00,0.00,'tenant-main-001',0.00,0,'dasdsa',NULL,'dadas','PROCESS_SERVICE',NULL,NULL,NULL),('afb4950f-b8e7-4552-91ea-15a1140d95ee',NULL,NULL,NULL,NULL,0,'2026-01-07 19:02:47.157931','012c48ba-563d-4d01-a338-e4a11cebf9ed',0.00,'2026-01-14 12:00:00',NULL,_binary '\0','C-e4a11cebf9ed-ORD10',NULL,0.00,'','DRAFT',1,0.00,0.00,'tenant-main-001',0.00,1,'','OTHER','','PROCESS_SERVICE',NULL,NULL,NULL),('bccea943-aa72-472d-91fd-1b1529275c70',NULL,NULL,NULL,NULL,0,'2026-01-02 17:50:00.188148','012c48ba-563d-4d01-a338-e4a11cebf9ed',0.00,'2026-01-02 00:00:00',NULL,_binary '','Cf9ed-ORD4',NULL,0.00,'','OPEN',1,0.00,0.00,'tenant-main-001',0.00,2,'asdf333','CIVIL_COMPLAINT','Sam I am','PROCESS_SERVICE',NULL,NULL,NULL),('cac6d156-7ad6-4f96-afb5-565490aa2ec7',NULL,NULL,NULL,'2026-01-02 17:08:27',1,'2025-12-28 04:54:09.896612','012c48ba-563d-4d01-a338-e4a11cebf9ed',0.00,'2025-12-19 00:00:00',NULL,_binary '\0','Cf9ed-ORD1',NULL,0.00,'','CANCELLED',0,0.00,0.00,'tenant-main-001',0.00,1,'232323','OTHER','','PROCESS_SERVICE','Hello',NULL,NULL),('cd29181e-b623-48e5-8df0-537dc0075979',NULL,NULL,NULL,NULL,0,'2026-01-07 18:57:28.140147','012c48ba-563d-4d01-a338-e4a11cebf9ed',0.00,'2026-01-08 00:00:00',NULL,_binary '\0','C-e4a11cebf9ed-ORD9',NULL,0.00,NULL,'OPEN',1,0.00,0.00,'tenant-main-001',0.00,1,'asdfasdf','OTHER','circuit','PROCESS_SERVICE',NULL,'cd29181e-b623-48e5-8df0-537dc0075979_fa932a11-3ff9-4d57-beb8-d712ac995dcb.pdf',1),('cd6d6f56-2da8-4850-a08b-1992cea76515',NULL,NULL,NULL,NULL,0,'2026-01-07 18:43:16.766248','012c48ba-563d-4d01-a338-e4a11cebf9ed',0.00,'2026-01-08 00:00:00',NULL,_binary '','C-e4a11cebf9ed-ORD8',NULL,0.00,NULL,'PARTIALLY_ASSIGNED',1,0.00,0.00,'tenant-main-001',0.00,2,'asdfasdf','OTHER','district','PROCESS_SERVICE',NULL,NULL,NULL),('d3cbaf28-db4b-4979-900f-0fd34a5a75d0','2025-12-25 18:42:22.503255',NULL,NULL,NULL,0,'2025-12-25 18:42:22.511643','28f2e4ca-4845-4b26-8de4-cd73fe9b9ba9',86.25,'2025-12-31 00:00:00',NULL,_binary '\0','C9ba9-ORD1',NULL,75.00,NULL,'ASSIGNED',1,0.56,11.25,'tenant-main-001',10.69,1,'CASE-1766688141','SUBPOENA','Test County','PROCESS_SERVICE',NULL,NULL,NULL),('d7deb2b2-3591-4f63-83a7-89ce2588c9a9',NULL,NULL,NULL,'2026-01-06 18:08:35',1,'2026-01-06 17:54:58.154089','012c48ba-563d-4d01-a338-e4a11cebf9ed',460.00,'2026-01-08 00:00:00',NULL,_binary '','C-e4a11cebf9ed-ORD7',NULL,400.00,'I want to deliver it today','PARTIALLY_ASSIGNED',1,3.00,60.00,'tenant-main-001',57.00,2,'77777','CHILD_CUSTODY','LA','PROCESS_SERVICE','Restraining Order','d7deb2b2-3591-4f63-83a7-89ce2588c9a9_8324f83e-e8a4-438f-862e-b0e9baf3bab0.pdf',NULL),('dbb06751-eac5-11f0-aa3a-fa163e03686f','2025-12-16 11:00:00.000000',NULL,'2025-12-22 14:45:00.000000',NULL,0,'2025-12-15 09:30:00.000000','user-cust-001',NULL,'2025-12-28 00:00:00',NULL,NULL,'user-cust-001-ORD001',NULL,NULL,'Please serve during business hours','COMPLETED',1,NULL,NULL,'tenant-main-001',NULL,NULL,'CV-2025-12345','RESTRAINING_ORDER','Los Angeles County Superior Court',NULL,NULL,NULL,NULL),('dbb0f81d-eac5-11f0-aa3a-fa163e03686f','2026-01-04 09:00:00.000000',NULL,NULL,NULL,0,'2026-01-03 11:20:00.000000','user-cust-001',NULL,'2026-01-10 00:00:00',NULL,NULL,'user-cust-001-ORD002',NULL,NULL,'Rush delivery needed','IN_PROGRESS',1,NULL,NULL,'tenant-main-001',NULL,NULL,'SC-2026-00567','SUBPOENA','San Francisco County Court',NULL,NULL,NULL,NULL),('dbb18e73-eac5-11f0-aa3a-fa163e03686f','2026-01-05 10:30:00.000000',NULL,NULL,NULL,0,'2026-01-04 14:00:00.000000','user-cust-001',NULL,'2026-01-15 00:00:00',NULL,NULL,'user-cust-001-ORD003',NULL,NULL,'Two witnesses need to be served','ASSIGNED',1,NULL,NULL,'tenant-main-001',NULL,NULL,'CR-2026-08901','CIVIL_COMPLAINT','New York County Supreme Court',NULL,NULL,NULL,NULL),('dbb204a8-eac5-11f0-aa3a-fa163e03686f',NULL,NULL,NULL,NULL,0,'2026-01-05 10:00:00.000000','user-cust-001',NULL,'2026-01-12 00:00:00',NULL,NULL,'user-cust-001-ORD004',NULL,NULL,'Tenant eviction notice','BIDDING',1,NULL,NULL,'tenant-main-001',NULL,NULL,'EV-2026-1234','EVICTION_NOTICE','Cook County Circuit Court',NULL,NULL,NULL,NULL),('dbb2a3ec-eac5-11f0-aa3a-fa163e03686f',NULL,NULL,NULL,NULL,0,'2026-01-06 09:00:00.000000','user-cust-001',NULL,'2026-01-20 00:00:00',NULL,NULL,'user-cust-001-ORD005',NULL,NULL,'Family court documents - handle with care','OPEN',1,NULL,NULL,'tenant-main-001',NULL,NULL,'FAM-2026-5678','DIVORCE_PAPERS','Miami-Dade County Court',NULL,NULL,NULL,NULL),('dbb32473-eac5-11f0-aa3a-fa163e03686f','2026-01-05 08:00:00.000000',NULL,NULL,NULL,0,'2026-01-04 16:30:00.000000','user-cust-001',NULL,'2026-01-18 00:00:00',NULL,NULL,'user-cust-001-ORD006',NULL,NULL,'Property seizure documentation','CANCELLED',1,NULL,NULL,'tenant-main-001',NULL,NULL,'CV-2025-9876','BANKRUPTCY','Harris County District Court',NULL,NULL,NULL,NULL),('dbb38a22-eac5-11f0-aa3a-fa163e03686f','2025-12-19 10:00:00.000000',NULL,NULL,NULL,0,'2025-12-18 08:00:00.000000','user-cust-001',NULL,'2025-12-30 00:00:00',NULL,NULL,'user-cust-001-ORD007',NULL,NULL,'Multiple attempts may be needed','FAILED',1,NULL,NULL,'tenant-main-001',NULL,NULL,'CV-2025-11223','CRIMINAL_CASE','King County Superior Court',NULL,NULL,NULL,NULL),('ord-asg-002','2025-12-18 17:50:28.000000',NULL,NULL,NULL,0,'2025-12-17 17:50:28.000000','tur-cust-002',200.00,'2025-12-23 00:00:00',NULL,NULL,'ORD-2025-034',NULL,150.00,NULL,'ASSIGNED',0,NULL,NULL,'tenant-main-001',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-bid-002',NULL,NULL,NULL,NULL,0,'2025-12-18 17:50:28.000000','tur-cust-002',NULL,'2025-12-26 00:00:00',NULL,NULL,'ORD-2025-031',NULL,NULL,NULL,'BIDDING',1,NULL,NULL,'tenant-main-001',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-bid-003',NULL,NULL,NULL,NULL,0,'2025-12-19 14:50:28.000000','tur-cust-003',NULL,'2025-12-27 00:00:00',NULL,NULL,'ORD-2025-032',NULL,NULL,NULL,'BIDDING',1,NULL,NULL,'tenant-main-001',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-c1-002','2025-12-17 17:01:52.000000',NULL,NULL,NULL,0,'2025-12-16 17:01:52.000000','tur-cust-002',200.00,'2025-12-26 00:00:00',NULL,_binary '\0','ORD-2025-002',NULL,150.00,NULL,'IN_PROGRESS',0,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-c2-001','2025-12-08 17:01:52.000000',15.00,'2025-12-13 17:01:52.000000',NULL,0,'2025-12-07 17:01:52.000000','tur-cust-002',201.25,'2025-12-25 00:00:00',175.00,_binary '\0','ORD-2025-011',NULL,175.00,NULL,'COMPLETED',0,1.31,26.25,'tenant-main-001',24.94,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-c2-002','2025-12-15 17:01:52.000000',NULL,NULL,NULL,0,'2025-12-14 17:01:52.000000','tur-cust-002',200.00,'2025-12-28 00:00:00',NULL,_binary '\0','ORD-2025-012',NULL,150.00,NULL,'IN_PROGRESS',0,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-c2-003',NULL,NULL,NULL,NULL,0,'2025-12-17 17:01:52.000000','tur-cust-002',NULL,'2025-12-30 00:00:00',NULL,_binary '\0','ORD-2025-013',NULL,NULL,NULL,'OPEN',1,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-c2-004','2025-12-02 17:01:52.000000',15.00,'2025-12-07 17:01:52.000000',NULL,0,'2025-12-01 17:01:52.000000','tur-cust-002',166.75,'2025-12-24 00:00:00',145.00,_binary '\0','ORD-2025-014',NULL,145.00,NULL,'COMPLETED',0,1.09,21.75,'tenant-main-001',20.66,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-c2-005',NULL,NULL,NULL,NULL,0,'2025-12-19 17:01:52.000000','tur-cust-002',NULL,'2026-01-01 00:00:00',NULL,_binary '\0','ORD-2025-015',NULL,NULL,NULL,'OPEN',1,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-c2-006','2025-12-17 17:01:52.000000',NULL,NULL,NULL,0,'2025-12-16 17:01:52.000000','tur-cust-002',200.00,'2025-12-26 00:00:00',NULL,_binary '\0','ORD-2025-016',NULL,150.00,NULL,'IN_PROGRESS',0,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-c3-001','2025-12-06 17:01:52.000000',15.00,'2025-12-11 17:01:52.000000',NULL,0,'2025-12-05 17:01:52.000000','tur-cust-003',178.25,'2025-12-23 00:00:00',155.00,_binary '\0','ORD-2025-017',NULL,155.00,NULL,'COMPLETED',0,1.16,23.25,'tenant-main-001',22.09,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-c3-002','2025-12-14 17:01:52.000000',NULL,NULL,NULL,0,'2025-12-13 17:01:52.000000','tur-cust-003',200.00,'2025-12-27 00:00:00',NULL,_binary '\0','ORD-2025-018',NULL,150.00,NULL,'IN_PROGRESS',0,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-c3-003',NULL,NULL,NULL,NULL,0,'2025-12-18 17:01:52.000000','tur-cust-003',NULL,'2025-12-29 00:00:00',NULL,_binary '\0','ORD-2025-019',NULL,NULL,NULL,'OPEN',1,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-c3-004',NULL,NULL,NULL,NULL,0,'2025-12-19 17:01:52.000000','tur-cust-003',NULL,'2025-12-31 00:00:00',NULL,_binary '\0','ORD-2025-020',NULL,NULL,NULL,'OPEN',1,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-c3-005','2025-12-04 17:01:52.000000',15.00,'2025-12-09 17:01:52.000000',NULL,0,'2025-12-03 17:01:52.000000','tur-cust-003',189.75,'2025-12-22 00:00:00',165.00,_binary '\0','ORD-2025-021',NULL,165.00,NULL,'COMPLETED',0,1.24,24.75,'tenant-main-001',23.51,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-c3-006','2025-12-16 17:01:52.000000',NULL,NULL,NULL,0,'2025-12-15 17:01:52.000000','tur-cust-003',200.00,'2025-12-28 00:00:00',NULL,_binary '\0','ORD-2025-022',NULL,150.00,NULL,'IN_PROGRESS',0,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-c3-007',NULL,NULL,NULL,NULL,0,'2025-12-19 17:01:52.000000','tur-cust-003',NULL,'2026-01-03 00:00:00',NULL,_binary '\0','ORD-2025-023',NULL,NULL,NULL,'OPEN',1,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-c3-008','2025-11-28 17:01:52.000000',15.00,'2025-12-03 17:01:52.000000',NULL,0,'2025-11-27 17:01:52.000000','tur-cust-003',207.00,'2025-12-24 00:00:00',180.00,_binary '\0','ORD-2025-024',NULL,180.00,NULL,'COMPLETED',0,1.35,27.00,'tenant-main-001',25.65,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-c4-001','2025-12-10 17:01:52.000000',15.00,'2025-12-15 17:01:52.000000',NULL,0,'2025-12-09 17:01:52.000000','tur-cust-004',143.75,'2025-12-26 00:00:00',125.00,_binary '\0','ORD-2025-025',NULL,125.00,NULL,'COMPLETED',0,0.94,18.75,'tenant-main-001',17.81,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-c4-002','2025-12-17 17:01:52.000000',NULL,NULL,NULL,0,'2025-12-16 17:01:52.000000','tur-cust-004',200.00,'2025-12-28 00:00:00',NULL,_binary '\0','ORD-2025-026',NULL,150.00,NULL,'IN_PROGRESS',0,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-c4-003',NULL,NULL,NULL,NULL,0,'2025-12-19 17:01:52.000000','tur-cust-004',NULL,'2025-12-30 00:00:00',NULL,_binary '\0','ORD-2025-027',NULL,NULL,NULL,'OPEN',1,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-c5-001','2025-12-15 17:01:52.000000',NULL,NULL,NULL,0,'2025-12-14 17:01:52.000000','tur-cust-005',200.00,'2025-12-27 00:00:00',NULL,_binary '\0','ORD-2025-028',NULL,150.00,NULL,'IN_PROGRESS',0,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-c5-002',NULL,NULL,NULL,NULL,0,'2025-12-19 17:01:52.000000','tur-cust-005',NULL,'2025-12-31 00:00:00',NULL,_binary '\0','ORD-2025-029',NULL,NULL,NULL,'OPEN',1,NULL,NULL,'tenant-main-001',NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-canc-001',NULL,NULL,NULL,NULL,0,'2025-12-16 17:50:28.000000','tur-cust-005',NULL,'2025-12-20 00:00:00',NULL,NULL,'ORD-2025-037',NULL,NULL,NULL,'CANCELLED',0,NULL,NULL,'tenant-main-001',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-fail-001','2025-12-10 17:50:28.000000',NULL,'2025-12-14 17:50:28.000000',NULL,0,'2025-12-09 17:50:28.000000','tur-cust-003',NULL,'2025-12-15 00:00:00',NULL,NULL,'ORD-2025-035',NULL,NULL,NULL,'FAILED',0,NULL,NULL,'tenant-main-001',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('ord-fail-002','2025-12-05 17:50:28.000000',NULL,'2025-12-10 17:50:28.000000',NULL,0,'2025-12-04 17:50:28.000000','tur-cust-004',NULL,'2025-12-10 00:00:00',NULL,NULL,'ORD-2025-036',NULL,NULL,NULL,'FAILED',0,NULL,NULL,'tenant-main-001',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),('test-order-chat-001',NULL,NULL,NULL,NULL,0,'2025-12-25 12:09:09.000000','cust-001',NULL,'2025-12-31 00:00:00',NULL,NULL,'ORD-TEST-001',NULL,NULL,'Test order for chat','OPEN',1,NULL,NULL,'tenant-001',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

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
  `status` enum('PENDING_APPROVAL','ACTIVE','SUSPENDED','BANNED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
INSERT INTO `process_server_profiles` VALUES ('02a4dd0d-5c11-40ab-8822-12b168d601b2','d668954e-4a05-4fb8-83a8-3858503ffa55','tenant-main-001',0,'[\"10001\", \"10002\"]','PENDING_APPROVAL',0.00,0,0,0,0,0.00,0,0,NULL,'1.png',NULL,'2025-12-25 18:32:02.353670',NULL),('133a9865-8ab6-476a-9b8f-400f3c09ffa2','8dec4425-c4d2-44c1-8a60-6b7239c354d3','tenant-main-001',0,'[\"10001\", \"10002\"]','PENDING_APPROVAL',0.00,0,0,0,0,0.00,0,0,NULL,'1.png',NULL,'2025-12-25 18:37:10.807753',NULL),('3780e4d4-696e-424d-8a70-35444905152a','7e0241a4-6105-4648-ad22-640d6c3ce905','tenant-main-001',0,'[\"10001\", \"10002\"]','PENDING_APPROVAL',0.00,0,0,0,0,0.00,0,0,NULL,'1.png',NULL,'2025-12-25 18:31:28.212100',NULL),('62e07af1-d18b-4576-a425-a5390396976e','8edd5ac4-d385-490b-b474-ccd95e251edb','tenant-main-001',0,'[\"10001\", \"10002\"]','PENDING_APPROVAL',0.00,0,0,0,0,0.00,0,0,NULL,'1.png',NULL,'2025-12-25 18:42:15.102953',NULL),('84856e52-e25d-11f0-aa3a-fa163e03686f','0583a0f7-b791-4c9e-b326-6e9f657d9bd1','tenant-main-001',0,'[]','ACTIVE',NULL,0,0,0,0,0.00,0,0,NULL,NULL,NULL,'2025-12-26 13:19:33.000000','2025-12-26 13:19:33.000000'),('a11060e0-f491-46f4-9e16-72bcb8f67565','d99faf7f-dc06-41f9-ae60-33c06a87f089','tenant-main-001',0,'[\"[\\\"75001\\\"]\"]','PENDING_APPROVAL',0.00,0,0,0,0,0.00,0,0,NULL,'1.png',NULL,'2025-12-25 18:25:18.183693',NULL),('a6876e37-2956-4813-8da5-117f4995a92a','c529b060-bec4-48e3-bc74-9c57961617e8','tenant-main-001',0,'[\"[\\\"75001\\\"]\"]','PENDING_APPROVAL',0.00,0,0,0,0,0.00,0,0,NULL,'1.png',NULL,'2025-12-25 18:25:35.466678',NULL),('c7ec8ee6-28c5-463e-9d0c-be4147ef67d6','dee14c8e-3b0e-4b09-8b19-4eef5dab9158','tenant-main-001',0,'[\"10001\", \"10002\"]','PENDING_APPROVAL',0.00,0,0,0,0,0.00,0,0,NULL,'1.png',NULL,'2025-12-25 18:40:59.525529',NULL),('ebae7ed9-3d90-4155-82d9-e407bc83088d','0e5fa8ab-222f-47be-92f0-c355d932367b','tenant-main-001',0,'[\"10001\", \"10002\"]','PENDING_APPROVAL',0.00,0,0,0,0,0.00,0,0,NULL,'1.png',NULL,'2025-12-25 18:33:04.943901',NULL),('ps-profile-001','tur-ps-001','tenant-main-001',1,'[\"75201\", \"75202\", \"75203\", \"76102\", \"76051\"]','ACTIVE',4.80,6,4,0,11,2.75,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000'),('ps-profile-002','tur-ps-002','tenant-main-001',1,'[\"10001\", \"10002\", \"10003\", \"11201\", \"11215\"]','ACTIVE',4.90,4,2,0,6,3.00,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000'),('ps-profile-003','tur-ps-003','tenant-main-001',1,'[\"33101\", \"33131\", \"33134\", \"33139\", \"33149\"]','ACTIVE',4.70,5,3,0,9,3.00,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000'),('ps-profile-004','tur-ps-004','tenant-main-001',0,'[\"60601\", \"60602\", \"60603\", \"60606\", \"60611\"]','ACTIVE',4.60,2,1,0,3,3.00,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000'),('ps-profile-005','tur-ps-005','tenant-main-001',0,'[\"77001\", \"77002\", \"77003\", \"77004\", \"77010\"]','ACTIVE',4.50,1,0,0,1,0.00,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000'),('ps-profile-006','tur-ps-006','tenant-main-001',1,'[\"85001\", \"85003\", \"85004\", \"85016\", \"85281\"]','ACTIVE',4.80,0,0,0,0,0.00,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000'),('ps-profile-007','tur-ps-007','tenant-main-001',0,'[\"92101\", \"92102\", \"92103\", \"92109\", \"91910\"]','ACTIVE',4.70,0,0,0,0,0.00,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000'),('ps-profile-008','tur-ps-008','tenant-main-001',1,'[\"94102\", \"94103\", \"94104\", \"94107\", \"94109\"]','ACTIVE',4.90,0,0,0,0,0.00,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000'),('ps-profile-009','tur-ps-009','tenant-main-001',0,'[\"98101\", \"98102\", \"98103\", \"98104\", \"98105\"]','ACTIVE',4.60,0,0,0,0,0.00,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000'),('ps-profile-010','tur-ps-010','tenant-main-001',1,'[\"02101\", \"02108\", \"02109\", \"02110\", \"02115\"]','ACTIVE',4.80,0,0,0,0,0.00,0,0,NULL,NULL,NULL,'2025-12-19 16:46:49.000000','2025-12-19 17:30:49.000000');
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
  `role` enum('TENANT_ADMIN','CUSTOMER','PROCESS_SERVER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
INSERT INTO `tenant_user_roles` VALUES ('012c48ba-563d-4d01-a338-e4a11cebf9ed','c0342272-6987-4b22-ab64-de2160e39adb','tenant-main-001','CUSTOMER',1,'2025-12-28 04:51:46'),('0583a0f7-b791-4c9e-b326-6e9f657d9bd1','77cf4474-c68e-4287-b8a7-c2d20806a635','tenant-main-001','CUSTOMER',1,'2025-12-26 12:07:03'),('0b18c0df-c441-44f1-a6b2-531d8b8dff12','2a7dbd34-f12e-438d-bf3b-025e5fd13cf9','tenant-main-001','CUSTOMER',1,'2025-12-25 18:31:25'),('0e5fa8ab-222f-47be-92f0-c355d932367b','9d983b0f-3388-436b-95e8-4dfcb28c04df','tenant-main-001','PROCESS_SERVER',1,'2025-12-25 18:33:05'),('13405660-c46e-44df-9428-727d227a82db','98bdad35-7dd9-4997-b945-f4b88c9b8718','tenant-main-001','CUSTOMER',1,'2025-12-25 18:40:56'),('3472e41e-6650-4895-b5ff-3bb552587085','8ea3aa94-8ca4-4070-98af-41de94fdecec','tenant-main-001','CUSTOMER',1,'2025-12-25 18:37:08'),('3861fc53-4e3f-4cfa-b3db-275bf5b1c0ee','a8dcf0f8-f5b4-4a58-84ff-52ab56f35da3','tenant-main-001','CUSTOMER',1,'2025-12-19 16:30:23'),('49930601-f881-40f6-ab44-0bc3bcf3220b','5a138dfb-b5c5-4772-8684-49ea7fede3d6','tenant-main-001','CUSTOMER',1,'2025-12-25 18:25:13'),('7c1a53c4-7097-420a-8d36-9a1e4eabe458','bf498344-9a8b-4130-a193-5bb5ad89cbdb','tenant-main-001','CUSTOMER',1,'2025-12-25 18:25:31'),('7dffd602-28fa-4580-94af-14fea15c167a','4d6cedfd-1535-4609-8704-c1772656d4b4','tenant-main-001','CUSTOMER',1,'2025-12-25 18:24:33'),('7e0241a4-6105-4648-ad22-640d6c3ce905','85c185fe-9b3c-450b-b822-c0410c5c9043','tenant-main-001','PROCESS_SERVER',1,'2025-12-25 18:31:28'),('8dec4425-c4d2-44c1-8a60-6b7239c354d3','1bafa4de-d4f2-416e-a8e8-7893fe37377e','tenant-main-001','PROCESS_SERVER',1,'2025-12-25 18:37:11'),('8edd5ac4-d385-490b-b474-ccd95e251edb','e922553a-bdfd-49f0-a968-189e8897e227','tenant-main-001','PROCESS_SERVER',1,'2025-12-25 18:42:15'),('93ad1041-5b0d-4437-ba3e-47758f0b3882','0ce9153f-c9dc-440f-8a5e-014c5ff3d8db','tenant-main-001','CUSTOMER',1,'2025-12-19 16:36:30'),('a34b202e-ae56-44f5-99b6-53f8b9a094da','698f70fe-fd95-4447-85fe-d9ad3e1fdcc2','tenant-main-001','CUSTOMER',1,'2025-12-25 18:31:59'),('b1b3072d-7fc0-4c38-88f8-c28a05a8e743','a2264e3e-22da-4dc3-8f19-7523cad178f4','tenant-main-001','CUSTOMER',1,'2025-12-19 16:24:37'),('c529b060-bec4-48e3-bc74-9c57961617e8','d4926c23-6af8-4341-a042-193c8efcd955','tenant-main-001','PROCESS_SERVER',1,'2025-12-25 18:25:35'),('d668954e-4a05-4fb8-83a8-3858503ffa55','f1ebe85f-ddd1-4aab-860a-338cbf7cc861','tenant-main-001','PROCESS_SERVER',1,'2025-12-25 18:32:02'),('d99faf7f-dc06-41f9-ae60-33c06a87f089','5e1405b8-b38f-4544-b6bd-2b8f5050d953','tenant-main-001','PROCESS_SERVER',1,'2025-12-25 18:25:18'),('dee14c8e-3b0e-4b09-8b19-4eef5dab9158','dc229e6b-b2da-4ec8-a692-8bd84477db26','tenant-main-001','PROCESS_SERVER',1,'2025-12-25 18:41:00'),('f00e43bf-a27d-4733-b08a-3d5df6252edb','fa0a3be8-58eb-4810-b4d2-313a25d9a17f','tenant-main-001','CUSTOMER',1,'2025-12-26 12:25:46'),('fab36909-ded1-44fb-ab98-b274db393cd1','3512a367-7c69-4eb7-9c13-0f0dbfccef12','tenant-main-001','CUSTOMER',1,'2025-12-25 18:33:03'),('ff8779bb-c685-4210-8794-f24d7663f9b4','28f2e4ca-4845-4b26-8de4-cd73fe9b9ba9','tenant-main-001','CUSTOMER',1,'2025-12-25 18:42:12'),('tur-admin-001','user-admin-001','tenant-main-001','TENANT_ADMIN',1,'2025-12-26 14:20:09'),('tur-cust-001','user-cust-001','tenant-main-001','CUSTOMER',1,'2025-12-19 11:16:49'),('tur-cust-002','user-cust-002','tenant-main-001','CUSTOMER',1,'2025-12-19 11:16:49'),('tur-cust-003','user-cust-003','tenant-main-001','CUSTOMER',1,'2025-12-19 11:16:49'),('tur-cust-004','user-cust-004','tenant-main-001','CUSTOMER',1,'2025-12-19 11:16:49'),('tur-cust-005','user-cust-005','tenant-main-001','CUSTOMER',1,'2025-12-19 11:16:49'),('tur-ps-001','user-ps-001','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49'),('tur-ps-002','user-ps-002','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49'),('tur-ps-003','user-ps-003','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49'),('tur-ps-004','user-ps-004','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49'),('tur-ps-005','user-ps-005','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49'),('tur-ps-006','user-ps-006','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49'),('tur-ps-007','user-ps-007','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49'),('tur-ps-008','user-ps-008','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49'),('tur-ps-009','user-ps-009','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49'),('tur-ps-010','user-ps-010','tenant-main-001','PROCESS_SERVER',1,'2025-12-19 11:16:49');
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
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `zip_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `county` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `abbreviation` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
INSERT INTO `user_invitations` VALUES ('069a8f7e-4e53-42d6-96d1-111e8ce7bb03',NULL,'2025-12-26 06:30:14.943344','2025-12-29 06:30:14.879898',NULL,'EXPIRED','user-cust-001','hitansu2004@gmail.com',NULL,'PROCESS_SERVER','tenant-1'),('6f281e3c-8977-4849-9f82-2782c1c7d4e1',NULL,'2025-12-26 06:22:07.522811','2025-12-29 06:22:07.513848',NULL,'EXPIRED','user-cust-001','photouploaded046@gmail.com',NULL,'PROCESS_SERVER','tenant-1'),('be7e54a0-eb3a-4a36-8672-03b92737dc21',NULL,'2026-01-02 18:24:32.931015','2026-01-05 18:24:32.923109',NULL,'EXPIRED','c0342272-6987-4b22-ab64-de2160e39adb','server@mailinator.com',NULL,'PROCESS_SERVER','tenant-1'),('e0657272-85f9-436a-b781-8011f07dd765','2025-12-26 13:13:33.000000','2025-12-25 14:51:45.231151','2025-12-28 14:51:45.188667','hitansu08','ACCEPTED','user-cust-001','hitansu08@gmail.com','','PROCESS_SERVER','tenant-1');
/*!40000 ALTER TABLE `user_invitations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-09 10:44:57
