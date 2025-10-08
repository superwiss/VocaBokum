/**
 * Web Speech API 및 Audio API를 사용한 음성 재생 서비스
 * - audioUrl이 있으면 실제 오디오 파일 재생
 * - audioUrl이 없으면 TTS 폴백
 */
class SpeechService {
  private synthesis: SpeechSynthesis | null = null
  // @ts-ignore - currentUtterance는 speak, stop 메서드에서 상태 관리를 위해 사용됨
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private currentAudio: HTMLAudioElement | null = null

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis
    }
  }

  /**
   * 브라우저가 Web Speech API를 지원하는지 확인
   */
  isSupported(): boolean {
    return this.synthesis !== null
  }

  /**
   * 영어 텍스트를 음성으로 재생
   */
  speak(text: string, lang: string = 'en-US'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('이 브라우저는 음성 재생을 지원하지 않습니다.'))
        return
      }

      // 기존 음성 재생 중지
      this.stop()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 0.9 // 약간 느리게 (명확한 발음)
      utterance.pitch = 1.0
      utterance.volume = 1.0

      utterance.onend = () => {
        this.currentUtterance = null
        resolve()
      }

      utterance.onerror = (event) => {
        this.currentUtterance = null
        reject(new Error(`음성 재생 오류: ${event.error}`))
      }

      this.currentUtterance = utterance
      this.synthesis!.speak(utterance)
    })
  }

  /**
   * 단어 발음 재생 (audioUrl 우선, 없으면 TTS 폴백)
   */
  async playWord(text: string, audioUrl?: string): Promise<void> {
    // 기존 재생 중지
    this.stop()

    if (audioUrl) {
      // 실제 오디오 파일 재생
      return this.playAudio(audioUrl)
    } else {
      // TTS 폴백
      return this.speak(text)
    }
  }

  /**
   * 오디오 파일 재생
   */
  private playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.currentAudio = new Audio(audioUrl)

        this.currentAudio.onended = () => {
          this.currentAudio = null
          resolve()
        }

        this.currentAudio.onerror = () => {
          this.currentAudio = null
          reject(new Error('오디오 재생 오류'))
        }

        this.currentAudio.play().catch((error) => {
          this.currentAudio = null
          reject(new Error(`오디오 재생 실패: ${error.message}`))
        })
      } catch (error) {
        this.currentAudio = null
        reject(error)
      }
    })
  }

  /**
   * 현재 재생 중인 음성 중지
   */
  stop(): void {
    // TTS 중지
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.cancel()
      this.currentUtterance = null
    }

    // 오디오 중지
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0
      this.currentAudio = null
    }
  }

  /**
   * 현재 음성이 재생 중인지 확인
   */
  isSpeaking(): boolean {
    return this.synthesis ? this.synthesis.speaking : false
  }

  /**
   * 음성 일시 정지
   */
  pause(): void {
    if (this.synthesis && this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause()
    }
  }

  /**
   * 일시 정지된 음성 재개
   */
  resume(): void {
    if (this.synthesis && this.synthesis.paused) {
      this.synthesis.resume()
    }
  }

  /**
   * 사용 가능한 음성 목록 가져오기
   */
  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return []
    return this.synthesis.getVoices()
  }

  /**
   * 영어 음성만 필터링
   */
  getEnglishVoices(): SpeechSynthesisVoice[] {
    return this.getVoices().filter((voice) => voice.lang.startsWith('en'))
  }
}

// 싱글톤 인스턴스 생성
export const speechService = new SpeechService()
