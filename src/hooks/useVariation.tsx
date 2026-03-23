import { useState, useEffect, createContext, useContext } from 'react';
import { trackEvent } from './useAnalytics';

interface Variation {
  id: number;
  name: string;
  link: string;
  price_original: string;
  price_avista: string;
  price_parcelas: string;
}

interface VariationContextType {
  variation: Variation | null;
  loading: boolean;
}

const VariationContext = createContext<VariationContextType>({
  variation: null,
  loading: true,
});

const LS_KEY = 'lf_variation_id';

export function VariationProvider({ children }: { children: React.ReactNode }) {
  const [variation, setVariation] = useState<Variation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVariation() {
      try {
        // Check localStorage for a previously assigned variation ID
        const savedId = localStorage.getItem(LS_KEY);

        // Send the saved ID as a query param so the server can use it as fallback
        const url = savedId ? `/api/variation?saved_id=${savedId}` : '/api/variation';
        const res = await fetch(url);
        const data = await res.json();

        if (data.variation) {
          setVariation(data.variation);

          // Persist to localStorage as backup (survives cookie clears)
          localStorage.setItem(LS_KEY, String(data.variation.id));

          // Track which variation was assigned
          trackEvent('variation_assigned', 'AB_Test', `${data.variation.name} (ID: ${data.variation.id})`);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchVariation();
  }, []);

  return (
    <VariationContext.Provider value={{ variation, loading }}>
      {children}
    </VariationContext.Provider>
  );
}

export function useVariation() {
  return useContext(VariationContext);
}
