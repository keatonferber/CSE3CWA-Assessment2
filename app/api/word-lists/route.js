import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, parseWordListInput } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET() {
  const lists = await prisma.wordList.findMany({
    include: { _count: { select: { words: true, configs: true } } },
    orderBy: { name: 'asc' }
  });
  return NextResponse.json(lists);
}

export async function POST(request) {
  try {
    const input = parseWordListInput(await request.json());
    const list = await prisma.wordList.create({ data: input });
    return NextResponse.json(list, { status: 201 });
  } catch (error) {
    const { status, message } = errorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}
