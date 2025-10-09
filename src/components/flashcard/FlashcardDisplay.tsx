import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FlashcardItem } from '@/types/flashcard';
import { speechService } from '@/services/speechService';

interface FlashcardDisplayProps {
  card: FlashcardItem;
  onKnown: () => void;
  onUnknown: () => void;
  learnedCount: number;
  remainingCount: number;
  totalCount: number;
}

export function FlashcardDisplay({
  card,
  onKnown,
  onUnknown,
  learnedCount,
  remainingCount,
  totalCount,
}: FlashcardDisplayProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<'known' | 'unknown' | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // 카드가 변경되면 상태 초기화
  useEffect(() => {
    setShowAnswer(false);
    setSelectedAnswer(null);

    // 유형 1은 자동으로 발음 재생
    if (card.type === 1) {
      playPronunciation();
    }
  }, [card.id]);

  const playPronunciation = async () => {
    try {
      if (!speechService.isSupported()) {
        return;
      }
      setIsPlaying(true);
      await speechService.playWord(card.word.word, card.word.audioUrl);
    } catch (error) {
      console.error('Pronunciation playback failed:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleKnown = () => {
    setSelectedAnswer('known');
    setShowAnswer(true);
  };

  const handleUnknown = () => {
    setSelectedAnswer('unknown');
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (selectedAnswer === 'known') {
      onKnown();
    } else {
      onUnknown();
    }
  };

  // 키보드 단축키
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!showAnswer) {
        if (e.key.toLowerCase() === 'o') {
          handleKnown();
        } else if (e.key.toLowerCase() === 'x') {
          handleUnknown();
        }
      } else {
        if (e.key === 'Enter') {
          handleNext();
        }
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [showAnswer, selectedAnswer]);

  const renderQuestion = () => {
    switch (card.type) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-4">
                발음을 듣고 영어 단어와 한글 뜻을 떠올려보세요
              </p>
              <Button
                size="lg"
                onClick={playPronunciation}
                disabled={isPlaying}
                className="text-4xl px-8 py-8"
              >
                {isPlaying ? '재생 중...' : '🔊 발음 듣기'}
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">
              이 단어의 한글 뜻을 떠올려보세요
            </p>
            <p className="text-6xl font-bold text-primary">{card.word.word}</p>
            <p className="text-muted-foreground">{card.word.pronunciation}</p>
          </div>
        );

      case 3:
        return (
          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">
              이 뜻에 해당하는 영어 단어를 떠올려보세요
            </p>
            <p className="text-4xl font-semibold">
              {card.word.meanings.join(', ')}
            </p>
          </div>
        );
    }
  };

  const renderAnswer = () => {
    switch (card.type) {
      case 1:
        return (
          <div className="mt-8 rounded-lg bg-green-50 dark:bg-green-950 p-6 border-2 border-green-500">
            <p className="text-sm text-muted-foreground mb-2">정답:</p>
            <p className="text-4xl font-bold text-green-700 dark:text-green-400">
              {card.word.word}
            </p>
            <p className="text-lg text-muted-foreground mt-2">
              {card.word.pronunciation}
            </p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-400 mt-4">
              {card.word.meanings.join(', ')}
            </p>
          </div>
        );

      case 2:
        return (
          <div className="mt-8 rounded-lg bg-green-50 dark:bg-green-950 p-6 border-2 border-green-500">
            <p className="text-sm text-muted-foreground mb-2">정답:</p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-400">
              {card.word.meanings.join(', ')}
            </p>
          </div>
        );

      case 3:
        return (
          <div className="mt-8 rounded-lg bg-green-50 dark:bg-green-950 p-6 border-2 border-green-500">
            <p className="text-sm text-muted-foreground mb-2">정답:</p>
            <p className="text-4xl font-bold text-green-700 dark:text-green-400">
              {card.word.word}
            </p>
            <p className="text-lg text-muted-foreground mt-2">
              {card.word.pronunciation}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* 진행률 */}
      <div className="flex items-center justify-between rounded-lg bg-muted p-4">
        <div className="text-sm">
          <span className="font-semibold">진행률:</span>{' '}
          <span className="text-muted-foreground">
            외운 카드 {learnedCount}개 / 남은 카드 {remainingCount}개
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          전체 {totalCount}개
        </div>
      </div>

      {/* 플래시 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>
            유형 {card.type} - 플래시 카드
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 문제 */}
          {renderQuestion()}

          {/* 정답 (O/X 선택 후에만 표시) */}
          {showAnswer && renderAnswer()}

          {/* O/X 버튼 또는 다음 카드 버튼 */}
          {!showAnswer ? (
            <div className="space-y-4 pt-4">
              <p className="text-center text-lg font-semibold">
                이 문제의 답을 알고 있나요?
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={handleKnown}
                  size="lg"
                  className="flex-1 bg-green-600 text-2xl font-bold hover:bg-green-700 h-20"
                >
                  O<br />
                  <span className="text-sm font-normal">(알고 있음)</span>
                </Button>
                <Button
                  onClick={handleUnknown}
                  size="lg"
                  variant="destructive"
                  className="flex-1 text-2xl font-bold h-20"
                >
                  X<br />
                  <span className="text-sm font-normal">(모르겠음)</span>
                </Button>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                키보드 단축키: O 또는 X 키를 누르세요
              </p>
            </div>
          ) : (
            <div className="pt-4">
              <Button
                onClick={handleNext}
                size="lg"
                className="w-full"
              >
                다음 카드 {selectedAnswer === 'known' ? '(외움 처리)' : '(다시 학습)'}
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-2">
                키보드 단축키: Enter 키를 누르세요
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
