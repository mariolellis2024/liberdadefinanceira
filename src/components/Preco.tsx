import CtaButton from './CtaButton';
import SecurityBadge from './SecurityBadge';

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

const features = [
  '5 aulas práticas (2h de conteúdo)',
  'Planilha Orçamento Sustentável',
  '2 bônus exclusivos',
  'Acesso por 12 meses',
  'Estude no seu ritmo',
];

export default function Preco() {
  return (
    <section id="preco" className="section-preco">
      <div className="container">
        <h2>Investimento</h2>
        <p>
          A organização financeira não começa quando você ganha mais.{' '}
          <span className="bold-white">
            Ela começa quando você decide estruturar melhor.
          </span>
        </p>
        <p className="preco-sub">
          Se você quer organizar seu dinheiro com método, este é o próximo passo.
        </p>

        <div className="preco-card">
          <div className="preco-badge">PRIMEIRA TURMA</div>
          <div className="preco-old">
            <span className="strikethrough">R$ 394</span>
            <span className="preco-off">50% OFF</span>
          </div>
          <div className="preco-valor">R$ 197</div>
          <p className="preco-avista">à vista</p>
          <p className="preco-parcelas">
            ou <strong>12x de R$ 19,70</strong>
          </p>

          <ul className="preco-features">
            {features.map((feat, i) => (
              <li key={i}>
                <span className="check-icon">
                  <CheckIcon />
                </span>
                {feat}
              </li>
            ))}
          </ul>

          <CtaButton href="#" />
          <SecurityBadge />

          <div className="garantia-box">
            <div className="garantia-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <p>
              <strong>Garantia de 7 dias.</strong> Se não fizer sentido para
              você, devolvemos 100% do valor.
            </p>
          </div>
        </div>

        <p className="preco-nota">
          A decisão de organizar seu dinheiro é mais importante que o valor deste
          investimento.
        </p>
      </div>
    </section>
  );
}
