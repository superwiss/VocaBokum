import { QuestionType } from '@/types/word'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface QuizTypeSelectorProps {
  selectedTypes: QuestionType[]
  onTypesChange: (types: QuestionType[]) => void
}

const typeDescriptions: Record<QuestionType, string> = {
  1: '발음 듣고 한글 뜻 입력',
  2: '발음 듣고 영어 단어 입력',
  3: '영어 단어 보고 한글 뜻 입력',
  4: '한글 뜻 보고 영어 단어 입력',
}

export default function QuizTypeSelector({ selectedTypes, onTypesChange }: QuizTypeSelectorProps) {
  const allTypes: QuestionType[] = [1, 2, 3, 4]

  const handleTypeToggle = (type: QuestionType) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type].sort()

    // 최소 1개 유형은 선택되어야 함
    if (newTypes.length > 0) {
      onTypesChange(newTypes)
    }
  }

  const handleSelectAll = () => {
    onTypesChange(allTypes)
  }

  const handleDeselectAll = () => {
    // 모두 해제 시 유형 1만 남김 (최소 1개 선택 보장)
    onTypesChange([1])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>시험 유형 선택</CardTitle>
        <CardDescription>출제할 문제 유형을 선택하세요 (최소 1개)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {allTypes.map((type) => (
            <div key={type} className="flex items-center space-x-3">
              <Checkbox
                id={`type-${type}`}
                checked={selectedTypes.includes(type)}
                onCheckedChange={() => handleTypeToggle(type)}
              />
              <Label
                htmlFor={`type-${type}`}
                className="text-sm font-normal cursor-pointer flex-1"
              >
                유형 {type}: {typeDescriptions[type]}
              </Label>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={selectedTypes.length === allTypes.length}
            className="flex-1"
          >
            모두 선택
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeselectAll}
            disabled={selectedTypes.length === 1 && selectedTypes[0] === 1}
            className="flex-1"
          >
            모두 해제
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          선택된 유형: {selectedTypes.length}개
        </p>
      </CardContent>
    </Card>
  )
}
