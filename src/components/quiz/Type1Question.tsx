import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QuizQuestion } from '@/types/quiz'
import { speechService } from '@/services/speechService'
import { toast } from 'sonner'

interface Type1QuestionProps {
  question: QuizQuestion
  onSubmit: (answer: string) => void
}

export default function Type1Question({ question, onSubmit }: Type1QuestionProps) {
  const [answer, setAnswer] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)

  // 문제 진입 시 자동으로 발음 재생
  useEffect(() => {
    const playAudio = async () => {
      try {
        if (!speechService.isSupported()) {
          return
        }
        setIsPlaying(true)
        await speechService.playWord(question.word.word, question.word.audioUrl)
      } catch (error) {
        // 자동 재생 실패 시 조용히 처리 (사용자가 수동으로 재생 버튼 클릭 가능)
        console.error('Auto-play failed:', error)
      } finally {
        setIsPlaying(false)
      }
    }
    playAudio()
  }, [question.id, question.word.word, question.word.audioUrl])

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
        <CardTitle>유형 1: 발음을 듣고 한글 뜻을 입력하세요</CardTitle>
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
