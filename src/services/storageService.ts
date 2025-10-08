import { Word } from '@/types/word'

const STORAGE_KEY = 'vocabokum_words'

export const storageService = {
  /**
   * 모든 단어를 로컬 스토리지에 저장
   */
  saveWords(words: Word[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(words))
    } catch (error) {
      console.error('Failed to save words to localStorage:', error)
      throw new Error('단어 저장에 실패했습니다.')
    }
  },

  /**
   * 로컬 스토리지에서 모든 단어 불러오기
   */
  loadWords(): Word[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return []

      const words = JSON.parse(data)
      return Array.isArray(words) ? words : []
    } catch (error) {
      console.error('Failed to load words from localStorage:', error)
      return []
    }
  },

  /**
   * 단어 추가
   */
  addWord(word: Word): void {
    const words = this.loadWords()
    words.push(word)
    this.saveWords(words)
  },

  /**
   * 단어 업데이트
   */
  updateWord(updatedWord: Word): void {
    const words = this.loadWords()
    const index = words.findIndex((w) => w.id === updatedWord.id)

    if (index !== -1) {
      words[index] = updatedWord
      this.saveWords(words)
    } else {
      throw new Error('단어를 찾을 수 없습니다.')
    }
  },

  /**
   * 단어 삭제
   */
  deleteWord(id: string): void {
    const words = this.loadWords()
    const filteredWords = words.filter((w) => w.id !== id)
    this.saveWords(filteredWords)
  },

  /**
   * 특정 날짜의 단어들 가져오기
   */
  getWordsByDate(date: string): Word[] {
    const words = this.loadWords()
    return words.filter((w) => w.addedDate.startsWith(date))
  },

  /**
   * 모든 단어를 JSON 문자열로 내보내기
   */
  exportWords(): string {
    const words = this.loadWords()
    return JSON.stringify(words, null, 2)
  },

  /**
   * JSON 문자열에서 단어 가져오기
   */
  importWords(json: string, mode: 'replace' | 'merge' = 'replace'): Word[] {
    try {
      const importedWords = JSON.parse(json)

      if (!Array.isArray(importedWords)) {
        throw new Error('올바른 형식이 아닙니다.')
      }

      // 기본 유효성 검증
      const isValid = importedWords.every(
        (w) =>
          w.id &&
          w.word &&
          Array.isArray(w.meanings) &&
          w.addedDate &&
          w.stats
      )

      if (!isValid) {
        throw new Error('단어 데이터가 올바르지 않습니다.')
      }

      if (mode === 'replace') {
        this.saveWords(importedWords)
        return importedWords
      } else {
        // merge mode
        const existingWords = this.loadWords()
        const existingIds = new Set(existingWords.map((w) => w.id))

        // 중복되지 않는 단어만 추가
        const newWords = importedWords.filter((w) => !existingIds.has(w.id))
        const mergedWords = [...existingWords, ...newWords]

        this.saveWords(mergedWords)
        return mergedWords
      }
    } catch (error) {
      console.error('Failed to import words:', error)
      throw new Error('데이터 가져오기에 실패했습니다.')
    }
  },

  /**
   * 모든 데이터 삭제 (초기화)
   */
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY)
  },

  /**
   * 모든 단어의 통계 데이터 리셋
   */
  resetAllStats(): void {
    const words = this.loadWords()
    const resetWords = words.map((word) => ({
      ...word,
      stats: {
        type1Attempts: 0,
        type1Correct: 0,
        type2Attempts: 0,
        type2Correct: 0,
        type3Attempts: 0,
        type3Correct: 0,
        type4Attempts: 0,
        type4Correct: 0,
      },
    }))
    this.saveWords(resetWords)
  },

  /**
   * 특정 날짜의 단어들 통계 데이터 리셋
   */
  resetStatsByDate(date: string): void {
    const words = this.loadWords()
    const resetWords = words.map((word) => {
      if (word.addedDate.startsWith(date)) {
        return {
          ...word,
          stats: {
            type1Attempts: 0,
            type1Correct: 0,
            type2Attempts: 0,
            type2Correct: 0,
            type3Attempts: 0,
            type3Correct: 0,
            type4Attempts: 0,
            type4Correct: 0,
          },
        }
      }
      return word
    })
    this.saveWords(resetWords)
  },

  /**
   * 특정 단어의 통계 데이터 리셋
   */
  resetWordStats(wordId: string): void {
    const words = this.loadWords()
    const index = words.findIndex((w) => w.id === wordId)

    if (index !== -1) {
      words[index] = {
        ...words[index],
        stats: {
          type1Attempts: 0,
          type1Correct: 0,
          type2Attempts: 0,
          type2Correct: 0,
          type3Attempts: 0,
          type3Correct: 0,
          type4Attempts: 0,
          type4Correct: 0,
        },
      }
      this.saveWords(words)
    } else {
      throw new Error('단어를 찾을 수 없습니다.')
    }
  },
}
