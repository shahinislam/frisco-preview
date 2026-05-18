import { useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function GoogleTranslate({ shouldLoad = false }) {
  const initialized = useRef(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!shouldLoad || initialized.current) return;

    // Defensive: ensure googtrans cookie is set based on URL before the
    // widget reads it. Middleware should set this, but on statically
    // generated /es root the Set-Cookie sometimes doesn't reach the
    // browser. Setting it here guarantees the widget knows the target.
    const localeMatch = window.location.pathname.match(/^\/([a-z]{2})(\/|$)/);
    const urlLocale = localeMatch?.[1];
    if (urlLocale && urlLocale !== "en") {
      document.cookie = `googtrans=/en/${urlLocale}; path=/; max-age=${
        60 * 60 * 24 * 365
      }`;
    }

    // Set global callback
    window.googleTranslateElementInit = () => {
      const container = document.getElementById("google_translate_element");
      if (!container) return;

      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,es,ur,hi,ar,ml,vi,ig,yo,bn",
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };

    initialized.current = true;
    setScriptLoaded(true);
  }, [shouldLoad]);

  return (
    <>
      {/* Hidden Google Translate container */}
      <div
        id="google_translate_element"
        style={{ position: "absolute", top: "-9999px", left: "-9999px" }}
      />

      {/* Only load script when needed */}
      {scriptLoaded && (
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      )}

      {/* Hide Google Translate UI */}
      <style jsx global>{`
        .goog-te-banner-frame,
        .goog-te-balloon-frame,
        .skiptranslate,
        .goog-logo-link,
        .goog-te-gadget,
        .goog-te-gadget span {
          display: none !important;
        }

        body {
          top: 0 !important;
          position: static !important;
        }

        #google_translate_element {
          display: none !important;
        }
      `}</style>
    </>
  );
}