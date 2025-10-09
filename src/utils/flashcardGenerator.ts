import { Word } from '../types/word';
import { FlashcardItem, FlashcardType } from '../types/flashcard';

/**
 * 플래시 카드 학습을 위한 문제 풀 생성
 * @param words 학습할 단어 목록
 * @param selectedTypes 선택한 유형 목록 (1: 발음 듣고 연상, 2: 영어 단어 보고 연상, 3: 한글 뜻 보고 연상)
 * @returns 랜덤 셔플된 플래시 카드 아이템 배열
 */
export function generateFlashcardPool(
  words: Word[],
  selectedTypes: FlashcardType[]
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
