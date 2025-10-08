import { useState, useEffect } from 'react'
import { useWords } from '@/hooks/useWords'
import { generateTodayQuiz } from '@/utils/quizGenerator'
import { validateAnswer } from '@/utils/answerValidator'
import { QuizQuestion, QuizResult as QuizResultType } from '@/types/quiz'
import Type1Question from '@/components/quiz/Type1Question'
import Type2QuestionNew from '@/components/quiz/Type2QuestionNew'
import Type2Question from '@/components/quiz/Type2Question'
import Type3Question from '@/components/quiz/Type3Question'
import QuizResult from '@/components/quiz/QuizResult'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function QuizPage() {
  const { getTodayWords, updateStats } = useWords()
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<QuizResultType[]>([])
  const [isCompleted, setIsCompleted] = useState(false)

  const initQuiz = () => {
    const todayWords = getTodayWords()
    if (todayWords.length > 0) {
      const quiz = generateTodayQuiz(todayWords)
      setQuestions(quiz)
      setCurrentIndex(0)
      setResults([])
      setIsCompleted(false)
    }
  }

  useEffect(() => {
    initQuiz()
  }, [])

  const handleAnswer = (answer: string) => {
    const currentQuestion = questions[currentIndex]
    const isCorrect = validateAnswer(
      currentQuestion.type,
      answer,
      currentQuestion.word.meanings,
      currentQuestion.word.word
    )

    // 결과 저장
    const result: QuizResultType = {
      questionId: currentQuestion.id,
      wordId: currentQuestion.wordId,
      type: currentQuestion.type,
      isCorrect,
      userAnswer: answer,
      correctAnswer:
        currentQuestion.type === 2 || currentQuestion.type === 4
          ? currentQuestion.word.word
          : currentQuestion.word.meanings,
    }

    setResults([...results, result])

    // 통계 업데이트
    updateStats(currentQuestion.wordId, currentQuestion.type, isCorrect)

    // 다음 문제로 이동 또는 완료
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setIsCompleted(true)
    }
  }

  const todayWords = getTodayWords()

  if (todayWords.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground mb-4">
              오늘 추가된 단어가 없습니다.
            </p>
            <Button onClick={() => (window.location.href = '/words')} className="w-full">
              단어 추가하러 가기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="container mx-auto p-6">
        <QuizResult results={results} onRetry={initQuiz} />
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]

  if (!currentQuestion) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">문제를 생성하는 중...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">오늘 단어 시험</h1>
        <p className="text-muted-foreground">
          문제 {currentIndex + 1} / {questions.length}
        </p>
        <div className="w-full bg-muted h-2 rounded-full mt-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {currentQuestion.type === 1 && (
        <Type1Question key={currentQuestion.id} question={currentQuestion} onSubmit={handleAnswer} />
      )}
      {currentQuestion.type === 2 && (
        <Type2QuestionNew key={currentQuestion.id} question={currentQuestion} onSubmit={handleAnswer} />
      )}
      {currentQuestion.type === 3 && (
        <Type2Question key={currentQuestion.id} question={currentQuestion} onSubmit={handleAnswer} />
      )}
      {currentQuestion.type === 4 && (
        <Type3Question key={currentQuestion.id} question={currentQuestion} onSubmit={handleAnswer} />
      )}
    </div>
  )
}
