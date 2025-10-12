// Script untuk menambahkan email ke whitelist
// Jalankan dengan: node scripts/add-email-to-whitelist.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addEmailToWhitelist(email, role = 'ADMIN', jabatan = 'DEVELOPER', nama = null) {
  try {
    // Extract name from email if not provided
    const defaultNama = nama || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    console.log(`Adding ${email} to whitelist with role: ${role}, jabatan: ${jabatan}, nama: ${defaultNama}`);
    
    // Check if email already exists
    const { data: existing, error: checkError } = await supabase
      .from('email_whitelist')
      .select('*')
      .eq('email', email)
      .single();
    
    if (existing && !checkError) {
      console.log('Email already exists in whitelist:', existing);
      
      // Update to make sure it's active
      const { data: updated, error: updateError } = await supabase
        .from('email_whitelist')
        .update({ 
          isActive: true,
          role: role,
          jabatan: jabatan,
          nama: defaultNama
        })
        .eq('email', email)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating email whitelist:', updateError);
        return false;
      }
      
      console.log('Email whitelist updated successfully:', updated);
      return true;
    }
    
    // Add new email to whitelist
    const { data, error } = await supabase
      .from('email_whitelist')
      .insert({
        nama: defaultNama,
        email: email,
        role: role,
        jabatan: jabatan,
        isActive: true
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding email to whitelist:', error);
      return false;
    }
    
    console.log('Email added to whitelist successfully:', data);
    return true;
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

// Main execution
async function main() {
  const email = process.argv[2];
  const role = process.argv[3] || 'ADMIN';
  const jabatan = process.argv[4] || 'DEVELOPER';
  const nama = process.argv[5] || null;
  
  if (!email) {
    console.log('Usage: node scripts/add-email-to-whitelist.js <email> [role] [jabatan] [nama]');
    console.log('Example: node scripts/add-email-to-whitelist.js faris.id.go@gmail.com ADMIN DEVELOPER "Faris"');
    process.exit(1);
  }
  
  const success = await addEmailToWhitelist(email, role, jabatan, nama);
  
  if (success) {
    console.log('✅ Email successfully added/updated in whitelist');
  } else {
    console.log('❌ Failed to add email to whitelist');
    process.exit(1);
  }
}

main();