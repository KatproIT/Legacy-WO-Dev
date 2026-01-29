import nspell from 'nspell';

let spellChecker: ReturnType<typeof nspell> | null = null;
let isLoading = false;
let loadPromise: Promise<void> | null = null;

export async function loadDictionary(): Promise<void> {
  if (spellChecker) return;
  if (loadPromise) return loadPromise;

  isLoading = true;
  loadPromise = (async () => {
    try {
      const [affRes, dicRes] = await Promise.all([
        fetch('/dictionaries/en_US.aff'),
        fetch('/dictionaries/en_US.dic')
      ]);

      const [affData, dicData] = await Promise.all([
        affRes.text(),
        dicRes.text()
      ]);

      spellChecker = nspell({ aff: affData, dic: dicData });
    } catch (error) {
      console.error('Failed to load dictionary:', error);
    } finally {
      isLoading = false;
    }
  })();

  return loadPromise;
}

export function isCorrect(word: string): boolean {
  if (!spellChecker) return true;

  const cleanWord = word.replace(/[^a-zA-Z]/g, '');
  if (!cleanWord || cleanWord.length === 0) return true;

  return spellChecker.correct(cleanWord);
}

export function checkText(text: string): { word: string; correct: boolean; start: number; end: number }[] {
  if (!spellChecker || !text) return [];

  const wordRegex = /[a-zA-Z]+/g;
  const results: { word: string; correct: boolean; start: number; end: number }[] = [];
  let match;

  while ((match = wordRegex.exec(text)) !== null) {
    const word = match[0];
    results.push({
      word,
      correct: isCorrect(word),
      start: match.index,
      end: match.index + word.length
    });
  }

  return results;
}
