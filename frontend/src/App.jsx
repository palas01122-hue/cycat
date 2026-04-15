import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { HelmetProvider } from 'react-helmet-async'
import Layout from './components/layout/Layout'
import ScrollToTop from './components/layout/ScrollToTop'
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import DetailPage from './pages/DetailPage'
import PersonPage from './pages/PersonPage'
import SearchPage from './pages/SearchPage'
import RankingsPage from './pages/RankingsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import WhatToWatchPage from './pages/WhatToWatchPage'
import DiaryPage from './pages/DiaryPage'
import ListsPage from './pages/ListsPage'
import StreamingPage from './pages/StreamingPage'
import { TermsPage, PrivacyPage } from './pages/LegalPages'
import GenrePage from './pages/GenrePage'
import CalendarPage from './pages/CalendarPage'
import MarathonPage from './pages/MarathonPage'
import CollectionPage from './pages/CollectionPage'
import StatsPage from './pages/StatsPage'
import { AuthProvider } from './hooks/useAuth'

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Analytics />
          <Routes>
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="catalog" element={<CatalogPage />} />
              <Route path="movies" element={<CatalogPage type="movie" />} />
              <Route path="series" element={<CatalogPage type="tv" />} />
              <Route path="movie/:id" element={<DetailPage type="movie" />} />
              <Route path="tv/:id" element={<DetailPage type="tv" />} />
              <Route path="person/:id" element={<PersonPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="rankings" element={<RankingsPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="what-to-watch" element={<WhatToWatchPage />} />
              <Route path="diary" element={<DiaryPage />} />
              <Route path="lists" element={<ListsPage />} />
              <Route path="lists/:id" element={<ListsPage />} />
              <Route path="streaming" element={<StreamingPage />} />
              <Route path="genre/:type/:slug" element={<GenrePage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="marathon" element={<MarathonPage />} />
              <Route path="collection/:id" element={<CollectionPage />} />
              <Route path="stats" element={<StatsPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  )
}
