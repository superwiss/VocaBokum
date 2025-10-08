import { useState } from 'react'
import { Word } from '@/types/word'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useWords } from '@/hooks/useWords'
import { speechService } from '@/services/speechService'
import { toast } from 'sonner'

interface WordListProps {
  words: Word[]
}

export default function WordList({ words }: WordListProps) {
  const { deleteWord } = useWords()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [wordToDelete, setWordToDelete] = useState<Word | null>(null)

  const handlePlayPronunciation = async (word: Word) => {
    try {
      if (!speechService.isSupported()) {
        toast.error('이 브라우저는 음성 재생을 지원하지 않습니다.')
        return
      }

      await speechService.speak(word.word)
    } catch (error) {
      toast.error('발음 재생에 실패했습니다.')
    }
  }

  const handleDeleteClick = (word: Word) => {
    setWordToDelete(word)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (wordToDelete) {
      deleteWord(wordToDelete.id)
      toast.success(`"${wordToDelete.word}" 단어가 삭제되었습니다.`)
      setDeleteDialogOpen(false)
      setWordToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setWordToDelete(null)
  }

  if (words.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            등록된 단어가 없습니다. 위에서 단어를 추가해보세요.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {words.map((word) => (
          <Card key={word.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{word.word}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePlayPronunciation(word)}
                  title="발음 듣기"
                >
                  🔊
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">발음</p>
                  <p className="text-sm">{word.pronunciation}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">뜻</p>
                  <ul className="text-sm list-disc list-inside">
                    {word.meanings.slice(0, 3).map((meaning, idx) => (
                      <li key={idx} className="truncate" title={meaning}>
                        {meaning}
                      </li>
                    ))}
                    {word.meanings.length > 3 && (
                      <li className="text-muted-foreground">
                        +{word.meanings.length - 3}개 더
                      </li>
                    )}
                  </ul>
                </div>
                <div className="pt-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => handleDeleteClick(word)}
                  >
                    삭제
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>단어 삭제</DialogTitle>
            <DialogDescription>
              "{wordToDelete?.word}" 단어를 삭제하시겠습니까? 이 작업은 되돌릴 수
              없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
