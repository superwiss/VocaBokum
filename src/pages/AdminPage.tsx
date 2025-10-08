import { useState, useMemo } from 'react'
import { useWords } from '@/hooks/useWords'
import { useWordContext } from '@/contexts/WordContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function AdminPage() {
  const { words } = useWords()
  const { dispatch } = useWordContext()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // 리셋 다이얼로그 상태
  const [resetDialog, setResetDialog] = useState<{
    open: boolean
    type: 'all' | 'date' | 'word'
    date?: string
    wordId?: string
    wordName?: string
  }>({ open: false, type: 'all' })

  // 날짜별로 단어 그룹화
  const wordsByDate = useMemo(() => {
    const grouped = new Map<string, typeof words>()

    words.forEach((word) => {
      const date = word.addedDate.split('T')[0]
      if (!grouped.has(date)) {
        grouped.set(date, [])
      }
      grouped.get(date)!.push(word)
    })

    // 날짜 역순 정렬 (최신순)
    return new Map(
      Array.from(grouped.entries()).sort((a, b) => b[0].localeCompare(a[0]))
    )
  }, [words])

  // 전체 통계 계산
  const overallStats = useMemo(() => {
    let totalAttempts = 0
    let totalCorrect = 0
    let type1Attempts = 0
    let type1Correct = 0
    let type2Attempts = 0
    let type2Correct = 0
    let type3Attempts = 0
    let type3Correct = 0
    let type4Attempts = 0
    let type4Correct = 0

    words.forEach((word) => {
      type1Attempts += word.stats.type1Attempts
      type1Correct += word.stats.type1Correct
      type2Attempts += word.stats.type2Attempts
      type2Correct += word.stats.type2Correct
      type3Attempts += word.stats.type3Attempts
      type3Correct += word.stats.type3Correct
      type4Attempts += word.stats.type4Attempts
      type4Correct += word.stats.type4Correct
    })

    totalAttempts = type1Attempts + type2Attempts + type3Attempts + type4Attempts
    totalCorrect = type1Correct + type2Correct + type3Correct + type4Correct

    const type1Rate = type1Attempts > 0 ? Math.round((type1Correct / type1Attempts) * 100) : 0
    const type2Rate = type2Attempts > 0 ? Math.round((type2Correct / type2Attempts) * 100) : 0
    const type3Rate = type3Attempts > 0 ? Math.round((type3Correct / type3Attempts) * 100) : 0
    const type4Rate = type4Attempts > 0 ? Math.round((type4Correct / type4Attempts) * 100) : 0
    const overallRate = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0

    return {
      totalWords: words.length,
      totalAttempts,
      totalCorrect,
      overallRate,
      type1: { attempts: type1Attempts, correct: type1Correct, rate: type1Rate },
      type2: { attempts: type2Attempts, correct: type2Correct, rate: type2Rate },
      type3: { attempts: type3Attempts, correct: type3Correct, rate: type3Rate },
      type4: { attempts: type4Attempts, correct: type4Correct, rate: type4Rate },
    }
  }, [words])

  // 단어별 통계 계산 함수
  const getWordStats = (word: typeof words[0]) => {
    const totalAttempts =
      word.stats.type1Attempts + word.stats.type2Attempts + word.stats.type3Attempts + word.stats.type4Attempts
    const totalCorrect =
      word.stats.type1Correct + word.stats.type2Correct + word.stats.type3Correct + word.stats.type4Correct
    const overallRate = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0

    const type1Rate =
      word.stats.type1Attempts > 0
        ? Math.round((word.stats.type1Correct / word.stats.type1Attempts) * 100)
        : 0
    const type2Rate =
      word.stats.type2Attempts > 0
        ? Math.round((word.stats.type2Correct / word.stats.type2Attempts) * 100)
        : 0
    const type3Rate =
      word.stats.type3Attempts > 0
        ? Math.round((word.stats.type3Correct / word.stats.type3Attempts) * 100)
        : 0
    const type4Rate =
      word.stats.type4Attempts > 0
        ? Math.round((word.stats.type4Correct / word.stats.type4Attempts) * 100)
        : 0

    return { totalAttempts, totalCorrect, overallRate, type1Rate, type2Rate, type3Rate, type4Rate }
  }

  // 선택된 날짜의 단어들
  const selectedWords = selectedDate ? wordsByDate.get(selectedDate) || [] : []

  // 리셋 핸들러
  const handleResetConfirm = () => {
    if (resetDialog.type === 'all') {
      dispatch({ type: 'RESET_ALL_STATS' })
    } else if (resetDialog.type === 'date' && resetDialog.date) {
      dispatch({ type: 'RESET_DATE_STATS', payload: resetDialog.date })
    } else if (resetDialog.type === 'word' && resetDialog.wordId) {
      dispatch({ type: 'RESET_WORD_STATS', payload: resetDialog.wordId })
    }
    setResetDialog({ open: false, type: 'all' })
  }

  // 리셋 다이얼로그 열기 함수들
  const openResetAllDialog = () => {
    setResetDialog({ open: true, type: 'all' })
  }

  const openResetDateDialog = (date: string) => {
    setResetDialog({ open: true, type: 'date', date })
  }

  const openResetWordDialog = (wordId: string, wordName: string) => {
    setResetDialog({ open: true, type: 'word', wordId, wordName })
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">통계 및 관리</h1>
        <p className="text-muted-foreground">단어 학습 통계를 확인하세요.</p>
      </div>

      {/* 전체 통계 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>전체 통계</CardTitle>
              <CardDescription>모든 단어에 대한 종합 통계입니다.</CardDescription>
            </div>
            <Button variant="destructive" size="sm" onClick={openResetAllDialog}>
              전체 리셋
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">총 단어 수</p>
              <p className="text-3xl font-bold">{overallStats.totalWords}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">전체 시도</p>
              <p className="text-3xl font-bold">{overallStats.totalAttempts}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">정답 수</p>
              <p className="text-3xl font-bold text-green-600">{overallStats.totalCorrect}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">전체 정답률</p>
              <p className="text-3xl font-bold text-primary">{overallStats.overallRate}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center border rounded p-4">
              <p className="text-sm text-muted-foreground mb-2">유형 1 (듣고 한글 뜻)</p>
              <p className="text-2xl font-semibold">{overallStats.type1.rate}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {overallStats.type1.correct}/{overallStats.type1.attempts}
              </p>
            </div>
            <div className="text-center border rounded p-4">
              <p className="text-sm text-muted-foreground mb-2">유형 2 (듣고 영어 단어)</p>
              <p className="text-2xl font-semibold">{overallStats.type2.rate}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {overallStats.type2.correct}/{overallStats.type2.attempts}
              </p>
            </div>
            <div className="text-center border rounded p-4">
              <p className="text-sm text-muted-foreground mb-2">유형 3 (단어→뜻)</p>
              <p className="text-2xl font-semibold">{overallStats.type3.rate}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {overallStats.type3.correct}/{overallStats.type3.attempts}
              </p>
            </div>
            <div className="text-center border rounded p-4">
              <p className="text-sm text-muted-foreground mb-2">유형 4 (뜻→단어)</p>
              <p className="text-2xl font-semibold">{overallStats.type4.rate}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {overallStats.type4.correct}/{overallStats.type4.attempts}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 날짜별 단어 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>날짜별 단어 목록</CardTitle>
          <CardDescription>날짜를 선택하여 해당 날짜에 추가된 단어들의 통계를 확인하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          {wordsByDate.size === 0 ? (
            <p className="text-center text-muted-foreground py-8">등록된 단어가 없습니다.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {/* 날짜 목록 */}
              <div className="space-y-2 max-h-96 overflow-y-auto border rounded p-4">
                <h3 className="font-semibold mb-3">날짜 목록</h3>
                {Array.from(wordsByDate.entries()).map(([date, dateWords]) => (
                  <Button
                    key={date}
                    variant={selectedDate === date ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="flex justify-between w-full">
                      <span>{date}</span>
                      <span className="text-muted-foreground">{dateWords.length}개</span>
                    </div>
                  </Button>
                ))}
              </div>

              {/* 선택된 날짜의 단어 통계 */}
              <div className="border rounded p-4 max-h-96 overflow-y-auto">
                {selectedDate ? (
                  <>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold">{selectedDate} 단어 통계</h3>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openResetDateDialog(selectedDate)}
                      >
                        날짜 리셋
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {selectedWords.map((word) => {
                        const stats = getWordStats(word)
                        return (
                          <div key={word.id} className="border-b pb-3 last:border-0">
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <div className="font-medium">{word.word}</div>
                                <div className="text-sm text-muted-foreground">
                                  {word.meanings.join(', ')}
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openResetWordDialog(word.id, word.word)}
                              >
                                리셋
                              </Button>
                            </div>
                            <div className="grid grid-cols-5 gap-2 text-xs">
                              <div className="text-center">
                                <p className="text-muted-foreground">전체</p>
                                <p className="font-semibold">{stats.overallRate}%</p>
                                <p className="text-muted-foreground">
                                  {stats.totalCorrect}/{stats.totalAttempts}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-muted-foreground">유형1</p>
                                <p className="font-semibold">{stats.type1Rate}%</p>
                                <p className="text-muted-foreground">
                                  {word.stats.type1Correct}/{word.stats.type1Attempts}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-muted-foreground">유형2</p>
                                <p className="font-semibold">{stats.type2Rate}%</p>
                                <p className="text-muted-foreground">
                                  {word.stats.type2Correct}/{word.stats.type2Attempts}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-muted-foreground">유형3</p>
                                <p className="font-semibold">{stats.type3Rate}%</p>
                                <p className="text-muted-foreground">
                                  {word.stats.type3Correct}/{word.stats.type3Attempts}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-muted-foreground">유형4</p>
                                <p className="font-semibold">{stats.type4Rate}%</p>
                                <p className="text-muted-foreground">
                                  {word.stats.type4Correct}/{word.stats.type4Attempts}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-12">
                    날짜를 선택하여 단어 통계를 확인하세요.
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 리셋 확인 다이얼로그 */}
      <AlertDialog open={resetDialog.open} onOpenChange={(open: boolean) => setResetDialog({ ...resetDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>통계 리셋 확인</AlertDialogTitle>
            <AlertDialogDescription>
              {resetDialog.type === 'all' && (
                <>
                  <strong>모든 단어</strong>의 통계 데이터를 초기화합니다.
                  <br />
                  단어는 삭제되지 않으며, 통계 데이터만 0으로 리셋됩니다.
                </>
              )}
              {resetDialog.type === 'date' && (
                <>
                  <strong>{resetDialog.date}</strong>에 등록된 모든 단어의 통계 데이터를 초기화합니다.
                  <br />
                  단어는 삭제되지 않으며, 통계 데이터만 0으로 리셋됩니다.
                </>
              )}
              {resetDialog.type === 'word' && (
                <>
                  <strong>{resetDialog.wordName}</strong> 단어의 통계 데이터를 초기화합니다.
                  <br />
                  단어는 삭제되지 않으며, 통계 데이터만 0으로 리셋됩니다.
                </>
              )}
              <br />
              <br />
              이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              리셋
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
