import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface DateRangeSelectorProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  wordCount: number
}

export default function DateRangeSelector({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  wordCount,
}: DateRangeSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>시험 날짜 범위 선택</CardTitle>
        <CardDescription>
          특정 기간에 등록한 단어들을 대상으로 시험을 볼 수 있습니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">시작 날짜</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              max={endDate}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">종료 날짜</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              min={startDate}
            />
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          선택한 기간의 단어: <span className="font-medium text-foreground">{wordCount}개</span>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 팁:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>오늘 단어만 시험: 시작/종료를 오늘로 설정</li>
            <li>특정 날짜 복습: 시작/종료를 같은 날짜로 설정</li>
            <li>여러 날짜 종합: 원하는 기간 선택</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
