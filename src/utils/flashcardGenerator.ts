import { Word, QuestionType } from '../types/word';
import { QuizQuestion } from '../types/quiz';

export interface FlashcardItem {
  id: string;
  wordId: string;
  type: QuestionType;
  word: Word;
}

/**
 * 플래시 카드 학습을 위한 문제 풀 생성
 * @param words 학습할 단어 목록
 * @param selectedTypes 선택한 유형 목록
 * @returns 랜덤 셔플된 플래시 카드 아이템 배열
 */
export function generateFlashcardPool(
  words: Word[],
  selectedTypes: QuestionType[]
): FlashcardItem[] {
  const pool: FlashcardItem[] = [];

  // 각 단어에 대해 선택된 유형별로 플래시 카드 생성
  words.forEach((word) => {
    selectedTypes.forEach((type) => {
      pool.push({
        id: `${word.id}-${type}`,
        wordId: word.id,
        type,
        word,
      });
    });
  });

  // Fisher-Yates 알고리즘으로 랜덤 셔플
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool;
}

/**
 * FlashcardItem을 QuizQuestion 형식으로 변환
 * @param item 플래시 카드 아이템
 * @returns 퀴즈 문제 형식
 */
export function flashcardToQuizQuestion(item: FlashcardItem): QuizQuestion {
  return {
    id: item.id,
    wordId: item.wordId,
    type: item.type,
    word: item.word,
  };
}
