import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QuizQuestion } from '@/types/quiz'
import { speechService } from '@/services/speechService'
import { toast } from 'sonner'

interface Type2QuestionNewProps {
  question: QuizQuestion
  onSubmit: (answer: string) => void
}

export default function Type2QuestionNew({ question, onSubmit }: Type2QuestionNewProps) {
  const [answer, setAnswer] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlayPronunciation = async () => {
    try {
      if (!speechService.isSupported()) {
        toast.error('이 브라우저는 음성 재생을 지원하지 않습니다.')
        return
      }

      setIsPlaying(true)
      // audioUrl이 있으면 실제 오디오 재생, 없으면 TTS 사용
      await speechService.playWord(question.word.word, question.word.audioUrl)
    } catch (error) {
      toast.error('발음 재생에 실패했습니다.')
    } finally {
      setIsPlaying(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (answer.trim()) {
      onSubmit(answer.trim())
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>유형 2: 발음을 듣고 영어 단어를 입력하세요</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handlePlayPronunciation}
            disabled={isPlaying}
            className="text-4xl px-8 py-8"
          >
            {isPlaying ? '재생 중...' : '🔊 발음 듣기'}
          </Button>
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
