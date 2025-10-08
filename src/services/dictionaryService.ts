/**
 * Free Dictionary API를 사용하여 영어 발음 가져오기
 * API: https://dictionaryapi.dev/
 * 한글 뜻은 사용자가 직접 입력
 * 숙어의 경우 API에서 찾지 못하면 기본 발음 사용
 */
export const dictionaryService = {
  async fetchPronunciation(word: string): Promise<string> {
    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`
      )

      if (!response.ok) {
        // 404 에러 (단어를 찾지 못함) - 숙어일 가능성이 있으므로 기본 발음 반환
        if (response.status === 404) {
          return `/${word}/`
        }
        // 다른 네트워크 오류는 기본 발음 반환
        return `/${word}/`
      }

      const data = await response.json()

      if (!Array.isArray(data) || data.length === 0) {
        // 데이터가 없으면 기본 발음 반환
        return `/${word}/`
      }

      const entry = data[0]

      // 발음 추출
      let pronunciation = ''
      if (entry.phonetic) {
        pronunciation = entry.phonetic
      } else if (entry.phonetics && entry.phonetics.length > 0) {
        pronunciation = entry.phonetics[0].text || ''
      }

      return pronunciation || `/${word}/`
    } catch (error) {
      // 모든 오류에 대해 기본 발음 반환 (숙어 지원)
      return `/${word}/`
    }
  },

  /**
   * 단어/숙어가 유효한지 확인 (영문자, 공백, 하이픈 포함)
   */
  isValidWord(word: string): boolean {
    return /^[a-zA-Z\s-]+$/.test(word.trim())
  },
}
