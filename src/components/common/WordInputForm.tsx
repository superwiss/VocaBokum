import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useWords } from '@/hooks/useWords'
import { dictionaryService } from '@/services/dictionaryService'
import { toast } from 'sonner'

export default function WordInputForm() {
  const [word, setWord] = useState('')
  const [meanings, setMeanings] = useState('')
  const [loading, setLoading] = useState(false)
  const { addWord, words } = useWords()
  const wordInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedWord = word.trim()
    const trimmedMeanings = meanings.trim()

    if (!trimmedWord) {
      toast.error('영어 단어를 입력해주세요.')
      return
    }

    if (!trimmedMeanings) {
      toast.error('한글 뜻을 입력해주세요.')
      return
    }

    if (!dictionaryService.isValidWord(trimmedWord)) {
      toast.error('올바른 영어 단어를 입력해주세요.')
      return
    }

    // 중복 체크
    const isDuplicate = words.some(
      (w) => w.word.toLowerCase() === trimmedWord.toLowerCase()
    )

    if (isDuplicate) {
      toast.error('이미 추가된 단어입니다.')
      return
    }

    setLoading(true)

    try {
      // 발음 및 오디오 URL API에서 가져오기
      const result = await dictionaryService.fetchPronunciation(trimmedWord)

      // 한글 뜻은 쉼표로 분리
      const meaningsList = trimmedMeanings
        .split(',')
        .map((m) => m.trim())
        .filter((m) => m.length > 0)

      if (meaningsList.length === 0) {
        toast.error('한글 뜻을 입력해주세요.')
        return
      }

      const newWord = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        word: trimmedWord,
        meanings: meaningsList,
        pronunciation: result.pronunciation,
        audioUrl: result.audioUrl,
        addedDate: new Date().toISOString(),
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

      addWord(newWord)
      toast.success(`"${trimmedWord}" 단어가 추가되었습니다.`)
      setWord('')
      setMeanings('')
      // 영어 단어 입력 필드로 포커스 이동 (약간의 지연 필요)
      setTimeout(() => {
        wordInputRef.current?.focus()
      }, 0)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('단어 추가에 실패했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>새 단어 추가</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="word">영어 단어</Label>
              <Input
                ref={wordInputRef}
                id="word"
                type="text"
                placeholder="예: hello"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                disabled={loading}
                autoComplete="off"
              />
            </div>
            <div>
              <Label htmlFor="meanings">한글 뜻 (쉼표로 구분)</Label>
              <Input
                id="meanings"
                type="text"
                placeholder="예: 안녕, 인사"
                value={meanings}
                onChange={(e) => setMeanings(e.target.value)}
                disabled={loading}
                autoComplete="off"
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full md:w-auto">
            {loading ? '추가 중...' : '추가'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
