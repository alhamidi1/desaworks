import { NextResponse } from 'next/server';
import { createProfile } from '@/lib/actions/residents';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await createProfile(body);
    return NextResponse.json(created);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
