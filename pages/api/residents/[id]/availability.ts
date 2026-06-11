import type { NextApiRequest, NextApiResponse } from 'next';
import { toggleAvailability } from '@/lib/actions/residents';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') return res.status(405).end();

  try {
    const { id } = req.query;
    const { availability } = req.body;
    const data = await toggleAvailability(String(id), availability);
    return res.status(200).json({ data });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
}
