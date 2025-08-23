const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('Supabase URL:', supabaseUrl);
  console.log('Service Key (first 20 chars):', supabaseServiceKey?.substring(0, 20) + '...');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Test connection by creating a simple table
    console.log('🔌 Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('test_table')
      .select('*')
      .limit(1);
      
    if (error && error.code !== 'PGRST116') { // PGRST116 = table not found, which is OK
      console.error('❌ Connection test failed:', error.message);
    } else {
      console.log('✅ Supabase connection successful!');
      console.log('Ready to set up database schema.\n');
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

testSupabaseConnection();