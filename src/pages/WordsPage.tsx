import { useState, useMemo } from 'react'
import { useWords } from '@/hooks/useWords'
import { useWordContext } from '@/contexts/WordContext'
import WordInputForm from '@/components/common/WordInputForm'
import WordList from '@/components/common/WordList'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export default function WordsPage() {
  const { words } = useWords()
  const { vocabularyBooks } = useWordContext()
  const [selectedBookId, setSelectedBookId] = useState<string>('')

  // 선택된 단어장의 단어들 필터링
  const filteredWords = useMemo(() => {
    if (!selectedBookId) return []
    return words.filter((word) => word.vocabularyBookId === selectedBookId)
  }, [words, selectedBookId])

  // 첫 번째 단어장을 기본으로 선택
  useMemo(() => {
    if (!selectedBookId && vocabularyBooks.length > 0) {
      setSelectedBookId(vocabularyBooks[0].id)
    }
  }, [vocabularyBooks, selectedBookId])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">단어 관리</h1>
        <p className="text-muted-foreground">
          영어 단어를 추가하고 관리하세요.
        </p>
      </div>

      {vocabularyBooks.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500 mb-4">
            등록된 단어장이 없습니다.
            <br />
            먼저 단어장을 생성해주세요.
          </p>
          <a
            href="/vocabulary-books"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            단어장 만들러 가기
          </a>
        </Card>
      ) : (
        <>
          {/* 단어장 선택 */}
          <Card className="p-4">
            <div className="space-y-2">
              <Label htmlFor="book-select">단어장 선택</Label>
              <select
                id="book-select"
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                {vocabularyBooks.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          {/* 단어 입력 폼 */}
          {selectedBookId && <WordInputForm vocabularyBookId={selectedBookId} />}

          {/* 단어 목록 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              단어 목록 ({filteredWords.length}개)
            </h2>
            <WordList words={filteredWords} />
          </div>
        </>
      )}
    </div>
  )
}
