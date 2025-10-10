import { useState } from 'react'
import { VocabularyBook } from '@/types/vocabularyBook'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

interface VocabularyBookFormProps {
  onSubmit: (book: Omit<VocabularyBook, 'id' | 'createdDate'>) => void
  initialData?: VocabularyBook
  onCancel?: () => void
}

export function VocabularyBookForm({ onSubmit, initialData, onCancel }: VocabularyBookFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      alert('단어장 제목을 입력해주세요.')
      return
    }

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
    })

    // 새로 생성하는 경우만 폼 초기화
    if (!initialData) {
      setTitle('')
      setDescription('')
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">단어장 제목 *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: TOEFL 필수 단어"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">설명 (선택)</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="단어장에 대한 간단한 설명"
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit">{initialData ? '수정' : '생성'}</Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
}
