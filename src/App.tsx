import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { WordProvider } from './contexts/WordContext'
import { Toaster } from './components/ui/sonner'
import Navigation from './components/common/Navigation'
import HomePage from './pages/HomePage'
import WordsPage from './pages/WordsPage'
import VocabularyBooksPage from './pages/VocabularyBooksPage'
import FlashcardPage from './pages/FlashcardPage'
import ReviewPage from './pages/ReviewPage'
import ImportExportPage from './pages/ImportExportPage'
import AdminPage from './pages/AdminPage'

function App() {
  return (
    <WordProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Navigation />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/vocabulary-books" element={<VocabularyBooksPage />} />
            <Route path="/words" element={<WordsPage />} />
            <Route path="/flashcard" element={<FlashcardPage />} />
            <Route path="/quiz" element={<ReviewPage />} />
            <Route path="/review" element={<Navigate to="/quiz" replace />} />
            <Route path="/import-export" element={<ImportExportPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </div>
        <Toaster />
      </BrowserRouter>
    </WordProvider>
  )
}

export default App
