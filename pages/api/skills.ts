import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('skills').select('*').order('name');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data || []);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
}
