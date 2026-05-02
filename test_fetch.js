const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://phvlfxjvtrpmemulymrw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBodmxmeGp2dHJwbWVtdWx5bXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDUzODAzOSwiZXhwIjoyMDkwMTE0MDM5fQ.1Gd-eBa1_poWRRHBdczmlajcxkzhnJ4atoL_v6m4_JU'
);

async function testFetch() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_status_history (
        id,
        old_status,
        new_status,
        changed_by,
        notes,
        created_at
      ),
      shipping_events (
        id,
        event_type,
        event_description,
        event_timestamp,
        created_at
      )
    `)
    .order('created_at', { ascending: false });

  console.log("ERROR:", error);
  console.log("DATA LENGTH:", data ? data.length : 0);
}
testFetch();
