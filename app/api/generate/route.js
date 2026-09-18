import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { activityFilename, generateWordleHtml, generateWordSearchHtml } from '@/lib/generator';
import { errorResponse, parseId, ValidationError } from '@/lib/validation';
import { wordInclude } from '@/lib/word-data';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const configId = parseId(body.configId, 'configId');
    const config = await prisma.activityConfig.findUnique({
      where: { id: configId },
      include: { list: true }
    });
    if (!config) return NextResponse.json({ error: 'Activity configuration not found.' }, { status: 404 });

    const words = await prisma.word.findMany({
      where: {
        listId: config.listId,
        ...(config.difficulty !== 'any' ? { difficulty: config.difficulty } : {})
      },
      include: wordInclude,
      orderBy: { english: 'asc' }
    });

    let eligible = words;
    if (config.type === 'wordle' && config.phonemeLength) {
      eligible = words.filter((word) => word.phonemes.length === config.phonemeLength);
    }

    const requestedIds = Array.isArray(body.wordIds)
      ? body.wordIds.map(Number).filter((id) => Number.isInteger(id) && id > 0)
      : [];
    if (requestedIds.length) eligible = eligible.filter((word) => requestedIds.includes(word.id));

    const selected = eligible.slice(0, config.wordCount);
    if (!selected.length) throw new ValidationError('No stored words match this activity configuration. Edit the list, difficulty, or phoneme length.', 422);

    const html = config.type === 'wordsearch'
      ? generateWordSearchHtml(config, selected)
      : generateWordleHtml(config, selected);

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${activityFilename(config)}"`,
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    const { status, message } = errorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}
