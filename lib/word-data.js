import { hintForPhoneme, exampleForPhoneme } from './phonemes';

export const wordInclude = {
  list: true,
  phonemes: {
    orderBy: { position: 'asc' },
    include: { phoneme: true }
  }
};

export function serialiseWord(word) {
  return {
    ...word,
    phonemeSymbols: word.phonemes.map((token) => token.phoneme.symbol)
  };
}

export function phonemeCreateData(symbols) {
  return symbols.map((symbol, position) => ({
    position,
    phoneme: {
      connectOrCreate: {
        where: { symbol },
        create: {
          symbol,
          hintLabel: hintForPhoneme(symbol),
          exampleWord: exampleForPhoneme(symbol)
        }
      }
    }
  }));
}

export function plainWord(word) {
  return {
    id: word.id,
    english: word.english,
    difficulty: word.difficulty,
    hint: word.hint,
    phonemes: word.phonemes.map((token) => ({
      symbol: token.phoneme.symbol,
      hintLabel: token.phoneme.hintLabel || hintForPhoneme(token.phoneme.symbol),
      exampleWord: token.phoneme.exampleWord || ''
    }))
  };
}
