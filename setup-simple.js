const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function setupDineEasy() {
  console.log('🚀 Setting up DineEasy with Supabase...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.log('\n📋 Required environment variables:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- SUPABASE_SERVICE_ROLE_KEY');
    console.log('- DATABASE_URL (for direct PostgreSQL access)');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('🔌 Testing Supabase connection...');
    
    // Test connection with a simple query
    const { data, error } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1);

    if (error && error.code === 'PGRST116') {
      // Table doesn't exist yet
      console.log('⚠️  Database tables not found. You need to run the schema first.\n');
      console.log('📋 Setup Instructions:');
      console.log('1. Go to your Supabase Dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the content from: supabase-schema.sql');
      console.log('4. Run the SQL to create all tables and sample data');
      console.log('5. Come back and run: npm run dev\n');
      
      console.log('🔗 Quick Setup:');
      console.log(`1. Open: ${supabaseUrl.replace('https://', 'https://app.')}/sql`);
      console.log('2. Paste the SQL from supabase-schema.sql');
      console.log('3. Click "Run"\n');
      
    } else if (error) {
      console.error('❌ Connection failed:', error.message);
    } else {
      console.log('✅ Supabase connection successful!');
      console.log('✅ Database tables are set up!');
      
      // Check if admin user exists
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', 'admin@starbucks.com')
        .single();

      if (adminData) {
        console.log('✅ Admin user is ready!');
      } else {
        console.log('⚠️  Admin user not found. Please run the schema SQL.');
      }

      console.log('\n🎉 Setup complete! You can now:');
      console.log('1. Run: npm run dev');
      console.log('2. Visit: http://localhost:3000');
      console.log('\n🔐 Login credentials:');
      console.log('   Email: admin@starbucks.com');
      console.log('   Password: starbucks@123');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your Supabase project is active');
    console.log('2. Verify your service role key has admin privileges');
    console.log('3. Make sure you\'ve run the schema SQL in Supabase Dashboard');
  }
}

// Show file contents for easy copying
function showSchemaInstructions() {
  console.log('\n📄 SQL Schema to copy to Supabase:');
  console.log('=' .repeat(60));
  console.log('File: supabase-schema.sql');
  console.log('Copy the entire content of this file to your Supabase SQL Editor');
  console.log('=' .repeat(60));
}

if (require.main === module) {
  setupDineEasy();
}

module.exports = { setupDineEasy };