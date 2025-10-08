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
 * 각 단어당 4가지 유형(1, 2, 3, 4)의 문제를 생성하고 랜덤 섞기
 */
export function generateQuiz(words: Word[]): QuizQuestion[] {
  const questions: QuizQuestion[] = []

  // 각 단어에 대해 4가지 유형의 문제 생성
  words.forEach((word) => {
    const types: QuestionType[] = [1, 2, 3, 4]

    types.forEach((type) => {
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
 * 오늘 단어로 퀴즈 생성 (각 단어당 4문제)
 */
export function generateTodayQuiz(words: Word[]): QuizQuestion[] {
  const today = new Date().toISOString().split('T')[0]
  const todayWords = words.filter((w) => w.addedDate.startsWith(today))
  return generateQuiz(todayWords)
}

/**
 * 복습용 퀴즈 생성 (각 단어당 1개 유형만 랜덤 선택)
 */
export function generateReviewQuiz(words: Word[], count: number): QuizQuestion[] {
  if (words.length === 0) return []

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

  // 가중치 기반 랜덤 선택
  const selectedWords: Word[] = []
  const availableWords = [...wordsWithWeight]

  for (let i = 0; i < Math.min(count, words.length); i++) {
    // 가중치 합계 계산
    const totalWeight = availableWords.reduce((sum, item) => sum + item.weight, 0)

    // 랜덤 값 생성
    let random = Math.random() * totalWeight

    // 가중치 기반으로 단어 선택
    let selectedIndex = 0
    for (let j = 0; j < availableWords.length; j++) {
      random -= availableWords[j].weight
      if (random <= 0) {
        selectedIndex = j
        break
      }
    }

    selectedWords.push(availableWords[selectedIndex].word)
    availableWords.splice(selectedIndex, 1)
  }

  // 각 선택된 단어에 대해 1개의 랜덤 유형 생성
  const questions: QuizQuestion[] = selectedWords.map((word) => {
    const types: QuestionType[] = [1, 2, 3, 4]
    const randomType = types[Math.floor(Math.random() * types.length)]

    return {
      id: `${word.id}-type${randomType}-${Date.now()}-${Math.random()}`,
      wordId: word.id,
      type: randomType,
      word,
    }
  })

  return shuffleArray(questions)
}
