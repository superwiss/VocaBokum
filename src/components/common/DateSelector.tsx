import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DateSelectorProps {
  selectedDate: string
  onDateChange: (date: string) => void
  wordCount: number
}

export default function DateSelector({
  selectedDate,
  onDateChange,
  wordCount,
}: DateSelectorProps) {
  const handleTodayClick = () => {
    const today = new Date().toISOString().split('T')[0]
    onDateChange(today)
  }

  return (
    <div className="flex items-end gap-4">
      <div className="flex-1">
        <Label htmlFor="date">날짜 선택</Label>
        <Input
          id="date"
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
        />
      </div>
      <Button variant="outline" onClick={handleTodayClick}>
        오늘
      </Button>
      <div className="text-sm text-muted-foreground whitespace-nowrap">
        {wordCount}개의 단어
      </div>
    </div>
  )
}
