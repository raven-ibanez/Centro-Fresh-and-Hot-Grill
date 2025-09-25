-- =====================================================
-- Centro Fresh and Hot Grill - POS Database Setup Script
-- =====================================================
-- This script sets up the complete POS database system
-- Run this script in your Supabase SQL editor

-- =====================================================
-- STEP 1: CREATE THE MAIN SCHEMA
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_code VARCHAR(20) UNIQUE NOT NULL, -- e.g., CUST-001
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(20),
    date_of_birth DATE,
    customer_type VARCHAR(20) DEFAULT 'regular' CHECK (customer_type IN ('regular', 'vip', 'wholesale')),
    loyalty_points INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STAFF/USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_code VARCHAR(20) UNIQUE NOT NULL, -- e.g., STAFF-001
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'cashier', 'kitchen', 'waiter', 'delivery')),
    permissions JSONB DEFAULT '{}', -- Store role-specific permissions
    hourly_rate DECIMAL(8,2),
    hire_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(20) UNIQUE NOT NULL, -- e.g., ORD-2024-001
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('dine-in', 'takeout', 'delivery', 'online')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled')),
    service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('dine-in', 'pickup', 'delivery')),
    
    -- Customer Information (denormalized for performance)
    customer_name VARCHAR(200),
    customer_phone VARCHAR(20),
    customer_email VARCHAR(255),
    
    -- Order Details
    table_number VARCHAR(10), -- For dine-in orders
    party_size INTEGER DEFAULT 1,
    order_notes TEXT,
    
    -- Delivery Information
    delivery_address TEXT,
    delivery_instructions TEXT,
    delivery_fee DECIMAL(8,2) DEFAULT 0.00,
    
    -- Timing
    order_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estimated_ready_time TIMESTAMP WITH TIME ZONE,
    actual_ready_time TIMESTAMP WITH TIME ZONE,
    completed_time TIMESTAMP WITH TIME ZONE,
    
    -- Pricing
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    service_charge DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    
    -- Payment
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partially_paid', 'refunded')),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ORDER ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    
    -- Item Details (denormalized for performance)
    item_name VARCHAR(200) NOT NULL,
    item_description TEXT,
    base_price DECIMAL(8,2) NOT NULL,
    
    -- Variations and Add-ons
    selected_variation_id UUID REFERENCES variations(id) ON DELETE SET NULL,
    selected_variation_name VARCHAR(100),
    selected_variation_price DECIMAL(8,2) DEFAULT 0.00,
    
    -- Quantity and Pricing
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(8,2) NOT NULL, -- Final price per unit after variations
    total_price DECIMAL(10,2) NOT NULL, -- quantity * unit_price
    
    -- Special Instructions
    special_instructions TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served')),
    prepared_by UUID REFERENCES staff(id) ON DELETE SET NULL,
    prepared_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ORDER ITEM ADD-ONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS order_item_addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    addon_id UUID NOT NULL REFERENCES add_ons(id) ON DELETE CASCADE,
    
    -- Add-on Details (denormalized for performance)
    addon_name VARCHAR(200) NOT NULL,
    addon_price DECIMAL(8,2) NOT NULL,
    addon_category VARCHAR(100),
    quantity INTEGER DEFAULT 1,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_method_id TEXT REFERENCES payment_methods(id) ON DELETE SET NULL,
    
    -- Payment Details
    payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('cash', 'gcash', 'maya', 'bank_transfer', 'credit_card', 'debit_card')),
    amount DECIMAL(10,2) NOT NULL,
    reference_number VARCHAR(100),
    transaction_id VARCHAR(100),
    
    -- Payment Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    
    -- Additional Info
    notes TEXT,
    processed_by UUID REFERENCES staff(id) ON DELETE SET NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INVENTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_name VARCHAR(200) NOT NULL,
    item_code VARCHAR(50) UNIQUE,
    category VARCHAR(100),
    unit VARCHAR(20) NOT NULL, -- e.g., 'kg', 'pcs', 'liters', 'boxes'
    current_stock DECIMAL(10,3) NOT NULL DEFAULT 0,
    minimum_stock DECIMAL(10,3) NOT NULL DEFAULT 0,
    maximum_stock DECIMAL(10,3),
    unit_cost DECIMAL(10,2),
    supplier VARCHAR(200),
    location VARCHAR(100), -- Storage location
    expiry_date DATE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INVENTORY TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('in', 'out', 'adjustment', 'waste', 'transfer')),
    quantity DECIMAL(10,3) NOT NULL, -- Positive for 'in', negative for 'out'
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    reference_type VARCHAR(50), -- 'order', 'purchase', 'adjustment', etc.
    reference_id UUID, -- ID of the related order, purchase, etc.
    reason VARCHAR(200),
    notes TEXT,
    processed_by UUID REFERENCES staff(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- EXPENSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_code VARCHAR(20) UNIQUE NOT NULL, -- e.g., EXP-2024-001
    category VARCHAR(100) NOT NULL, -- 'utilities', 'supplies', 'rent', 'maintenance', etc.
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE NOT NULL,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    vendor VARCHAR(200),
    receipt_url VARCHAR(500),
    approved_by UUID REFERENCES staff(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    created_by UUID REFERENCES staff(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REPORTS TABLE (for storing generated reports)
-- =====================================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_type VARCHAR(50) NOT NULL, -- 'sales', 'inventory', 'staff', 'customer', etc.
    report_name VARCHAR(200) NOT NULL,
    report_data JSONB NOT NULL,
    date_from DATE,
    date_to DATE,
    generated_by UUID REFERENCES staff(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    is_read BOOLEAN DEFAULT false,
    action_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_staff_id ON orders(staff_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_type ON orders(order_type);
CREATE INDEX IF NOT EXISTS idx_orders_order_time ON orders(order_time);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON order_items(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items(status);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_type ON payments(payment_type);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_item_code ON inventory(item_code);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_current_stock ON inventory(current_stock);

-- Inventory transactions indexes
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_inventory_id ON inventory_transactions(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created_at ON inventory_transactions(created_at);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_customer_code ON customers(customer_code);

-- Staff indexes
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all relevant tables
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_order_items_updated_at ON order_items;
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- =====================================================

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_num INTEGER;
    order_num TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 9) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM orders
    WHERE order_number LIKE 'ORD-' || year_part || '-%';
    
    order_num := 'ORD-' || year_part || '-' || LPAD(sequence_num::TEXT, 3, '0');
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample staff
INSERT INTO staff (staff_code, first_name, last_name, email, role, permissions, is_active) VALUES
('ADMIN-001', 'System', 'Administrator', 'admin@centrofresh.com', 'admin', '{"all": true, "menu": true, "orders": true, "inventory": true, "reports": true, "staff": true}', true),
('STAFF-002', 'John', 'Manager', 'manager@centrofresh.com', 'manager', '{"orders": true, "inventory": true, "reports": true}', true),
('STAFF-003', 'Maria', 'Cashier', 'cashier@centrofresh.com', 'cashier', '{"orders": true}', true),
('STAFF-004', 'Pedro', 'Kitchen', 'kitchen@centrofresh.com', 'kitchen', '{"orders": true, "inventory": true}', true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample customer
INSERT INTO customers (customer_code, first_name, last_name, email, phone, customer_type) VALUES
('WALK-IN-001', 'Walk-in', 'Customer', 'walkin@centrofresh.com', '+639000000000', 'regular'),
('CUST-001', 'Juan', 'Dela Cruz', 'juan@example.com', '+639123456789', 'regular'),
('CUST-002', 'Maria', 'Santos', 'maria@example.com', '+639987654321', 'vip')
ON CONFLICT (email) DO NOTHING;

-- Insert sample inventory items
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
('Bay Leaves', 'SPICE-003', 'Spices', 'kg', 1.0, 0.2, 300.00, 'Spice Supplier')
ON CONFLICT (item_code) DO NOTHING;

-- Insert sample expenses
INSERT INTO expenses (expense_code, category, description, amount, expense_date, payment_method, vendor, status) VALUES
('EXP-2024-001', 'utilities', 'Electricity Bill - January 2024', 2500.00, '2024-01-15', 'bank_transfer', 'Meralco', 'approved'),
('EXP-2024-002', 'utilities', 'Water Bill - January 2024', 800.00, '2024-01-15', 'bank_transfer', 'Maynilad', 'approved'),
('EXP-2024-003', 'supplies', 'Kitchen Supplies and Utensils', 1500.00, '2024-01-20', 'cash', 'Kitchen Supply Store', 'approved'),
('EXP-2024-004', 'maintenance', 'Equipment Maintenance', 3000.00, '2024-01-25', 'bank_transfer', 'Equipment Service Co.', 'pending')
ON CONFLICT (expense_code) DO NOTHING;

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
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Centro Fresh and Hot Grill POS System Setup Complete!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'All POS tables created successfully.';
    RAISE NOTICE 'Sample data inserted for testing.';
    RAISE NOTICE 'You can now start using the POS system features.';
    RAISE NOTICE '=====================================================';
END $$;
