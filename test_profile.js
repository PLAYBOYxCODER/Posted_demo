const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://phvlfxjvtrpmemulymrw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBodmxmeGp2dHJwbWVtdWx5bXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDUzODAzOSwiZXhwIjoyMDkwMTE0MDM5fQ.1Gd-eBa1_poWRRHBdczmlajcxkzhnJ4atoL_v6m4_JU'
);

async function checkProfileError() {
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  if (userError || !users.users[0]) {
    console.log("No users found to test with.");
    return;
  }
  
  const testUserId = users.users[0].id;
  
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: testUserId,
      full_name: 'Test Update',
      phone_number: '1234567890'
    })
    .select()
    .single();
    
  console.log("Upsert Error:", error);
  console.log("Data:", data);
}

checkProfileError();
