import { NextResponse } from 'next/server';
import { toggleAvailability } from '@/lib/actions/residents';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await toggleAvailability(id, body.availability);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
