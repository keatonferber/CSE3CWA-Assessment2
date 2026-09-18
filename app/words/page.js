import WordsClient from './words-client';
import { prisma } from '@/lib/prisma';
import { wordInclude } from '@/lib/word-data';

export const dynamic = 'force-dynamic';

export default async function WordsPage() {
  const [lists, words] = await Promise.all([
    prisma.wordList.findMany({ include: { _count: { select: { words: true, configs: true } } }, orderBy: { name: 'asc' } }),
    prisma.word.findMany({ include: wordInclude, orderBy: [{ listId: 'asc' }, { english: 'asc' }] })
  ]);
  return <WordsClient initialLists={JSON.parse(JSON.stringify(lists))} initialWords={JSON.parse(JSON.stringify(words))} />;
}
