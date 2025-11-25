-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: safedesk
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `agent_commands`
--

DROP TABLE IF EXISTS `agent_commands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agent_commands` (
  `id` int NOT NULL AUTO_INCREMENT,
  `agent_id` varchar(64) NOT NULL,
  `command_type` varchar(50) NOT NULL,
  `command_params` json DEFAULT NULL,
  `status` enum('pending','success','failed') DEFAULT 'pending',
  `result` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agent_commands`
--

LOCK TABLES `agent_commands` WRITE;
/*!40000 ALTER TABLE `agent_commands` DISABLE KEYS */;
INSERT INTO `agent_commands` VALUES (1,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','capturescreen','{}','success',NULL,'2025-11-21 01:18:04','2025-11-21 01:18:09',NULL),(2,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','capturescreen','{}','success',NULL,'2025-11-21 01:19:14','2025-11-21 01:19:19',NULL),(3,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','capturescreen','{}','success',NULL,'2025-11-21 09:15:59','2025-11-21 09:16:52',NULL),(4,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','capturescreen','{}','success',NULL,'2025-11-25 02:38:17','2025-11-25 02:38:28',NULL);
/*!40000 ALTER TABLE `agent_commands` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `agent_screenshots`
--

DROP TABLE IF EXISTS `agent_screenshots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agent_screenshots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `agent_id` varchar(64) DEFAULT NULL,
  `command_id` int DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agent_screenshots`
--

LOCK TABLES `agent_screenshots` WRITE;
/*!40000 ALTER TABLE `agent_screenshots` DISABLE KEYS */;
INSERT INTO `agent_screenshots` VALUES (63,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f',NULL,'/screenshots/b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f/1763687889.jpg','2025-11-21 01:18:09'),(64,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f',NULL,'/screenshots/b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f/1763687959.jpg','2025-11-21 01:19:19'),(65,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f',NULL,'/screenshots/b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f/1763716612.jpg','2025-11-21 09:16:52'),(66,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f',NULL,'/screenshots/b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f/1764038308.jpg','2025-11-25 02:38:28');
/*!40000 ALTER TABLE `agent_screenshots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `agents`
--

DROP TABLE IF EXISTS `agents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agents` (
  `agent_id` varchar(64) NOT NULL,
  `user_id` int NOT NULL,
  `installer_token_id` int NOT NULL,
  `agent_token` varchar(128) NOT NULL,
  `hostname` varchar(255) DEFAULT NULL,
  `guid` varchar(64) DEFAULT NULL,
  `os` varchar(128) DEFAULT NULL,
  `status` enum('online','offline') DEFAULT 'offline',
  `last_activity` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`agent_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_agent_token` (`agent_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agents`
--

LOCK TABLES `agents` WRITE;
/*!40000 ALTER TABLE `agents` DISABLE KEYS */;
INSERT INTO `agents` VALUES ('10602255-cdc9-4396-a6bf-4ab039a2b6de',1,1,'fd537dda819df4acb43ce267b36f684685c0c945194906593bf6206e33eff281','LEVUONG-LAPTOP','1692634b-d6d7-4cbb-92fc-d153f575a2c0','Windows 10.0 (Build 26200)','offline',NULL,'2025-11-14 09:20:32','2025-11-14 09:20:32'),('b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f',1,3,'fb30caede447a7c5ae2fe5cd7ff1bde3247665f4a8f55e981b57733328954713','DESKTOP-4UCI50O','640c4c84-062a-4810-aba8-bbd4905c3a4d','Windows 10.0 (Build 26200)','online','2025-11-25 14:54:03','2025-11-16 11:40:06','2025-11-25 07:54:03');
/*!40000 ALTER TABLE `agents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `app_policies`
--

DROP TABLE IF EXISTS `app_policies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_policies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `installed_app_id` int NOT NULL,
  `is_blocked` tinyint(1) NOT NULL DEFAULT '0',
  `limit_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `limit_minutes` int DEFAULT NULL,
  `action_on_limit` enum('close','warn','none') NOT NULL DEFAULT 'none',
  `warn_interval` int DEFAULT '3',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `installed_app_id` (`installed_app_id`),
  CONSTRAINT `fk_app_policies_installed_app` FOREIGN KEY (`installed_app_id`) REFERENCES `installed_apps` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_policies`
--

LOCK TABLES `app_policies` WRITE;
/*!40000 ALTER TABLE `app_policies` DISABLE KEYS */;
INSERT INTO `app_policies` VALUES (1,2712,0,1,60,'none',3,'2025-11-20 16:27:07','2025-11-20 17:53:48'),(2,2713,0,0,60,'none',3,'2025-11-20 16:27:07','2025-11-21 07:27:17'),(3,2714,0,0,60,'none',3,'2025-11-20 16:27:07','2025-11-25 07:12:45'),(4,2715,0,0,60,'none',3,'2025-11-20 16:27:07','2025-11-21 07:27:17'),(5,2716,0,0,60,'none',3,'2025-11-20 16:27:07','2025-11-21 07:27:17'),(6,2717,0,0,60,'none',3,'2025-11-20 16:27:07','2025-11-21 07:27:17');
/*!40000 ALTER TABLE `app_policies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_usage_policies`
--

DROP TABLE IF EXISTS `daily_usage_policies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_usage_policies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `agent_id` varchar(64) NOT NULL,
  `day_of_week` enum('mon','tue','wed','thu','fri','sat','sun') NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `limit_daily_minutes` int DEFAULT NULL,
  `allowed_hours` json DEFAULT NULL,
  `warn_on_exceed` tinyint(1) NOT NULL DEFAULT '0',
  `shutdown_on_exceed` tinyint(1) NOT NULL DEFAULT '0',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_agent_day` (`agent_id`,`day_of_week`),
  CONSTRAINT `daily_usage_policies_ibfk_1` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`agent_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_usage_policies`
--

LOCK TABLES `daily_usage_policies` WRITE;
/*!40000 ALTER TABLE `daily_usage_policies` DISABLE KEYS */;
INSERT INTO `daily_usage_policies` VALUES (8,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','mon',1,300,'[\"08:00-23:00\"]',1,0,'2025-11-21 04:26:30'),(9,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','tue',1,300,'[\"08:00-09:00\"]',1,0,'2025-11-25 02:52:40'),(10,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','wed',1,300,'[\"08:00-22:00\"]',1,0,'2025-11-21 04:26:14'),(11,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','thu',1,300,'[\"08:00-22:00\"]',1,0,'2025-11-21 04:26:14'),(12,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','fri',1,300,'[\"08:00-22:00\"]',1,0,'2025-11-21 04:26:14'),(13,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','sat',1,300,'[\"08:00-22:00\"]',1,0,'2025-11-21 04:26:14'),(14,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','sun',1,300,'[\"08:00-22:00\"]',1,0,'2025-11-21 04:26:14');
/*!40000 ALTER TABLE `daily_usage_policies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `installed_apps`
--

DROP TABLE IF EXISTS `installed_apps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `installed_apps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `agent_id` varchar(64) NOT NULL,
  `app_name` varchar(255) NOT NULL,
  `version` varchar(100) DEFAULT NULL,
  `publisher` varchar(255) DEFAULT NULL,
  `install_location` text,
  `icon_path` text,
  `icon_base64` text,
  `uninstall_string` text,
  `quiet_uninstall_string` text,
  `status` varchar(45) NOT NULL DEFAULT 'installed',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2720 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `installed_apps`
--

LOCK TABLES `installed_apps` WRITE;
/*!40000 ALTER TABLE `installed_apps` DISABLE KEYS */;
INSERT INTO `installed_apps` VALUES (2712,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','Process Hacker 2.39 (r124)','2.39.0.124','wj32','c:\\program files\\process hacker 2','c:\\program files\\process hacker 2\\processhacker.exe','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\0','c:\\program files\\process hacker 2\\unins000.exe','\"c:\\program files\\process hacker 2\\unins000.exe\" /silent','installed','2025-11-20 16:27:07'),(2713,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','VMware Tools','12.5.0.24276846','VMware, Inc.','c:\\program files\\vmware\\vmware tools','','','msiexec.exe /i{64171bd0-863e-4dde-8df9-4f7e62da4a3c}','','installed','2025-11-20 16:27:07'),(2714,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','Microsoft Edge','142.0.3595.94','Microsoft Corporation','c:\\program files (x86)\\microsoft\\edge\\application','c:\\program files (x86)\\microsoft\\edge\\application\\142.0.3595.94\\msedge.exe','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\0','\"c:\\program files (x86)\\microsoft\\edge\\application\\142.0.3595.94\\installer\\setup.exe\" --uninstall --msedge --channel=stable --system-level --verbose-logging','','installed','2025-11-25 01:51:04'),(2715,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','Microsoft Edge WebView2 Runtime','142.0.3595.94','Microsoft Corporation','c:\\program files (x86)\\microsoft\\edgewebview\\application','c:\\program files (x86)\\microsoft\\edgewebview\\application\\142.0.3595.94\\msedgewebview2.exe','iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAT5SURBVFhH7ZdZTFxlFMfvDAMD3GUuUMUao9GY+OSbS2JiIrZFGHYobaHaqtXY1NBAKQzDDAz7vtOCUBX3GMUEBUopLYLIIjszw0CjMSQ2rFETkybGRP+ee+8g2A4tbcn4Isnv5Xv5/c8ZvnO+y9Af/mNcHroTl4fuxOWh+9A8/Cy4hI+ID8EdkvgA/MH3nbwH/kCLk3fBx0u8A2H/207OQYhrVohtIt6S0cU0OmmALvqsQtQZol5GjKwjauH1wFNgZLlTvCGXxOvyrcTrckmsyF2KoyWxIlfEilyMqJFhbhBvrtop3pC7Fm/IJfG6/OZiMaIaYng1GJftvkF8q3ZvFrtutxixLlfEYngV/MIqwUQvAtGLfxF/ImbxD+J34hpiF39D7NKviFtaw/6lZeIq4pcWiB9wYGkOB5dtxCQOLY8iYXkQict9RA8Or3TixZU2vLTyGY6sfIyjKy04utqEl1fr8cpqJV5dLcax1Vy8tmbC62un/w/gngBHrjYhYaqBqIO+pxHBHY0I6WpA6IWzOx8g8ad2RA214ulPv8AjdV9hl+lL6AwdEI1d8DN3w99yCQG5vbi3cACBFWM7EyDO3ocnPunE/UUdYFPawaddgGC8BJ25H2LOt/DLH4Z/0SgCSsaxq3wK91ROIbDGht1nHHceIP77CTzZ2gt/czt8kjvhm9YDNqMPfNYQhJxR6AonIBbPwK/UhvtIHpjaBr9jdNXja8FFlMIn2AI2rPz2A4SPTeGh2h5oT7TBO+UifAz98DUNg7WMg8ubBl9kha7EQdVaEZDUSrJi+O4xg32hgISlYMMrwEVWg42uB0vzZNsBwsZmsbv0MrySOuF1qhdawyC8zWPwzZ0Bm28HV+gAXzyPgIIJ8IebwQYZwYUUgNOXUohqcFF14GhgcTS8OBpmHA05jobeLQPoR68gsPgyNEnd8EzthzZjBFrzJLwtVvjkOeBbOAe26Aq13A4+sRn8niwSF4IPLwdPk4+nkcyTlCepMl1pypKYo+krrYCtAyz8jEcbhuBx4jw0KX3wNHwHr8xJaLOt0OY44E1yn/x5+JJcPP45uH0W8NRmQV8GPrIGAokFGtPSzuBplMtyabFJS84pl5agywBB3/wI7cnz8Dj5NTSnh6ExTsDTbIVX9qws1+bNw5vkXJ6N2lkNfq8FQmgJhIgq6Gj2C7QP5F0hLSzaIZsrv3mAhWt4sHIA6je7oU4egEf6GDSZ09Bk2eFpccArZw7aXIICiJlDYPUF4IPzSF5G8mplAdFSEmKVyuXFtd0A+plfwKZdhCqpF+rUEagNE/DItEFjtkOT7aAAc/8EEIxD4J8zQAjOh0BXSUe/tSyPoU0otX29+u0GeKZ7AczxLqioalXaONTGGahJ7mGepeod/wogZAyCf94oy3V6pzxSqlyS00q+3QCPtdjBJPWBOTUCVfokVEYr1CY7MUsBSL4pAGcaI7mJ5HkkL5P3uo6ul7z/7zQAkzwEJpVmsmEaqgwrVJmK/PoA3lkzdKcLIewjeWgpPSyq5IeG8vC4mwBpU2DSZ8AYbVS9nQIo8usDsFGVEPbmQBdSApFeMiJdNem1c/cBDFYwGTYKQPItAnBvtEEXZCJ5EckrlCeV9MzakQCPR1EA+j/YIoDWRPOd5GJwAUTpdw+j1ktvux0IIH0S0LeBi48F9+Ly0J24PHQnLg/dBIO/AT2FIih1GNi4AAAAAElFTkSuQmCC\0','\"c:\\program files (x86)\\microsoft\\edgewebview\\application\\142.0.3595.94\\installer\\setup.exe\" --uninstall --msedgewebview --system-level --verbose-logging','','installed','2025-11-25 01:51:04'),(2716,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','Microsoft Visual C++ 2015-2022 Redistributable (x86) - 14.40.33810','14.40.33810.0','Microsoft Corporation','c:\\programdata\\package cache\\{47109d57-d746-4f8b-9618-ed6a17cc922b}','c:\\programdata\\package cache\\{47109d57-d746-4f8b-9618-ed6a17cc922b}\\vc_redist.x86.exe','iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAHtSURBVFhHtZbLcYMwFEVZsHQ3FOQdLXiblUvwDDsvUoErcAHauwAXQnTAV3mIjyU+b+YMiRC6R49PUpRl2a7hcrlsQuusErher+3aej6f3fVaa5NAUfxkQe0uULs2UPkxfwjHwqNzhwvE4RxDeOOOFfgafqRAUviRAknhWwSYHMM4FXdgLryq+7lUlgAT47LjtgNL4asEmHQ+nwfYcxSLDl61mfBsgbnw+/03nKc6gQyokQC/zBGHxwJrarIDcwvG4VaAhdYyEgDt1sK4DZfAHjwej/Z0Ov0LYBXD+JTA1NwcCOfIWgOBuOYEVLfbbYD+1qfUJgEF1a7xs5rWuTrA7qqq6mDNmPg5yBbg2aj8O143zawAMBcJrS8Iz74FnAvhzn9g+Mh8JBCwEgoHwpDQri3K/SqgcI5B4CMRd8HunhBqqguW5A4Q/n6/iRpLeOzuFf56vTqWJEYCzi+so8ZZVAKSsCJaQwIUwepIsoANpxi3HWj8TmN0vdCuuUbs1gHGhHan6+06YvcO2GBhn2jdIrBzduuAXRQId/4tgIJb4p8LKyF26QA/8/Wz4RLgNez/CeklrMhSOCR1QHPUBYVbAd6GWAKyBKY6EIOEDZeAfzRHEt/CIQjkgET/UE4LEJwSDqsEhERAoanBPWX7Bwxr79enuACRAAAAAElFTkSuQmCC\0','\"c:\\programdata\\package cache\\{47109d57-d746-4f8b-9618-ed6a17cc922b}\\vc_redist.x86.exe\"  /uninstall','\"c:\\programdata\\package cache\\{47109d57-d746-4f8b-9618-ed6a17cc922b}\\vc_redist.x86.exe\" /uninstall /quiet','installed','2025-11-20 16:27:07'),(2717,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','Microsoft Visual C++ 2015-2022 Redistributable (x64) - 14.40.33810','14.40.33810.0','Microsoft Corporation','c:\\programdata\\package cache\\{5af95fd8-a22e-458f-acee-c61bd787178e}','c:\\programdata\\package cache\\{5af95fd8-a22e-458f-acee-c61bd787178e}\\vc_redist.x64.exe','iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAHtSURBVFhHtZbLcYMwFEVZsHQ3FOQdLXiblUvwDDsvUoErcAHauwAXQnTAV3mIjyU+b+YMiRC6R49PUpRl2a7hcrlsQuusErher+3aej6f3fVaa5NAUfxkQe0uULs2UPkxfwjHwqNzhwvE4RxDeOOOFfgafqRAUviRAknhWwSYHMM4FXdgLryq+7lUlgAT47LjtgNL4asEmHQ+nwfYcxSLDl61mfBsgbnw+/03nKc6gQyokQC/zBGHxwJrarIDcwvG4VaAhdYyEgDt1sK4DZfAHjwej/Z0Ov0LYBXD+JTA1NwcCOfIWgOBuOYEVLfbbYD+1qfUJgEF1a7xs5rWuTrA7qqq6mDNmPg5yBbg2aj8O143zawAMBcJrS8Iz74FnAvhzn9g+Mh8JBCwEgoHwpDQri3K/SqgcI5B4CMRd8HunhBqqguW5A4Q/n6/iRpLeOzuFf56vTqWJEYCzi+so8ZZVAKSsCJaQwIUwepIsoANpxi3HWj8TmN0vdCuuUbs1gHGhHan6+06YvcO2GBhn2jdIrBzduuAXRQId/4tgIJb4p8LKyF26QA/8/Wz4RLgNez/CeklrMhSOCR1QHPUBYVbAd6GWAKyBKY6EIOEDZeAfzRHEt/CIQjkgET/UE4LEJwSDqsEhERAoanBPWX7Bwxr79enuACRAAAAAElFTkSuQmCC\0','\"c:\\programdata\\package cache\\{5af95fd8-a22e-458f-acee-c61bd787178e}\\vc_redist.x64.exe\"  /uninstall','\"c:\\programdata\\package cache\\{5af95fd8-a22e-458f-acee-c61bd787178e}\\vc_redist.x64.exe\" /uninstall /quiet','installed','2025-11-20 16:27:07');
/*!40000 ALTER TABLE `installed_apps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `installer_tokens`
--

DROP TABLE IF EXISTS `installer_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `installer_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` varchar(128) NOT NULL,
  `user_id` int NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `expire_at` datetime NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `used_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `installer_tokens`
--

LOCK TABLES `installer_tokens` WRITE;
/*!40000 ALTER TABLE `installer_tokens` DISABLE KEYS */;
INSERT INTO `installer_tokens` VALUES (1,'dc0c2f2d478bea8f993bc6f654b6a4fd2f9ec5d6dccacdc162d0095fbb4e2443',1,1,'2025-11-14 16:35:13','2025-11-14 16:20:13','2025-11-14 16:20:32'),(2,'e39b97e3eb7f8c77adec1e5b302ff5c5380777a31ccfa0b2a3d38b2b2dea6bac',1,1,'2025-11-16 18:23:37','2025-11-16 18:08:37','2025-11-16 18:09:04'),(3,'fddc30166af63066fe7493420350928356aec2042ac906af5bd89e2f45a247e3',1,1,'2025-11-16 18:54:53','2025-11-16 18:39:53','2025-11-16 18:40:06'),(4,'48360504e99351302ca21e5c0ace540dde0f956039b4696729a32e6040bb9483',1,0,'2025-11-17 08:28:15','2025-11-17 08:13:15',NULL);
/*!40000 ALTER TABLE `installer_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `agent_id` varchar(64) NOT NULL,
  `type` enum('capture_screen','app_limit_exceeded','daily_limit_exceeded','shutdown_triggered','killapp_triggered') NOT NULL,
  `message` text NOT NULL,
  `meta` json DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
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
-- Table structure for table `power_usage`
--

DROP TABLE IF EXISTS `power_usage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `power_usage` (
  `usage_id` int NOT NULL AUTO_INCREMENT,
  `agent_id` varchar(64) NOT NULL,
  `date` date NOT NULL,
  `hour` int NOT NULL,
  `usage_minutes` int DEFAULT '0',
  PRIMARY KEY (`usage_id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `power_usage`
--

LOCK TABLES `power_usage` WRITE;
/*!40000 ALTER TABLE `power_usage` DISABLE KEYS */;
INSERT INTO `power_usage` VALUES (1,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-17',8,13),(2,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-17',10,4),(3,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-16',19,2),(4,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-16',20,20),(5,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-16',22,4),(6,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-17',3,0),(7,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-17',6,1),(8,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-17',7,27),(9,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-17',17,20),(10,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-17',18,40),(11,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-17',19,42),(12,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-17',20,48),(13,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-18',0,27),(14,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-18',1,39),(15,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-18',18,30),(16,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-18',19,46),(17,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-19',10,12),(18,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-19',11,50),(19,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-19',14,16),(20,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-19',15,39),(21,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-19',16,2),(22,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-19',17,22),(23,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-20',23,37),(24,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-21',8,37),(25,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-21',15,8),(26,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-21',16,43),(27,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-21',17,19),(28,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-24',14,26),(29,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-24',15,12),(30,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-24',17,37),(31,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-25',8,0),(32,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-24',18,8),(33,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-25',10,4),(34,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-25',11,20),(35,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-25',13,1),(36,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','2025-11-25',14,49);
/*!40000 ALTER TABLE `power_usage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `process_usage`
--

DROP TABLE IF EXISTS `process_usage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `process_usage` (
  `usage_id` int NOT NULL AUTO_INCREMENT,
  `agent_id` varchar(64) DEFAULT NULL,
  `process_title` text,
  `process_path` text,
  `process_location` text,
  `date_recorded` date DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `time_usage` double DEFAULT NULL,
  PRIMARY KEY (`usage_id`),
  UNIQUE KEY `uq_usage` (`agent_id`,`process_title`(100),`date_recorded`,`start_time`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `process_usage`
--

LOCK TABLES `process_usage` WRITE;
/*!40000 ALTER TABLE `process_usage` DISABLE KEYS */;
INSERT INTO `process_usage` VALUES (1,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','C:\\Users\\Darius\\Desktop\\SafeDeskTray.exe','c:\\users\\darius\\desktop\\safedesktray.exe','c:\\users\\darius\\desktop','2025-11-25','11:18:00',1),(2,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','C:\\Users\\Darius\\Desktop\\SafeDeskTray.exe','c:\\users\\darius\\desktop\\safedesktray.exe','c:\\users\\darius\\desktop','2025-11-25','11:19:00',1.7),(3,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','SafeDeskAgent - Notepad','c:\\windows\\system32\\notepad.exe','c:\\windows\\system32','2025-11-25','11:23:00',2.3),(4,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','C:\\Users\\Darius\\Desktop\\SafeDeskAgent.exe','c:\\users\\darius\\desktop\\safedeskagent.exe','c:\\users\\darius\\desktop','2025-11-25','11:38:00',1.7),(5,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','Process Hacker [DESKTOP-Q7ILQ8T\\Darius]','c:\\program files\\process hacker 2\\processhacker.exe','c:\\program files\\process hacker 2','2025-11-25','14:03:00',3.5),(8,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','C:\\Users\\Darius\\Desktop\\SafeDeskAgent.exe','c:\\users\\darius\\desktop\\safedeskagent.exe','c:\\users\\darius\\desktop','2025-11-25','14:07:00',3.5),(12,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','Program Manager','c:\\windows\\explorer.exe','c:\\windows','2025-11-25','14:13:00',3.9),(16,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','Program Manager','c:\\windows\\explorer.exe','c:\\windows','2025-11-25','14:17:00',4.9),(21,'b707b6c8-ac7b-4ce1-a9ef-5ade1a6a382f','System32','c:\\windows\\explorer.exe','c:\\windows','2025-11-25','14:22:00',30.4);
/*!40000 ALTER TABLE `process_usage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') NOT NULL,
  `create_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@email.com','$2b$10$HUPji68Zq5vX.MqsbxwV1eF5Qq6KdGWM1ynTDbKUXRPxX5/9PlPfC','user','2025-11-14 06:47:09','2025-11-25 09:16:20'),(2,'admin@safedesk.com','$2b$10$4Up9WiOeZZF/FSkAFU3KdOpb4GeypllpMOmkEd8/2wt2XtFkYpqc6','user','2025-11-17 07:24:13','2025-11-25 09:16:20');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-25 17:42:17
