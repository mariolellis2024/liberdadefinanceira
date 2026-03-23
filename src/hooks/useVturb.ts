import { useState, useEffect } from 'react';

interface VturbData {
  videoCode: string;
  speedCode: string;
}

let speedCodeInjected = false;

export function useVturb() {
  const [data, setData] = useState<VturbData>({ videoCode: '', speedCode: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/video');
        const json = await res.json();
        const videoCode = json.vturb_video_code || '';
        const speedCode = json.vturb_speed_code || '';

        // Inject speed code into <head> IMMEDIATELY — it must run before the player loads
        if (speedCode && !speedCodeInjected) {
          speedCodeInjected = true;

          // Parse the speed code HTML and inject each element into <head>
          const parser = new DOMParser();
          const doc = parser.parseFromString(speedCode, 'text/html');

          // Inject <link> elements (preload, dns-prefetch)
          doc.querySelectorAll('link').forEach((link) => {
            const newLink = document.createElement('link');
            link.getAttributeNames().forEach((attr) => {
              newLink.setAttribute(attr, link.getAttribute(attr)!);
            });
            document.head.appendChild(newLink);
          });

          // Inject <script> elements (performance timing)
          doc.querySelectorAll('script').forEach((script) => {
            const newScript = document.createElement('script');
            if (script.src) {
              newScript.src = script.src;
              newScript.async = true;
            } else {
              newScript.textContent = script.textContent;
            }
            document.head.appendChild(newScript);
          });

          console.log('✓ VTURB speed code injected into <head>');
        }

        setData({ videoCode, speedCode });
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { ...data, loading };
}
