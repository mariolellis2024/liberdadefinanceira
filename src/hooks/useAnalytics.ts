import { useEffect } from 'react';

let analyticsLoaded = false;

export function useAnalytics() {
  useEffect(() => {
    if (analyticsLoaded) return;

    async function loadAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        const data = await res.json();
        const gaId = data.ga_tracking_id;

        if (!gaId || gaId.trim() === '') return;

        // Inject gtag.js script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(script);

        // Init gtag
        const inlineScript = document.createElement('script');
        inlineScript.textContent = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
            send_page_view: true
          });
        `;
        document.head.appendChild(inlineScript);

        analyticsLoaded = true;
        console.log('✓ Google Analytics loaded:', gaId);
      } catch {
        // Silently fail — analytics is optional
      }
    }

    loadAnalytics();
  }, []);
}

// Track custom events (CTA clicks, FAQ opens, etc.)
export function trackEvent(action: string, category: string, label?: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }
}
