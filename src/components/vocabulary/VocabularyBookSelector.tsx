import { useWordContext } from '@/contexts/WordContext'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

interface VocabularyBookSelectorProps {
  selectedBookIds: string[]
  onSelectionChange: (bookIds: string[]) => void
  showWordCount?: boolean
}

export function VocabularyBookSelector({
  selectedBookIds,
  onSelectionChange,
  showWordCount = true,
}: VocabularyBookSelectorProps) {
  const { vocabularyBooks, words } = useWordContext()

  const handleToggle = (bookId: string) => {
    if (selectedBookIds.includes(bookId)) {
      onSelectionChange(selectedBookIds.filter((id) => id !== bookId))
    } else {
      onSelectionChange([...selectedBookIds, bookId])
    }
  }

  const handleSelectAll = () => {
    if (selectedBookIds.length === vocabularyBooks.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(vocabularyBooks.map((book) => book.id))
    }
  }

  const getWordCount = (bookId: string) => {
    return words.filter((w) => w.vocabularyBookId === bookId).length
  }

  const getTotalWordCount = () => {
    return words.filter((w) => selectedBookIds.includes(w.vocabularyBookId)).length
  }

  if (vocabularyBooks.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-center text-gray-500">
          등록된 단어장이 없습니다.
          <br />
          먼저 단어장을 생성해주세요.
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-base font-semibold">단어장 선택</Label>
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {selectedBookIds.length === vocabularyBooks.length ? '전체 해제' : '전체 선택'}
          </button>
        </div>

        <div className="space-y-2">
          {vocabularyBooks.map((book) => {
            const wordCount = getWordCount(book.id)
            const isSelected = selectedBookIds.includes(book.id)

            return (
              <div
                key={book.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleToggle(book.id)}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(book.id)}
                    className="mt-1"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{book.title}</h4>
                    {book.description && (
                      <p className="text-sm text-gray-600 mt-0.5">{book.description}</p>
                    )}
                    {showWordCount && (
                      <p className="text-xs text-gray-500 mt-1">단어 수: {wordCount}개</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {selectedBookIds.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm text-gray-600">
              선택된 단어장: {selectedBookIds.length}개 • 총 단어 수: {getTotalWordCount()}개
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
