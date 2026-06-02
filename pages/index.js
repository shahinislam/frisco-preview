import { useEffect, useState, useMemo } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import parse from "html-react-parser";
import Image from "next/image";
import Link from "next/link";
import { MdPayment } from "react-icons/md";
import { LuCalendarCheck } from "react-icons/lu";
import { FaPhone } from "react-icons/fa";
import { BsArrowRightCircleFill } from "react-icons/bs";
import http from "../components/utils/http";
import laravelURL from "../components/utils/laravel-url";
import mainURL from "../components/utils/main-url";
import dynamic from "next/dynamic";
import { getLayoutData } from "../components/utils/getLayoutData";

const MapHome = dynamic(() => import("../components/templates/map-home"), {
  loading: () => <div style={{ height: "440px" }}>Loading Map...</div>,
});

const HomeBelowFold = dynamic(
  () => import("../components/templates/home-below-fold"),
  { ssr: false }
);

export default function Home({ page, locations }) {
  const first = page?.first ? JSON.parse(page.first) : null;
  const sectionSecond = JSON.parse(page?.second);
  const sectionFive = JSON.parse(page?.fifth);
  const sectionSix = JSON.parse(page?.sixth);
  const router = useRouter();
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showBelowFold, setShowBelowFold] = useState(false);

  useEffect(() => {
    // Desktop: show immediately to avoid CLS (footer jump)
    if (window.innerWidth >= 768) {
      setShowBelowFold(true);
      return;
    }
    // Mobile: defer until user interaction to reduce initial load
    const show = () => setShowBelowFold(true);
    const events = ["scroll", "touchstart", "click", "keydown"];
    events.forEach((e) => window.addEventListener(e, show, { once: true, passive: true }));
    const timer = setTimeout(show, 4000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, show));
      clearTimeout(timer);
    };
  }, []);

  // ✅ KEEP this one:
  const isVideoActive = useMemo(() => {
    if (!first?.path || !first?.startTime || !first?.endTime) return false;
    const now = new Date();
    return now >= new Date(first.startTime) && now <= new Date(first.endTime);
  }, [first?.path, first?.startTime, first?.endTime]);

  useEffect(() => {
    if (!isVideoActive) return;

    const videoTimer = setTimeout(() => {
      setShouldLoadVideo(true);
    }, 1500);

    return () => clearTimeout(videoTimer);
  }, [isVideoActive]);

  if (router.isFallback) {
    return <h1>Loading...</h1>;
  }

  return (
    <>
      <Head>
        <title>{page.seo_title}</title>
        <meta name="description" content={page.meta_description} />
        <link rel="canonical" href={mainURL} />

        <meta property="og:title" content={page.seo_title} />
        <meta property="og:description" content={page.meta_description} />
        <meta property="og:url" content={mainURL} />
        <meta
          property="og:image"
          content={laravelURL + "/storage/" + page.media?.path}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "SignatureCare Emergency Center",
              alternateName: ["SignatureCare ER", "ercare24"],
              url: mainURL,
              potentialAction: {
                "@type": "SearchAction",
                target: `${mainURL}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "SignatureCare Emergency Center",
              alternateName: "SignatureCare ER",
              url: mainURL,
              logo: `${mainURL}/assets/signaturecare-mini.webp`,
            }),
          }}
        />

        {page?.head && parse(page?.head)}
      </Head>
      <div className="home-page position-relative mb-5">
        <div className="position-relative">
          {/* Section 1 - Hero */}
          <div className="card rounded-0 border-0 section-1">
            <div className="row g-0">
              <div
                className="col-md-6 mb-md-0 mb-1 mobile-height"
                style={{
                  minHeight: "600px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* ✅ ALWAYS show image first (critical for LCP) */}
                <div
                  className="img-skeleton"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: videoLoaded ? 1 : 2,
                  }}
                >
                  <Image
                    src={laravelURL + "/storage/" + page.media?.path}
                    alt={
                      page.media?.alt_text || "SignatureCare Emergency Center"
                    }
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
                    quality={75}
                    priority
                    fetchpriority="high"
                    style={{
                      objectFit: "cover",
                    }}
                  />
                </div>

                {/* ✅ Video loads after delay */}
                {isVideoActive && shouldLoadVideo && first?.path && (
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="none"
                    onLoadedData={() => setVideoLoaded(true)}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      zIndex: videoLoaded ? 2 : 1,
                      opacity: videoLoaded ? 1 : 0,
                      transition: "opacity 0.5s ease-in",
                    }}
                  >
                    <source src={first.path} type="video/mp4" />
                  </video>
                )}
              </div>

              <div
                className="col-md-6 mobile-height"
                style={{ minHeight: "600px" }}
              >
                <MapHome locations={locations} />
              </div>
              <div className="fade-overlay d-none d-lg-block"></div>
            </div>
          </div>

          {/* Section 2 - Bottom Cards */}
          <div
            className="card-group shadow container p-0 mx-auto section-2 position-absolute bottom-0 start-50 translate-middle-x"
            style={{ zIndex: 10 }}
          >
            <Link
              href={sectionSecond[0].link}
              className="card border-0 border-end bg-white bg-opacity-25 text-white section-2-1"
              prefetch={false}
            >
              <div className="card-body">
                <div className="d-flex justify-content-between mb-3">
                  <h2 className="card-title fw-bold hover-underline">
                    {sectionSecond[0].title}
                  </h2>
                  <div className="text-secondary fs-3">
                    <BsArrowRightCircleFill className="right-circle text-light" />
                  </div>
                </div>
                <div className="card-text fs-1">
                  <MdPayment />
                </div>
              </div>
            </Link>

            <Link
              href={sectionSecond[1].link}
              className="card border-0 bg-white bg-opacity-25 text-white section-2-2"
              prefetch={false}
            >
              <div className="card-body">
                <div className="d-flex justify-content-between mb-3">
                  <h2 className="card-title fw-bold hover-underline">
                    {sectionSecond[1].title}
                  </h2>
                  <div className="text-secondary fs-3">
                    <BsArrowRightCircleFill className="right-circle text-light" />
                  </div>
                </div>
                <div className="card-text fs-1">
                  <LuCalendarCheck />
                </div>
              </div>
            </Link>

            <Link
              href={sectionSecond[2].link}
              className="card border-0 text-white section-2-3 border-0"
              prefetch={false}
            >
              <div className="card-body section-2-3-body">
                <div className="d-flex justify-content-between mb-3">
                  <h2 className="card-title h4 fw-bold hover-underline">
                    {sectionSecond[2].title}
                  </h2>
                  <div className="text-secondary fs-3">
                    <BsArrowRightCircleFill className="right-circle text-light" />
                  </div>
                </div>
                <div className="card-text fs-1">
                  <FaPhone />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Section 2 Small Screen*/}
      <div className="card-group shadow d-lg-none container p-0 mx-auto mb-5">
        <Link
          href={sectionSecond[0].link}
          className="card border-0 border-end text-white section-2-3"
          prefetch={false}
        >
          <div className="card-body section-2-3-body">
            <div className="d-flex justify-content-between mb-3">
              <h2 className="card-title h4 fw-bold hover-underline">
                {sectionSecond[0].title}
              </h2>
              <div className="text-secondary fs-3">
                <BsArrowRightCircleFill className="right-circle text-light" />
              </div>
            </div>
            <div className="card-text fs-1">
              <MdPayment />
            </div>
          </div>
        </Link>
        <Link
          href={sectionSecond[1].link}
          className="card border-0 text-white section-2-3"
          prefetch={false}
        >
          <div className="card-body section-2-3-body">
            <div className="d-flex justify-content-between mb-3">
              <h2 className="card-title h4 fw-bold hover-underline">
                {sectionSecond[1].title}
              </h2>
              <div className="text-secondary fs-3">
                <BsArrowRightCircleFill className="right-circle text-light" />
              </div>
            </div>
            <div className="card-text fs-1">
              <LuCalendarCheck />
            </div>
          </div>
        </Link>
        <Link
          href={sectionSecond[2].link}
          className="card border-0 text-white section-2-3 border-0"
          prefetch={false}
        >
          <div className="card-body section-2-3-body">
            <div className="d-flex justify-content-between mb-3">
              <h2 className="card-title h4 fw-bold hover-underline">
                {sectionSecond[2].title}
              </h2>
              <div className="text-secondary fs-3">
                <BsArrowRightCircleFill className="right-circle text-light" />
              </div>
            </div>
            <div className="card-text fs-1">
              <FaPhone />
            </div>
          </div>
        </Link>
      </div>

      {/* Sections 3-7 + Bottom: dynamically loaded to reduce initial JS */}
      {showBelowFold && (
        <HomeBelowFold
          page={page}
          sectionFive={sectionFive}
          sectionSix={sectionSix}
        />
      )}
    </>
  );
}

// ← UPDATED getStaticProps - ADD layoutData
export const getStaticProps = async () => {
  try {
    // Fetch all data in parallel with timeout
    const [pageRes, locationsRes, layoutData] = await Promise.allSettled([
      http.get("/admin/home-page"),
      http.get("/admin/locations"),
      getLayoutData(),
    ]);

    // Handle partial failures gracefully
    const page = pageRes.status === "fulfilled" ? pageRes.value.data : {};
    const locations =
      locationsRes.status === "fulfilled" ? locationsRes.value.data : [];
    const layout = layoutData.status === "fulfilled" ? layoutData.value : {};

    return {
      props: {
        page,
        locations,
        layoutData: layout,
      },
      revalidate: 300, // 5 minutes
    };
  } catch (err) {
    console.error("Error fetching static props:", err.message);
    // Return empty data instead of 404 to prevent blocking
    return {
      props: {
        page: {},
        locations: [],
        layoutData: {},
      },
      revalidate: 60, // Retry after 1 minute if failed
    };
  }
};
