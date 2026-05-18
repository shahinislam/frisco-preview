import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Merriweather } from "@next/font/google";
import { LayoutProvider } from "../contexts/LayoutContext";
import MainLayout from "../components/layouts/main-layout";
import BootstrapLoader from "../components/utils/BootstrapLoader";
import { trackPageView, captureGclid } from "../components/utils/gtm";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import "../styles/main-layout.css";
import "../styles/content-style.css";
import "../styles/home.css";
import "../styles/sub-location.css";

const merriweather = Merriweather({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "700"], // Reduced from 4 weights to 2 for better performance
  display: "swap",
  preload: true,
  fallback: ["Georgia", "serif"],
  adjustFontFallback: true,
});

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const getLayout = Component.getLayout || ((page) => page);
  const layoutData = pageProps.layoutData || {};

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    captureGclid();
  }, []);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    const handlePageView = (url) => trackPageView(url);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeComplete", handlePageView);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeComplete", handlePageView);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  return (
    <SessionProvider session={pageProps.session}>
      <LayoutProvider layoutData={layoutData}>
        <main className={merriweather.className}>
          {/* Loading bar */}
          {loading && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                background: "linear-gradient(90deg, #01CAB8, #00D9C0, #00E5CC)",
                zIndex: 99999,
                animation: "progress 1s ease-in-out infinite",
                boxShadow: "0 0 10px rgba(1, 202, 184, 0.6)",
              }}
            />
          )}

          <MainLayout>{getLayout(<Component {...pageProps} />)}</MainLayout>
          <BootstrapLoader />
        </main>
      </LayoutProvider>
    </SessionProvider>
  );
}
