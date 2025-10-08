/**
 * 문자열 정규화: 공백 제거, 소문자 변환, 특수문자 제거
 */
function normalizeString(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, '') // 영문, 숫자, 한글만 남기기 (괄호, 마침표 등 제거)
    .replace(/\s+/g, '') // 모든 공백 제거
}

/**
 * 한국어 동사 어간 추출: 하다, 시키다, 되다 등의 어미 제거
 */
function extractKoreanStem(str: string): string {
  return str
    .replace(/(시키|당하|받|되|지|게하|게되)?다$/g, '') // 동사 어미 제거
    .replace(/하$/g, '') // "하" 제거
}

/**
 * 유형 1과 3: 발음 듣고/영어 단어 보고 한글 뜻 입력
 * meanings 배열 중 하나라도 일치하면 정답
 * 부분 일치 허용
 */
export function validateType1And3(
  userAnswer: string,
  correctMeanings: string[]
): boolean {
  const normalizedAnswer = normalizeString(userAnswer)

  if (!normalizedAnswer) return false

  // meanings 배열의 각 뜻을 정규화하고 확인
  return correctMeanings.some((meaning) => {
    const normalizedMeaning = normalizeString(meaning)

    // 부분 일치 허용: 사용자 답변이 정답에 포함되거나, 정답이 사용자 답변에 포함
    if (
      normalizedMeaning.includes(normalizedAnswer) ||
      normalizedAnswer.includes(normalizedMeaning)
    ) {
      return true
    }

    // 어간 비교: 하다/시키다/되다 등의 어미 차이 무시
    const stemAnswer = extractKoreanStem(normalizedAnswer)
    const stemMeaning = extractKoreanStem(normalizedMeaning)

    return (
      stemMeaning.includes(stemAnswer) ||
      stemAnswer.includes(stemMeaning)
    )
  })
}

/**
 * 유형 2와 4: 영어 단어 입력
 * 정확한 일치 검사 (대소문자 무시)
 */
export function validateType2And4(
  userAnswer: string,
  correctWord: string
): boolean {
  const normalizedAnswer = userAnswer.trim().toLowerCase()
  const normalizedCorrect = correctWord.trim().toLowerCase()

  if (!normalizedAnswer) return false

  return normalizedAnswer === normalizedCorrect
}

/**
 * 퀴즈 타입에 따른 답변 검증
 */
export function validateAnswer(
  type: 1 | 2 | 3 | 4,
  userAnswer: string,
  correctMeanings: string[],
  correctWord: string
): boolean {
  if (type === 1 || type === 3) {
    return validateType1And3(userAnswer, correctMeanings)
  } else {
    return validateType2And4(userAnswer, correctWord)
  }
}
