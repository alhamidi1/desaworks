import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  const { data: assignments, error } = await supabase
    .from('assignments')
    .select('*');
    
  console.log('ALL ASSIGNMENTS (admin):', assignments, error);
}
check();
