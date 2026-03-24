import { trackEvent, trackConversion } from '../hooks/useAnalytics';
import { useVariation } from '../hooks/useVariation';

interface CtaButtonProps {
  href?: string;
}

export default function CtaButton({ href = '#preco' }: CtaButtonProps) {
  const { variation } = useVariation();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const variationLabel = variation
      ? `${variation.name} (ID: ${variation.id}) - ${variation.price_avista}`
      : 'sem-variacao';

    // Track CTA click via dataLayer (GTM → GA + Meta Pixel)
    trackEvent('cta_click', 'CTA', variationLabel);

    // Record click server-side for admin analytics
    if (variation) {
      fetch('/api/variation/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variation_id: variation.id }),
      }).catch(() => {});
    }

    // If variation has a link, fire InitiateCheckout + redirect
    if (variation?.link) {
      // InitiateCheckout — Meta Pixel standard event (via GTM dataLayer)
      trackConversion('InitiateCheckout', {
        content_name: variation.name,
        content_category: 'Curso Liberdade Financeira',
        currency: 'BRL',
        value: parseFloat(variation.price_avista.replace(/[^\d,]/g, '').replace(',', '.')),
        variation_id: variation.id,
        variation_name: variation.name,
      });

      // GA4 begin_checkout event (via GTM dataLayer)
      trackConversion('begin_checkout', {
        currency: 'BRL',
        value: parseFloat(variation.price_avista.replace(/[^\d,]/g, '').replace(',', '.')),
        items: [{
          item_name: 'Curso Liberdade Financeira',
          item_variant: variation.name,
          price: parseFloat(variation.price_avista.replace(/[^\d,]/g, '').replace(',', '.')),
          quantity: 1,
        }],
      });

      // Small delay to ensure events fire before redirect
      setTimeout(() => {
        // Append all current URL params (UTMs + src) to the checkout link
        const currentParams = new URLSearchParams(window.location.search);
        const checkoutUrl = new URL(variation.link);
        currentParams.forEach((value, key) => {
          // Don't override params that already exist in the checkout link
          // Skip preview_mode as it's internal only
          if (key !== 'preview_mode' && !checkoutUrl.searchParams.has(key)) {
            checkoutUrl.searchParams.set(key, value);
          }
        });
        window.open(checkoutUrl.toString(), '_blank');
      }, 150);
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
