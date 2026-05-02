const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://phvlfxjvtrpmemulymrw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBodmxmeGp2dHJwbWVtdWx5bXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDUzODAzOSwiZXhwIjoyMDkwMTE0MDM5fQ.1Gd-eBa1_poWRRHBdczmlajcxkzhnJ4atoL_v6m4_JU'
);

async function fixRLS() {
  await supabase.rpc('invoke_sql', { sql: `
    CREATE POLICY "Allow public select orders" ON orders FOR SELECT USING (true);
    CREATE POLICY "Allow public select order history" ON order_status_history FOR SELECT USING (true);
    CREATE POLICY "Allow public select shipping events" ON shipping_events FOR SELECT USING (true);
  `});
  console.log("RLS patched");
}
fixRLS();
