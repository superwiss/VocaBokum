import { useState } from 'react'
import { useWordContext } from '@/contexts/WordContext'
import { VocabularyBook } from '@/types/vocabularyBook'
import { VocabularyBookForm } from '@/components/vocabulary/VocabularyBookForm'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function VocabularyBooksPage() {
  const { vocabularyBooks, words, dispatch } = useWordContext()
  const [editingBook, setEditingBook] = useState<VocabularyBook | null>(null)
  const [showForm, setShowForm] = useState(false)

  const handleCreateBook = (bookData: Omit<VocabularyBook, 'id' | 'createdDate'>) => {
    const newBook: VocabularyBook = {
      id: `book_${Date.now()}`,
      createdDate: new Date().toISOString(),
      ...bookData,
    }

    dispatch({ type: 'ADD_VOCABULARY_BOOK', payload: newBook })
    setShowForm(false)
  }

  const handleUpdateBook = (bookData: Omit<VocabularyBook, 'id' | 'createdDate'>) => {
    if (!editingBook) return

    const updatedBook: VocabularyBook = {
      ...editingBook,
      ...bookData,
    }

    dispatch({ type: 'UPDATE_VOCABULARY_BOOK', payload: updatedBook })
    setEditingBook(null)
  }

  const handleDeleteBook = (bookId: string) => {
    const wordCount = words.filter((w) => w.vocabularyBookId === bookId).length
    const message =
      wordCount > 0
        ? `이 단어장에는 ${wordCount}개의 단어가 있습니다.\n단어장을 삭제하면 모든 단어도 함께 삭제됩니다.\n정말 삭제하시겠습니까?`
        : '이 단어장을 삭제하시겠습니까?'

    if (window.confirm(message)) {
      dispatch({ type: 'DELETE_VOCABULARY_BOOK', payload: bookId })
    }
  }

  const getWordCount = (bookId: string) => {
    return words.filter((w) => w.vocabularyBookId === bookId).length
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">단어장 관리</h1>
        <p className="text-gray-600">단어장을 생성하고 관리합니다.</p>
      </div>

      {/* 새 단어장 생성 */}
      <div className="mb-6">
        {!showForm && !editingBook && (
          <Button onClick={() => setShowForm(true)}>+ 새 단어장 만들기</Button>
        )}

        {showForm && (
          <VocabularyBookForm
            onSubmit={handleCreateBook}
            onCancel={() => setShowForm(false)}
          />
        )}

        {editingBook && (
          <div>
            <h3 className="text-lg font-semibold mb-2">단어장 수정</h3>
            <VocabularyBookForm
              initialData={editingBook}
              onSubmit={handleUpdateBook}
              onCancel={() => setEditingBook(null)}
            />
          </div>
        )}
      </div>

      {/* 단어장 목록 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">내 단어장 ({vocabularyBooks.length})</h2>

        {vocabularyBooks.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            아직 생성된 단어장이 없습니다.
            <br />
            위의 버튼을 눌러 새 단어장을 만들어보세요.
          </Card>
        ) : (
          vocabularyBooks.map((book) => (
            <Card key={book.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{book.title}</h3>
                  {book.description && (
                    <p className="text-sm text-gray-600 mt-1">{book.description}</p>
                  )}
                  <div className="mt-2 text-sm text-gray-500">
                    <span>단어 수: {getWordCount(book.id)}개</span>
                    <span className="mx-2">•</span>
                    <span>
                      생성일: {new Date(book.createdDate).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingBook(book)}
                    disabled={!!editingBook || showForm}
                  >
                    수정
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteBook(book.id)}
                    disabled={!!editingBook || showForm}
                  >
                    삭제
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
