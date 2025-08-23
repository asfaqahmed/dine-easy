const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function setupSupabaseDatabase() {
  console.log('🚀 Setting up DineEasy Database with Supabase...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.log('Required variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('🔌 Connecting to Supabase...');
    
    // Test connection
    const { error: testError } = await supabase.from('test_connection').select('*').limit(1);
    if (testError && !testError.message.includes('does not exist')) {
      throw testError;
    }
    console.log('✅ Connected to Supabase successfully!\n');

    // Create tables using SQL
    console.log('🔧 Creating database tables...');
    
    // Enable UUID extension
    await executeSQL(supabase, 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    
    // Create customers table
    await executeSQL(supabase, `
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(15) NOT NULL UNIQUE,
        last_order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create restaurant_tables table
    await executeSQL(supabase, `
      CREATE TABLE IF NOT EXISTS restaurant_tables (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        table_number VARCHAR(20) NOT NULL UNIQUE,
        qr_code TEXT,
        capacity INTEGER DEFAULT 4,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create menu_items table
    await executeSQL(supabase, `
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
    `);

    // Create orders table
    await executeSQL(supabase, `
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
    `);

    // Create order_items table
    await executeSQL(supabase, `
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
    `);

    // Create admin_users table
    await executeSQL(supabase, `
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
    `);

    // Create sms_logs table
    await executeSQL(supabase, `
      CREATE TABLE IF NOT EXISTS sms_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        phone_number VARCHAR(15) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
        order_id UUID REFERENCES orders(id),
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create payment_transactions table
    await executeSQL(supabase, `
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
    `);

    console.log('✅ Database tables created successfully!\n');

    // Create indexes
    console.log('📚 Creating database indexes...');
    await executeSQL(supabase, 'CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);');
    await executeSQL(supabase, 'CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);');
    await executeSQL(supabase, 'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);');
    await executeSQL(supabase, 'CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);');
    await executeSQL(supabase, 'CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);');
    await executeSQL(supabase, 'CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);');
    await executeSQL(supabase, 'CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON menu_items(is_available);');
    console.log('✅ Indexes created successfully!\n');

    // Insert default admin user
    console.log('👤 Creating default admin user...');
    const hashedPassword = await bcrypt.hash('starbucks@123', 12);
    
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', 'admin@starbucks.com')
      .single();

    if (!existingAdmin) {
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({
          email: 'admin@starbucks.com',
          password_hash: hashedPassword,
          full_name: 'Admin User',
          role: 'admin'
        });

      if (adminError) {
        console.log('⚠️  Admin user creation error:', adminError.message);
      } else {
        console.log('✅ Default admin user created!');
        console.log('   Email: admin@starbucks.com');
        console.log('   Password: starbucks@123\n');
      }
    } else {
      console.log('✅ Admin user already exists!\n');
    }

    // Insert sample restaurant tables
    console.log('🪑 Creating sample restaurant tables...');
    const tables = [];
    for (let i = 1; i <= 10; i++) {
      const tableNumber = `T${i.toString().padStart(3, '0')}`;
      const menuUrl = `${process.env.NEXT_PUBLIC_APP_URL}/menu?table=${tableNumber}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}`;
      
      tables.push({
        table_number: tableNumber,
        capacity: i <= 5 ? 2 : i <= 8 ? 4 : 6,
        qr_code: qrCodeUrl
      });
    }

    const { error: tablesError } = await supabase
      .from('restaurant_tables')
      .upsert(tables, { onConflict: 'table_number' });

    if (tablesError) {
      console.log('⚠️  Tables creation error:', tablesError.message);
    } else {
      console.log('✅ Sample restaurant tables created!\n');
    }

    // Insert sample menu items
    console.log('🍽️ Creating sample menu items...');
    const menuItems = [
      // Appetizers
      { name: 'Spring Rolls', description: 'Crispy vegetable spring rolls served with sweet chili sauce', price: 850.00, category: 'appetizers', preparation_time: 10, ingredients: 'Vegetables, pastry, chili sauce' },
      { name: 'Chicken Wings', description: 'Spicy buffalo wings with ranch dipping sauce', price: 1250.00, category: 'appetizers', preparation_time: 15, ingredients: 'Chicken wings, buffalo sauce, ranch' },
      { name: 'Mozzarella Sticks', description: 'Golden fried mozzarella with marinara sauce', price: 950.00, category: 'appetizers', preparation_time: 12, ingredients: 'Mozzarella cheese, breadcrumbs, marinara' },
      
      // Main Courses
      { name: 'Chicken Biriyani', description: 'Fragrant basmati rice with tender chicken and spices', price: 1850.00, category: 'mains', preparation_time: 25, ingredients: 'Basmati rice, chicken, spices, yogurt' },
      { name: 'Fish and Chips', description: 'Beer-battered fish with golden fries and tartar sauce', price: 2200.00, category: 'mains', preparation_time: 20, ingredients: 'Fish fillet, potatoes, beer batter, tartar sauce' },
      { name: 'Vegetable Curry', description: 'Mixed vegetable curry with jasmine rice', price: 1450.00, category: 'mains', preparation_time: 18, ingredients: 'Mixed vegetables, coconut milk, curry spices, rice' },
      { name: 'Grilled Chicken', description: 'Herb-marinated grilled chicken breast with sides', price: 2100.00, category: 'mains', preparation_time: 22, ingredients: 'Chicken breast, herbs, vegetables' },
      
      // Beverages
      { name: 'Fresh Lime Juice', description: 'Freshly squeezed lime with mint and soda', price: 450.00, category: 'beverages', preparation_time: 5, ingredients: 'Lime, mint, soda water, sugar' },
      { name: 'Iced Coffee', description: 'Cold brew coffee with milk and ice', price: 550.00, category: 'beverages', preparation_time: 3, ingredients: 'Coffee, milk, ice, sugar' },
      { name: 'Mango Smoothie', description: 'Creamy mango smoothie with yogurt', price: 650.00, category: 'beverages', preparation_time: 5, ingredients: 'Mango, yogurt, honey, ice' },
      { name: 'Ceylon Tea', description: 'Traditional Sri Lankan black tea', price: 350.00, category: 'beverages', preparation_time: 3, ingredients: 'Ceylon tea leaves, water' },
      
      // Desserts
      { name: 'Chocolate Brownie', description: 'Warm chocolate brownie with vanilla ice cream', price: 750.00, category: 'desserts', preparation_time: 8, ingredients: 'Chocolate, flour, vanilla ice cream' },
      { name: 'Fruit Salad', description: 'Fresh seasonal fruits with honey dressing', price: 650.00, category: 'desserts', preparation_time: 5, ingredients: 'Seasonal fruits, honey, mint' },
      { name: 'Creme Brulee', description: 'Classic vanilla custard with caramelized sugar', price: 850.00, category: 'desserts', preparation_time: 10, ingredients: 'Cream, vanilla, eggs, sugar' }
    ];

    const { error: menuError } = await supabase
      .from('menu_items')
      .upsert(menuItems, { onConflict: 'name' });

    if (menuError) {
      console.log('⚠️  Menu items creation error:', menuError.message);
    } else {
      console.log('✅ Sample menu items created!\n');
    }

    console.log('🎉 Supabase database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Visit: http://localhost:3000');
    console.log('\n🔐 Admin login credentials:');
    console.log('   Email: admin@starbucks.com');
    console.log('   Password: starbucks@123');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your Supabase project is active');
    console.log('2. Verify your service role key has admin privileges');
    console.log('3. Check your .env.local file for correct credentials');
  }
}

async function executeSQL(supabase, sql) {
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
  if (error && !error.message.includes('already exists')) {
    // Try alternative method for SQL execution
    const { error: altError } = await supabase.from('_temp_exec').select(sql);
    if (altError && !altError.message.includes('does not exist')) {
      throw new Error(`SQL execution failed: ${error.message}`);
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  setupSupabaseDatabase();
}

module.exports = { setupSupabaseDatabase };