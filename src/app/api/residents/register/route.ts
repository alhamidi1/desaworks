import { NextResponse } from 'next/server';
import { createJoinRequest } from '@/lib/actions/residents';

// Public endpoint: submit a "request to join". A manager reviews + approves it,
// which creates the actual account (manager-invite onboarding model).
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await createJoinRequest(body);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result.data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
