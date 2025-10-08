import { useState, useEffect } from 'react'
import { useWords } from '@/hooks/useWords'
import { generateReviewQuiz } from '@/utils/quizGenerator'
import { validateAnswer } from '@/utils/answerValidator'
import { QuizQuestion, QuizResult as QuizResultType } from '@/types/quiz'
import Type1Question from '@/components/quiz/Type1Question'
import Type2QuestionNew from '@/components/quiz/Type2QuestionNew'
import Type2Question from '@/components/quiz/Type2Question'
import Type3Question from '@/components/quiz/Type3Question'
import QuizResult from '@/components/quiz/QuizResult'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ReviewPage() {
  const { getPastWords, updateStats } = useWords()
  const [reviewCount, setReviewCount] = useState(10)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<QuizResultType[]>([])
  const [isStarted, setIsStarted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const pastWords = getPastWords()

  const startReview = () => {
    if (pastWords.length === 0) return

    const count = Math.min(reviewCount, pastWords.length)
    const quiz = generateReviewQuiz(pastWords, count)
    setQuestions(quiz)
    setCurrentIndex(0)
    setResults([])
    setIsStarted(true)
    setIsCompleted(false)
  }

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

  const handleRetry = () => {
    setIsStarted(false)
    setIsCompleted(false)
    setQuestions([])
    setResults([])
    setCurrentIndex(0)
  }

  // 복습 시작 전 화면
  if (!isStarted) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">복습</h1>
          <p className="text-muted-foreground">
            과거에 학습한 단어를 복습하세요.
          </p>
        </div>

        {pastWords.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground mb-4">
                복습할 수 있는 단어가 없습니다. 어제 이전에 추가된 단어가 있어야 합니다.
              </p>
              <Button onClick={() => (window.location.href = '/words')} className="w-full">
                단어 추가하러 가기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>복습 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  복습 가능한 단어: {pastWords.length}개
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  틀린 단어일수록 더 자주 출제됩니다.
                </p>
              </div>

              <div>
                <Label htmlFor="count">복습할 문제 수</Label>
                <Input
                  id="count"
                  type="number"
                  min={1}
                  max={pastWords.length}
                  value={reviewCount}
                  onChange={(e) => setReviewCount(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  1 ~ {pastWords.length} 사이의 숫자를 입력하세요
                </p>
              </div>

              <Button
                onClick={startReview}
                className="w-full"
                disabled={reviewCount < 1 || reviewCount > pastWords.length}
              >
                복습 시작
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // 복습 완료 화면
  if (isCompleted) {
    return (
      <div className="container mx-auto p-6">
        <QuizResult results={results} onRetry={handleRetry} />
      </div>
    )
  }

  // 복습 진행 중
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
        <h1 className="text-3xl font-bold mb-2">복습</h1>
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
