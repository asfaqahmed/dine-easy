const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  console.log('🚀 Setting up DineEasy Database with Supabase...\n');

  // Use Supabase connection string
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in environment variables');
    console.log('Please check your .env.local file and ensure DATABASE_URL is set');
    return;
  }

  // Connect directly to Supabase database
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected to Supabase successfully!\n');

    // Read and execute schema file
    console.log('🔧 Setting up database schema...');
    const schemaPath = path.join(__dirname, 'lib', 'db-schema.sql');
    
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schema);
      console.log('✅ Database schema created successfully!\n');
    } else {
      console.log('⚠️  Schema file not found, creating basic tables...\n');
      
      // Create basic tables if schema file doesn't exist
      await createBasicTables(client);
    }

    // Create default admin user if it doesn't exist
    console.log('👤 Setting up default admin user...');
    const adminExists = await client.query(
      "SELECT 1 FROM admin_users WHERE email = 'admin@starbucks.com'"
    );

    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('starbucks@123', 12);
      await client.query(
        `INSERT INTO admin_users (email, password_hash, full_name, role) 
         VALUES ($1, $2, $3, $4)`,
        ['admin@starbucks.com', hashedPassword, 'Admin User', 'admin']
      );
      console.log('✅ Default admin user created!');
      console.log('   Email: admin@starbucks.com');
      console.log('   Password: starbucks@123\n');
    } else {
      console.log('✅ Admin user already exists!\n');
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm install');
    console.log('2. Run: npm run dev');
    console.log('3. Visit: http://localhost:3000');
    console.log('\n🔐 Admin login credentials:');
    console.log('   Email: admin@starbucks.com');
    console.log('   Password: starbucks@123');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Check your database credentials in .env.local');
    console.log('3. Ensure the postgres user has CREATE DATABASE privileges');
  } finally {
    await client.end();
  }
}

async function createBasicTables(client) {
  const tables = [
    `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
    
    `CREATE TABLE IF NOT EXISTS customers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(15) NOT NULL UNIQUE,
      last_order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS restaurant_tables (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      table_number VARCHAR(20) NOT NULL UNIQUE,
      qr_code TEXT,
      capacity INTEGER DEFAULT 4,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS menu_items (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      category VARCHAR(50) NOT NULL,
      image_url TEXT,
      is_available BOOLEAN DEFAULT true,
      preparation_time INTEGER DEFAULT 15,
      ingredients TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      customer_id UUID REFERENCES customers(id),
      table_id UUID REFERENCES restaurant_tables(id),
      order_number VARCHAR(20) UNIQUE NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      order_type VARCHAR(20) DEFAULT 'dine_in',
      subtotal DECIMAL(10,2) NOT NULL,
      tax_amount DECIMAL(10,2) DEFAULT 0,
      total_amount DECIMAL(10,2) NOT NULL,
      payment_status VARCHAR(20) DEFAULT 'pending',
      payment_method VARCHAR(20) DEFAULT 'payhere',
      special_instructions TEXT,
      estimated_ready_time TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS order_items (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
      menu_item_id UUID REFERENCES menu_items(id),
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price DECIMAL(10,2) NOT NULL,
      total_price DECIMAL(10,2) NOT NULL,
      special_instructions TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS admin_users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'admin',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const table of tables) {
    await client.query(table);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };