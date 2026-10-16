import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { RootLayout } from './components/RootLayout.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { EbookPage } from './pages/EbookPage.jsx'
import { AcademyApp } from './pages/AcademyApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <RootLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ebook/:grade" element={<EbookPage />} />
          <Route path="/academy" element={<AcademyApp />} />
          <Route path="/academy/:tab" element={<AcademyApp />} />
        </Routes>
      </RootLayout>
    </BrowserRouter>
  </StrictMode>,
)
