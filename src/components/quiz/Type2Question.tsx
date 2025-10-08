import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QuizQuestion } from '@/types/quiz'

interface Type2QuestionProps {
  question: QuizQuestion
  onSubmit: (answer: string) => void
}

export default function Type2Question({ question, onSubmit }: Type2QuestionProps) {
  const [answer, setAnswer] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (answer.trim()) {
      onSubmit(answer.trim())
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>유형 3: 영어 단어를 보고 한글 뜻을 입력하세요</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-6xl font-bold text-primary">{question.word.word}</p>
          <p className="text-muted-foreground mt-2">{question.word.pronunciation}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="answer">한글 뜻</Label>
            <Input
              id="answer"
              type="text"
              placeholder="한글 뜻을 입력하세요"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              autoFocus
              autoComplete="off"
            />
          </div>
          <Button type="submit" className="w-full" disabled={!answer.trim()}>
            제출
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
