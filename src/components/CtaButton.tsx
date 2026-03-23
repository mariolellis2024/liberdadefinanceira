interface CtaButtonProps {
  href?: string;
}

export default function CtaButton({ href = '#preco' }: CtaButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a href={href} className="btn-cta" onClick={handleClick}>
      Quero organizar meu dinheiro com método <span className="arrow">→</span>
    </a>
  );
}
