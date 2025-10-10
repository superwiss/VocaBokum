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
  audioUrl?: string // Optional: 실제 오디오 파일 URL (Free Dictionary API)
  vocabularyBookId: string // 단어장 ID
  addedDate?: string // ISO 8601 format - 마이그레이션을 위해 optional 유지
  stats: WordStats
}

export type QuestionType = 1 | 2 | 3 | 4
