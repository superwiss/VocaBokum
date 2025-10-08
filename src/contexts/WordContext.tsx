import { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react'
import { Word, QuestionType } from '@/types/word'
import { storageService } from '@/services/storageService'

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

// State type
interface WordState {
  words: Word[]
}

// Context type
interface WordContextType {
  words: Word[]
  dispatch: React.Dispatch<WordAction>
}

// Reducer
function wordReducer(state: WordState, action: WordAction): WordState {
  switch (action.type) {
    case 'LOAD_WORDS':
      return { words: action.payload }

    case 'ADD_WORD':
      return { words: [...state.words, action.payload] }

    case 'UPDATE_WORD':
      return {
        words: state.words.map((word) =>
          word.id === action.payload.id ? action.payload : word
        ),
      }

    case 'DELETE_WORD':
      return {
        words: state.words.filter((word) => word.id !== action.payload),
      }

    case 'UPDATE_STATS': {
      const { wordId, type, isCorrect } = action.payload
      return {
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
        words: state.words.map((word) => {
          if (word.addedDate.startsWith(action.payload)) {
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

    default:
      return state
  }
}

// Context
const WordContext = createContext<WordContextType | undefined>(undefined)

// Provider
export function WordProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wordReducer, { words: [] })
  const [isInitialized, setIsInitialized] = useState(false)

  // 초기 로드
  useEffect(() => {
    const words = storageService.loadWords()
    dispatch({ type: 'LOAD_WORDS', payload: words })
    setIsInitialized(true)
  }, [])

  // words 변경시 자동 저장 (초기 로드 후에만)
  useEffect(() => {
    if (isInitialized) {
      storageService.saveWords(state.words)
    }
  }, [state.words, isInitialized])

  return (
    <WordContext.Provider value={{ words: state.words, dispatch }}>
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
