const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function run() {
  const res = await fetch(`${url}/rest/v1/assignments?select=*`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
    }
  });
  console.log('Assignments (anon):', await res.json());
}
run();
