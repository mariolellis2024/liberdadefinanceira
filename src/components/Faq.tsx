import { useState } from 'react';

const faqData = [
  {
    pergunta: 'Em quanto tempo começo a aplicar?',
    resposta:
      'Imediatamente. A partir da primeira aula, você já começa a organizar sua vida financeira com ferramentas práticas.',
  },
  {
    pergunta: 'Eu ganho pouco. Serve para mim?',
    resposta:
      'Sim. O foco do curso é estrutura, não renda alta. Independente de quanto você ganha, o método te ajuda a organizar e direcionar melhor o seu dinheiro.',
  },
  {
    pergunta: 'O curso é apenas sobre mentalidade?',
    resposta:
      'Não. O curso integra técnica financeira com consciência comportamental. Você aprende a usar planilhas, criar orçamento e entender padrões emocionais que influenciam suas decisões.',
  },
  {
    pergunta: 'Preciso saber usar planilhas?',
    resposta:
      'Não. O modelo é simples e acessível. Dentro da aula, você recebe orientação prática de preenchimento.',
  },
  {
    pergunta: 'Por quanto tempo terei acesso?',
    resposta:
      'Você terá acesso por 12 meses a todo o conteúdo, incluindo as aulas, planilha e bônus. Pode assistir quantas vezes quiser, no seu ritmo.',
  },
];

export default function Faq() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="section-faq">
      <div className="container">
        <h2>Perguntas frequentes</h2>
        <div className="faq-list">
          {faqData.map((item, i) => (
            <div
              key={i}
              className={`faq-item${activeIndex === i ? ' active' : ''}`}
            >
              <button className="faq-question" onClick={() => toggle(i)}>
                <span>{item.pergunta}</span>
                <span className="faq-chevron">˅</span>
              </button>
              <div className="faq-answer">
                <p>{item.resposta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
