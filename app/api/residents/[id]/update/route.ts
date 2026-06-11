import { NextResponse } from 'next/server';
import { updateProfile } from '@/lib/actions/residents';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await updateProfile(params.id, body);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
