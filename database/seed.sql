-- =====================================================================
-- Farmer's Online Granary - Demonstration Seed Script
-- Notice: ALL DATA IN THIS SCRIPT IS FOR DEMONSTRATION & TESTING ONLY.
-- Farmers, listings, prices, reviews, and credentials are dummy records.
-- =====================================================================

USE `farmers_granary`;

-- Disable foreign key checks for clean loading
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `notifications`;
TRUNCATE TABLE `complaints`;
TRUNCATE TABLE `verification_records`;
TRUNCATE TABLE `reviews`;
TRUNCATE TABLE `order_items`;
TRUNCATE TABLE `orders`;
TRUNCATE TABLE `price_history`;
TRUNCATE TABLE `product_listings`;
TRUNCATE TABLE `categories`;
TRUNCATE TABLE `addresses`;
TRUNCATE TABLE `buyer_profiles`;
TRUNCATE TABLE `farmer_profiles`;
TRUNCATE TABLE `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. DEMO USERS (Password for all demonstration accounts is: Password@123)
-- Hash: $2b$10$EQA3Sg6qtqTFPyEohxELZOtAIk9cDV/lqfzFNBDpRpTTNS1Sn92KC
INSERT INTO `users` (`id`, `full_name`, `email`, `phone`, `password_hash`, `role`, `buyer_type`, `status`, `preferred_language`) VALUES
(1, 'Granary Admin (Demo)', 'admin@farmersgranary.test', '+919800000001', '$2b$10$EQA3Sg6qtqTFPyEohxELZOtAIk9cDV/lqfzFNBDpRpTTNS1Sn92KC', 'admin', NULL, 'active', 'en'),
(2, 'Kempe Gowda (Farmer Demo)', 'ramesh.farmer@farmersgranary.test', '+919800000002', '$2b$10$EQA3Sg6qtqTFPyEohxELZOtAIk9cDV/lqfzFNBDpRpTTNS1Sn92KC', 'farmer', NULL, 'active', 'kn'),
(3, 'Basavaraj Patil (Farmer Demo)', 'basavaraj.farmer@farmersgranary.test', '+919800000003', '$2b$10$EQA3Sg6qtqTFPyEohxELZOtAIk9cDV/lqfzFNBDpRpTTNS1Sn92KC', 'farmer', NULL, 'active', 'en'),
(4, 'Suresh Hegde (Farmer Demo)', 'manjunath.farmer@farmersgranary.test', '+919800000004', '$2b$10$EQA3Sg6qtqTFPyEohxELZOtAIk9cDV/lqfzFNBDpRpTTNS1Sn92KC', 'farmer', NULL, 'active', 'en'),
(5, 'Anand Rao (Consumer Demo)', 'anand.buyer@farmersgranary.test', '+919800000005', '$2b$10$EQA3Sg6qtqTFPyEohxELZOtAIk9cDV/lqfzFNBDpRpTTNS1Sn92KC', 'buyer', 'individual', 'active', 'en'),
(6, 'Kaveri Agro Traders (Wholesale Demo)', 'mysore.traders@farmersgranary.test', '+919800000006', '$2b$10$EQA3Sg6qtqTFPyEohxELZOtAIk9cDV/lqfzFNBDpRpTTNS1Sn92KC', 'buyer', 'wholesaler', 'active', 'kn');

-- 2. DEMO FARMER PROFILES (Karnataka Districts)
INSERT INTO `farmer_profiles` (`id`, `user_id`, `farm_name`, `experience_years`, `state`, `district`, `taluk`, `village`, `pincode`, `farm_size_acres`, `primary_crops`, `verification_status`, `id_proof_type`, `id_proof_number`, `bio`) VALUES
(1, 2, 'Kaveri Basin Organic Farm', 18, 'Karnataka', 'Mandya', 'Srirangapatna', 'Ganjam', '571477', 4.5, 'Sona Masoori Rice, Organic Sugarcane Jaggery, Ragi', 'verified', 'Pahani RTC Document', 'RTC-MDY-2024-8841', 'Generational farmer practicing natural farming along the Cauvery river canal basin.'),
(2, 3, 'Malaprabha Agro Fields', 12, 'Karnataka', 'Dharwad', 'Navalgund', 'Morab', '582208', 8.0, 'Foxtail Millet (Navane), Byadgi Chilli, Bengal Gram', 'verified', 'Pahani RTC Document', 'RTC-DHW-2023-1192', 'Specializing in dryland millets and traditional pulses under integrated farming system.'),
(3, 4, 'Sahyadri Spice & Areca Plantation', 22, 'Karnataka', 'Uttara Kannada', 'Sirsi', 'Hulekal', '581402', 6.0, 'Black Pepper, Green Cardamom, Ginger, Clove', 'pending', 'Aadhaar Card / RTC', 'RTC-UKD-2024-4401', 'High-rainfall hill garden cultivating forest spices and traditional GI-associated herbs.');

-- 3. DEMO BUYER PROFILES
INSERT INTO `buyer_profiles` (`id`, `user_id`, `business_name`, `gst_number`, `trade_license`, `default_delivery_notes`) VALUES
(1, 5, NULL, NULL, NULL, 'Deliver during evening hours after 5 PM if possible.'),
(2, 6, 'Kaveri Agro Wholesale Mart', '29ABCDE1234F1Z5', 'TL-MYS-2025-091', 'Unloading bay at APMC Yard Shop 14, Mysuru.');

-- 4. DEMO ADDRESSES
INSERT INTO `addresses` (`id`, `user_id`, `title`, `recipient_name`, `recipient_phone`, `address_line1`, `address_line2`, `village_or_town`, `taluk`, `district`, `state`, `pincode`, `is_default`) VALUES
(1, 5, 'Residence', 'Anand Rao', '+919800000005', '#142, 4th Cross, Malleshwaram', 'Near Sampige Theater', 'Bengaluru Urban', 'Bengaluru North', 'Bengaluru Urban', 'Karnataka', '560003', TRUE),
(2, 6, 'Warehouse & Shop', 'S. Mahadevappa (Kaveri Agro)', '+919800000006', 'Shop No. 14, APMC Bandipalya', 'Ring Road Junction', 'Bandipalya', 'Mysuru', 'Mysuru', 'Karnataka', '570025', TRUE);

-- 5. DEMO CATEGORIES (Karnataka Agricultural Categories)
INSERT INTO `categories` (`id`, `name_en`, `name_kn`, `slug`, `description`, `icon_name`, `is_active`) VALUES
(1, 'Cereals & Grains', 'ಧಾನ್ಯಗಳು', 'cereals', 'Traditional staple cereals including Sona Masoori, brown rice, and wheat.', 'Wheat', TRUE),
(2, 'Millets (Siri Dhanya)', 'ಸಿರಿಧಾನ್ಯಗಳು', 'millets', 'Nutrient-rich Karnataka indigenous millets like Ragi, Navane, and Same.', 'Sprout', TRUE),
(3, 'Pulses & Legumes', 'ಬೇಳೆಕಾಳುಗಳು', 'pulses', 'High-protein farm-split Toor Dal, Kadale (chana), and Moong.', 'Bean', TRUE),
(4, 'Fresh Vegetables', 'ತರಕಾರಿಗಳು', 'vegetables', 'Freshly harvested regional vegetables, shallots, and Byadgi chillies.', 'Salad', TRUE),
(5, 'Fresh Fruits', 'ಹಣ್ಣುಗಳು', 'fruits', 'Regional fruits including Nanjangud Rasabale, Coorg Oranges, and sapota.', 'Apple', TRUE),
(6, 'Spices & Condiments', 'ಮಸಾಲೆಗಳು', 'spices', 'Malnad black pepper, natural cardamom, ginger, and raw turmeric.', 'Flame', TRUE),
(7, 'Oilseeds & Natural Oils', 'ಎಣ್ಣೆಕಾಳುಗಳು', 'oilseeds', 'Groundnut, sunflower seeds, and cold-pressed pure village sesame.', 'Droplets', TRUE);

-- 6. DEMO PRODUCT LISTINGS
INSERT INTO `product_listings` (`id`, `farmer_id`, `category_id`, `title_en`, `title_kn`, `description`, `unit`, `price_per_unit`, `available_quantity`, `min_order_quantity`, `quality_grade`, `farming_method`, `harvest_date`, `location_district`, `location_taluk`, `location_village`, `image_url`, `status`) VALUES
(1, 2, 1, 'Organic Sona Masoori Raw Rice', 'ಸಾವಯವ ಸೋನಾ ಮಸೂರಿ ಅಕ್ಕಿ', 'Naturally cultivated river-irrigated Sona Masoori rice aged 12 months for fluffiness. Directly harvested from Srirangapatna farms.', 'quintal', 5400.00, 35.00, 1.00, 'Grade A (Premium)', 'Seller-Declared Organic', '2026-09-15', 'Mandya', 'Srirangapatna', 'Ganjam', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80', 'active'),
(2, 2, 2, 'Unpolished Finger Millet (Ragi)', 'ಪಾಲಿಶ್ ಮಾಡದ ರಾಗಿ', 'Traditional Karnataka brown Ragi rich in natural calcium and fiber. Sun-dried and cleaned for household flour milling.', 'kg', 42.00, 850.00, 5.00, 'Grade A (Premium)', 'Natural / ZBNF', '2026-09-28', 'Mandya', 'Srirangapatna', 'Ganjam', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80', 'active'),
(3, 3, 2, 'Navane / Foxtail Millet (Grain)', 'ನವಣೆ ಸಿರಿಧಾನ್ಯ', 'Rain-fed Navane millet cultivated in black cotton soils of Dharwad. Excellent low-glycemic traditional grain.', 'kg', 78.00, 420.00, 2.00, 'Grade A (Premium)', 'Natural / ZBNF', '2026-10-02', 'Dharwad', 'Navalgund', 'Morab', 'https://images.unsplash.com/photo-1599763261773-199684124357?auto=format&fit=crop&w=800&q=80', 'active'),
(4, 3, 4, 'Authentic Byadgi Red Chillies (Dry)', 'ಅಸಲಿ ಬ್ಯಾಡಗಿ ಒಣ ಮೆಣಸಿನಕಾಯಿ', 'Famous Karnataka Byadgi chillies prized for deep crimson oleoresin color and mild balanced spice.', 'kg', 360.00, 180.00, 1.00, 'Grade A (Premium)', 'Traditional Conventional', '2026-08-20', 'Dharwad', 'Navalgund', 'Morab', 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80', 'active'),
(5, 3, 3, 'Gulbarga Special Brown Chickpeas (Kadale)', 'ಕಲಬುರಗಿ ಕಡಲೆಕಾಳು', 'Desi native brown chickpeas sorted and cleaned, rich in natural protein for sprouting and curries.', 'kg', 68.00, 550.00, 5.00, 'Grade B (Standard)', 'Traditional Conventional', '2026-09-10', 'Dharwad', 'Navalgund', 'Morab', 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80', 'active'),
(6, 4, 6, 'Malnad Tellicherry Black Pepper (Garbled)', 'ಮಲೆನಾಡು ಕಾಳುಮೆಣಸು', 'Bold size sun-dried black peppercorns grown under canopy shade in Western Ghats valleys of Sirsi.', 'kg', 720.00, 240.00, 0.50, 'Grade A (Premium)', 'Natural / ZBNF', '2026-09-05', 'Uttara Kannada', 'Sirsi', 'Hulekal', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80', 'active'),
(7, 4, 6, 'Western Ghats Green Cardamom (8mm Bold)', 'ಹಸಿರು ಏಲಕ್ಕಿ', 'High aroma green cardamom pods handpicked in hill mist valleys of Uttara Kannada.', 'kg', 2450.00, 45.00, 0.25, 'Grade A (Premium)', 'Natural / ZBNF', '2026-09-12', 'Uttara Kannada', 'Sirsi', 'Hulekal', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80', 'active'),
(8, 2, 7, 'Traditional Chemical-Free Jaggery Blocks', 'ಸಾವಯವ ಅಚ್ಚು ಬೆಲ್ಲ', 'Made from fresh Mandya sugarcane juice without chemical bleaching agents or artificial colors.', 'box', 420.00, 60.00, 1.00, 'Grade A (Premium)', 'Seller-Declared Organic', '2026-10-05', 'Mandya', 'Srirangapatna', 'Ganjam', 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80', 'active');

-- 7. DEMO PRICE HISTORY
INSERT INTO `price_history` (`id`, `product_id`, `old_price`, `new_price`, `change_reason`, `changed_at`) VALUES
(1, 1, 5600.00, 5400.00, 'Post-harvest seasonal price adjustment', '2026-10-01 10:00:00'),
(2, 4, 380.00, 360.00, 'Bulk mandi arrival rate stabilization', '2026-09-25 14:30:00');

-- 8. DEMO ORDERS
INSERT INTO `orders` (`id`, `order_code`, `buyer_id`, `farmer_id`, `delivery_address_id`, `delivery_address_snapshot`, `total_amount`, `payment_method`, `payment_status`, `order_status`, `buyer_notes`, `created_at`) VALUES
(1, 'FOG-20261010-001', 5, 2, 1, 'Anand Rao, #142, 4th Cross, Malleshwaram, Bengaluru Urban, Karnataka - 560003. Phone: +919800000005', 420.00, 'cash_on_delivery', 'paid', 'delivered', 'Please ensure safe packing', '2026-10-10 11:20:00'),
(2, 'FOG-20261015-002', 6, 3, 2, 'Kaveri Agro Wholesale Mart, Shop No. 14, APMC Bandipalya, Mysuru, Karnataka - 570025. Phone: +919800000006', 7200.00, 'cash_on_delivery', 'pending', 'confirmed', 'Wholesale inspection upon arrival', '2026-10-15 15:45:00');

-- 9. DEMO ORDER ITEMS
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_title_snapshot`, `unit_price`, `quantity`, `subtotal`) VALUES
(1, 1, 2, 'Unpolished Finger Millet (Ragi)', 42.00, 10.00, 420.00),
(2, 2, 4, 'Authentic Byadgi Red Chillies (Dry)', 360.00, 20.00, 7200.00);

-- 10. DEMO REVIEWS
INSERT INTO `reviews` (`id`, `order_id`, `product_id`, `buyer_id`, `farmer_id`, `rating`, `comment`, `is_approved`, `created_at`) VALUES
(1, 1, 2, 5, 2, 5, 'Exceptional quality clean Ragi directly from Mandya farmer. No stones or dust, very fresh harvest.', TRUE, '2026-10-12 16:30:00');

-- 11. DEMO VERIFICATION RECORDS
INSERT INTO `verification_records` (`id`, `farmer_id`, `document_type`, `document_number`, `submitted_notes`, `status`, `reviewed_by`, `admin_notes`, `reviewed_at`) VALUES
(1, 2, 'Pahani RTC Document', 'RTC-MDY-2024-8841', 'Mandya Srirangapatna agricultural survey land records attached.', 'approved', 1, 'Verified via Karnataka Bhoomi portal land records.', '2026-08-15 11:00:00'),
(2, 3, 'Pahani RTC Document', 'RTC-DHW-2023-1192', 'Navalgund dryland millets farmer survey registration.', 'approved', 1, 'Farmer landholding verified against revenue record.', '2026-09-01 14:00:00'),
(3, 4, 'Aadhaar Card / RTC', 'RTC-UKD-2024-4401', 'Sirsi spice garden RTC pending verification.', 'pending', NULL, NULL, NULL);

-- 12. DEMO COMPLAINTS
INSERT INTO `complaints` (`id`, `ticket_number`, `user_id`, `order_id`, `subject`, `description`, `category`, `status`, `created_at`) VALUES
(1, 'CMP-20261016-01', 5, 1, 'Inquiry on cold-pressed sesame availability', 'Wondering when the Mandya farmer will harvest the winter sesame batch.', 'other', 'resolved', '2026-10-16 09:30:00');

-- 13. DEMO NOTIFICATIONS
INSERT INTO `notifications` (`id`, `user_id`, `title_en`, `title_kn`, `message_en`, `message_kn`, `type`, `link_url`, `is_read`) VALUES
(1, 2, 'Order Delivered Successfully', 'ಆದೇಶವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ತಲುಪಿಸಲಾಗಿದೆ', 'Order FOG-20261010-001 for Ragi has been marked delivered.', 'ರಾಗಿಯ ಆದೇಶ FOG-20261010-001 ತಲುಪಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ.', 'order_update', '/farmer/orders', TRUE),
(2, 4, 'Verification Under Review', 'ಪರಿಶೀಲನೆ ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ', 'Your Sirsi land RTC documents are under administrative review.', 'ನಿಮ್ಮ ಸಿರ್ಸಿ ಭೂ ದಾಖಲೆಗಳು ಆಡಳಿತ ಮಂಡಳಿಯ ಪರಿಶೀಲನೆಯಲ್ಲಿವೆ.', 'verification', '/farmer/profile', FALSE);
