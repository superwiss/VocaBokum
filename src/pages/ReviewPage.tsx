import { useState, useEffect } from 'react'
import { useWords } from '@/hooks/useWords'
import { generateTodayQuiz, generateReviewQuiz } from '@/utils/quizGenerator'
import { validateAnswer } from '@/utils/answerValidator'
import { QuizQuestion, QuizResult as QuizResultType } from '@/types/quiz'
import { QuestionType } from '@/types/word'
import Type1Question from '@/components/quiz/Type1Question'
import Type2QuestionNew from '@/components/quiz/Type2QuestionNew'
import Type2Question from '@/components/quiz/Type2Question'
import Type3Question from '@/components/quiz/Type3Question'
import QuizResult from '@/components/quiz/QuizResult'
import QuizTypeSelector from '@/components/quiz/QuizTypeSelector'
import GradingModeSelector, { GradingMode } from '@/components/quiz/GradingModeSelector'
import DateRangeSelector from '@/components/quiz/DateRangeSelector'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export default function ReviewPage() {
  const { getWordsByDateRange, getLatestWordDate, updateStats } = useWords()

  // 기본값: 가장 최근 단어 등록 날짜
  const latestDate = getLatestWordDate()
  const [startDate, setStartDate] = useState(latestDate)
  const [endDate, setEndDate] = useState(latestDate)
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([1, 2, 3, 4])
  const [gradingMode, setGradingMode] = useState<GradingMode>('immediate')
  const [useQuestionLimit, setUseQuestionLimit] = useState(false)
  const [questionLimit, setQuestionLimit] = useState(10)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<QuizResultType[]>([])
  const [isStarted, setIsStarted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean
    correctAnswer: string | string[]
  } | null>(null)

  const dateRangeWords = getWordsByDateRange(startDate, endDate)

  // 날짜 범위가 변경되면 문제 수를 단어 개수 이하로 조정
  useEffect(() => {
    if (questionLimit > dateRangeWords.length) {
      setQuestionLimit(Math.max(1, dateRangeWords.length))
    }
  }, [startDate, endDate, dateRangeWords.length])

  const startQuiz = () => {
    if (dateRangeWords.length === 0) return

    let quiz: QuizQuestion[]

    if (useQuestionLimit && questionLimit > 0) {
      // 문제 수 제한이 있는 경우: 가중치 기반 랜덤 선택
      const count = Math.min(questionLimit, dateRangeWords.length)
      quiz = generateReviewQuiz(dateRangeWords, count, selectedTypes)
    } else {
      // 문제 수 제한이 없는 경우: 모든 단어 * 선택된 유형
      quiz = generateTodayQuiz(dateRangeWords, selectedTypes)
    }

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

    const newResults = [...results, result]
    setResults(newResults)

    // 즉시 채점 모드: 통계를 바로 업데이트하고 피드백 표시
    if (gradingMode === 'immediate') {
      updateStats(currentQuestion.wordId, currentQuestion.type, isCorrect)
      setFeedback({
        isCorrect,
        correctAnswer: result.correctAnswer,
      })
    } else {
      // 일괄 채점 모드: 바로 다음 문제로
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        setIsCompleted(true)
      }
    }
  }

  const handleNext = () => {
    setFeedback(null)
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setIsCompleted(true)
    }
  }

  // 피드백 화면에서 엔터키 처리
  useEffect(() => {
    if (!feedback) return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [feedback, handleNext])

  // 시험 완료 시 일괄 채점 모드인 경우 통계 일괄 업데이트
  useEffect(() => {
    if (isCompleted && gradingMode === 'batch') {
      results.forEach((result) => {
        updateStats(result.wordId, result.type, result.isCorrect)
      })
    }
  }, [isCompleted, gradingMode, results, updateStats])

  // 현재 점수 계산
  const currentScore = results.filter((r) => r.isCorrect).length

  const handleRetry = () => {
    setIsStarted(false)
    setIsCompleted(false)
    setQuestions([])
    setResults([])
    setCurrentIndex(0)
  }

  // 시험 시작 전 화면
  if (!isStarted) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">시험</h1>
          <p className="text-muted-foreground">
            원하는 날짜 범위의 단어로 시험을 보세요.
          </p>
        </div>

        {dateRangeWords.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground mb-4">
                선택한 날짜 범위에 등록된 단어가 없습니다.
              </p>
              <Button onClick={() => (window.location.href = '/words')} className="w-full">
                단어 추가하러 가기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <DateRangeSelector
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              wordCount={dateRangeWords.length}
            />

            <Card>
              <CardHeader>
                <CardTitle>문제 수 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="use-limit"
                    checked={useQuestionLimit}
                    onCheckedChange={(checked) => setUseQuestionLimit(checked === true)}
                  />
                  <Label htmlFor="use-limit" className="cursor-pointer">
                    문제 수 제한 (가중치 기반 랜덤 선택)
                  </Label>
                </div>

                {useQuestionLimit && (
                  <div>
                    <Label htmlFor="count">문제 수</Label>
                    <Input
                      id="count"
                      type="number"
                      min={1}
                      max={dateRangeWords.length}
                      value={questionLimit}
                      onChange={(e) => {
                        const value = Number(e.target.value)
                        // 단어 개수를 초과하지 않도록 제한
                        setQuestionLimit(Math.min(value, dateRangeWords.length))
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      최대 {dateRangeWords.length}개 (틀린 단어 우선 출제)
                    </p>
                  </div>
                )}

                {!useQuestionLimit && (
                  <p className="text-sm text-muted-foreground">
                    예상 문제 수: {dateRangeWords.length * selectedTypes.length}개
                    (모든 단어 × 선택된 유형)
                  </p>
                )}
              </CardContent>
            </Card>

            <QuizTypeSelector
              selectedTypes={selectedTypes}
              onTypesChange={setSelectedTypes}
            />

            <GradingModeSelector
              selectedMode={gradingMode}
              onModeChange={setGradingMode}
            />

            <Button
              onClick={startQuiz}
              className="w-full"
              size="lg"
              disabled={useQuestionLimit && (questionLimit < 1 || questionLimit > dateRangeWords.length)}
            >
              시험 시작
            </Button>
          </div>
        )}
      </div>
    )
  }

  // 시험 완료 화면
  if (isCompleted) {
    return (
      <div className="container mx-auto p-6">
        <QuizResult results={results} onRetry={handleRetry} />
      </div>
    )
  }

  // 시험 진행 중
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
        <h1 className="text-3xl font-bold mb-2">시험</h1>
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            문제 {currentIndex + 1} / {questions.length}
          </p>
          {gradingMode === 'immediate' && results.length > 0 && (
            <p className="text-sm font-medium">
              현재 점수: <span className="text-primary">{currentScore}</span> / {results.length}
            </p>
          )}
        </div>
        <div className="w-full bg-muted h-2 rounded-full mt-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {!feedback ? (
        <>
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
        </>
      ) : (
        <Card className={feedback.isCorrect ? 'border-green-500' : 'border-red-500'}>
          <CardHeader>
            <CardTitle className={feedback.isCorrect ? 'text-green-600' : 'text-red-600'}>
              {feedback.isCorrect ? '✓ 정답입니다!' : '✗ 오답입니다'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">정답:</p>
              <p className="text-lg font-medium">
                {Array.isArray(feedback.correctAnswer)
                  ? feedback.correctAnswer.join(', ')
                  : feedback.correctAnswer}
              </p>
            </div>
            <Button onClick={handleNext} className="w-full" size="lg">
              {currentIndex < questions.length - 1 ? '다음 문제' : '결과 보기'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
