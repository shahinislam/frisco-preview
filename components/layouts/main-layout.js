import { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { RiArrowUpSLine, RiCloseLine } from "react-icons/ri";
import { MdLanguage } from "react-icons/md";
import Head from "next/head";
import { useRouter } from "next/router";
import { useLayout } from "../../contexts/LayoutContext";

const DeferredScripts = dynamic(() => import("../utils/DeferredScripts"), {
  ssr: false, // ✅ Force client-side only
});

// Dynamic imports with loading states
const MainMenu = dynamic(() => import("./main-menu"), {
  loading: () => <div style={{ height: "45px" }} />,
  ssr: true,
});

const TopNavbar = dynamic(() => import("./top-navbar"), {
  loading: () => <div style={{ height: "28px" }} />,
  ssr: true,
});

const BottomMenu = dynamic(() => import("./bottom-menu"), {
  ssr: true,
});

const MainFooter = dynamic(() => import("./main-footer"), {
  ssr: true,
});

const GoogleTranslate = dynamic(() => import("./GoogleTranslate"), {
  ssr: false,
  loading: () => null,
});

const SUPPORTED_LANGUAGES = {
  en: "English",
  es: "Español",
  ur: "اردو",
  hi: "हिन्दी",
  ar: "العربية",
  ml: "മلയാളം",
  vi: "Tiếng Việt",
  ig: "Igbo",
  yo: "Yorùbá",
  bn: "বাংলা",
};

export default function MainLayout({ children }) {
  const [scrollBtn, setScrollBtn] = useState(false);
  const router = useRouter();

  const {
    mainMenu: menuItems,
    mainMenuBtn,
    mobileMainMenu,
    topMenu,
    mobileTopMenu,
    bottomMenu,
    footer,
    globalTags,
    mobileLayout,
  } = useLayout();

  // Language is the Next.js i18n locale. Source of truth on both server
  // and client; no hydration mismatch, no URL regex needed.
  const currentLang =
    router.locale && SUPPORTED_LANGUAGES[router.locale] ? router.locale : "en";

  // Path without the locale prefix (router.asPath already excludes locale
  // under i18n routing).
  const basePath = router.asPath.split("?")[0] || "/";

  useEffect(() => {
    let timeoutId;

    const handleScroll = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        setScrollBtn(window.scrollY > 400);
      }, 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  const phoneNumber = useMemo(() => mobileLayout?.bottom || "", [mobileLayout]);

  // Handle close button (reset to English)
  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Clear ALL Google Translate cookies
    document.cookie =
      "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie =
      "googtrans=; path=/; domain=" +
      window.location.hostname +
      "; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie =
      "googtrans=; domain=." +
      window.location.hostname +
      "; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

    // Use replace instead of href to bypass cache
    window.location.replace(basePath);
  };

  // Update language change handler
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;

    const newPath = newLang === "en" ? basePath : `/${newLang}${basePath}`;

    // Clear old cookies
    document.cookie =
      "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie =
      "googtrans=; domain=" +
      window.location.hostname +
      "; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

    // Set new cookie if not English
    if (newLang !== "en") {
      document.cookie = `googtrans=/en/${newLang}; path=/; max-age=${60 * 60 * 24 * 365}`;
    }

    // Use replace to bypass cache
    window.location.replace(newPath);
  };

  return (
    <>
      <Head>
        <meta
          property="og:site_name"
          content="SignatureCare Emergency Center"
          key="og:site_name"
        />
        <meta property="og:locale" content="en_US" key="og:locale" />
        <meta property="og:type" content="website" key="og:type" />
        <meta
          property="article:publisher"
          content="https://www.facebook.com/SignatureCareER/"
          key="article:publisher"
        />
        <meta name="geo.placename" content="Houston" key="geo.placename" />
        <meta
          name="geo.position"
          content="29.744225;-95.3918991"
          key="geo.position"
        />
        <meta name="geo.region" content="United States (US)" key="geo.region" />

        <link rel="preconnect" href="https://translate.googleapis.com" />
        <link rel="preconnect" href="https://translate.google.com" />
      </Head>

      {globalTags?.first && (
        // <div suppressHydrationWarning>{parse(globalTags.first)}</div>
        <DeferredScripts content={globalTags.first} position="first" />
      )}

      {/* Hidden Google Translate - triggers translation in background */}
      <GoogleTranslate shouldLoad={currentLang !== "en"} />

      {/* Language Switcher - Desktop: Floating, Mobile: Full Width */}

      {/* Desktop Version - Floating */}
      <div
        className="d-none d-md-block"
        style={{
          position: "fixed",
          top: "10px",
          left: "10px",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "6px 10px",
            borderRadius: "6px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            border: "1px solid #dee2e6",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            flexWrap: "nowrap",
          }}
        >
          <MdLanguage size={16} style={{ color: "#495057", flexShrink: 0 }} />
          <select
            key={`lang-${currentLang}`} // Force re-render when language changes
            value={currentLang}
            onChange={handleLanguageChange}
            style={{
              border: "1px solid #ced4da",
              borderRadius: "4px",
              padding: "3px 6px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500",
              backgroundColor: "white",
              color: "#495057",
              outline: "none",
              minWidth: "90px",
              flexShrink: 0,
            }}
            aria-label="Select Language"
          >
            {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>

          {/* Close/Reset Button - Always visible */}
          <button
            onClick={handleClose}
            title={`Reset to English (Current: ${SUPPORTED_LANGUAGES[currentLang]})`}
            style={{
              background: "transparent",
              border: "1px solid #dee2e6",
              borderRadius: "4px",
              cursor: "pointer",
              padding: "3px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: currentLang !== "en" ? "#dc3545" : "#6c757d",
              transition: "all 0.2s",
              flexShrink: 0,
              lineHeight: 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#212529")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color =
                currentLang !== "en" ? "#dc3545" : "#6c757d")
            }
            aria-label="Reset to English"
          >
            <RiCloseLine size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Version - Full Width Top Bar */}
      <div
        className="d-md-none"
        style={{
          backgroundColor: "#f8f9fa",
          borderBottom: "1px solid #dee2e6",
          padding: "6px 0",
        }}
      >
        <div className="container-fluid">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                flex: 1,
              }}
            >
              <MdLanguage
                size={16}
                style={{ color: "#495057", flexShrink: 0 }}
              />
              <select
                key={`lang-mobile-${currentLang}`} // Force re-render when language changes
                value={currentLang}
                onChange={handleLanguageChange}
                style={{
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  padding: "5px 8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                  backgroundColor: "white",
                  color: "#495057",
                  outline: "none",
                  flex: 1,
                  width: "100%",
                }}
                aria-label="Select Language"
              >
                {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Close/Reset Button - Always visible */}
            <button
              onClick={handleClose}
              title={`Reset to English (Current: ${SUPPORTED_LANGUAGES[currentLang]})`}
              style={{
                background: "#f8f9fa",
                border: "1px solid #dee2e6",
                borderRadius: "4px",
                cursor: "pointer",
                padding: "5px 8px",
                display: "flex",
                alignItems: "center",
                color: currentLang !== "en" ? "#dc3545" : "#6c757d",
                fontSize: "12px",
                fontWeight: "600",
                whiteSpace: "nowrap",
              }}
              aria-label="Reset to English"
            >
              <RiCloseLine size={16} style={{ marginRight: "3px" }} />
              Close
            </button>
          </div>
        </div>
      </div>

      <div className="page-container">
        <div className="sticky-md-top">
          <div className="d-none d-md-block">
            <TopNavbar menuItems={topMenu} style={{ height: "28px" }} />
            <MainMenu
              menuItems={menuItems}
              mainMenuBtn={mainMenuBtn}
              style={{ height: "45px" }}
            />
          </div>

          <div className="d-block d-md-none">
            <TopNavbar menuItems={mobileTopMenu} style={{ height: "28px" }} />
            <MainMenu
              menuItems={mobileMainMenu}
              mainMenuBtn={mainMenuBtn}
              style={{ height: "45px" }}
            />
          </div>
        </div>

        <div className="content-wrap" style={{ minHeight: "700px" }}>
          {children}
        </div>

        {scrollBtn && (
          <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            style={{
              position: "fixed",
              bottom: "5px",
              left: "40px",
              padding: "5px 10px",
              backgroundColor: "black",
              color: "white",
              borderRadius: "5px 5px 0 0",
              cursor: "pointer",
              zIndex: "1",
              border: "none",
            }}
          >
            <RiArrowUpSLine className="fa-2x" aria-hidden="true" />
          </button>
        )}

        <footer className="footer text-white">
          <MainFooter footer={footer} />
        </footer>

        <BottomMenu menuItems={bottomMenu} />
      </div>

      <nav
        className="d-lg-none navbar fixed-bottom navbar-dark p-1"
        style={{ backgroundColor: "hsl(0, 100%, 40%)" }}
        aria-label="Mobile call navigation"
      >
        <div className="container-fluid">
          <a
            className="navbar-brand mx-auto"
            href={`tel:${phoneNumber}`}
            aria-label={`Call us at ${phoneNumber}`}
          >
            Call us now!
          </a>
        </div>
      </nav>

      {globalTags?.second && (
        // <div suppressHydrationWarning>{parse(globalTags.second)}</div>
        <DeferredScripts content={globalTags.second} position="second" />
      )}
    </>
  );
}
