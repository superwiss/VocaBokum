import { useWordContext } from '@/contexts/WordContext'
import { Word, QuestionType } from '@/types/word'
import { VocabularyBook } from '@/types/vocabularyBook'

export function useWords() {
  const { words, vocabularyBooks, dispatch } = useWordContext()

  const addWord = (word: Word) => {
    dispatch({ type: 'ADD_WORD', payload: word })
  }

  const updateWord = (word: Word) => {
    dispatch({ type: 'UPDATE_WORD', payload: word })
  }

  const deleteWord = (id: string) => {
    dispatch({ type: 'DELETE_WORD', payload: id })
  }

  const getWordById = (id: string): Word | undefined => {
    return words.find((w) => w.id === id)
  }

  const getWordsByDate = (date: string): Word[] => {
    return words.filter((w) => w.addedDate?.startsWith(date))
  }

  const getTodayWords = (): Word[] => {
    const today = new Date().toISOString().split('T')[0]
    return getWordsByDate(today)
  }

  const getPastWords = (): Word[] => {
    const today = new Date().toISOString().split('T')[0]
    return words.filter((w) => w.addedDate && !w.addedDate.startsWith(today))
  }

  const getWordsByDateRange = (startDate: string, endDate: string): Word[] => {
    return words.filter((w) => {
      if (!w.addedDate) return false
      const wordDate = w.addedDate.split('T')[0]
      return wordDate >= startDate && wordDate <= endDate
    })
  }

  const getLatestWordDate = (): string => {
    if (words.length === 0) {
      return new Date().toISOString().split('T')[0]
    }
    const dates = words
      .filter((w) => w.addedDate)
      .map((w) => w.addedDate!.split('T')[0])
    return dates.sort().reverse()[0] || new Date().toISOString().split('T')[0]
  }

  const updateStats = (wordId: string, type: QuestionType, isCorrect: boolean) => {
    dispatch({ type: 'UPDATE_STATS', payload: { wordId, type, isCorrect } })
  }

  const loadWords = (newWords: Word[]) => {
    dispatch({ type: 'LOAD_WORDS', payload: newWords })
  }

  const getWordsByVocabularyBookId = (bookId: string): Word[] => {
    return words.filter((w) => w.vocabularyBookId === bookId)
  }

  const getWordsByVocabularyBookIds = (bookIds: string[]): Word[] => {
    return words.filter((w) => bookIds.includes(w.vocabularyBookId))
  }

  const addVocabularyBook = (book: VocabularyBook) => {
    dispatch({ type: 'ADD_VOCABULARY_BOOK', payload: book })
  }

  const updateVocabularyBook = (book: VocabularyBook) => {
    dispatch({ type: 'UPDATE_VOCABULARY_BOOK', payload: book })
  }

  const deleteVocabularyBook = (id: string) => {
    dispatch({ type: 'DELETE_VOCABULARY_BOOK', payload: id })
  }

  return {
    words,
    vocabularyBooks,
    addWord,
    updateWord,
    deleteWord,
    getWordById,
    getWordsByDate,
    getWordsByDateRange,
    getLatestWordDate,
    getTodayWords,
    getPastWords,
    updateStats,
    loadWords,
    getWordsByVocabularyBookId,
    getWordsByVocabularyBookIds,
    addVocabularyBook,
    updateVocabularyBook,
    deleteVocabularyBook,
  }
}
