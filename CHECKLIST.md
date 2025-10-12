# VocaBokum 구현 체크리스트

## Phase 1: 프로젝트 기반 설정

### 1.1 프로젝트 초기화
- [x] Vite + React + TypeScript 프로젝트 생성
  ```bash
  npm create vite@latest . -- --template react-ts
  ```
- [x] 필수 dependencies 설치
  - [x] react-router-dom
  - [ ] @radix-ui/react-* (shadcn/ui 의존성)
  - [x] tailwindcss
  - [x] class-variance-authority, clsx, tailwind-merge
- [x] Git 초기화 및 .gitignore 설정

### 1.2 shadcn/ui 설정
- [x] Tailwind CSS 설정
- [x] shadcn/ui 초기화
  ```bash
  npx shadcn-ui@latest init
  ```
- [x] 필요한 컴포넌트 설치
  - [x] button, input, card, label
  - [ ] dialog, select, toast, navigation-menu, table
  - [ ] form, separator

### 1.3 프로젝트 구조 생성
- [x] 폴더 구조 생성
  ```
  /src
    /components
      /ui (shadcn/ui 컴포넌트)
      /quiz
      /admin
      /common
    /pages
    /services
    /utils
    /types
    /hooks
    /contexts
  ```

### 1.4 라우팅 설정
- [x] React Router 설치
- [x] App.tsx에 라우팅 설정
  - [x] / (Home/Dashboard)
  - [x] /words (단어 관리)
  - [x] /quiz (시험 - 날짜 범위 선택 가능, ReviewPage 사용)
  - [x] /review (/quiz로 리다이렉트)
  - [x] /import-export (데이터 관리)
  - [x] /admin (통계)
- [x] Navigation 컴포넌트 생성
- [x] /quiz 라우트를 ReviewPage로 변경 (오늘 시험과 복습 통합)

---

## Phase 2: 핵심 데이터 레이어

### 2.1 타입 정의
- [x] `/types/word.ts` 생성
  ```typescript
  interface Word {
    id: string;
    word: string;
    meanings: string[];
    pronunciation: string;
    vocabularyBookId: string; // 단어장 ID (필수)
    addedDate?: string; // ISO 8601 (옵션, 마이그레이션 호환성)
    audioUrl?: string; // 오디오 URL (옵션)
    stats: {
      type1Attempts: number;
      type1Correct: number;
      type2Attempts: number;
      type2Correct: number;
      type3Attempts: number;
      type3Correct: number;
      type4Attempts: number;
      type4Correct: number;
    };
  }
  ```
- [x] `/types/vocabularyBook.ts` 생성
  ```typescript
  interface VocabularyBook {
    id: string;
    title: string;
    createdDate: string; // ISO 8601
    description?: string;
  }
  ```
- [x] `/types/quiz.ts` 생성
  ```typescript
  interface QuizQuestion {
    id: string;
    wordId: string;
    type: 1 | 2 | 3 | 4;
    word: Word;
  }

  interface QuizResult {
    questionId: string;
    isCorrect: boolean;
    userAnswer: string;
  }
  ```

### 2.2 로컬 스토리지 서비스
- [x] `/services/storageService.ts` 생성
  - [x] `saveWords(words: Word[]): void`
  - [x] `loadWords(): Word[]`
  - [x] `addWord(word: Word): void`
  - [x] `updateWord(word: Word): void`
  - [x] `deleteWord(id: string): void`
  - [x] `getWordsByDate(date: string): Word[]`
  - [x] `exportWords(): string` (JSON)
  - [x] `importWords(json: string): Word[]`
  - [x] 에러 처리 및 데이터 유효성 검증
  - [x] 단어장 관련 함수 추가
    - [x] `saveVocabularyBooks(books: VocabularyBook[]): void`
    - [x] `loadVocabularyBooks(): VocabularyBook[]` - 최신순(createdDate 내림차순) 정렬 포함
    - [x] `addVocabularyBook(book: VocabularyBook): void`
    - [x] `updateVocabularyBook(book: VocabularyBook): void`
    - [x] `deleteVocabularyBook(id: string): void`
    - [x] `getVocabularyBookById(id: string): VocabularyBook | undefined`
    - [x] `getWordsByVocabularyBookId(bookId: string): Word[]`
    - [x] `getWordsByVocabularyBookIds(bookIds: string[]): Word[]`
    - [x] `resetStatsByVocabularyBook(bookId: string): void`

### 2.2.1 데이터 마이그레이션 서비스
- [x] `/services/migrationService.ts` 생성
  - [x] `needsMigration(): boolean` - 마이그레이션 필요 여부 확인
  - [x] `migrateFromDateBased(): MigrationResult` - 날짜 기반 → 단어장 기반 자동 변환
  - [x] 날짜별로 단어장 생성 (예: "2024-01-15 단어장")
  - [x] 모든 기존 단어에 vocabularyBookId 할당
  - [x] 날짜 없는 단어 처리 (기본 단어장에 할당)

### 2.3 상태 관리
- [x] `/contexts/WordContext.tsx` 생성
  - [x] WordContext 생성
  - [x] wordReducer 구현
  - [x] WordProvider 컴포넌트
  - [x] 액션 타입 정의: ADD_WORD, UPDATE_WORD, DELETE_WORD, LOAD_WORDS, UPDATE_STATS
- [x] `/hooks/useWords.ts` 생성
  - [x] useWords 커스텀 훅
  - [x] addWord, updateWord, deleteWord, getWordsByDate 헬퍼 함수

### 2.4 Dictionary API 통합
- [x] API 조사 및 선택 (Free Dictionary API 사용 - 발음만 가져옴)
- [x] `/services/dictionaryService.ts` 생성
  - [x] `fetchPronunciation(word: string): Promise<string>` - 발음만 가져오기
  - [x] 에러 처리 (단어 없음, 네트워크 오류 등)
  - [x] 응답 데이터 파싱 및 변환
  - [x] 한글 뜻은 사용자가 직접 입력
  - [x] 숙어 지원 (API에서 찾지 못하면 기본 발음 사용)

### 2.5 Speech API 통합
- [x] `/services/speechService.ts` 생성
  - [x] Web Speech API (TTS) 사용
  - [x] `speak(text: string, lang: 'en-US'): void`
  - [x] `stop(): void`
  - [x] 브라우저 호환성 체크
  - [x] 폴백 처리

---

## Phase 3: 단어 관리 기능

### 3.1 단어 입력 페이지
- [x] `/pages/WordsPage.tsx` 생성
- [x] `/components/WordInputForm.tsx` 생성
  - [x] 영어 단어 입력 필드
  - [x] "추가" 버튼
  - [x] 로딩 상태 표시
  - [x] Dictionary API 호출
  - [x] 단어 데이터 저장
  - [x] 에러 처리 (단어 없음, 중복 등)
  - [x] 성공 Toast 메시지

### 3.2 단어 목록 표시
- [x] `/components/WordList.tsx` 생성
  - [x] Card 컴포넌트로 단어 표시
  - [x] 영어 단어, 한글 뜻, 발음 표시
  - [x] 발음 재생 버튼
  - [x] 삭제 버튼 (확인 Dialog)
  - [x] 빈 상태 처리

### 3.3 날짜별 단어 관리
- [x] `/components/DateSelector.tsx` 생성
  - [x] 날짜 선택 UI (Input type="date")
  - [x] 선택된 날짜의 단어 필터링
  - [x] "오늘" 버튼
- [x] 날짜별 단어 통계 표시 (개수)

---

## Phase 4: 시험 시스템

### 4.1 시험 생성 로직
- [x] `/utils/quizGenerator.ts` 생성
  - [x] `generateQuiz(words: Word[]): QuizQuestion[]`
  - [x] 각 단어당 4가지 유형 생성 (총 N * 4 문제)
  - [x] Fisher-Yates 알고리즘으로 랜덤 셔플
  - [x] 문제 ID 생성

### 4.2 답변 검증 로직
- [x] `/utils/answerValidator.ts` 생성
  - [x] `validateType1And3(userAnswer: string, meanings: string[]): boolean`
    - [x] 문자열 정규화 (trim, toLowerCase, 특수문자 제거)
    - [x] meanings 배열 중 1개라도 일치하면 정답
    - [x] 부분 일치 허용 (포함 검사)
    - [x] 괄호, 쉼표, 마침표 등 특수문자 무시
    - [x] 공백(white space) 완전 제거
    - [x] 한국어 동사 어간 비교 (하다/시키다/되다 등 어미 차이 무시)
  - [x] `validateType2And4(userAnswer: string, correctWord: string): boolean`
    - [x] 정확한 일치 검사
    - [x] 대소문자 무시 옵션
  - [ ] 테스트 케이스 작성

### 4.3 문제 컴포넌트
- [x] `/components/quiz/Type1Question.tsx` 생성 (유형 1: 발음 듣고 한글 뜻)
  - [x] 발음 재생 버튼
  - [x] 문제 진입 시 자동 발음 재생
  - [x] "발음을 듣고 한글 뜻을 입력하세요" 안내
  - [x] 답변 입력 필드
  - [x] Enter 키 제출 지원
- [x] `/components/quiz/Type2QuestionNew.tsx` 생성 (유형 2: 발음 듣고 영어 단어)
  - [x] 발음 재생 버튼
  - [x] 문제 진입 시 자동 발음 재생
  - [x] "발음을 듣고 영어 단어를 입력하세요" 안내
  - [x] 답변 입력 필드
  - [x] Enter 키 제출 지원
- [x] `/components/quiz/Type2Question.tsx` (유형 3: 영어 단어 보고 한글 뜻)
  - [x] 영어 단어 표시 (큰 글씨)
  - [x] "한글 뜻을 입력하세요" 안내
  - [x] 답변 입력 필드
- [x] `/components/quiz/Type3Question.tsx` (유형 4: 한글 뜻 보고 영어 단어)
  - [x] 한글 뜻 표시
  - [x] "영어 단어를 입력하세요" 안내
  - [x] 답변 입력 필드

### 4.4 시험 페이지
- [x] `/pages/QuizPage.tsx` 생성
  - [x] 시험 설정 UI (오늘 단어 자동 선택)
  - [x] 진행률 표시 (X / N)
  - [x] 현재 문제 표시
  - [x] 답변 제출 처리
  - [x] 다음 문제로 이동
  - [x] 시험 완료 후 결과 페이지로 이동

### 4.5 결과 표시 및 통계 업데이트
- [x] `/components/quiz/QuizResult.tsx` 생성
  - [x] 총 점수 표시 (X / N)
  - [x] 유형별 정답률 표시
  - [x] 틀린 문제 목록 (단어, 정답, 사용자 답변)
  - [x] "다시 시험보기" 버튼
  - [x] "홈으로" 버튼
- [x] 시험 완료 시 단어 통계 업데이트
  - [x] 각 단어의 stats 업데이트 (attempts++, correct++ if correct)
  - [x] 로컬 스토리지에 저장

### 4.6 시험 유형 선택 기능
- [x] `/components/quiz/QuizTypeSelector.tsx` 생성
  - [x] 4가지 유형 선택 체크박스 UI
  - [x] "모두 선택" / "모두 해제" 버튼
  - [x] 선택된 유형 상태 관리
  - [x] 최소 1개 유형 선택 검증
- [x] `/utils/quizGenerator.ts` 업데이트
  - [x] `generateQuiz`에 `selectedTypes` 파라미터 추가
  - [x] 선택된 유형만 필터링하여 문제 생성
  - [x] `generateReviewQuiz`에도 동일 로직 적용
- [x] `/pages/QuizPage.tsx` 업데이트
  - [x] QuizTypeSelector 컴포넌트 통합
  - [x] 선택된 유형 상태 관리
  - [x] 시험 생성 시 선택된 유형 전달
- [x] `/pages/ReviewPage.tsx` 업데이트
  - [x] QuizTypeSelector 컴포넌트 통합
  - [x] 선택된 유형 상태 관리
  - [x] 복습 시험 생성 시 선택된 유형 전달

### 4.7 채점 방식 선택 기능
- [x] `/components/quiz/GradingModeSelector.tsx` 생성
  - [x] 채점 방식 선택 UI (라디오 버튼)
    - [x] 즉시 채점 모드 (기본값)
    - [x] 일괄 채점 모드
  - [x] 각 모드에 대한 설명 텍스트
- [x] `/pages/QuizPage.tsx` 업데이트
  - [x] GradingModeSelector 컴포넌트 통합
  - [x] 채점 방식 상태 관리
  - [x] 즉시 채점 모드: 문제 제출 시 바로 정답/오답 표시
  - [x] 일괄 채점 모드: 모든 답변 수집 후 결과 페이지로 이동
- [x] `/pages/ReviewPage.tsx` 업데이트
  - [x] GradingModeSelector 컴포넌트 통합
  - [x] 채점 방식 상태 관리
  - [x] 즉시 채점/일괄 채점 모드 지원
- [x] 피드백 UI 구현
  - [x] 즉시 채점 모드: 답변 제출 후 정답/오답 표시 UI
  - [x] 일괄 채점 모드: 답변만 수집하고 다음 문제로 이동
  - [x] 정답/오답에 따른 색상 구분 (초록색/빨간색)
  - [x] "다음 문제" / "결과 보기" 버튼
  - [x] 피드백 화면에서 엔터키로 다음 문제 이동
  - [x] 즉시 채점 모드에서 실시간 점수 표시 (현재 점수 / 푼 문제 수)

### 4.8 시험 기능 통합 (오늘 시험 + 복습 통합) - 단어장 기반 시스템으로 변경됨
- [x] `/components/vocabulary/VocabularyBookSelector.tsx` 생성
  - [x] 단어장 멀티 셀렉트 UI
  - [x] 기본값: 첫 번째 단어장 선택
  - [x] 선택한 단어장의 단어 개수 표시
  - [x] 사용 팁 안내 메시지
- [x] `/hooks/useWords.ts` 업데이트
  - [x] `getWordsByVocabularyBookIds(bookIds: string[])` 함수 추가
  - [x] 단어장별 단어 필터링 지원
- [x] `/pages/ReviewPage.tsx`를 통합 시험 페이지로 업데이트
  - [x] 페이지 제목을 "복습" → "시험"으로 변경
  - [x] VocabularyBookSelector 컴포넌트 통합
  - [x] 선택한 단어장 상태 관리
  - [x] 선택한 단어장의 단어 필터링
  - [x] 문제 수 제한 옵션 추가 (체크박스로 선택)
  - [x] 문제 수 제한 없을 때: 모든 단어 * 선택된 유형
  - [x] 문제 수 제한 있을 때: 가중치 기반 랜덤 선택
  - [x] 퀴즈 생성 로직을 generateQuiz로 수정 (날짜 필터링 제거)
- [x] App.tsx 라우팅 업데이트
  - [x] /quiz → ReviewPage 연결
  - [x] /review → /quiz로 리다이렉트
  - [x] QuizPage import 제거
- [x] Navigation 컴포넌트 업데이트
  - [x] "오늘 단어 시험" 메뉴 제거
  - [x] "복습" 메뉴를 "시험"으로 변경하고 /quiz로 연결

---

## Phase 4.9: 플래시 카드 학습 시스템

### 4.9.1 플래시 카드 페이지
- [x] `/pages/FlashcardPage.tsx` 생성
  - [x] 초기 설정 UI (단어장 선택, 유형 선택)
  - [x] VocabularyBookSelector 컴포넌트 사용 (단어장 멀티 셀렉트)
  - [x] FlashcardTypeSelector 컴포넌트 사용 (3가지 유형 전용)
  - [x] 기본값: 첫 번째 단어장 + 유형 1 선택
  - [x] 채점 방식은 항상 즉시 채점 모드 (UI 제거)
  - [x] 문제 수 선택 UI 제거 (모든 단어 학습)
  - [x] "학습 시작" 버튼

### 4.9.2 플래시 카드 학습 로직
- [x] `/utils/flashcardGenerator.ts` 생성
  - [x] `generateFlashcardPool(words: Word[], selectedTypes: QuestionType[]): FlashcardItem[]`
  - [x] 선택한 날짜 범위와 유형에 해당하는 모든 단어-유형 조합 생성
  - [x] Fisher-Yates 알고리즘으로 랜덤 셔플
- [x] 플래시 카드 학습 상태 관리
  - [x] 현재 문제 추적 (currentCard, cardKey로 리셋 관리)
  - [x] 외운 문제 목록 (learnedCount)
  - [x] 남은 문제 풀 관리 (remainingCards)
  - [x] O 선택 시 해당 문제 풀에서 제거
  - [x] X 선택 시 문제 풀에 유지하고 다시 출제

### 4.9.3 플래시 카드 UI 컴포넌트
- [x] `/components/flashcard/FlashcardDisplay.tsx` 생성
  - [x] 문제만 표시하는 상태 (정답 숨김)
  - [x] 유형별 문제 표시 (3가지 유형):
    - [x] 유형 1: 발음 버튼만 (자동 재생) - 발음 듣고 영어 단어와 한글 뜻 연상하기
    - [x] 유형 2: 영어 단어만 - 영어 단어 보고 한글 뜻 연상하기
    - [x] 유형 3: 한글 뜻만 - 한글 뜻 보고 영어 단어 연상하기
  - [x] O / X 선택 버튼 UI
  - [x] O/X 선택 후 정답 표시:
    - [x] 유형 1: 영어 단어 + 한글 뜻 모두 표시
    - [x] 유형 2: 한글 뜻 표시
    - [x] 유형 3: 영어 단어 표시
  - [x] "다음 카드" 버튼 (외움 처리/다시 학습 표시)
  - [x] 진행률 표시 (외운 카드 수 / 남은 카드 수 / 전체)
  - [x] 현재까지 외운 문제 수 표시
- [x] 플래시 카드 학습 흐름 구현
  - [x] 초기: 문제만 표시 + O/X 버튼
  - [x] O/X 선택 시: 정답 표시 + "다음 카드" 버튼
  - [x] "다음 카드" 클릭: 문제 풀 업데이트 + 다음 문제로 이동
  - [x] 키보드 단축키 지원 (O키, X키, Enter키)
  - [x] 마지막 카드 X 선택 시 리셋 버그 수정 (cardKey 사용)

### 4.9.4 플래시 카드 완료 화면
- [x] `/components/flashcard/FlashcardComplete.tsx` 생성
  - [x] 축하 메시지 표시
  - [x] 학습 통계 표시
    - [x] 총 학습한 문제 수
    - [x] 학습 시간
    - [x] 유형별 학습 단어 수
  - [x] "홈으로" 버튼
  - [x] "다시 학습하기" 버튼

### 4.9.5 라우팅 및 네비게이션
- [x] App.tsx에 `/flashcard` 라우트 추가
- [x] Navigation 컴포넌트에 "플래시 카드" 메뉴 추가
  - [x] 단어 관리와 시험 메뉴 사이에 배치

### 4.9.6 통계 독립성 확인
- [x] 플래시 카드는 통계에 영향을 주지 않음 (updateStats 호출 없음)
- [x] 시험/복습 기능만 통계 업데이트
- [x] 참고: 플래시 카드는 3가지 유형, 시험은 4가지 유형 사용 (독립적으로 운영)

---

## Phase 5: 복습 시스템 (Phase 4.8로 통합됨)

### 5.1 복습 단어 선택 알고리즘
- [x] `/utils/quizGenerator.ts`에 `generateReviewQuiz` 구현
  - [x] `generateReviewQuiz(words: Word[], count: number): QuizQuestion[]`
  - [x] 오늘 날짜가 아닌 단어 필터링
  - [x] 오답률 계산: `(totalAttempts - totalCorrect) / totalAttempts`
  - [x] 가중치 기반 랜덤 선택 구현
  - [x] 선택된 각 단어에 대해 1개 유형만 랜덤 선택
- [x] 엣지 케이스 처리
  - [x] 복습 가능한 단어가 K개 미만일 때
  - [x] 모든 단어가 오늘 추가된 경우

### 5.2 복습 페이지
- [x] `/pages/ReviewPage.tsx` 생성
  - [x] K개 입력 UI (숫자 입력)
  - [x] "복습 시작" 버튼
  - [x] QuizPage와 유사한 시험 진행 로직
  - [x] 단, 각 단어당 1개 유형만 출제
  - [x] 결과 표시 및 통계 업데이트

---

## Phase 6: 관리 및 부가 기능

### 6.1 Import/Export 기능
- [x] `/pages/ImportExportPage.tsx` 생성
- [x] Export 기능
  - [x] "내보내기" 버튼
  - [x] 모든 단어를 JSON으로 변환
  - [x] Blob 생성 및 다운로드 트리거
  - [x] 파일명: `vocabokum_backup_YYYYMMDD.json`
  - [x] 성공 Toast 메시지
- [x] Import 기능
  - [x] 파일 선택 Input (accept=".json")
  - [x] 파일 읽기 (FileReader API)
  - [x] JSON 파싱 및 유효성 검증
  - [x] 병합 옵션 Dialog
    - [x] 덮어쓰기 (Replace)
    - [x] 추가 (Merge - ID 중복 처리)
    - [x] 취소
  - [x] 데이터 저장 및 Context 업데이트
  - [x] 에러 처리 (잘못된 형식, 손상된 파일)
  - [x] 성공 Toast 메시지

### 6.2 관리자 페이지
- [x] `/pages/AdminPage.tsx` 생성
- [x] 전체 통계 표시
  - [x] 총 단어 수, 전체 시도, 정답 수, 전체 정답률
  - [x] 유형별 정답률 (Type 1, 2, 3, 4)
- [x] 단어장별 단어 목록
  - [x] 단어장 선택 UI
  - [x] 해당 단어장의 단어 목록 표시
  - [x] 각 단어장별 단어 개수
- [x] 단어별 통계
  - [x] 단어별 상세 정보 표시 (단어, 뜻)
  - [x] 유형1 합격률, 유형2 합격률, 유형3 합격률, 유형4 합격률, 전체 합격률
  - [x] 합격률 계산: `(correct / attempts) * 100`
- [x] 통계 리셋 기능
  - [x] 전체 리셋 기능
    - [x] 모든 단어의 통계 데이터 초기화 (attempts, correct → 0)
    - [x] 확인 다이얼로그로 안전장치 구현
  - [x] 단어장별 리셋 기능
    - [x] 선택한 단어장의 모든 단어 통계 초기화
    - [x] 확인 다이얼로그로 안전장치 구현
  - [x] 단어별 리셋 기능
    - [x] 개별 단어의 통계 데이터만 초기화
    - [x] 확인 다이얼로그로 안전장치 구현
  - [x] storageService에 리셋 함수 추가
    - [x] `resetAllStats(): void`
    - [x] `resetStatsByVocabularyBook(bookId: string): void`
    - [x] `resetWordStats(wordId: string): void`
  - [x] WordContext에 리셋 액션 추가
    - [x] RESET_ALL_STATS
    - [x] RESET_BOOK_STATS
    - [x] RESET_WORD_STATS
- [ ] 선택적: 차트 시각화 (향후 개선)
  - [ ] recharts 또는 chart.js 설치
  - [ ] 전체 합격률 추이 그래프
  - [ ] 유형별 합격률 비교 그래프

### 6.3 홈/대시보드 페이지
- [ ] `/pages/HomePage.tsx` 생성
  - [ ] 오늘 추가할 단어 안내
  - [ ] 빠른 액션 버튼
    - [ ] "단어 추가하기"
    - [ ] "오늘 시험 보기"
    - [ ] "복습하기"
  - [ ] 통계 요약
    - [ ] 총 단어 수
    - [ ] 오늘 추가된 단어 수
    - [ ] 전체 평균 합격률
  - [ ] 최근 추가된 단어 목록 (5개)

---

## Phase 7: UI/UX 개선 및 테스트

### 7.1 UI/UX 개선
- [ ] 반응형 디자인 확인 (모바일, 태블릿, 데스크톱)
- [ ] 다크 모드 지원 (shadcn/ui 기본 지원 확인)
- [ ] 로딩 상태 개선 (Skeleton 컴포넌트)
- [ ] 에러 상태 개선 (에러 바운더리)
- [ ] 애니메이션 추가 (문제 전환, 결과 표시)
- [ ] 키보드 네비게이션 개선
- [ ] ARIA 레이블 추가 및 접근성 검증

### 7.2 테스트
- [ ] 단어 추가 테스트
  - [ ] 정상 케이스
  - [ ] 존재하지 않는 단어
  - [ ] 중복 단어
  - [ ] 네트워크 오류
- [ ] 시험 기능 테스트
  - [ ] 4가지 유형 모두 정상 작동
  - [ ] 답변 검증 정확성
  - [ ] 통계 업데이트 확인
- [ ] 복습 기능 테스트
  - [ ] 가중치 랜덤 선택 확인
  - [ ] 오답률 높은 단어 우선 선택 확인
- [ ] Import/Export 테스트
  - [ ] 내보내기 후 가져오기
  - [ ] 잘못된 JSON 처리
  - [ ] 병합 옵션 확인
- [ ] 로컬 스토리지 테스트
  - [ ] 데이터 영속성 확인
  - [ ] 브라우저 새로고침 후 데이터 유지

### 7.3 성능 최적화
- [ ] React.memo 사용 (불필요한 리렌더링 방지)
- [ ] useMemo, useCallback 적절히 사용
- [ ] 큰 목록에 대한 가상화 고려 (react-window)
- [ ] 이미지 최적화 (있을 경우)
- [ ] 번들 크기 분석 및 최적화

### 7.4 문서화
- [ ] README.md 작성
  - [ ] 프로젝트 소개
  - [ ] 기능 목록
  - [ ] 설치 및 실행 방법
  - [ ] 사용법
  - [ ] 기술 스택
- [ ] 주요 컴포넌트 및 함수에 JSDoc 주석 추가
- [ ] API 사용법 문서 (Dictionary API, Speech API)

---

## Phase 8: 배포 및 최종 점검

### 8.1 배포 준비
- [ ] 환경 변수 설정 (.env 파일)
- [ ] 프로덕션 빌드 테스트
  ```bash
  npm run build
  npm run preview
  ```
- [ ] 빌드 에러 및 경고 해결
- [ ] 브라우저 호환성 테스트

### 8.2 배포
- [ ] 배포 플랫폼 선택 (Vercel, Netlify, GitHub Pages 등)
- [ ] 배포 설정 및 실행
- [ ] 배포된 사이트 테스트
- [ ] GitHub README에 배포 URL 추가

### 8.3 최종 점검
- [ ] 모든 기능 동작 확인
- [ ] 크로스 브라우저 테스트 (Chrome, Firefox, Safari, Edge)
- [ ] 모바일 테스트 (iOS Safari, Chrome Mobile)
- [ ] 성능 테스트 (Lighthouse)
- [ ] 접근성 테스트 (axe DevTools)

---

## 선택적 개선 사항

### 고급 기능
- [x] 단어장 기능 (여러 단어장 생성 및 관리) ✅ 완료
- [ ] 단어 검색 기능
- [ ] 단어 편집 기능
- [ ] 학습 통계 그래프 (일별, 주별, 월별)
- [ ] 학습 스트릭 (연속 학습 일수)
- [ ] 오답 노트 (틀린 문제만 모아서 복습)
- [ ] 발음 기호 표시 개선 (IPA)
- [ ] 예문 추가 (Dictionary API에서 가져오기)
- [ ] 단어 이미지 추가 (선택적)

### 기술적 개선
- [ ] PWA 설정 (오프라인 지원, 설치 가능)
- [ ] 서비스 워커 (캐싱)
- [ ] IndexedDB 사용 (대용량 데이터 처리)
- [ ] 백엔드 추가 (선택적 - 여러 기기 간 동기화)
- [ ] 사용자 인증 (선택적)
- [ ] 단위 테스트 (Jest, React Testing Library)
- [ ] E2E 테스트 (Playwright, Cypress)

---

## 참고사항

### API 추천
- **Dictionary API**: [Free Dictionary API](https://dictionaryapi.dev/) - 무료, API 키 불필요
- **Alternative**: [Merriam-Webster API](https://dictionaryapi.com/) - API 키 필요하지만 더 풍부한 데이터
- **Speech API**: Web Speech API (브라우저 내장) - 별도 API 키 불필요

### 기술 스택 요약
- React 18 + TypeScript
- Vite (빌드 툴)
- React Router (라우팅)
- shadcn/ui (UI 컴포넌트)
- Tailwind CSS (스타일링)
- Context API + useReducer (상태 관리)
- Local Storage (데이터 저장)
- Web Speech API (발음)
- Free Dictionary API (단어 데이터)

### 개발 우선순위
1. **Must Have**: Phase 1-4 (기본 단어 관리 및 시험 기능)
2. **Should Have**: Phase 5-6 (복습, Import/Export, 관리자 페이지)
3. **Nice to Have**: Phase 7-8 (UI/UX 개선, 배포)
4. **Optional**: 선택적 개선 사항
