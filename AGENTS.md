# VocaBokum - AI Agent Documentation

## 프로젝트 개요

**VocaBokum**은 영어 단어 학습 웹 애플리케이션입니다. 사용자가 영어 단어를 추가하고, 3가지 유형의 퀴즈로 학습하며, 복습 시스템을 통해 효과적으로 단어를 암기할 수 있습니다.

## 기술 스택

- **Frontend Framework**: React 19.1.1
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 7.1.7
- **Routing**: React Router DOM 7.9.3
- **Styling**: Tailwind CSS 4.1.14
- **UI Components**: shadcn/ui (Radix UI 기반)
- **State Management**: React Context API + useReducer
- **Storage**: Local Storage
- **External APIs**:
  - Free Dictionary API (단어 정의)
  - Web Speech API (발음 재생)

## 프로젝트 구조

```
src/
├── components/
│   ├── ui/              # shadcn/ui 기본 컴포넌트
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── sonner.tsx
│   ├── quiz/            # 퀴즈 관련 컴포넌트
│   │   ├── Type1Question.tsx   # 듣기 문제
│   │   ├── Type2Question.tsx   # 영어→한글 문제
│   │   ├── Type3Question.tsx   # 한글→영어 문제
│   │   └── QuizResult.tsx      # 결과 화면
│   └── common/          # 공통 컴포넌트
│       ├── Navigation.tsx
│       ├── WordInputForm.tsx
│       ├── WordList.tsx
│       └── DateSelector.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── WordsPage.tsx
│   ├── QuizPage.tsx
│   ├── ReviewPage.tsx
│   ├── ImportExportPage.tsx
│   └── AdminPage.tsx
├── contexts/
│   └── WordContext.tsx  # 전역 상태 관리
├── hooks/
│   └── useWords.ts      # 단어 관련 커스텀 훅
├── services/
│   ├── storageService.ts     # 로컬 스토리지 CRUD
│   ├── dictionaryService.ts  # Dictionary API 호출
│   └── speechService.ts      # TTS (Text-to-Speech)
├── utils/
│   ├── quizGenerator.ts      # 퀴즈 생성 로직
│   └── answerValidator.ts    # 답안 검증 로직
├── types/
│   ├── word.ts          # Word, WordStats 타입
│   └── quiz.ts          # QuizQuestion, QuizResult 타입
└── lib/
    └── utils.ts         # cn() 유틸리티
```

## 구현된 기능

### Phase 1: 프로젝트 초기화 ✅
- Vite + React + TypeScript 프로젝트 생성
- shadcn/ui 설정 및 기본 컴포넌트 설치
- React Router 라우팅 설정
- 프로젝트 폴더 구조 생성

### Phase 2: 핵심 데이터 레이어 ✅
- 타입 정의 (Word, WordStats, QuizQuestion, QuizResult)
- 로컬 스토리지 서비스 (CRUD, Import/Export)
- Context API + useReducer 상태 관리
- Dictionary API 서비스
- Text-to-Speech 서비스

### Phase 3: 단어 관리 ✅
- 단어 입력 폼 (Dictionary API 연동)
- 단어 목록 표시 (카드 레이아웃)
- 발음 재생 기능
- 단어 삭제 기능
- 날짜별 필터링

### Phase 4: 퀴즈 시스템 ✅
- **유형 1**: 발음 듣고 한글 뜻 입력
- **유형 2**: 영어 단어 보고 한글 뜻 입력
- **유형 3**: 한글 뜻 보고 영어 단어 입력
- Fisher-Yates 셔플 알고리즘
- 답안 검증 (정규화, 부분 일치)
- 결과 표시 (총점, 유형별 정답률, 틀린 문제)
- 통계 업데이트 (시도/정답 카운트)

### Phase 5: 복습 시스템 ✅
- 과거 단어 필터링 (어제 이전 추가된 단어)
- 가중치 기반 랜덤 선택 (오답률 높을수록 더 자주 출제)
- 복습 문제 수 설정
- 단어당 1문제 (랜덤 유형)

### Phase 6: 관리 및 부가 기능 ✅
- **Import/Export**:
  - JSON 파일로 백업/복원
  - 병합 모드 (추가/덮어쓰기)
  - 파일 검증 및 에러 처리
- **통계 페이지**:
  - 전체 통계 (총 단어, 시도, 정답, 정답률)
  - 유형별 정답률
  - 날짜별 단어 목록
  - 단어별 상세 통계

## 주요 알고리즘

### 1. 퀴즈 생성 (Fisher-Yates Shuffle)
```typescript
// src/utils/quizGenerator.ts
function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
```

### 2. 가중치 기반 복습 선택
```typescript
// 오답률 기반 가중치 계산
const weight = totalAttempts === 0
  ? 1
  : (totalAttempts - totalCorrect) / totalAttempts
```

### 3. 답안 검증
```typescript
// 문자열 정규화: 공백 제거, 소문자 변환, 특수문자 제거
function normalize(str: string): string {
  return str.trim().toLowerCase().replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, '')
}

// 유형 1, 2: 한글 뜻 부분 일치 허용
// 유형 3: 영어 단어 완전 일치
```

## 데이터 모델

### Word
```typescript
interface Word {
  id: string              // UUID
  word: string            // 영어 단어
  meanings: string[]      // 한글 뜻 (최대 5개)
  pronunciation: string   // 발음
  addedDate: string       // ISO 8601 형식
  stats: WordStats        // 학습 통계
}
```

### WordStats
```typescript
interface WordStats {
  type1Attempts: number   // 유형1 시도 횟수
  type1Correct: number    // 유형1 정답 횟수
  type2Attempts: number   // 유형2 시도 횟수
  type2Correct: number    // 유형2 정답 횟수
  type3Attempts: number   // 유형3 시도 횟수
  type3Correct: number    // 유형3 정답 횟수
}
```

## 상태 관리

### Context Actions
- `LOAD_WORDS`: 로컬 스토리지에서 단어 로드
- `ADD_WORD`: 새 단어 추가
- `UPDATE_WORD`: 단어 정보 수정
- `DELETE_WORD`: 단어 삭제
- `UPDATE_STATS`: 퀴즈 결과 반영 (시도/정답 카운트)

### Auto-save
모든 상태 변경 시 자동으로 로컬 스토리지에 저장됩니다.

## API 통합

### Free Dictionary API
```typescript
// https://api.dictionaryapi.dev/api/v2/entries/en/{word}
// 응답: 단어, 뜻, 발음, 예문 등
```

### Web Speech API
```typescript
const utterance = new SpeechSynthesisUtterance(text)
utterance.lang = 'en-US'
speechSynthesis.speak(utterance)
```

## 실행 방법

### 개발 서버
```bash
npm run dev
```
기본적으로 `http://localhost:5173`에서 실행됩니다.

### 프로덕션 빌드
```bash
npm run build
npm run preview
```

### 린트 검사
```bash
npm run lint
```

## 라우팅 구조

- `/` - 홈 페이지
- `/words` - 단어 관리 페이지
- `/quiz` - 오늘 단어 시험
- `/review` - 복습 시험
- `/import-export` - 백업/복원
- `/admin` - 통계 및 관리

## 향후 개선 사항 (Phase 7-8)

### UI/UX 개선
- [ ] 홈페이지 대시보드 (빠른 액션, 통계 요약)
- [ ] 반응형 디자인 최적화
- [ ] 애니메이션 및 트랜지션
- [ ] 다크 모드 지원

### 기능 확장
- [ ] 차트 시각화 (학습 추이, 정답률 그래프)
- [ ] 단어장 그룹/카테고리 관리
- [ ] 학습 목표 설정 및 진행률 추적
- [ ] 오프라인 지원 (PWA)

## 개발 노트

### 주요 기술 결정
1. **Context API vs Redux**: 프로젝트 규모가 작아 Context API + useReducer 선택
2. **로컬 스토리지**: 백엔드 없이 프론트엔드만으로 완성하기 위해 선택
3. **shadcn/ui**: 접근성 좋고 커스터마이징 가능한 컴포넌트 라이브러리
4. **Fisher-Yates Shuffle**: 공정한 랜덤 퀴즈 생성을 위한 표준 알고리즘
5. **가중치 기반 복습**: 스페이스드 리피티션(Spaced Repetition) 개념 적용

### 알려진 제한사항
- Web Speech API는 브라우저 지원이 필요 (Chrome, Edge 권장)
- Free Dictionary API는 모든 단어를 지원하지 않을 수 있음
- 로컬 스토리지는 용량 제한 있음 (일반적으로 5-10MB)

## 문제 해결

### Dictionary API에서 단어를 찾을 수 없는 경우
- 다른 철자 확인
- 복수형/과거형이 아닌 기본형 입력
- 오타 확인

### 발음 재생이 안 되는 경우
- 브라우저 Web Speech API 지원 확인
- Chrome 또는 Edge 브라우저 사용 권장

### Import 시 오류 발생
- JSON 파일 형식 확인
- 파일이 손상되지 않았는지 확인
- Export로 생성한 파일만 Import 가능

## 라이센스 및 참고

- PRD: `/PRD.md`
- 체크리스트: `/CHECKLIST.md`
- 프로젝트 생성일: 2025-10-08
