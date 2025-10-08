import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export type GradingMode = 'immediate' | 'batch'

interface GradingModeSelectorProps {
  selectedMode: GradingMode
  onModeChange: (mode: GradingMode) => void
}

const modeDescriptions: Record<GradingMode, { title: string; description: string }> = {
  immediate: {
    title: '즉시 채점 모드',
    description: '문제를 풀 때마다 정답/오답 여부를 바로 확인하고, 모든 문제를 풀면 총점을 표시합니다.',
  },
  batch: {
    title: '일괄 채점 모드',
    description: '모든 문제를 푼 후 한꺼번에 채점 결과(문제별 정답/오답, 총점)를 표시합니다.',
  },
}

export default function GradingModeSelector({
  selectedMode,
  onModeChange,
}: GradingModeSelectorProps) {
  const modes: GradingMode[] = ['immediate', 'batch']

  return (
    <Card>
      <CardHeader>
        <CardTitle>채점 방식 선택</CardTitle>
        <CardDescription>문제 채점 방식을 선택하세요</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {modes.map((mode) => (
          <div key={mode} className="flex items-start space-x-3">
            <input
              type="radio"
              id={`mode-${mode}`}
              name="grading-mode"
              value={mode}
              checked={selectedMode === mode}
              onChange={() => onModeChange(mode)}
              className="mt-1 h-4 w-4 cursor-pointer"
            />
            <Label
              htmlFor={`mode-${mode}`}
              className="cursor-pointer flex-1 font-normal"
            >
              <div className="font-medium">{modeDescriptions[mode].title}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {modeDescriptions[mode].description}
              </div>
            </Label>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
