import CtaButton from './CtaButton';
import SecurityBadge from './SecurityBadge';

export default function Hero() {
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

        {/* Video Placeholder */}
        <div className="video-wrapper">
          <div className="video-placeholder" id="videoPlaceholder">
            <div className="play-icon">
              <svg viewBox="0 0 24 24">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
            <span>Clique para assistir o vídeo</span>
          </div>
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
