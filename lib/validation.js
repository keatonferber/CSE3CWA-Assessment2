const DIFFICULTIES = new Set(['any', 'easy', 'medium', 'hard']);
const ACTIVITY_TYPES = new Set(['wordle', 'wordsearch']);

export class ValidationError extends Error {
  constructor(message, status = 422) {
    super(message);
    this.name = 'ValidationError';
    this.status = status;
  }
}

export function cleanString(value, field, { min = 1, max = 200, allowEmpty = false } = {}) {
  if (typeof value !== 'string') throw new ValidationError(`${field} must be text.`);
  const cleaned = value.trim();
  if (allowEmpty && cleaned.length === 0) return '';
  if (cleaned.length < min || cleaned.length > max) {
    throw new ValidationError(`${field} must be between ${min} and ${max} characters.`);
  }
  return cleaned;
}

export function optionalString(value, field, max = 600) {
  if (value == null) return '';
  return cleanString(String(value), field, { min: 0, max, allowEmpty: true });
}

export function positiveInt(value, field, { min = 1, max = 100 } = {}) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new ValidationError(`${field} must be an integer between ${min} and ${max}.`);
  }
  return number;
}

export function optionalPositiveInt(value, field, { min = 1, max = 100 } = {}) {
  if (value == null || value === '') return null;
  return positiveInt(value, field, { min, max });
}

export function booleanValue(value, defaultValue = false) {
  if (value == null) return defaultValue;
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === 1 || value === '1') return true;
  if (value === 'false' || value === 0 || value === '0') return false;
  throw new ValidationError('Boolean setting is malformed.');
}

export function normalisePhonemes(value) {
  let tokens = [];
  if (Array.isArray(value)) {
    tokens = value;
  } else if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.includes(',')) tokens = trimmed.split(',');
    else tokens = trimmed.split(/\s+/);
  }

  const cleaned = tokens.map((token) => String(token).trim()).filter(Boolean);
  if (cleaned.length < 1 || cleaned.length > 10) {
    throw new ValidationError('phonemes must contain between 1 and 10 phoneme symbols.');
  }
  for (const token of cleaned) {
    if (token.length > 12) throw new ValidationError(`Phoneme symbol "${token}" is too long.`);
    if (/\s/.test(token)) throw new ValidationError(`Phoneme symbol "${token}" cannot contain spaces.`);
  }
  return cleaned;
}

function parseDifficulty(value, { allowAny = false } = {}) {
  const difficulty = cleanString(value ?? (allowAny ? 'any' : 'medium'), 'difficulty', { max: 20 }).toLowerCase();
  if (!DIFFICULTIES.has(difficulty) || (!allowAny && difficulty === 'any')) {
    throw new ValidationError(`difficulty must be ${allowAny ? 'any, ' : ''}easy, medium, or hard.`);
  }
  return difficulty;
}

export function parseWordListInput(body) {
  return {
    name: cleanString(body.name, 'name', { max: 100 }),
    description: optionalString(body.description, 'description', 500)
  };
}

export function parseWordInput(body) {
  return {
    english: cleanString(body.english, 'english', { max: 80 }),
    difficulty: parseDifficulty(body.difficulty),
    hint: optionalString(body.hint, 'hint', 300),
    listId: positiveInt(body.listId, 'listId', { max: 1_000_000 }),
    phonemes: normalisePhonemes(body.phonemes)
  };
}

export function parseConfigInput(body) {
  const type = cleanString(body.type, 'type', { max: 20 }).toLowerCase();
  if (!ACTIVITY_TYPES.has(type)) throw new ValidationError('type must be wordle or wordsearch.');

  const config = {
    name: cleanString(body.name, 'name', { max: 100 }),
    type,
    listId: positiveInt(body.listId, 'listId', { max: 1_000_000 }),
    difficulty: parseDifficulty(body.difficulty, { allowAny: true }),
    wordCount: positiveInt(body.wordCount ?? 5, 'wordCount', { min: 1, max: 20 }),
    phonemeLength: optionalPositiveInt(body.phonemeLength, 'phonemeLength', { min: 1, max: 10 }),
    gridRows: positiveInt(body.gridRows ?? 10, 'gridRows', { min: 4, max: 20 }),
    gridCols: positiveInt(body.gridCols ?? 10, 'gridCols', { min: 4, max: 20 }),
    maxAttempts: positiveInt(body.maxAttempts ?? 6, 'maxAttempts', { min: 1, max: 10 }),
    showHints: booleanValue(body.showHints, true),
    showEnglishOnCorrect: booleanValue(body.showEnglishOnCorrect, true),
    allowDiagonal: booleanValue(body.allowDiagonal, true),
    allowReverse: booleanValue(body.allowReverse, true),
    showAnswers: booleanValue(body.showAnswers, true),
    title: optionalString(body.title, 'title', 120),
    instructions: optionalString(body.instructions, 'instructions', 700)
  };

  if (type === 'wordle' && !config.phonemeLength) {
    throw new ValidationError('Wordle configurations require a phonemeLength so every game row has a consistent number of cells.');
  }
  return config;
}

export function parseId(value, field = 'id') {
  return positiveInt(value, field, { max: 1_000_000 });
}

export function errorResponse(error) {
  const status = error?.status || (error?.code === 'P2025' ? 404 : error?.code === 'P2002' ? 409 : 400);
  let message = error?.message || 'The request could not be completed.';
  if (error?.code === 'P2002') message = 'A record with the same unique value already exists.';
  if (error?.code === 'P2025') message = 'The requested record was not found.';
  return { status, message };
}
