import CtaButton from './CtaButton';
import SecurityBadge from './SecurityBadge';

const pilares = [
  {
    titulo: 'Direção',
    descricao: 'Saber para onde o dinheiro vai.',
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    titulo: 'Consciência',
    descricao: 'Entender por que você decide como decide.',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    titulo: 'Estrutura',
    descricao: 'Orçamento, rotina e critérios claros.',
    icon: (
      <svg viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
];

export default function Diferente() {
  return (
    <section id="diferente" className="section-diferente">
      <div className="container">
        <h2>Por que este curso é diferente</h2>
        <p>
          Este curso não promete riqueza rápida.{' '}
          <span className="bold-white">Ele ensina estrutura.</span>
        </p>
        <p className="diferente-sub">Aqui, liberdade financeira significa:</p>

        <div className="pilares-grid">
          {pilares.map((pilar, i) => (
            <div key={i} className="pilar-card fade-in">
              <div className="pilar-icon">{pilar.icon}</div>
              <h3>{pilar.titulo}</h3>
              <p>{pilar.descricao}</p>
            </div>
          ))}
        </div>

        <p className="diferente-final">
          Quando esses três pilares se organizam, o dinheiro deixa de gerar
          tensão e passa a funcionar como recurso a serviço da vida que você quer
          construir.
        </p>

        <CtaButton />
        <SecurityBadge />
      </div>
    </section>
  );
}
