import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import http from "../components/utils/http";
import laravelURL from "../components/utils/laravel-url";
import mainURL from "../components/utils/main-url";
import SkipTheWait from "../components/utils/skip-the-wait";
import parse from "html-react-parser";
import { addLazyLoadWithSkeleton } from "../components/utils/lazy-images";
import { getLayoutData } from "../components/utils/getLayoutData";

// ✅ YouTube Lite component - loads thumbnail first, iframe on click
function YouTubeLite({ videoId, title }) {
  const [showIframe, setShowIframe] = useState(false);

  if (!videoId) return null;

  if (showIframe) {
    return (
      <iframe
        width="100%"
        height={315}
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title={title || "YouTube video"}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <div
      onClick={() => setShowIframe(true)}
      style={{
        position: "relative",
        width: "100%",
        height: "315px",
        cursor: "pointer",
        backgroundColor: "#000",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <Image
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        alt={title || "YouTube video thumbnail"}
        fill
        style={{ objectFit: "cover" }}
        sizes="(max-width: 768px) 100vw, 50vw"
        loading="lazy"
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "68px",
          height: "48px",
          backgroundColor: "rgba(255, 0, 0, 0.8)",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>
  );
}

// ✅ Extract video ID from YouTube URL
function getYouTubeId(url) {
  if (!url) return null;
  const regex =
    /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export default function ScholarshipPage({ page, scholarships }) {
  const router = useRouter();
  const [modalVideo, setModalVideo] = useState(null);

  // ✅ Parse with SkipTheWait replacement (no ReactDOMServer)
  const parseOptions = {
    replace: (domNode) => {
      if (
        domNode.attribs &&
        (domNode.attribs.class === "skip-the-wait" ||
          domNode.attribs.id === "skip-the-wait")
      ) {
        return <SkipTheWait />;
      }
      if (domNode.type === "text" && domNode.data === "skip-the-wait") {
        return <SkipTheWait />;
      }
    },
  };

  if (router.isFallback) {
    return <h1>Loading...</h1>;
  }

  return (
    <>
      <Head>
        <title>{page.seo_title}</title>
        <meta name="description" content={page.meta_description} />
        <link rel="canonical" href={mainURL + "/scholarship"} />

        <meta property="og:title" content={page.seo_title} />
        <meta property="og:description" content={page.meta_description} />
        <meta property="og:url" content={mainURL + "/scholarship"} />
        <meta
          property="og:image"
          content={laravelURL + "/storage/" + page.media?.path}
        />

        {page?.head && parse(page?.head)}
      </Head>

      <div className="bg-dark">
        <div className="container text-center">
          <h1 className="py-2 text-white">{page.title}</h1>
        </div>
      </div>

      <br />
      <br />
      <div className="container">
        <div className="row">
          <div className="col-md-9">
            {/* ✅ Fixed: Aspect ratio container to prevent CLS */}
            {page?.media?.path && (
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', maxHeight: '600px' }} className="mb-4 rounded overflow-hidden shadow img-skeleton">
                <Image
                  src={laravelURL + "/storage/" + page.media?.path}
                  alt={page.media?.alt_text || page.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 75vw"
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
            )}
            <section className="mb-5">
              <div className="ck-content">
                {/* ✅ Removed ReactDOMServer */}
                {page?.description && parse(addLazyLoadWithSkeleton(page.description), parseOptions)}
              </div>
            </section>

            <section>
              <h2 className="h4 fw-bold mb-4 pb-2 border-bottom border-danger">
                Past Scholarship Winners
              </h2>
              <div className="list-group list-group-flush">
                {scholarships?.map((scholarship, index) => (
                  <div key={index} className="list-group-item px-0 py-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-center gap-2">
                      <div className="d-flex flex-wrap align-items-center gap-2 min-w-0">
                        <span className="badge bg-dark">
                          {scholarship.year} {scholarship.semester}
                        </span>
                        <Link
                          href={scholarship.blog_link || "/scholarship"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="fw-bold text-danger text-decoration-none text-break"
                        >
                          {scholarship.winner}
                        </Link>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const id = getYouTubeId(scholarship.youtube_link);
                          if (id) {
                            setModalVideo({ id, title: scholarship.winner });
                          } else if (scholarship.youtube_link) {
                            window.open(scholarship.youtube_link, "_blank", "noopener,noreferrer");
                          }
                        }}
                        disabled={!scholarship.youtube_link}
                        aria-label="Watch Video"
                        title="Watch Video"
                        className="btn btn-outline-danger btn-sm flex-shrink-0 d-inline-flex align-items-center"
                      >
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <div className="col-md-3">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-dark text-white text-center py-3">
                <h3 className="h6 mb-0 fw-bold">Featured Winners</h3>
              </div>
              <div className="card-body p-0">
                {scholarships &&
                  scholarships.slice(0, 5).map((scholarship, index) => (
                    <figure key={index} className="mb-0 border-bottom">
                      {/* ✅ Fixed: Aspect ratio container to prevent CLS */}
                      <div style={{ position: 'relative', width: '100%', aspectRatio: '3/2' }} className="img-skeleton">
                        <Image
                          fill
                          sizes="(max-width: 768px) 100vw, 300px"
                          src={laravelURL + "/storage/" + scholarship.media?.path}
                          style={{ objectFit: 'cover' }}
                          alt={
                            scholarship.media?.alt_text || "Scholarship Winner Image"
                          }
                          loading="lazy"
                        />
                      </div>
                      <figcaption className="text-center p-3 bg-light">
                        <div className="fw-bold text-dark mb-1" style={{ fontSize: '0.9rem' }}>
                          {scholarship.winner}
                        </div>
                        <small className="text-muted">
                          {scholarship.year} {scholarship.semester}
                        </small>
                      </figcaption>
                    </figure>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <br />
      <section className="bg-dark py-5 mb-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="text-white h3 fw-bold mb-2">Recent Scholarship Winners</h2>
            <p className="text-white-50">Watch their inspiring stories</p>
          </div>
          <div className="row g-4">
            {/* ✅ Lazy YouTube - only loads iframe on click */}
            {scholarships?.slice(0, 2).map((scholarship, index) => {
              const videoId = getYouTubeId(scholarship.youtube_link);
              return (
                <div className="col-md-6" key={index}>
                  <div className="card bg-transparent border-0">
                    <YouTubeLite
                      videoId={videoId}
                      title={`${scholarship.winner} - Scholarship Winner`}
                    />
                    <div className="card-body text-center px-0">
                      <h3 className="text-white h6 fw-bold mb-1">{scholarship.winner}</h3>
                      <p className="text-white-50 mb-0">
                        <small>{scholarship.year} {scholarship.semester} Winner</small>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {page?.bottom && parse(page?.bottom)}

      <Modal
        show={!!modalVideo}
        onHide={() => setModalVideo(null)}
        size="lg"
        centered
        aria-label={modalVideo?.title || "YouTube video"}
      >
        <Modal.Body className="p-0 bg-black position-relative">
          <button
            type="button"
            className="btn-close btn-close-white position-absolute"
            style={{ top: "8px", right: "8px", zIndex: 2, opacity: 0.9 }}
            aria-label="Close"
            onClick={() => setModalVideo(null)}
          />
          <div className="ratio ratio-16x9">
            {modalVideo?.id && (
              <iframe
                src={`https://www.youtube.com/embed/${modalVideo.id}?autoplay=1`}
                title={modalVideo?.title || "YouTube video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export const getStaticProps = async () => {
  try {
    const [scholarshipsRes, pageRes, layoutData] = await Promise.all([
      http.get("/admin/scholarships"),
      http.get("/admin/pages/scholarship-text"),
      getLayoutData(),
    ]);

    return {
      props: {
        scholarships: scholarshipsRes.data || [],
        page: pageRes.data || {},
        layoutData,
      },
      revalidate: 10,
    };
  } catch (err) {
    console.error("Error fetching scholarships page data:", err.message);
    return { notFound: true };
  }
};