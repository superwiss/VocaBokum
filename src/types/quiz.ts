import { Word, QuestionType } from './word'

export interface QuizQuestion {
  id: string
  wordId: string
  type: QuestionType
  word: Word
}

export interface QuizResult {
  questionId: string
  wordId: string
  type: QuestionType
  isCorrect: boolean
  userAnswer: string
  correctAnswer: string | string[]
}

export interface QuizSession {
  questions: QuizQuestion[]
  results: QuizResult[]
  currentQuestionIndex: number
  isCompleted: boolean
}
