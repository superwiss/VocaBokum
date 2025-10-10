import { Word, QuestionType } from '@/types/word'
import { QuizQuestion } from '@/types/quiz'

/**
 * Fisher-Yates 알고리즘을 사용한 배열 셔플
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * 단어 배열로부터 퀴즈 문제 생성
 * 각 단어당 선택된 유형의 문제를 생성하고 랜덤 섞기
 * @param words 퀴즈를 생성할 단어 목록
 * @param selectedTypes 선택된 문제 유형 (기본값: 모든 유형)
 */
export function generateQuiz(words: Word[], selectedTypes: QuestionType[] = [1, 2, 3, 4]): QuizQuestion[] {
  const questions: QuizQuestion[] = []

  // 각 단어에 대해 선택된 유형의 문제 생성
  words.forEach((word) => {
    selectedTypes.forEach((type) => {
      questions.push({
        id: `${word.id}-type${type}-${Date.now()}-${Math.random()}`,
        wordId: word.id,
        type,
        word,
      })
    })
  })

  // Fisher-Yates 알고리즘으로 문제 섞기
  return shuffleArray(questions)
}

/**
 * 오늘 단어로 퀴즈 생성
 * @param words 전체 단어 목록
 * @param selectedTypes 선택된 문제 유형 (기본값: 모든 유형)
 */
export function generateTodayQuiz(words: Word[], selectedTypes: QuestionType[] = [1, 2, 3, 4]): QuizQuestion[] {
  const today = new Date().toISOString().split('T')[0]
  const todayWords = words.filter((w) => w.addedDate?.startsWith(today))
  return generateQuiz(todayWords, selectedTypes)
}

/**
 * 복습용 퀴즈 생성 (가중치 기반 문제 생성)
 * @param words 복습할 단어 목록
 * @param count 생성할 문제 수
 * @param selectedTypes 선택된 문제 유형 (기본값: 모든 유형)
 */
export function generateReviewQuiz(words: Word[], count: number, selectedTypes: QuestionType[] = [1, 2, 3, 4]): QuizQuestion[] {
  if (words.length === 0 || selectedTypes.length === 0) return []

  // 오답률 기반 가중치 계산
  const wordsWithWeight = words.map((word) => {
    const totalAttempts =
      word.stats.type1Attempts + word.stats.type2Attempts + word.stats.type3Attempts + word.stats.type4Attempts
    const totalCorrect =
      word.stats.type1Correct + word.stats.type2Correct + word.stats.type3Correct + word.stats.type4Correct

    // 시도가 없으면 기본 가중치 1
    const weight = totalAttempts === 0 ? 1 : (totalAttempts - totalCorrect) / totalAttempts

    return { word, weight: Math.max(0.1, weight) } // 최소 가중치 0.1
  })

  // 최대 문제 수는 단어 수 × 유형 수
  const maxQuestions = words.length * selectedTypes.length
  const questionCount = Math.min(count, maxQuestions)

  // 가중치 기반으로 문제 생성 (중복 가능)
  const questions: QuizQuestion[] = []

  for (let i = 0; i < questionCount; i++) {
    // 가중치 합계 계산
    const totalWeight = wordsWithWeight.reduce((sum, item) => sum + item.weight, 0)

    // 랜덤 값 생성
    let random = Math.random() * totalWeight

    // 가중치 기반으로 단어 선택
    let selectedWord = wordsWithWeight[0].word
    for (let j = 0; j < wordsWithWeight.length; j++) {
      random -= wordsWithWeight[j].weight
      if (random <= 0) {
        selectedWord = wordsWithWeight[j].word
        break
      }
    }

    // 선택된 유형 중 랜덤으로 1개 선택
    const randomType = selectedTypes[Math.floor(Math.random() * selectedTypes.length)]

    questions.push({
      id: `${selectedWord.id}-type${randomType}-${Date.now()}-${Math.random()}-${i}`,
      wordId: selectedWord.id,
      type: randomType,
      word: selectedWord,
    })
  }

  return shuffleArray(questions)
}
