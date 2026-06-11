import type { NextApiRequest, NextApiResponse } from 'next';
import { createProfile } from '@/lib/actions/residents';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const body = req.body;
    const data = await createProfile(body);
    return res.status(200).json({ data });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
}
