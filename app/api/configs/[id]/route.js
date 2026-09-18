import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, parseConfigInput, parseId } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const config = await prisma.activityConfig.findUnique({ where: { id: parseId(id) }, include: { list: true } });
    if (!config) return NextResponse.json({ error: 'Activity configuration not found.' }, { status: 404 });
    return NextResponse.json(config);
  } catch (error) {
    const { status, message } = errorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const config = await prisma.activityConfig.update({
      where: { id: parseId(id) },
      data: parseConfigInput(await request.json()),
      include: { list: true }
    });
    return NextResponse.json(config);
  } catch (error) {
    const { status, message } = errorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    await prisma.activityConfig.delete({ where: { id: parseId(id) } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const { status, message } = errorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}
