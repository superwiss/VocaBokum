/**
 * Free Dictionary API를 사용하여 영어 발음 및 오디오 URL 가져오기
 * API: https://dictionaryapi.dev/
 * 한글 뜻은 사용자가 직접 입력
 * 숙어의 경우 API에서 찾지 못하면 기본 발음 사용
 */

export interface DictionaryResult {
  pronunciation: string
  audioUrl?: string
}

export const dictionaryService = {
  async fetchPronunciation(word: string): Promise<DictionaryResult> {
    try {
      // 첫 번째 시도: 원본 단어로 검색
      let response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`
      )

      // 404이고 공백이 포함된 경우, 공백을 하이픈으로 바꿔서 재시도
      if (!response.ok && response.status === 404 && word.includes(' ')) {
        const hyphenatedWord = word.replace(/\s+/g, '-')
        response = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${hyphenatedWord.toLowerCase()}`
        )
      }

      if (!response.ok) {
        // 여전히 찾지 못하면 기본 발음 반환 (TTS 사용)
        return { pronunciation: `/${word}/` }
      }

      const data = await response.json()

      if (!Array.isArray(data) || data.length === 0) {
        // 데이터가 없으면 기본 발음 반환
        return { pronunciation: `/${word}/` }
      }

      const entry = data[0]

      // 발음 및 오디오 URL 추출
      let pronunciation = ''
      let audioUrl: string | undefined = undefined

      if (entry.phonetic) {
        pronunciation = entry.phonetic
      } else if (entry.phonetics && entry.phonetics.length > 0) {
        pronunciation = entry.phonetics[0].text || ''
      }

      // 오디오 URL 찾기 (phonetics 배열에서 audio가 있는 첫 번째 항목)
      if (entry.phonetics && Array.isArray(entry.phonetics)) {
        for (const phonetic of entry.phonetics) {
          if (phonetic.audio && phonetic.audio.trim() !== '') {
            audioUrl = phonetic.audio
            break
          }
        }
      }

      return {
        pronunciation: pronunciation || `/${word}/`,
        audioUrl,
      }
    } catch (error) {
      // 모든 오류에 대해 기본 발음 반환 (숙어 지원)
      return { pronunciation: `/${word}/` }
    }
  },

  /**
   * 단어/숙어가 유효한지 확인 (영문자, 공백, 하이픈 포함)
   */
  isValidWord(word: string): boolean {
    return /^[a-zA-Z\s-]+$/.test(word.trim())
  },
}
