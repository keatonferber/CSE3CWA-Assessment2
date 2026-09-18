import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const phonemes = await prisma.phoneme.findMany({ orderBy: { id: 'asc' } });
  return NextResponse.json(phonemes);
}
