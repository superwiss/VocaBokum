import { useState, useMemo } from 'react'
import { useWords } from '@/hooks/useWords'
import WordInputForm from '@/components/common/WordInputForm'
import WordList from '@/components/common/WordList'
import DateSelector from '@/components/common/DateSelector'

export default function WordsPage() {
  const { words } = useWords()
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  const filteredWords = useMemo(() => {
    return words.filter((word) => word.addedDate.startsWith(selectedDate))
  }, [words, selectedDate])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">단어 관리</h1>
        <p className="text-muted-foreground">
          영어 단어를 추가하고 관리하세요.
        </p>
      </div>

      <WordInputForm />

      <div className="space-y-4">
        <DateSelector
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          wordCount={filteredWords.length}
        />

        <WordList words={filteredWords} />
      </div>
    </div>
  )
}
