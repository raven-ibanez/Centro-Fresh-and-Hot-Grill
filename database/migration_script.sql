-- =====================================================
-- Centro Fresh and Hot Grill - POS System Migration Script
-- =====================================================
-- This script migrates the existing database to include POS functionality
-- Run this script after the main pos_schema.sql

-- =====================================================
-- STEP 1: BACKUP EXISTING DATA (Optional but recommended)
-- =====================================================
-- Uncomment the following lines if you want to backup existing data
-- CREATE TABLE menu_items_backup AS SELECT * FROM menu_items;
-- CREATE TABLE variations_backup AS SELECT * FROM variations;
-- CREATE TABLE add_ons_backup AS SELECT * FROM add_ons;
-- CREATE TABLE categories_backup AS SELECT * FROM categories;
-- CREATE TABLE payment_methods_backup AS SELECT * FROM payment_methods;
-- CREATE TABLE site_settings_backup AS SELECT * FROM site_settings;

-- =====================================================
-- STEP 2: ADD NEW COLUMNS TO EXISTING TABLES (if needed)
-- =====================================================

-- Add any missing columns to existing tables
-- (Most of the existing tables should already have the required structure)

-- =====================================================
-- STEP 3: CREATE NEW POS TABLES
-- =====================================================

-- Run the pos_schema.sql file first, then run this migration script

-- =====================================================
-- STEP 4: MIGRATE EXISTING MENU DATA (if needed)
-- =====================================================

-- If you have existing menu data in a different format, migrate it here
-- Example: Migrate from JSON to relational structure

-- =====================================================
-- STEP 5: CREATE INITIAL ADMIN USER
-- =====================================================

-- Check if staff table exists before inserting
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff') THEN
        -- Insert the main admin user
        INSERT INTO staff (staff_code, first_name, last_name, email, role, permissions, is_active)
        VALUES (
            'ADMIN-001',
            'System',
            'Administrator',
            'admin@centrofresh.com',
            'admin',
            '{"all": true, "menu": true, "orders": true, "inventory": true, "reports": true, "staff": true}',
            true
        ) ON CONFLICT (email) DO NOTHING;
        
        RAISE NOTICE 'Admin user created successfully';
    ELSE
        RAISE WARNING 'Staff table does not exist. Please run pos_schema.sql first.';
    END IF;
END $$;

-- =====================================================
-- STEP 6: CREATE INITIAL CUSTOMER (for testing)
-- =====================================================

-- Check if customers table exists before inserting
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
        INSERT INTO customers (customer_code, first_name, last_name, email, phone, customer_type)
        VALUES (
            'WALK-IN-001',
            'Walk-in',
            'Customer',
            'walkin@centrofresh.com',
            '+639000000000',
            'regular'
        ) ON CONFLICT (email) DO NOTHING;
        
        RAISE NOTICE 'Sample customer created successfully';
    ELSE
        RAISE WARNING 'Customers table does not exist. Please run pos_schema.sql first.';
    END IF;
END $$;

-- =====================================================
-- STEP 7: CREATE SAMPLE INVENTORY ITEMS
-- =====================================================

-- Check if inventory table exists before inserting
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory') THEN
        -- Insert essential inventory items for a restaurant
        INSERT INTO inventory (item_name, item_code, category, unit, current_stock, minimum_stock, unit_cost, supplier) VALUES
        -- Grains and Rice
        ('Jasmine Rice', 'RICE-001', 'Grains', 'kg', 100.0, 20.0, 45.00, 'Local Supplier'),
        ('Brown Rice', 'RICE-002', 'Grains', 'kg', 50.0, 10.0, 55.00, 'Local Supplier'),
        
        -- Meats
        ('Pork Belly', 'PORK-001', 'Meat', 'kg', 30.0, 5.0, 280.00, 'Meat Supplier'),
        ('Pork Shoulder', 'PORK-002', 'Meat', 'kg', 25.0, 5.0, 250.00, 'Meat Supplier'),
        ('Whole Chicken', 'CHICKEN-001', 'Meat', 'kg', 40.0, 8.0, 180.00, 'Poultry Supplier'),
        ('Chicken Breast', 'CHICKEN-002', 'Meat', 'kg', 20.0, 5.0, 220.00, 'Poultry Supplier'),
        ('Bangus (Milkfish)', 'FISH-001', 'Seafood', 'kg', 15.0, 3.0, 200.00, 'Fish Supplier'),
        
        -- Vegetables
        ('Onions', 'VEG-001', 'Vegetables', 'kg', 20.0, 5.0, 35.00, 'Vegetable Supplier'),
        ('Garlic', 'VEG-002', 'Vegetables', 'kg', 10.0, 2.0, 120.00, 'Vegetable Supplier'),
        ('Tomatoes', 'VEG-003', 'Vegetables', 'kg', 15.0, 3.0, 60.00, 'Vegetable Supplier'),
        ('Bell Peppers', 'VEG-004', 'Vegetables', 'kg', 8.0, 2.0, 80.00, 'Vegetable Supplier'),
        ('Ginger', 'VEG-005', 'Vegetables', 'kg', 5.0, 1.0, 100.00, 'Fruit Supplier'),
        
        -- Cooking Essentials
        ('Cooking Oil', 'OIL-001', 'Cooking', 'liters', 20.0, 5.0, 85.00, 'Cooking Supplier'),
        ('Soy Sauce', 'SAUCE-001', 'Sauces', 'liters', 10.0, 2.0, 45.00, 'Sauce Supplier'),
        ('Vinegar', 'SAUCE-002', 'Sauces', 'liters', 8.0, 2.0, 25.00, 'Sauce Supplier'),
        ('Calamansi', 'CITRUS-001', 'Citrus', 'kg', 10.0, 2.0, 40.00, 'Fruit Supplier'),
        
        -- Noodles
        ('Egg Noodles', 'NOODLE-001', 'Noodles', 'kg', 20.0, 5.0, 35.00, 'Noodle Supplier'),
        ('Rice Noodles', 'NOODLE-002', 'Noodles', 'kg', 15.0, 3.0, 30.00, 'Noodle Supplier'),
        
        -- Beverages
        ('Calamansi Juice', 'BEV-001', 'Beverages', 'liters', 10.0, 2.0, 25.00, 'Beverage Supplier'),
        ('Coconut Water', 'BEV-002', 'Beverages', 'liters', 8.0, 2.0, 40.00, 'Beverage Supplier'),
        ('Mango Juice', 'BEV-003', 'Beverages', 'liters', 6.0, 2.0, 50.00, 'Beverage Supplier'),
        
        -- Spices and Seasonings
        ('Salt', 'SPICE-001', 'Spices', 'kg', 5.0, 1.0, 15.00, 'Spice Supplier'),
        ('Black Pepper', 'SPICE-002', 'Spices', 'kg', 2.0, 0.5, 200.00, 'Spice Supplier'),
        ('Bay Leaves', 'SPICE-003', 'Spices', 'kg', 1.0, 0.2, 300.00, 'Spice Supplier');
        
        RAISE NOTICE 'Sample inventory items created successfully';
    ELSE
        RAISE WARNING 'Inventory table does not exist. Please run pos_schema.sql first.';
    END IF;
END $$;

-- =====================================================
-- STEP 8: CREATE SAMPLE EXPENSES (for testing)
-- =====================================================

-- Check if expenses table exists before inserting
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'expenses') THEN
        INSERT INTO expenses (expense_code, category, description, amount, expense_date, payment_method, vendor, status) VALUES
        ('EXP-2024-001', 'utilities', 'Electricity Bill - January 2024', 2500.00, '2024-01-15', 'bank_transfer', 'Meralco', 'approved'),
        ('EXP-2024-002', 'utilities', 'Water Bill - January 2024', 800.00, '2024-01-15', 'bank_transfer', 'Maynilad', 'approved'),
        ('EXP-2024-003', 'supplies', 'Kitchen Supplies and Utensils', 1500.00, '2024-01-20', 'cash', 'Kitchen Supply Store', 'approved'),
        ('EXP-2024-004', 'maintenance', 'Equipment Maintenance', 3000.00, '2024-01-25', 'bank_transfer', 'Equipment Service Co.', 'pending');
        
        RAISE NOTICE 'Sample expenses created successfully';
    ELSE
        RAISE WARNING 'Expenses table does not exist. Please run pos_schema.sql first.';
    END IF;
END $$;

-- =====================================================
-- STEP 9: UPDATE SITE SETTINGS FOR POS
-- =====================================================

-- Add POS-specific settings
INSERT INTO site_settings (id, value, type, description) VALUES
('pos_tax_rate', '0.12', 'number', 'Tax rate for orders (12% VAT)'),
('pos_service_charge_rate', '0.10', 'number', 'Service charge rate for dine-in orders (10%)'),
('pos_delivery_fee', '50.00', 'number', 'Standard delivery fee'),
('pos_minimum_order', '100.00', 'number', 'Minimum order amount for delivery'),
('pos_currency_symbol', '₱', 'text', 'Currency symbol'),
('pos_receipt_footer', 'Thank you for dining with us!', 'text', 'Receipt footer message'),
('pos_kitchen_printer_ip', '192.168.1.100', 'text', 'Kitchen printer IP address'),
('pos_receipt_printer_ip', '192.168.1.101', 'text', 'Receipt printer IP address')
ON CONFLICT (id) DO UPDATE SET 
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- STEP 10: CREATE USEFUL FUNCTIONS FOR POS
-- =====================================================

-- Function to calculate order totals
CREATE OR REPLACE FUNCTION calculate_order_total(order_id UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    subtotal DECIMAL(10,2);
    tax_rate DECIMAL(5,4);
    service_charge_rate DECIMAL(5,4);
    tax_amount DECIMAL(10,2);
    service_charge DECIMAL(10,2);
    total DECIMAL(10,2);
    order_type VARCHAR(20);
BEGIN
    -- Get order type
    SELECT o.order_type INTO order_type FROM orders o WHERE o.id = order_id;
    
    -- Calculate subtotal from order items
    SELECT COALESCE(SUM(oi.total_price), 0) INTO subtotal
    FROM order_items oi
    WHERE oi.order_id = order_id;
    
    -- Get tax rate from settings
    SELECT CAST(value AS DECIMAL(5,4)) INTO tax_rate
    FROM site_settings
    WHERE id = 'pos_tax_rate';
    
    -- Get service charge rate from settings (only for dine-in)
    IF order_type = 'dine-in' THEN
        SELECT CAST(value AS DECIMAL(5,4)) INTO service_charge_rate
        FROM site_settings
        WHERE id = 'pos_service_charge_rate';
    ELSE
        service_charge_rate := 0;
    END IF;
    
    -- Calculate tax and service charge
    tax_amount := subtotal * COALESCE(tax_rate, 0);
    service_charge := subtotal * COALESCE(service_charge_rate, 0);
    
    -- Calculate total
    total := subtotal + tax_amount + service_charge;
    
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Function to get low stock alerts
CREATE OR REPLACE FUNCTION get_low_stock_alerts()
RETURNS TABLE(
    item_name VARCHAR(200),
    current_stock DECIMAL(10,3),
    minimum_stock DECIMAL(10,3),
    unit VARCHAR(20),
    days_remaining INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.item_name,
        i.current_stock,
        i.minimum_stock,
        i.unit,
        CASE 
            WHEN i.current_stock > 0 THEN 
                CAST((i.current_stock / GREATEST(i.minimum_stock, 1)) * 30 AS INTEGER)
            ELSE 0
        END as days_remaining
    FROM inventory i
    WHERE i.current_stock <= i.minimum_stock 
    AND i.is_active = true
    ORDER BY (i.current_stock - i.minimum_stock) ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 11: CREATE SAMPLE ORDERS (for testing)
-- =====================================================

-- Create a sample completed order
INSERT INTO orders (
    order_number,
    customer_id,
    staff_id,
    order_type,
    status,
    service_type,
    customer_name,
    customer_phone,
    table_number,
    party_size,
    subtotal,
    tax_amount,
    service_charge,
    total_amount,
    payment_status,
    payment_method,
    order_time,
    completed_time
) VALUES (
    generate_order_number(),
    (SELECT id FROM customers WHERE customer_code = 'WALK-IN-001'),
    (SELECT id FROM staff WHERE staff_code = 'STAFF-003'),
    'dine-in',
    'completed',
    'dine-in',
    'Walk-in Customer',
    '+639000000000',
    'T01',
    2,
    320.00,
    38.40,
    32.00,
    390.40,
    'paid',
    'cash',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 hour 45 minutes'
);

-- Add order items to the sample order
INSERT INTO order_items (
    order_id,
    menu_item_id,
    item_name,
    item_description,
    base_price,
    quantity,
    unit_price,
    total_price,
    status
) VALUES (
    (SELECT id FROM orders WHERE order_number LIKE 'ORD-%' ORDER BY created_at DESC LIMIT 1),
    (SELECT id FROM menu_items WHERE name = 'Lechon Kawali'),
    'Lechon Kawali',
    'Crispy deep-fried pork belly served with liver sauce and atchara',
    320.00,
    1,
    320.00,
    320.00,
    'served'
);

-- =====================================================
-- STEP 12: VERIFY MIGRATION
-- =====================================================

-- Check if all tables were created successfully
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'customers', 'staff', 'orders', 'order_items', 'order_item_addons',
        'payments', 'inventory', 'inventory_transactions', 'expenses',
        'reports', 'notifications'
    );
    
    IF table_count = 11 THEN
        RAISE NOTICE 'Migration completed successfully! All POS tables created.';
    ELSE
        RAISE WARNING 'Migration incomplete. Only % out of 11 tables created.', table_count;
    END IF;
END $$;

-- =====================================================
-- STEP 13: CREATE USEFUL VIEWS FOR DASHBOARD
-- =====================================================

-- Today's sales summary
CREATE VIEW today_sales_summary AS
SELECT 
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as average_order_value,
    COUNT(DISTINCT customer_id) as unique_customers,
    SUM(CASE WHEN order_type = 'dine-in' THEN 1 ELSE 0 END) as dine_in_orders,
    SUM(CASE WHEN order_type = 'takeout' THEN 1 ELSE 0 END) as takeout_orders,
    SUM(CASE WHEN order_type = 'delivery' THEN 1 ELSE 0 END) as delivery_orders
FROM orders
WHERE DATE(order_time) = CURRENT_DATE
AND status = 'completed';

-- Current month sales
CREATE VIEW monthly_sales_summary AS
SELECT 
    DATE_TRUNC('month', order_time) as month,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as average_order_value
FROM orders
WHERE status = 'completed'
AND DATE_TRUNC('month', order_time) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY DATE_TRUNC('month', order_time);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Centro Fresh and Hot Grill POS System Migration Complete!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Database is now ready for POS operations.';
    RAISE NOTICE 'You can now start using the POS system features.';
    RAISE NOTICE '=====================================================';
END $$;
