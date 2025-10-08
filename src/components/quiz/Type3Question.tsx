import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QuizQuestion } from '@/types/quiz'

interface Type3QuestionProps {
  question: QuizQuestion
  onSubmit: (answer: string) => void
}

export default function Type3Question({ question, onSubmit }: Type3QuestionProps) {
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
        <CardTitle>유형 3: 한글 뜻을 보고 영어 단어를 입력하세요</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted p-6 rounded-lg">
          <ul className="space-y-2">
            {question.word.meanings.map((meaning, idx) => (
              <li key={idx} className="text-lg">
                {idx + 1}. {meaning}
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="answer">영어 단어</Label>
            <Input
              id="answer"
              type="text"
              placeholder="영어 단어를 입력하세요"
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
