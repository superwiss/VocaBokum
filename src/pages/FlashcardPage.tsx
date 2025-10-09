import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWords } from '@/hooks/useWords';
import { FlashcardType, FlashcardItem } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DateRangeSelector from '@/components/quiz/DateRangeSelector';
import { FlashcardTypeSelector } from '@/components/flashcard/FlashcardTypeSelector';
import { FlashcardDisplay } from '@/components/flashcard/FlashcardDisplay';
import { FlashcardComplete } from '@/components/flashcard/FlashcardComplete';
import { generateFlashcardPool } from '@/utils/flashcardGenerator';

type Step = 'setup' | 'learning' | 'complete';

export default function FlashcardPage() {
  const navigate = useNavigate();
  const { getWordsByDateRange, getLatestWordDate } = useWords();

  // 설정 상태
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<FlashcardType[]>([1]);

  // 학습 상태
  const [step, setStep] = useState<Step>('setup');
  const [flashcardPool, setFlashcardPool] = useState<FlashcardItem[]>([]);
  const [remainingCards, setRemainingCards] = useState<FlashcardItem[]>([]);
  const [currentCard, setCurrentCard] = useState<FlashcardItem | null>(null);
  const [cardKey, setCardKey] = useState(0); // 카드 리셋을 위한 키
  const [learnedCount, setLearnedCount] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [typeBreakdown, setTypeBreakdown] = useState({
    type1: 0,
    type2: 0,
    type3: 0,
  });

  // 초기 날짜 설정
  useEffect(() => {
    const latestDate = getLatestWordDate();
    if (latestDate) {
      setStartDate(latestDate);
      setEndDate(latestDate);
    }
  }, [getLatestWordDate]);

  // 학습 시작
  const handleStartLearning = () => {
    const words = getWordsByDateRange(startDate, endDate);

    if (words.length === 0) {
      alert('선택한 날짜 범위에 단어가 없습니다.');
      return;
    }

    if (selectedTypes.length === 0) {
      alert('최소 1개의 유형을 선택해야 합니다.');
      return;
    }

    const pool = generateFlashcardPool(words, selectedTypes);
    setFlashcardPool(pool);
    setRemainingCards([...pool]);
    setCurrentCard(pool[0]);
    setLearnedCount(0);
    setStartTime(Date.now());
    setTypeBreakdown({ type1: 0, type2: 0, type3: 0 });
    setStep('learning');
  };

  // O 선택 (외웠음) - FlashcardDisplay에서 호출
  const handleKnown = () => {
    if (!currentCard) return;

    // 유형별 통계 업데이트
    const newBreakdown = { ...typeBreakdown };
    if (currentCard.type === 1) newBreakdown.type1++;
    else if (currentCard.type === 2) newBreakdown.type2++;
    else if (currentCard.type === 3) newBreakdown.type3++;
    setTypeBreakdown(newBreakdown);

    setLearnedCount((prev) => prev + 1);

    // 현재 카드를 풀에서 제거
    const newRemaining = remainingCards.filter((card) => card.id !== currentCard.id);
    setRemainingCards(newRemaining);

    // 다음 카드로 이동 또는 완료
    if (newRemaining.length === 0) {
      setStep('complete');
    } else {
      // 랜덤하게 다음 카드 선택
      const randomIndex = Math.floor(Math.random() * newRemaining.length);
      setCurrentCard(newRemaining[randomIndex]);
      setCardKey((prev) => prev + 1); // 카드 리셋을 위해 키 변경
    }
  };

  // X 선택 (아직 모름) - FlashcardDisplay에서 호출
  const handleUnknown = () => {
    if (!currentCard) return;

    // 현재 카드는 풀에 유지
    // 다음 카드로 이동 (현재 카드도 포함)
    const randomIndex = Math.floor(Math.random() * remainingCards.length);
    setCurrentCard(remainingCards[randomIndex]);
    setCardKey((prev) => prev + 1); // 카드 리셋을 위해 키 변경 (마지막 카드일 때도 리셋됨)
  };

  // 다시 학습하기
  const handleRestart = () => {
    setStep('setup');
    setFlashcardPool([]);
    setRemainingCards([]);
    setCurrentCard(null);
    setLearnedCount(0);
    setTypeBreakdown({ type1: 0, type2: 0, type3: 0 });
  };

  // 홈으로
  const handleGoHome = () => {
    navigate('/');
  };

  // 설정 단계 렌더링
  if (step === 'setup') {
    const words = getWordsByDateRange(startDate, endDate);
    const totalCards = words.length * selectedTypes.length;

    return (
      <div className="container mx-auto max-w-4xl p-4">
        <Card>
          <CardHeader>
            <CardTitle>플래시 카드 학습</CardTitle>
            <CardDescription>
              단어를 빠르게 암기했는지 확인하는 학습 방식입니다. O(외웠음) 또는 X(모름)를 선택하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 날짜 범위 선택 */}
            <DateRangeSelector
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              wordCount={words.length}
            />

            {/* 유형 선택 */}
            <FlashcardTypeSelector
              selectedTypes={selectedTypes}
              onTypesChange={setSelectedTypes}
            />

            {/* 학습 정보 */}
            <div className="rounded-lg bg-muted p-4">
              <h3 className="mb-2 text-sm font-semibold">학습 정보</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• 선택한 단어 수: {words.length}개</p>
                <p>• 총 학습할 문제 수: {totalCards}개</p>
                <p>• 채점 방식: 즉시 확인 (고정)</p>
                <p>• 키보드 단축키: O (외웠음), X (모름)</p>
              </div>
            </div>

            {/* 학습 시작 버튼 */}
            <Button
              onClick={handleStartLearning}
              className="w-full"
              size="lg"
              disabled={words.length === 0 || selectedTypes.length === 0}
            >
              학습 시작
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 학습 단계 렌더링
  if (step === 'learning' && currentCard) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <FlashcardDisplay
          key={cardKey}
          card={currentCard}
          onKnown={handleKnown}
          onUnknown={handleUnknown}
          learnedCount={learnedCount}
          remainingCount={remainingCards.length}
          totalCount={flashcardPool.length}
        />
      </div>
    );
  }

  // 완료 단계 렌더링
  if (step === 'complete') {
    const studyTime = Math.floor((Date.now() - startTime) / 1000);
    const stats = {
      totalCards: flashcardPool.length,
      studyTime,
      typeBreakdown,
    };

    return <FlashcardComplete stats={stats} onGoHome={handleGoHome} onRestart={handleRestart} />;
  }

  return null;
}
