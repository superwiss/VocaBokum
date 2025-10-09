import { Word } from './word';

// 플래시 카드 전용 유형 (3가지)
// 유형 1: 발음 듣고 영어 단어와 한글 뜻 연상하기
// 유형 2: 영어 단어 보고 한글 뜻 연상하기
// 유형 3: 한글 뜻 보고 영어 단어 연상하기
export type FlashcardType = 1 | 2 | 3;

export interface FlashcardItem {
  id: string;
  wordId: string;
  type: FlashcardType;
  word: Word;
}
