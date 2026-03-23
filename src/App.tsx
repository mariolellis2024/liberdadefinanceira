import { useEffect } from 'react';
import Hero from './components/Hero';
import Problemas from './components/Problemas';
import Resultados from './components/Resultados';
import Conteudo from './components/Conteudo';
import Diferente from './components/Diferente';
import Instrutor from './components/Instrutor';
import Preco from './components/Preco';
import Faq from './components/Faq';
import Footer from './components/Footer';

export default function App() {
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
      <Problemas />
      <Resultados />
      <Conteudo />
      <Diferente />
      <Instrutor />
      <Preco />
      <Faq />
      <Footer />
    </>
  );
}
