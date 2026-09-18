import ActivitiesClient from './activities-client';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ActivitiesPage() {
  const [configs, lists] = await Promise.all([
    prisma.activityConfig.findMany({ include: { list: true }, orderBy: [{ type: 'asc' }, { name: 'asc' }] }),
    prisma.wordList.findMany({ include: { _count: { select: { words: true } } }, orderBy: { name: 'asc' } })
  ]);
  return <ActivitiesClient initialConfigs={JSON.parse(JSON.stringify(configs))} lists={JSON.parse(JSON.stringify(lists))} />;
}
