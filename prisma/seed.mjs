import { readFile } from 'node:fs/promises';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const corpus = JSON.parse(await readFile(new URL('../data/hce-corpus.json', import.meta.url), 'utf8'));
const hintData = JSON.parse(await readFile(new URL('../data/phoneme-hints.json', import.meta.url), 'utf8'));

function difficultyForCount(count) {
  if (count <= 3) return 'easy';
  if (count === 4) return 'medium';
  return 'hard';
}

async function main() {
  await prisma.activityConfig.deleteMany();
  await prisma.wordPhoneme.deleteMany();
  await prisma.word.deleteMany();
  await prisma.wordList.deleteMany();
  await prisma.phoneme.deleteMany();

  const uniqueSymbols = [...new Set([
    ...corpus.keyboard,
    ...corpus.words.flatMap((word) => word.phonemes)
  ])];

  for (const symbol of uniqueSymbols) {
    await prisma.phoneme.create({
      data: {
        symbol,
        hintLabel: hintData.hints[symbol] || `/${symbol}/`,
        exampleWord: hintData.examples[symbol] || ''
      }
    });
  }

  const lists = {};
  for (const count of [3, 4, 5]) {
    lists[count] = await prisma.wordList.create({
      data: {
        name: `HCE ${count}-phoneme words`,
        description: `Official ${count}-phoneme word set supplied in HCE_Wordle_Phoneme_Corpus.docx.`
      }
    });
  }

  for (const item of corpus.words) {
    await prisma.word.create({
      data: {
        english: item.word,
        difficulty: difficultyForCount(item.phonemeCount),
        hint: `${item.phonemeCount}-phoneme HCE corpus word`,
        listId: lists[item.phonemeCount].id,
        phonemes: {
          create: item.phonemes.map((symbol, position) => ({
            position,
            phoneme: { connect: { symbol } }
          }))
        }
      }
    });
  }

  await prisma.activityConfig.create({
    data: {
      name: '3-phoneme Wordle practice',
      type: 'wordle',
      listId: lists[3].id,
      difficulty: 'easy',
      wordCount: 5,
      phonemeLength: 3,
      maxAttempts: 6,
      showHints: true,
      showEnglishOnCorrect: true,
      title: 'HCE Phoneme Wordle — 3 phonemes',
      instructions: 'Choose one phoneme per cell. Green means correct position and yellow means the phoneme is present in another position.'
    }
  });

  await prisma.activityConfig.create({
    data: {
      name: '4-phoneme Wordle practice',
      type: 'wordle',
      listId: lists[4].id,
      difficulty: 'medium',
      wordCount: 5,
      phonemeLength: 4,
      maxAttempts: 6,
      showHints: true,
      showEnglishOnCorrect: true,
      title: 'HCE Phoneme Wordle — 4 phonemes',
      instructions: 'Build each target from four HCE phonemes. Hover or focus a phoneme key for a teaching hint.'
    }
  });

  await prisma.activityConfig.create({
    data: {
      name: 'HCE Word Search practice',
      type: 'wordsearch',
      listId: lists[4].id,
      difficulty: 'medium',
      wordCount: 8,
      phonemeLength: null,
      gridRows: 10,
      gridCols: 10,
      showHints: true,
      allowDiagonal: true,
      allowReverse: true,
      showAnswers: true,
      title: 'HCE Phoneme Word Search',
      instructions: 'Drag across a straight line of phoneme cells to find each target sequence.'
    }
  });

  console.log(`Seeded ${corpus.words.length} HCE words, ${uniqueSymbols.length} phoneme symbols, 3 word lists and 3 activity configurations.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
