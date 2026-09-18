import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, parseId, parseWordInput } from '@/lib/validation';
import { phonemeCreateData, wordInclude } from '@/lib/word-data';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const word = await prisma.word.findUnique({ where: { id: parseId(id) }, include: wordInclude });
    if (!word) return NextResponse.json({ error: 'Word not found.' }, { status: 404 });
    return NextResponse.json(word);
  } catch (error) {
    const { status, message } = errorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const input = parseWordInput(await request.json());
    const word = await prisma.word.update({
      where: { id: parseId(id) },
      data: {
        english: input.english,
        difficulty: input.difficulty,
        hint: input.hint,
        listId: input.listId,
        phonemes: {
          deleteMany: {},
          create: phonemeCreateData(input.phonemes)
        }
      },
      include: wordInclude
    });
    return NextResponse.json(word);
  } catch (error) {
    const { status, message } = errorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    await prisma.word.delete({ where: { id: parseId(id) } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const { status, message } = errorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}
