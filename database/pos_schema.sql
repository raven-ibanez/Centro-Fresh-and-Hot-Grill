-- =====================================================
-- Centro Fresh and Hot Grill - POS System Database Schema
-- =====================================================
-- This schema extends the existing menu system to support
-- a complete Point of Sale (POS) system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================
CREATE TABLE customers (
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
CREATE TABLE staff (
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
CREATE TABLE orders (
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
CREATE TABLE order_items (
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
CREATE TABLE order_item_addons (
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
CREATE TABLE payments (
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
CREATE TABLE inventory (
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
CREATE TABLE inventory_transactions (
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
CREATE TABLE expenses (
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
CREATE TABLE reports (
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
CREATE TABLE notifications (
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
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_staff_id ON orders(staff_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_type ON orders(order_type);
CREATE INDEX idx_orders_order_time ON orders(order_time);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- Order items indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_menu_item_id ON order_items(menu_item_id);
CREATE INDEX idx_order_items_status ON order_items(status);

-- Payments indexes
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_type ON payments(payment_type);

-- Inventory indexes
CREATE INDEX idx_inventory_item_code ON inventory(item_code);
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_inventory_current_stock ON inventory(current_stock);

-- Inventory transactions indexes
CREATE INDEX idx_inventory_transactions_inventory_id ON inventory_transactions(inventory_id);
CREATE INDEX idx_inventory_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_inventory_transactions_created_at ON inventory_transactions(created_at);

-- Customers indexes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_customer_code ON customers(customer_code);

-- Staff indexes
CREATE INDEX idx_staff_email ON staff(email);
CREATE INDEX idx_staff_role ON staff(role);

-- Notifications indexes
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

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
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
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

-- Function to update inventory when order is completed
CREATE OR REPLACE FUNCTION update_inventory_on_order_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- This function would be called when an order status changes to 'completed'
    -- It would deduct inventory based on menu item recipes
    -- Implementation depends on your specific inventory tracking needs
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Daily sales summary view
CREATE VIEW daily_sales_summary AS
SELECT 
    DATE(order_time) as sale_date,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as average_order_value,
    COUNT(DISTINCT customer_id) as unique_customers
FROM orders
WHERE status = 'completed'
GROUP BY DATE(order_time)
ORDER BY sale_date DESC;

-- Top selling menu items view
CREATE VIEW top_selling_items AS
SELECT 
    mi.name as item_name,
    mi.category,
    SUM(oi.quantity) as total_quantity_sold,
    SUM(oi.total_price) as total_revenue,
    COUNT(DISTINCT oi.order_id) as times_ordered
FROM order_items oi
JOIN menu_items mi ON oi.menu_item_id = mi.id
JOIN orders o ON oi.order_id = o.id
WHERE o.status = 'completed'
GROUP BY mi.id, mi.name, mi.category
ORDER BY total_quantity_sold DESC;

-- Low stock inventory view
CREATE VIEW low_stock_items AS
SELECT 
    item_name,
    current_stock,
    minimum_stock,
    unit,
    (current_stock - minimum_stock) as stock_difference
FROM inventory
WHERE current_stock <= minimum_stock AND is_active = true
ORDER BY stock_difference ASC;

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample staff
INSERT INTO staff (staff_code, first_name, last_name, email, role, hourly_rate) VALUES
('STAFF-001', 'Admin', 'User', 'admin@centrofresh.com', 'admin', 0.00),
('STAFF-002', 'John', 'Manager', 'manager@centrofresh.com', 'manager', 25.00),
('STAFF-003', 'Maria', 'Cashier', 'cashier@centrofresh.com', 'cashier', 15.00),
('STAFF-004', 'Pedro', 'Kitchen', 'kitchen@centrofresh.com', 'kitchen', 18.00);

-- Insert sample customer
INSERT INTO customers (customer_code, first_name, last_name, email, phone, customer_type) VALUES
('CUST-001', 'Juan', 'Dela Cruz', 'juan@example.com', '+639123456789', 'regular'),
('CUST-002', 'Maria', 'Santos', 'maria@example.com', '+639987654321', 'vip');

-- Insert sample inventory items
INSERT INTO inventory (item_name, item_code, category, unit, current_stock, minimum_stock, unit_cost) VALUES
('Rice', 'RICE-001', 'Grains', 'kg', 50.0, 10.0, 45.00),
('Pork', 'PORK-001', 'Meat', 'kg', 25.0, 5.0, 280.00),
('Chicken', 'CHICKEN-001', 'Meat', 'kg', 30.0, 8.0, 180.00),
('Cooking Oil', 'OIL-001', 'Cooking', 'liters', 20.0, 5.0, 85.00);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (adjust based on your authentication system)
-- Only allow staff to view customer data
CREATE POLICY "Staff can view customers" ON customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert customers" ON customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update customers" ON customers FOR UPDATE TO authenticated USING (true);

-- Only allow staff to view orders
CREATE POLICY "Staff can view orders" ON orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert orders" ON orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update orders" ON orders FOR UPDATE TO authenticated USING (true);

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE customers IS 'Customer information and loyalty tracking';
COMMENT ON TABLE staff IS 'Staff members and their roles/permissions';
COMMENT ON TABLE orders IS 'Main orders table with order details and status';
COMMENT ON TABLE order_items IS 'Individual items within each order';
COMMENT ON TABLE order_item_addons IS 'Add-ons selected for specific order items';
COMMENT ON TABLE payments IS 'Payment transactions for orders';
COMMENT ON TABLE inventory IS 'Inventory items and stock levels';
COMMENT ON TABLE inventory_transactions IS 'All inventory movements (in/out/adjustments)';
COMMENT ON TABLE expenses IS 'Business expenses tracking';
COMMENT ON TABLE reports IS 'Generated reports storage';
COMMENT ON TABLE notifications IS 'System notifications for staff';

-- =====================================================
-- END OF SCHEMA
-- =====================================================
