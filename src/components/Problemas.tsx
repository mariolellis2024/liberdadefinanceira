import CtaButton from './CtaButton';
import SecurityBadge from './SecurityBadge';

const problemas = [
  'O dinheiro entra e você não sabe exatamente para onde foi.',
  'Você evita olhar conta ou cartão porque isso gera ansiedade.',
  'Você gasta por impulso, pressão social ou cansaço.',
  'Você vive resolvendo urgências financeiras.',
  'Você tenta se organizar, mas não sustenta porque falta método.',
];

function XIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

export default function Problemas() {
  return (
    <section id="problemas" className="section-problemas">
      <div className="container">
        <h2>Se você vive isso, o curso é para você</h2>
        <p>
          Você não precisa ganhar mais para começar.{' '}
          <span className="bold-white">Você precisa de estrutura.</span>
        </p>
        <p className="problemas-intro">
          Talvez você esteja vivendo algo assim:
        </p>

        <div className="problemas-grid">
          {problemas.map((texto, i) => (
            <div
              key={i}
              className={`problema-card${i === problemas.length - 1 ? ' full-width' : ''}`}
            >
              <div className="problema-icon">
                <XIcon />
              </div>
              <p>{texto}</p>
            </div>
          ))}
        </div>

        <div className="resumo-box">
          <p>E quase sempre a raiz é a mesma:</p>
          <p className="bold-line">
            Falta de estrutura. Orçamento, metas e rotina.
            <br />
            Padrões emocionais e crenças que distorcem decisões.
          </p>
        </div>

        <CtaButton />
        <SecurityBadge />
      </div>
    </section>
  );
}
