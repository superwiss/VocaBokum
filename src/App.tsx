import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { WordProvider } from './contexts/WordContext'
import { Toaster } from './components/ui/sonner'
import Navigation from './components/common/Navigation'
import HomePage from './pages/HomePage'
import WordsPage from './pages/WordsPage'
import QuizPage from './pages/QuizPage'
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
            <Route path="/words" element={<WordsPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/review" element={<ReviewPage />} />
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
