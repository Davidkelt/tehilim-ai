import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useSettings } from './hooks/useSettings';
import { useScrollToTop } from './hooks/useScrollToTop';
import Layout from './components/Layout';
import ToastContainer from './components/ToastContainer';
import Home from './pages/Home';
import ChapterView from './pages/ChapterView';

// Lazy-load less-visited pages to reduce initial bundle size
const Favorites = lazy(() => import('./pages/Favorites'));
const Settings = lazy(() => import('./pages/Settings'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));

export default function App() {
  // Initialize settings (applies dark mode)
  useSettings();
  useScrollToTop();

  const loadingFallback = (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-600 border-t-transparent" />
    </div>
  );

  return (
    <>
      <Layout>
        <Suspense fallback={loadingFallback}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chapter/:id" element={<ChapterView />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/auth" element={<AuthPage />} />
          </Routes>
        </Suspense>
      </Layout>
      <ToastContainer />
    </>
  );
}
