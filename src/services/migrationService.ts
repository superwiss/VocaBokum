import { Word } from '@/types/word'
import { VocabularyBook } from '@/types/vocabularyBook'
import { storageService } from './storageService'

/**
 * 날짜 기반 단어 데이터를 단어장 기반으로 마이그레이션
 *
 * 기존 addedDate를 기준으로 단어장을 자동 생성하고,
 * 각 단어에 vocabularyBookId를 할당합니다.
 */
export function migrateFromDateBased(): {
  success: boolean
  migratedWords: number
  createdBooks: number
} {
  try {
    const words = storageService.loadWords()
    const existingBooks = storageService.loadVocabularyBooks()

    // 이미 마이그레이션된 단어가 있는지 확인
    const hasVocabularyBookId = words.some((w) => w.vocabularyBookId)

    if (hasVocabularyBookId && existingBooks.length > 0) {
      // 이미 마이그레이션 완료
      return {
        success: true,
        migratedWords: 0,
        createdBooks: 0,
      }
    }

    // addedDate가 없는 단어가 있는지 확인
    const wordsWithoutDate = words.filter((w) => !w.addedDate)
    if (wordsWithoutDate.length > 0 && existingBooks.length === 0) {
      // 날짜가 없는 단어들을 위한 기본 단어장 생성
      const defaultBook: VocabularyBook = {
        id: `book_${Date.now()}`,
        title: '기본 단어장',
        createdDate: new Date().toISOString(),
        description: '날짜 정보가 없는 단어들을 위한 단어장',
      }
      existingBooks.push(defaultBook)
    }

    // 날짜별로 단어 그룹화
    const dateGroups = new Map<string, Word[]>()

    words.forEach((word) => {
      if (word.addedDate) {
        const dateKey = word.addedDate.split('T')[0] // YYYY-MM-DD 형식
        if (!dateGroups.has(dateKey)) {
          dateGroups.set(dateKey, [])
        }
        dateGroups.get(dateKey)!.push(word)
      }
    })

    // 날짜별로 단어장 생성
    const newBooks: VocabularyBook[] = []
    const dateToBookId = new Map<string, string>()

    dateGroups.forEach((_, date) => {
      const bookId = `book_${date.replace(/-/g, '')}`
      const book: VocabularyBook = {
        id: bookId,
        title: `${date} 단어장`,
        createdDate: `${date}T00:00:00.000Z`,
        description: `${date}에 등록된 단어들`,
      }
      newBooks.push(book)
      dateToBookId.set(date, bookId)
    })

    // 단어들에 vocabularyBookId 할당
    const migratedWords = words.map((word) => {
      if (word.addedDate) {
        const dateKey = word.addedDate.split('T')[0]
        const bookId = dateToBookId.get(dateKey)

        if (bookId) {
          return {
            ...word,
            vocabularyBookId: bookId,
          }
        }
      }

      // 날짜가 없는 단어는 기본 단어장에 할당
      if (existingBooks.length > 0) {
        return {
          ...word,
          vocabularyBookId: existingBooks[0].id,
        }
      }

      return word
    })

    // 저장
    storageService.saveVocabularyBooks([...existingBooks, ...newBooks])
    storageService.saveWords(migratedWords)

    return {
      success: true,
      migratedWords: migratedWords.length,
      createdBooks: newBooks.length,
    }
  } catch (error) {
    console.error('Migration failed:', error)
    return {
      success: false,
      migratedWords: 0,
      createdBooks: 0,
    }
  }
}

/**
 * 마이그레이션이 필요한지 확인
 */
export function needsMigration(): boolean {
  const words = storageService.loadWords()
  const books = storageService.loadVocabularyBooks()

  // 단어는 있지만 단어장이 없는 경우
  if (words.length > 0 && books.length === 0) {
    return true
  }

  // vocabularyBookId가 없는 단어가 있는 경우
  const wordsWithoutBookId = words.filter((w) => !w.vocabularyBookId)
  if (wordsWithoutBookId.length > 0) {
    return true
  }

  return false
}
