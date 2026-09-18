import ActivityBuilderClient from '@/components/ActivityBuilderClient';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function WordSearchPage() {
  const configs = await prisma.activityConfig.findMany({ where: { type: 'wordsearch' }, include: { list: true }, orderBy: { name: 'asc' } });
  const plain = JSON.parse(JSON.stringify(configs));
  return <section><div className="sectionHeader"><div><p className="eyebrow">Database-driven activity</p><h1>Phoneme Word Search</h1><p className="lead">Build a word search from stored phoneme sequences. Generated puzzles support straight-line selection, touch/pointer input, optional diagonals, reverse words and answer display.</p></div></div><ActivityBuilderClient type="wordsearch" configs={plain} /></section>;
}
