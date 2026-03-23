import { useEffect } from 'react';

let gtmLoaded = false;

export function useAnalytics() {
  useEffect(() => {
    if (gtmLoaded) return;

    async function loadGTM() {
      try {
        const res = await fetch('/api/analytics');
        const data = await res.json();
        const gtmId = data.gtm_id;

        if (!gtmId || gtmId.trim() === '') return;

        // Initialize dataLayer
        (window as any).dataLayer = (window as any).dataLayer || [];

        // Inject GTM script
        const script = document.createElement('script');
        script.textContent = `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `;
        document.head.insertBefore(script, document.head.firstChild);

        // Inject GTM noscript fallback in body
        const noscript = document.createElement('noscript');
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
        iframe.height = '0';
        iframe.width = '0';
        iframe.style.display = 'none';
        iframe.style.visibility = 'hidden';
        noscript.appendChild(iframe);
        document.body.insertBefore(noscript, document.body.firstChild);

        gtmLoaded = true;
        console.log('✓ Google Tag Manager loaded:', gtmId);
      } catch {
        // Silently fail — analytics is optional
      }
    }

    loadGTM();
  }, []);
}

// Push events to the dataLayer — GTM will route them to GA, Meta Pixel, etc.
export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window !== 'undefined' && (window as any).dataLayer) {
    (window as any).dataLayer.push({
      event: action,
      event_category: category,
      event_label: label,
      event_value: value,
    });
  }
}

// Track standard e-commerce/conversion events (InitiateCheckout, Purchase, etc.)
export function trackConversion(eventName: string, data?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).dataLayer) {
    (window as any).dataLayer.push({
      event: eventName,
      ...data,
    });
  }
}
