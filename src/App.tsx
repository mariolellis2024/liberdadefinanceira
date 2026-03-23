import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Hero from './components/Hero';
import Headline from './components/Headline';
import Problemas from './components/Problemas';
import Resultados from './components/Resultados';
import Conteudo from './components/Conteudo';
import Diferente from './components/Diferente';
import Instrutor from './components/Instrutor';
import Preco from './components/Preco';
import Faq from './components/Faq';
import Footer from './components/Footer';
import Admin from './pages/Admin';
import { useAnalytics } from './hooks/useAnalytics';
import { VariationProvider, useVariation } from './hooks/useVariation';

function LandingPageContent() {
  const { variation } = useVariation();

  // Allow admins to preview a specific mode via ?preview_mode=open|hidden
  const previewMode = new URLSearchParams(window.location.search).get('preview_mode');
  const isPreview = previewMode === 'open' || previewMode === 'hidden';

  // Determine effective mode
  const effectiveMode = isPreview
    ? previewMode
    : variation?.page_mode || 'open';
  const isHidden = effectiveMode === 'hidden';

  // Only add VTURB IDs when truly hidden (not preview) — otherwise VTURB's JS will hide the content
  // For preview_mode=hidden, use CSS class only (no VTURB IDs)
  const revealId = isHidden && !isPreview ? 'lf-reveal' : undefined;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Hero />
      <div
        className={isHidden ? 'page-content-hidden' : ''}
        id={revealId}
      >
        <Headline />
        <Problemas />
        <Resultados />
        <Conteudo />
        <Diferente />
        <Instrutor />
        <Preco />
        <Faq />
      </div>
      <Footer />
    </>
  );
}

function LandingPage() {
  useAnalytics();

  return (
    <VariationProvider>
      <LandingPageContent />
    </VariationProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
