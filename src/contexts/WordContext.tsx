import { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react'
import { Word, QuestionType } from '@/types/word'
import { VocabularyBook } from '@/types/vocabularyBook'
import { storageService } from '@/services/storageService'
import { migrateFromDateBased, needsMigration } from '@/services/migrationService'

// Action types
type WordAction =
  | { type: 'LOAD_WORDS'; payload: Word[] }
  | { type: 'ADD_WORD'; payload: Word }
  | { type: 'UPDATE_WORD'; payload: Word }
  | { type: 'DELETE_WORD'; payload: string }
  | { type: 'UPDATE_STATS'; payload: { wordId: string; type: QuestionType; isCorrect: boolean } }
  | { type: 'RESET_ALL_STATS' }
  | { type: 'RESET_DATE_STATS'; payload: string }
  | { type: 'RESET_WORD_STATS'; payload: string }
  | { type: 'LOAD_VOCABULARY_BOOKS'; payload: VocabularyBook[] }
  | { type: 'ADD_VOCABULARY_BOOK'; payload: VocabularyBook }
  | { type: 'UPDATE_VOCABULARY_BOOK'; payload: VocabularyBook }
  | { type: 'DELETE_VOCABULARY_BOOK'; payload: string }
  | { type: 'RESET_VOCABULARY_BOOK_STATS'; payload: string }

// State type
interface WordState {
  words: Word[]
  vocabularyBooks: VocabularyBook[]
}

// Context type
interface WordContextType {
  words: Word[]
  vocabularyBooks: VocabularyBook[]
  dispatch: React.Dispatch<WordAction>
}

// Reducer
function wordReducer(state: WordState, action: WordAction): WordState {
  switch (action.type) {
    case 'LOAD_WORDS':
      return { ...state, words: action.payload }

    case 'ADD_WORD':
      return { ...state, words: [...state.words, action.payload] }

    case 'UPDATE_WORD':
      return {
        ...state,
        words: state.words.map((word) =>
          word.id === action.payload.id ? action.payload : word
        ),
      }

    case 'DELETE_WORD':
      return {
        ...state,
        words: state.words.filter((word) => word.id !== action.payload),
      }

    case 'UPDATE_STATS': {
      const { wordId, type, isCorrect } = action.payload
      return {
        ...state,
        words: state.words.map((word) => {
          if (word.id !== wordId) return word

          const stats = { ...word.stats }
          const attemptKey = `type${type}Attempts` as keyof typeof stats
          const correctKey = `type${type}Correct` as keyof typeof stats

          stats[attemptKey]++
          if (isCorrect) {
            stats[correctKey]++
          }

          return { ...word, stats }
        }),
      }
    }

    case 'RESET_ALL_STATS':
      return {
        ...state,
        words: state.words.map((word) => ({
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
        })),
      }

    case 'RESET_DATE_STATS':
      return {
        ...state,
        words: state.words.map((word) => {
          if (word.addedDate?.startsWith(action.payload)) {
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
        }),
      }

    case 'RESET_WORD_STATS':
      return {
        ...state,
        words: state.words.map((word) => {
          if (word.id === action.payload) {
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
        }),
      }

    case 'LOAD_VOCABULARY_BOOKS':
      return { ...state, vocabularyBooks: action.payload }

    case 'ADD_VOCABULARY_BOOK':
      return { ...state, vocabularyBooks: [...state.vocabularyBooks, action.payload] }

    case 'UPDATE_VOCABULARY_BOOK':
      return {
        ...state,
        vocabularyBooks: state.vocabularyBooks.map((book) =>
          book.id === action.payload.id ? action.payload : book
        ),
      }

    case 'DELETE_VOCABULARY_BOOK':
      return {
        ...state,
        vocabularyBooks: state.vocabularyBooks.filter((book) => book.id !== action.payload),
        words: state.words.filter((word) => word.vocabularyBookId !== action.payload),
      }

    case 'RESET_VOCABULARY_BOOK_STATS':
      return {
        ...state,
        words: state.words.map((word) => {
          if (word.vocabularyBookId === action.payload) {
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
        }),
      }

    default:
      return state
  }
}

// Context
const WordContext = createContext<WordContextType | undefined>(undefined)

// Provider
export function WordProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wordReducer, { words: [], vocabularyBooks: [] })
  const [isInitialized, setIsInitialized] = useState(false)

  // 초기 로드 및 마이그레이션
  useEffect(() => {
    // 마이그레이션이 필요한지 확인하고 실행
    if (needsMigration()) {
      const result = migrateFromDateBased()
      console.log('Migration completed:', result)
    }

    // 데이터 로드
    const words = storageService.loadWords()
    const books = storageService.loadVocabularyBooks()

    dispatch({ type: 'LOAD_WORDS', payload: words })
    dispatch({ type: 'LOAD_VOCABULARY_BOOKS', payload: books })
    setIsInitialized(true)
  }, [])

  // words 변경시 자동 저장 (초기 로드 후에만)
  useEffect(() => {
    if (isInitialized) {
      storageService.saveWords(state.words)
    }
  }, [state.words, isInitialized])

  // vocabularyBooks 변경시 자동 저장 (초기 로드 후에만)
  useEffect(() => {
    if (isInitialized) {
      storageService.saveVocabularyBooks(state.vocabularyBooks)
    }
  }, [state.vocabularyBooks, isInitialized])

  return (
    <WordContext.Provider
      value={{ words: state.words, vocabularyBooks: state.vocabularyBooks, dispatch }}
    >
      {children}
    </WordContext.Provider>
  )
}

// Custom hook
export function useWordContext() {
  const context = useContext(WordContext)
  if (context === undefined) {
    throw new Error('useWordContext must be used within a WordProvider')
  }
  return context
}
