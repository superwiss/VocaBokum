import { useState } from 'react'
import { useWords } from '@/hooks/useWords'
import { storageService } from '@/services/storageService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function ImportExportPage() {
  const { words, loadWords } = useWords()
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge')

  // Export 기능
  const handleExport = () => {
    try {
      const jsonData = storageService.exportWords()
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
      a.download = `vocabokum_backup_${today}.json`

      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('데이터를 성공적으로 내보냈습니다.')
    } catch (error) {
      toast.error('내보내기에 실패했습니다.')
    }
  }

  // 파일 선택
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/json') {
        toast.error('JSON 파일만 업로드할 수 있습니다.')
        return
      }
      setSelectedFile(file)
      setImportDialogOpen(true)
    }
  }

  // Import 실행
  const handleImportConfirm = async () => {
    if (!selectedFile) return

    try {
      const text = await selectedFile.text()
      const importedWords = storageService.importWords(text, importMode)
      loadWords(importedWords)

      toast.success(
        importMode === 'replace'
          ? '데이터를 덮어씌웠습니다.'
          : `${importedWords.length}개의 단어를 가져왔습니다.`
      )

      setImportDialogOpen(false)
      setSelectedFile(null)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('가져오기에 실패했습니다.')
      }
    }
  }

  const handleImportCancel = () => {
    setImportDialogOpen(false)
    setSelectedFile(null)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">데이터 관리</h1>
        <p className="text-muted-foreground">
          단어 데이터를 백업하거나 복원하세요.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Export 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>내보내기</CardTitle>
            <CardDescription>
              모든 단어 데이터를 JSON 파일로 저장합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>현재 저장된 단어: {words.length}개</p>
            </div>
            <Button onClick={handleExport} className="w-full" disabled={words.length === 0}>
              데이터 내보내기
            </Button>
          </CardContent>
        </Card>

        {/* Import 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>가져오기</CardTitle>
            <CardDescription>
              백업한 JSON 파일에서 단어 데이터를 복원합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file-upload">JSON 파일 선택</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              <p>⚠️ 주의: 가져오기 전에 현재 데이터를 백업하는 것을 권장합니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import 확인 Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>데이터 가져오기</DialogTitle>
            <DialogDescription>
              파일: {selectedFile?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm">
              데이터를 어떻게 가져올까요?
            </p>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="merge"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="cursor-pointer"
                />
                <div>
                  <p className="font-medium">추가 (권장)</p>
                  <p className="text-xs text-muted-foreground">
                    기존 데이터를 유지하고 중복되지 않는 단어만 추가합니다.
                  </p>
                </div>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="cursor-pointer"
                />
                <div>
                  <p className="font-medium text-destructive">덮어쓰기</p>
                  <p className="text-xs text-muted-foreground">
                    기존 데이터를 모두 삭제하고 새 데이터로 교체합니다.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleImportCancel}>
              취소
            </Button>
            <Button onClick={handleImportConfirm}>
              가져오기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
