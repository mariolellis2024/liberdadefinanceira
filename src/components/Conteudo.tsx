import CtaButton from './CtaButton';
import SecurityBadge from './SecurityBadge';

const aulas = [
  'Boas-vindas',
  'Orçamento Pessoal',
  'Crenças em relação ao dinheiro',
  'Ferida Econômica',
  'Tríade do Dinheiro',
];

const materiais = [
  {
    titulo: 'Planilha Orçamento Sustentável para download',
    descricao:
      'Modelo simples e prático para organizar entradas e saídas e direcionar o seu dinheiro.',
  },
  {
    titulo: 'Orientação prática de preenchimento',
    descricao:
      'Exemplo aplicado dentro da aula para você começar já na primeira semana.',
  },
];

const bonus = [
  {
    tag: 'BÔNUS 1',
    titulo: 'Calcule o preço real do seu carro',
    descricao: 'Entenda o custo total e o impacto financeiro dessa decisão.',
  },
  {
    tag: 'BÔNUS 2',
    titulo: '7 passos para sair das dívidas',
    descricao: 'Estrutura prática para organizar e reduzir endividamento.',
  },
];

export default function Conteudo() {
  return (
    <section id="conteudo" className="section-conteudo">
      <div className="container">
        <h2>O que você recebe</h2>
        <p>
          Você não está comprando apenas aulas. Está adquirindo{' '}
          <span className="bold-white">método, estrutura e ferramenta</span>{' '}
          para aplicar.
        </p>
        <p className="conteudo-acesso">
          Ao se inscrever, você tem acesso imediato a todo o conteúdo abaixo:
        </p>

        {/* 1. Aulas do curso */}
        <h3 className="group-title">1. Aulas do curso</h3>
        <div className="lesson-list">
          {aulas.map((aula, i) => (
            <div key={i} className="lesson-card">
              <span className="lesson-number">{i + 1}</span>
              <span>{aula}</span>
              <span className="lesson-chevron">˅</span>
            </div>
          ))}
        </div>

        {/* 2. Material prático */}
        <h3 className="group-title">2. Material prático para aplicação</h3>
        <div className="material-list">
          {materiais.map((mat, i) => (
            <div key={i} className="material-card">
              <h4>{mat.titulo}</h4>
              <p>{mat.descricao}</p>
            </div>
          ))}
        </div>

        {/* 3. Bônus */}
        <h3 className="group-title">3. Bônus exclusivos da primeira turma</h3>
        <div className="bonus-grid">
          {bonus.map((b, i) => (
            <div key={i} className="bonus-card">
              <div className="bonus-tag">★ {b.tag}</div>
              <h4>{b.titulo}</h4>
              <p>{b.descricao}</p>
            </div>
          ))}
        </div>

        <CtaButton />
        <SecurityBadge />
      </div>
    </section>
  );
}
