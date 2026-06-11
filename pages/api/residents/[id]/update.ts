import type { NextApiRequest, NextApiResponse } from 'next';
import { updateProfile } from '@/lib/actions/residents';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { id } = req.query;
    const data = await updateProfile(String(id), req.body);
    return res.status(200).json({ data });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
}
