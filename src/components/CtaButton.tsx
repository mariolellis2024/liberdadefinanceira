import { trackEvent } from '../hooks/useAnalytics';
import { useVariation } from '../hooks/useVariation';

interface CtaButtonProps {
  href?: string;
}

export default function CtaButton({ href = '#preco' }: CtaButtonProps) {
  const { variation } = useVariation();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Track CTA click with variation info
    const variationLabel = variation
      ? `${variation.name} (ID: ${variation.id}) - ${variation.price_avista}`
      : 'sem-variacao';
    trackEvent('cta_click', 'CTA', variationLabel);

    // Record click server-side for admin analytics
    if (variation) {
      fetch('/api/variation/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variation_id: variation.id }),
      }).catch(() => {});
    }

    // If variation has a link, go to it; otherwise smooth scroll
    if (variation?.link) {
      trackEvent('checkout_redirect', 'Conversion', variationLabel);
      window.open(variation.link, '_blank');
    } else {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="cta-wrapper">
      <a href={variation?.link || href} className="cta-button" onClick={handleClick}>
        <span>Quero organizar meu dinheiro com método</span>
        <span className="arrow">→</span>
      </a>
      {variation && (
        <div className="cta-pricing">
          <span className="cta-price-original">{variation.price_original}</span>
          <span className="cta-price-avista">{variation.price_avista}</span>
          <span className="cta-price-parcelas">ou {variation.price_parcelas}</span>
        </div>
      )}
    </div>
  );
}
