-- =====================================================================
-- Farmer's Online Granary - Database Schema
-- Focus: Karnataka Agricultural Direct Marketplace
-- Database: farmers_granary
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `farmers_granary` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `farmers_granary`;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(20) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('farmer', 'buyer', 'admin') NOT NULL DEFAULT 'buyer',
  `buyer_type` ENUM('individual', 'retailer', 'wholesaler') NULL,
  `status` ENUM('active', 'suspended', 'pending') NOT NULL DEFAULT 'active',
  `preferred_language` ENUM('en', 'kn') NOT NULL DEFAULT 'en',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. FARMER PROFILES
CREATE TABLE IF NOT EXISTS `farmer_profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `farm_name` VARCHAR(150) NOT NULL,
  `experience_years` INT DEFAULT 0,
  `state` VARCHAR(100) NOT NULL DEFAULT 'Karnataka',
  `district` VARCHAR(100) NOT NULL,
  `taluk` VARCHAR(100) NOT NULL,
  `village` VARCHAR(100) NOT NULL,
  `pincode` VARCHAR(10) NOT NULL,
  `farm_size_acres` DECIMAL(6,2) DEFAULT 0.00,
  `primary_crops` VARCHAR(255) NULL,
  `verification_status` ENUM('unverified', 'pending', 'verified', 'rejected') NOT NULL DEFAULT 'unverified',
  `id_proof_type` VARCHAR(80) NULL,
  `id_proof_number` VARCHAR(100) NULL,
  `bio` TEXT NULL,
  `profile_image_url` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_farmer_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_farmer_district` (`district`),
  INDEX `idx_farmer_verification` (`verification_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. BUYER PROFILES
CREATE TABLE IF NOT EXISTS `buyer_profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `business_name` VARCHAR(150) NULL,
  `gst_number` VARCHAR(50) NULL,
  `trade_license` VARCHAR(100) NULL,
  `default_delivery_notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_buyer_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. ADDRESSES
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(50) NOT NULL DEFAULT 'Home',
  `recipient_name` VARCHAR(120) NOT NULL,
  `recipient_phone` VARCHAR(20) NOT NULL,
  `address_line1` VARCHAR(255) NOT NULL,
  `address_line2` VARCHAR(255) NULL,
  `village_or_town` VARCHAR(100) NOT NULL,
  `taluk` VARCHAR(100) NOT NULL,
  `district` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL DEFAULT 'Karnataka',
  `pincode` VARCHAR(10) NOT NULL,
  `is_default` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_addresses_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. CATEGORIES
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name_en` VARCHAR(100) NOT NULL,
  `name_kn` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `icon_name` VARCHAR(50) NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. PRODUCT LISTINGS
CREATE TABLE IF NOT EXISTS `product_listings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `farmer_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `title_en` VARCHAR(200) NOT NULL,
  `title_kn` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `unit` ENUM('kg', 'quintal', 'bag_50kg', 'box', 'piece') NOT NULL DEFAULT 'kg',
  `price_per_unit` DECIMAL(10, 2) NOT NULL,
  `available_quantity` DECIMAL(10, 2) NOT NULL,
  `min_order_quantity` DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
  `quality_grade` ENUM('Grade A (Premium)', 'Grade B (Standard)', 'Grade C (Fair)') NOT NULL DEFAULT 'Grade A (Premium)',
  `farming_method` ENUM('Seller-Declared Organic', 'Natural / ZBNF', 'Traditional Conventional') NOT NULL DEFAULT 'Traditional Conventional',
  `harvest_date` DATE NOT NULL,
  `location_district` VARCHAR(100) NOT NULL,
  `location_taluk` VARCHAR(100) NOT NULL,
  `location_village` VARCHAR(100) NOT NULL,
  `image_url` VARCHAR(255) NULL,
  `status` ENUM('active', 'sold_out', 'inactive', 'unlisted') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_products_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  INDEX `idx_products_category` (`category_id`),
  INDEX `idx_products_farmer` (`farmer_id`),
  INDEX `idx_products_district` (`location_district`),
  INDEX `idx_products_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. PRICE HISTORY
CREATE TABLE IF NOT EXISTS `price_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `old_price` DECIMAL(10, 2) NOT NULL,
  `new_price` DECIMAL(10, 2) NOT NULL,
  `change_reason` VARCHAR(255) NULL,
  `changed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_price_history_product` FOREIGN KEY (`product_id`) REFERENCES `product_listings` (`id`) ON DELETE CASCADE,
  INDEX `idx_price_history_product` (`product_id`, `changed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. ORDERS
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_code` VARCHAR(30) NOT NULL UNIQUE,
  `buyer_id` INT NOT NULL,
  `farmer_id` INT NOT NULL,
  `delivery_address_id` INT NULL,
  `delivery_address_snapshot` TEXT NOT NULL,
  `total_amount` DECIMAL(12, 2) NOT NULL,
  `payment_method` ENUM('cash_on_delivery', 'manual_bank_transfer') NOT NULL DEFAULT 'cash_on_delivery',
  `payment_status` ENUM('pending', 'paid', 'cancelled') NOT NULL DEFAULT 'pending',
  `order_status` ENUM('placed', 'confirmed', 'harvesting_packed', 'in_transit', 'delivered', 'cancelled') NOT NULL DEFAULT 'placed',
  `buyer_notes` TEXT NULL,
  `cancellation_reason` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_orders_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_orders_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_orders_address` FOREIGN KEY (`delivery_address_id`) REFERENCES `addresses` (`id`) ON DELETE SET NULL,
  INDEX `idx_orders_buyer` (`buyer_id`),
  INDEX `idx_orders_farmer` (`farmer_id`),
  INDEX `idx_orders_status` (`order_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. ORDER ITEMS
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `product_title_snapshot` VARCHAR(200) NOT NULL,
  `unit_price` DECIMAL(10, 2) NOT NULL,
  `quantity` DECIMAL(10, 2) NOT NULL,
  `subtotal` DECIMAL(12, 2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `product_listings` (`id`),
  INDEX `idx_order_items_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. REVIEWS
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `buyer_id` INT NOT NULL,
  `farmer_id` INT NOT NULL,
  `rating` INT NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `comment` TEXT NULL,
  `is_approved` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_reviews_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `product_listings` (`id`),
  CONSTRAINT `fk_reviews_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_reviews_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`),
  INDEX `idx_reviews_product` (`product_id`),
  INDEX `idx_reviews_farmer` (`farmer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. VERIFICATION RECORDS
CREATE TABLE IF NOT EXISTS `verification_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `farmer_id` INT NOT NULL,
  `document_type` VARCHAR(100) NOT NULL,
  `document_number` VARCHAR(100) NOT NULL,
  `submitted_notes` TEXT NULL,
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `reviewed_by` INT NULL,
  `admin_notes` TEXT NULL,
  `reviewed_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_verification_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_verification_admin` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_verification_farmer` (`farmer_id`),
  INDEX `idx_verification_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. COMPLAINTS
CREATE TABLE IF NOT EXISTS `complaints` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ticket_number` VARCHAR(30) NOT NULL UNIQUE,
  `user_id` INT NOT NULL,
  `order_id` INT NULL,
  `subject` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `category` ENUM('quality_issue', 'delivery_delay', 'quantity_mismatch', 'payment_issue', 'other') NOT NULL DEFAULT 'quality_issue',
  `status` ENUM('open', 'investigating', 'resolved', 'closed') NOT NULL DEFAULT 'open',
  `resolution_notes` TEXT NULL,
  `resolved_by` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_complaints_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_complaints_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_complaints_admin` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_complaints_user` (`user_id`),
  INDEX `idx_complaints_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title_en` VARCHAR(200) NOT NULL,
  `title_kn` VARCHAR(200) NOT NULL,
  `message_en` TEXT NOT NULL,
  `message_kn` TEXT NOT NULL,
  `type` ENUM('order_update', 'verification', 'price_alert', 'system') NOT NULL DEFAULT 'system',
  `link_url` VARCHAR(255) NULL,
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_notifications_user_unread` (`user_id`, `is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
