import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, parseId, parseWordListInput } from '@/lib/validation';
import { wordInclude } from '@/lib/word-data';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const list = await prisma.wordList.findUnique({
      where: { id: parseId(id) },
      include: { words: { include: wordInclude, orderBy: { english: 'asc' } }, configs: true }
    });
    if (!list) return NextResponse.json({ error: 'Word list not found.' }, { status: 404 });
    return NextResponse.json(list);
  } catch (error) {
    const { status, message } = errorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const list = await prisma.wordList.update({
      where: { id: parseId(id) },
      data: parseWordListInput(await request.json())
    });
    return NextResponse.json(list);
  } catch (error) {
    const { status, message } = errorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    await prisma.wordList.delete({ where: { id: parseId(id) } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const { status, message } = errorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}
