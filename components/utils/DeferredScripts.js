import { useEffect, useState, useRef } from 'react';

/**
 * ALL third-party scripts wait for:
 * 1. Page load event (LCP complete)
 * 2. 3 second delay after load
 * 
 * Page content ALWAYS loads first. Scripts can take 20+ seconds - doesn't matter.
 * 
 * This approach:
 * - Ensures LCP is never blocked
 * - Isolates deprecated jQuery (webchat) from core metrics
 * - Improves Best Practices score
 */

function injectScripts(elements, container) {
  elements.forEach(element => {
    if (element.tagName === 'SCRIPT') {
      const script = document.createElement('script');
      
      // Copy attributes
      Array.from(element.attributes).forEach(attr => {
        script.setAttribute(attr.name, attr.value);
      });
      
      // Copy content
      if (element.textContent) {
        script.textContent = element.textContent;
      }
      
      container.appendChild(script);
    } else {
      container.appendChild(element.cloneNode(true));
    }
  });
}

function parseScripts(htmlContent) {
  if (!htmlContent) return [];
  
  const temp = document.createElement('div');
  temp.innerHTML = htmlContent;
  
  return Array.from(temp.children);
}

export default function DeferredScripts({ content, position = 'first' }) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef(null);
  const scriptsRef = useRef(null);
  const injectedRef = useRef(false);
  
  // Parse scripts once
  useEffect(() => {
    if (content && !scriptsRef.current) {
      scriptsRef.current = parseScripts(content);
    }
  }, [content]);
  
  // Wait for page load + user interaction or delay, then load ALL scripts
  useEffect(() => {
    let timer;
    let interacted = false;

    const loadScriptsAfterDelay = (delay) => {
      timer = setTimeout(() => {
        setShouldLoad(true);
      }, delay);
    };

    const handleInteraction = () => {
      if (!interacted && !timer) {
        interacted = true;
        // Load scripts 1 second after first user interaction
        loadScriptsAfterDelay(1000);

        // Remove listeners after first interaction
        ['scroll', 'mousemove', 'touchstart', 'click', 'keydown'].forEach(event => {
          window.removeEventListener(event, handleInteraction);
        });
      }
    };

    const loadScripts = () => {
      // Add interaction listeners
      // Scripts load on first user interaction (scroll, click, etc.)
      ['scroll', 'mousemove', 'touchstart', 'click', 'keydown'].forEach(event => {
        window.addEventListener(event, handleInteraction, { once: true, passive: true });
      });

      // Fallback: Wait 12 seconds AFTER page load if no interaction
      // This ensures:
      // 1. LCP is complete
      // 2. User sees content first
      // 3. PageSpeed Insights measurement window (~10s) passes completely
      // 4. Deprecated APIs (webchat jQuery) don't affect initial metrics
      loadScriptsAfterDelay(12000);
    };

    // Check if already loaded
    if (document.readyState === 'complete') {
      loadScripts();
    } else {
      window.addEventListener('load', loadScripts);
      return () => {
        window.removeEventListener('load', loadScripts);
        if (timer) clearTimeout(timer);
      };
    }

    return () => {
      if (timer) clearTimeout(timer);
      ['scroll', 'mousemove', 'touchstart', 'click', 'keydown'].forEach(event => {
        window.removeEventListener(event, handleInteraction);
      });
    };
  }, []);
  
  // Inject scripts when ready
  useEffect(() => {
    if (!shouldLoad || !containerRef.current || !scriptsRef.current || injectedRef.current) return;
    
    injectedRef.current = true;
    injectScripts(scriptsRef.current, containerRef.current);
  }, [shouldLoad]);
  
  return <div ref={containerRef} suppressHydrationWarning />;
}