const resultados = [
  'Mapear sua realidade financeira com objetividade e responsabilidade.',
  'Estruturar um orçamento sustentável usando o Orçamento Pessoal.',
  'Identificar padrões emocionais que influenciam consumo e endividamento.',
  'Criar um plano simples para reduzir desorganização e aumentar previsibilidade.',
  'Tomar decisões financeiras com mais consciência e critério.',
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export default function Resultados() {
  return (
    <section
      className="section-bg-image section-resultados"
      style={{ backgroundImage: "url('/calculator-bg.png')" }}
    >
      <div className="container">
        <h2>O que você vai conseguir fazer após o curso</h2>
        <p className="sub">Ao final do curso, você será capaz de:</p>

        <div className="resultados-list">
          {resultados.map((texto, i) => (
            <div key={i} className="resultado-item fade-in">
              <div className="resultado-number">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="resultado-check">
                <CheckIcon />
              </div>
              <p>{texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
