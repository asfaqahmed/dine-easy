-- Database Schema for DineEasy Restaurant Ordering System

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL UNIQUE,
    last_order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tables table (restaurant tables)
CREATE TABLE IF NOT EXISTS restaurant_tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_number VARCHAR(20) NOT NULL UNIQUE,
    qr_code TEXT,
    capacity INTEGER DEFAULT 4,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu Items table
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('appetizers', 'mains', 'desserts', 'beverages', 'specials')),
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    preparation_time INTEGER DEFAULT 15,
    ingredients TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    table_id UUID REFERENCES restaurant_tables(id),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
    order_type VARCHAR(20) DEFAULT 'dine_in' CHECK (order_type IN ('dine_in', 'takeaway')),
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method VARCHAR(20) DEFAULT 'payhere',
    special_instructions TEXT,
    estimated_ready_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'kitchen', 'manager')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SMS Logs table (for tracking SMS notifications)
CREATE TABLE IF NOT EXISTS sms_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(15) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    order_id UUID REFERENCES orders(id),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment Transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    payment_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'LKR',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    payment_method VARCHAR(20) DEFAULT 'payhere',
    transaction_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON menu_items(is_available);

-- Insert default admin user
INSERT INTO admin_users (email, password_hash, full_name, role) 
VALUES ('admin@starbucks.com', '$2a$12$9OzVr0hZTzAGdlBkCe9IFOd5xJf8GQ6LH3m4K7N9R8sZ5a4Y1v6We', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample restaurant tables
INSERT INTO restaurant_tables (table_number, capacity) VALUES 
('T001', 2),
('T002', 4),
('T003', 4),
('T004', 6),
('T005', 2),
('T006', 4),
('T007', 8),
('T008', 4),
('T009', 6),
('T010', 2)
ON CONFLICT (table_number) DO NOTHING;

-- Insert sample menu items
INSERT INTO menu_items (name, description, price, category, preparation_time, ingredients) VALUES 
-- Appetizers
('Spring Rolls', 'Crispy vegetable spring rolls served with sweet chili sauce', 850.00, 'appetizers', 10, 'Vegetables, pastry, chili sauce'),
('Chicken Wings', 'Spicy buffalo wings with ranch dipping sauce', 1250.00, 'appetizers', 15, 'Chicken wings, buffalo sauce, ranch'),
('Mozzarella Sticks', 'Golden fried mozzarella with marinara sauce', 950.00, 'appetizers', 12, 'Mozzarella cheese, breadcrumbs, marinara'),

-- Main Courses
('Chicken Biriyani', 'Fragrant basmati rice with tender chicken and spices', 1850.00, 'mains', 25, 'Basmati rice, chicken, spices, yogurt'),
('Fish and Chips', 'Beer-battered fish with golden fries and tartar sauce', 2200.00, 'mains', 20, 'Fish fillet, potatoes, beer batter, tartar sauce'),
('Vegetable Curry', 'Mixed vegetable curry with jasmine rice', 1450.00, 'mains', 18, 'Mixed vegetables, coconut milk, curry spices, rice'),
('Grilled Chicken', 'Herb-marinated grilled chicken breast with sides', 2100.00, 'mains', 22, 'Chicken breast, herbs, vegetables'),

-- Beverages
('Fresh Lime Juice', 'Freshly squeezed lime with mint and soda', 450.00, 'beverages', 5, 'Lime, mint, soda water, sugar'),
('Iced Coffee', 'Cold brew coffee with milk and ice', 550.00, 'beverages', 3, 'Coffee, milk, ice, sugar'),
('Mango Smoothie', 'Creamy mango smoothie with yogurt', 650.00, 'beverages', 5, 'Mango, yogurt, honey, ice'),
('Ceylon Tea', 'Traditional Sri Lankan black tea', 350.00, 'beverages', 3, 'Ceylon tea leaves, water'),

-- Desserts
('Chocolate Brownie', 'Warm chocolate brownie with vanilla ice cream', 750.00, 'desserts', 8, 'Chocolate, flour, vanilla ice cream'),
('Fruit Salad', 'Fresh seasonal fruits with honey dressing', 650.00, 'desserts', 5, 'Seasonal fruits, honey, mint'),
('Creme Brulee', 'Classic vanilla custard with caramelized sugar', 850.00, 'desserts', 10, 'Cream, vanilla, eggs, sugar')
ON CONFLICT DO NOTHING;