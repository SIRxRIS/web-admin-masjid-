// Script untuk menambahkan test user ke whitelist
const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addTestUser() {
  try {
    const testEmail = 'test.admin@gmail.com';
    
    console.log(`Adding test user: ${testEmail}`);
    
    // Check if email already exists
    const { data: existing, error: checkError } = await supabase
      .from('email_whitelist')
      .select('*')
      .eq('email', testEmail)
      .single();
    
    if (existing && !checkError) {
      console.log('Test user already exists:', existing);
      
      // Update to make sure it's active
      const { data: updated, error: updateError } = await supabase
        .from('email_whitelist')
        .update({ 
          isActive: true,
          role: 'ADMIN',
          jabatan: 'KETUA'
        })
        .eq('email', testEmail)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating test user:', updateError);
        return false;
      }
      
      console.log('Test user updated successfully:', updated);
      return true;
    }
    
    // Add new test user to whitelist with generated UUID
    const { data, error } = await supabase
      .from('email_whitelist')
      .insert({
        id: randomUUID(),
        nama: 'Test Admin',
        email: testEmail,
        role: 'ADMIN',
        jabatan: 'KETUA',
        isActive: true
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding test user:', error);
      return false;
    }
    
    console.log('Test user added successfully:', data);
    return true;
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

// Also add test user to pengurus table
async function addTestPengurus() {
  try {
    const { data: existing, error: checkError } = await supabase
      .from('Pengurus')
      .select('*')
      .eq('nama', 'Test Admin')
      .single();
    
    if (existing && !checkError) {
      console.log('Test pengurus already exists:', existing);
      return true;
    }
    
    const { data, error } = await supabase
      .from('Pengurus')
      .insert({
        no: 1,
        nama: 'Test Admin',
        jabatan: 'KETUA',
        periode: '2024-2025',
        kategori: 'MASJID'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding test pengurus:', error);
      return false;
    }
    
    console.log('Test pengurus added successfully:', data);
    return true;
    
  } catch (error) {
    console.error('Unexpected error adding pengurus:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Adding test user for login testing...');
  
  const whitelistSuccess = await addTestUser();
  const pengurusSuccess = await addTestPengurus();
  
  if (whitelistSuccess && pengurusSuccess) {
    console.log('✅ Test user setup completed successfully!');
    console.log('📧 Test email: test.admin@gmail.com');
    console.log('🔑 Role: ADMIN');
    console.log('👤 Jabatan: KETUA');
    console.log('');
    console.log('You can now test login with this email using Google OAuth.');
  } else {
    console.log('❌ Failed to setup test user');
    process.exit(1);
  }
}

main();