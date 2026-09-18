import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, parseConfigInput } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const where = ['wordle', 'wordsearch'].includes(type) ? { type } : {};
  const configs = await prisma.activityConfig.findMany({
    where,
    include: { list: true },
    orderBy: [{ type: 'asc' }, { name: 'asc' }]
  });
  return NextResponse.json(configs);
}

export async function POST(request) {
  try {
    const input = parseConfigInput(await request.json());
    const config = await prisma.activityConfig.create({ data: input, include: { list: true } });
    return NextResponse.json(config, { status: 201 });
  } catch (error) {
    const { status, message } = errorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}
