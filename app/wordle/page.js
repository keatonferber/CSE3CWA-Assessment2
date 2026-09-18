import ActivityBuilderClient from '@/components/ActivityBuilderClient';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function WordlePage() {
  const configs = await prisma.activityConfig.findMany({ where: { type: 'wordle' }, include: { list: true }, orderBy: { name: 'asc' } });
  const plain = JSON.parse(JSON.stringify(configs));
  return <section><div className="sectionHeader"><div><p className="eyebrow">Database-driven activity</p><h1>Phoneme Wordle</h1><p className="lead">Preview and download a playable Wordle-style activity. Each grid cell stores one phoneme unit rather than one spelling character.</p></div></div><ActivityBuilderClient type="wordle" configs={plain} /></section>;
}
