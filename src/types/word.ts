export interface WordStats {
  type1Attempts: number
  type1Correct: number
  type2Attempts: number
  type2Correct: number
  type3Attempts: number
  type3Correct: number
  type4Attempts: number
  type4Correct: number
}

export interface Word {
  id: string
  word: string
  meanings: string[]
  pronunciation: string
  addedDate: string // ISO 8601 format
  stats: WordStats
}

export type QuestionType = 1 | 2 | 3 | 4
