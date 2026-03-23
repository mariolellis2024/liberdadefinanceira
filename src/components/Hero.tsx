import { useEffect, useRef } from 'react';
import CtaButton from './CtaButton';
import SecurityBadge from './SecurityBadge';
import { useVturb } from '../hooks/useVturb';

export default function Hero() {
  const { videoCode, loading } = useVturb();
  const videoRef = useRef<HTMLDivElement>(null);

  // When the video code is loaded, inject it and execute the scripts
  useEffect(() => {
    if (!videoCode || !videoRef.current) return;

    // Parse the HTML to separate the custom element from the script
    const parser = new DOMParser();
    const doc = parser.parseFromString(videoCode, 'text/html');

    // Clear existing content
    videoRef.current.innerHTML = '';

    // Inject the HTML elements (vturb-smartplayer, etc.)
    Array.from(doc.body.childNodes).forEach((node) => {
      if (node.nodeName === 'SCRIPT') {
        // Scripts need to be re-created to execute
        const script = document.createElement('script');
        const originalScript = node as HTMLScriptElement;
        if (originalScript.src) {
          script.src = originalScript.src;
          script.async = true;
        } else {
          script.textContent = originalScript.textContent;
        }
        if (originalScript.type) script.type = originalScript.type;
        videoRef.current!.appendChild(script);
      } else {
        videoRef.current!.appendChild(node.cloneNode(true));
      }
    });

    console.log('✓ VTURB player injected');
  }, [videoCode]);

  const showPlaceholder = loading || !videoCode;

  return (
    <section id="hero" className="hero">
      <div className="container">
        <span className="hero-tag">CURSO LIBERDADE FINANCEIRA</span>
        <h1>
          Organize seu dinheiro
          <br />
          com <span className="highlight">método simples</span>
        </h1>
        <p className="hero-sub">
          Curso 100% online para estruturar seu dinheiro integrando técnica
          financeira, padrões emocionais e consciência nas decisões.
        </p>
        <p className="hero-details">
          5 aulas práticas + Planilha Livro Caixa + Bônus exclusivo da primeira
          turma
        </p>

        {/* Video — VTURB player or placeholder */}
        <div className="video-wrapper">
          {showPlaceholder ? (
            <div className="video-placeholder" id="videoPlaceholder">
              <div className="play-icon">
                <svg viewBox="0 0 24 24">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </div>
              <span>Clique para assistir o vídeo</span>
            </div>
          ) : (
            <div ref={videoRef} className="vturb-container" />
          )}
        </div>

        <CtaButton />
        <SecurityBadge />
        <div className="trust-badges">
          <span>Acesso imediato</span>
          <span className="dot">•</span>
          <span>Curso 100% online</span>
          <span className="dot">•</span>
          <span>Aplicação prática</span>
        </div>
      </div>
    </section>
  );
}
