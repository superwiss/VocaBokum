import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QuizResult as QuizResultType } from '@/types/quiz'

interface QuizResultProps {
  results: QuizResultType[]
  onRetry: () => void
}

export default function QuizResult({ results, onRetry }: QuizResultProps) {
  const navigate = useNavigate()

  const totalQuestions = results.length
  const correctAnswers = results.filter((r) => r.isCorrect).length
  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

  // 유형별 정답률 계산
  const type1Results = results.filter((r) => r.type === 1)
  const type2Results = results.filter((r) => r.type === 2)
  const type3Results = results.filter((r) => r.type === 3)

  const type1Correct = type1Results.filter((r) => r.isCorrect).length
  const type2Correct = type2Results.filter((r) => r.isCorrect).length
  const type3Correct = type3Results.filter((r) => r.isCorrect).length

  const type1Score =
    type1Results.length > 0 ? Math.round((type1Correct / type1Results.length) * 100) : 0
  const type2Score =
    type2Results.length > 0 ? Math.round((type2Correct / type2Results.length) * 100) : 0
  const type3Score =
    type3Results.length > 0 ? Math.round((type3Correct / type3Results.length) * 100) : 0

  // 틀린 문제들
  const wrongAnswers = results.filter((r) => !r.isCorrect)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">시험 결과</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-6xl font-bold text-primary">{score}점</p>
            <p className="text-muted-foreground mt-2">
              {correctAnswers} / {totalQuestions} 문제 정답
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">유형 1 (듣고 한글 뜻 쓰기)</p>
              <p className="text-2xl font-semibold">{type1Score}%</p>
              <p className="text-xs text-muted-foreground">
                {type1Correct}/{type1Results.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">유형 2 (단어→뜻)</p>
              <p className="text-2xl font-semibold">{type2Score}%</p>
              <p className="text-xs text-muted-foreground">
                {type2Correct}/{type2Results.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">유형 3 (뜻→단어)</p>
              <p className="text-2xl font-semibold">{type3Score}%</p>
              <p className="text-xs text-muted-foreground">
                {type3Correct}/{type3Results.length}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={onRetry} className="flex-1">
              다시 시험보기
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" className="flex-1">
              홈으로
            </Button>
          </div>
        </CardContent>
      </Card>

      {wrongAnswers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>틀린 문제</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {wrongAnswers.map((result, idx) => (
                <div key={idx} className="border-b pb-4 last:border-0">
                  <p className="font-medium">
                    유형 {result.type} - 단어:{' '}
                    {results.find((r) => r.questionId === result.questionId)?.wordId}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    내 답변: <span className="text-destructive">{result.userAnswer}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    정답:{' '}
                    <span className="text-green-600">
                      {Array.isArray(result.correctAnswer)
                        ? result.correctAnswer.join(', ')
                        : result.correctAnswer}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
