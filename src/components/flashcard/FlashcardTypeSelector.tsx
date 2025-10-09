import { FlashcardType } from '@/types/flashcard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface FlashcardTypeSelectorProps {
  selectedTypes: FlashcardType[];
  onTypesChange: (types: FlashcardType[]) => void;
}

const flashcardTypeDescriptions: Record<FlashcardType, string> = {
  1: '발음 듣고 영어 단어와 한글 뜻 연상하기',
  2: '영어 단어 보고 한글 뜻 연상하기',
  3: '한글 뜻 보고 영어 단어 연상하기',
};

export function FlashcardTypeSelector({ selectedTypes, onTypesChange }: FlashcardTypeSelectorProps) {
  const handleTypeToggle = (type: FlashcardType) => {
    const isSelected = selectedTypes.includes(type);

    if (isSelected) {
      // 최소 1개는 선택되어야 함
      if (selectedTypes.length > 1) {
        onTypesChange(selectedTypes.filter(t => t !== type));
      }
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  const handleSelectAll = () => {
    onTypesChange([1, 2, 3]);
  };

  const handleDeselectAll = () => {
    // 최소 1개는 선택되어야 하므로 유형 1만 남김
    onTypesChange([1]);
  };

  const allSelected = selectedTypes.length === 3;

  return (
    <Card>
      <CardHeader>
        <CardTitle>학습 유형 선택</CardTitle>
        <CardDescription>
          학습할 유형을 선택하세요. 최소 1개 이상 선택해야 합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={handleSelectAll}
            disabled={allSelected}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            모두 선택
          </button>
          <button
            type="button"
            onClick={handleDeselectAll}
            disabled={selectedTypes.length === 1}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            모두 해제
          </button>
        </div>

        <div className="space-y-3">
          {([1, 2, 3] as FlashcardType[]).map(type => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type}`}
                checked={selectedTypes.includes(type)}
                onCheckedChange={() => handleTypeToggle(type)}
              />
              <Label htmlFor={`type-${type}`} className="cursor-pointer">
                유형 {type}: {flashcardTypeDescriptions[type]}
              </Label>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-600 mt-4">
          선택된 유형: {selectedTypes.length}개
        </p>
      </CardContent>
    </Card>
  );
}
