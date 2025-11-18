import { ParsedScript } from './munging';

export interface MyState {
  originalScript: string;
  parsedScript: ParsedScript | null;
  cueScript: string;
  nWordsInCueScript: number;
  nCharsInLine: number;
  selectedCharacters: Set<string>;
  fileName: string | null;
}

export const MAX_NUM_CUE_WORDS = 8;
export const DEFAULT_NUM_CUE_WORDS = 3;
export const MIN_CHARS_PER_LINE = 30;
export const MAX_CHARS_PER_LINE = 100;
export const DEFAULT_NUM_CHARS_PER_LINE = 53;

export const INIT_STATE: MyState = {
  originalScript: '',
  parsedScript: null,
  cueScript: '',
  nWordsInCueScript: DEFAULT_NUM_CUE_WORDS,
  nCharsInLine: DEFAULT_NUM_CHARS_PER_LINE,
  selectedCharacters: new Set(),
  fileName: null,
};
