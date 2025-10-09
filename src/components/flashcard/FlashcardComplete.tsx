import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface FlashcardStats {
  totalCards: number;
  studyTime: number; // in seconds
  typeBreakdown: {
    type1: number;
    type2: number;
    type3: number;
  };
}

interface FlashcardCompleteProps {
  stats: FlashcardStats;
  onGoHome: () => void;
  onRestart: () => void;
}

export function FlashcardComplete({ stats, onGoHome, onRestart }: FlashcardCompleteProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}분 ${secs}초`;
    }
    return `${secs}초`;
  };

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <Card className="border-2 border-green-500">
        <CardHeader className="text-center">
          <div className="mb-4 text-6xl">🎉</div>
          <CardTitle className="text-3xl text-green-600">축하합니다!</CardTitle>
          <CardDescription className="text-lg">
            모든 단어를 학습했습니다!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 전체 통계 */}
          <div className="rounded-lg bg-muted p-4">
            <h3 className="mb-3 text-lg font-semibold">학습 통계</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">총 학습한 문제 수:</span>
                <span className="font-bold">{stats.totalCards}개</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">학습 시간:</span>
                <span className="font-bold">{formatTime(stats.studyTime)}</span>
              </div>
            </div>
          </div>

          {/* 유형별 통계 */}
          <div className="rounded-lg bg-muted p-4">
            <h3 className="mb-3 text-lg font-semibold">유형별 학습 단어 수</h3>
            <div className="grid grid-cols-2 gap-3">
              {stats.typeBreakdown.type1 > 0 && (
                <div className="rounded bg-background p-3">
                  <div className="text-sm text-muted-foreground">유형 1 (발음 → 단어+뜻)</div>
                  <div className="text-xl font-bold">{stats.typeBreakdown.type1}개</div>
                </div>
              )}
              {stats.typeBreakdown.type2 > 0 && (
                <div className="rounded bg-background p-3">
                  <div className="text-sm text-muted-foreground">유형 2 (단어 → 뜻)</div>
                  <div className="text-xl font-bold">{stats.typeBreakdown.type2}개</div>
                </div>
              )}
              {stats.typeBreakdown.type3 > 0 && (
                <div className="rounded bg-background p-3">
                  <div className="text-sm text-muted-foreground">유형 3 (뜻 → 단어)</div>
                  <div className="text-xl font-bold">{stats.typeBreakdown.type3}개</div>
                </div>
              )}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3">
            <Button onClick={onGoHome} variant="outline" className="flex-1">
              홈으로
            </Button>
            <Button onClick={onRestart} className="flex-1">
              다시 학습하기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
