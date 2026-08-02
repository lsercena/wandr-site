import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import PageLoader from '@/components/ui/PageLoader';

const HomePage = lazy(() => import('@/pages/HomePage'));
const ExplorePage = lazy(() => import('@/pages/ExplorePage'));
const CountryPage = lazy(() => import('@/pages/CountryPage'));
const NomadVisasPage = lazy(() => import('@/pages/NomadVisasPage'));
const VisaFinderPage = lazy(() => import('@/pages/VisaFinderPage'));
const TravelPlannerPage = lazy(() => import('@/pages/TravelPlannerPage'));
const CostCalculatorPage = lazy(() => import('@/pages/CostCalculatorPage'));
const ComparePage = lazy(() => import('@/pages/ComparePage'));
const GuidesPage = lazy(() => import('@/pages/GuidesPage'));
const ResourcesPage = lazy(() => import('@/pages/ResourcesPage'));
const AssistantPage = lazy(() => import('@/pages/AssistantPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const SeoPage = lazy(() => import('@/pages/SeoPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/countries/:slug" element={<CountryPage />} />
          <Route path="/digital-nomad-visas" element={<NomadVisasPage />} />
          <Route path="/visa-finder" element={<VisaFinderPage />} />
          <Route path="/travel-planner" element={<TravelPlannerPage />} />
          <Route path="/cost-calculator" element={<CostCalculatorPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/guides" element={<GuidesPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/seo/:slug" element={<SeoPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
