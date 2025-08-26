
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';

const VitalSchema = z.object({
  name: z.enum(['CLS', 'LCP', 'INP', 'FID', 'TTFB']),
  value: z.number(),
  id: z.string(),
  navigationType: z.string().optional(),
  rating: z.enum(['good', 'needs-improvement', 'poor']).optional(),
});

export async function POST(req: Request) {
  const requestId = nanoid();
  try {
    const json = await req.json();
    const parsed = VitalSchema.safeParse(json);
    if (!parsed.success) {
      console.warn({ requestId, issues: parsed.error.issues });
      return NextResponse.json({ ok: false, error: 'Bad Request' }, { status: 400 });
    }
    console.log({ requestId, event: 'vitals', vital: parsed.data });
    return NextResponse.json({ ok: true }, { status: 202 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
