import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import parse from "html-react-parser";
import {
  FaPhoneAlt,
  FaDirections,
  FaCheckCircle,
  FaStar,
  FaRegStar,
  FaMapMarkerAlt,
  FaArrowRight,
} from "react-icons/fa";
import Accordion from "react-bootstrap/Accordion";

import http from "../components/utils/http";
import laravelURL from "../components/utils/laravel-url";
import mainURL from "../components/utils/main-url";
import { getLayoutData } from "../components/utils/getLayoutData";
import {
  trackBookAppointment,
  trackGetDirections,
  trackPhoneCall,
} from "../components/utils/gtm";
import { ICON_MAP, richTextParseOptions } from "../components/utils/rich-text";

const LocationMap = dynamic(
  () => import("../components/templates/LocationMap"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: "500px",
          borderRadius: "16px",
          background: "var(--sl-cream-deep)",
        }}
      />
    ),
  },
);

const SocialIcon = dynamic(
  () => import("react-social-icons").then((mod) => mod.SocialIcon),
  {
    ssr: false,
    loading: () => (
      <span style={{ width: 40, height: 40, display: "inline-block" }} />
    ),
  },
);

// CKEditor often emits `<p>&nbsp;</p>` and similar for "empty" — strip those
// so an empty rich-text field doesn't render as an empty section.
const cleanHTML = (htmlString) => {
  if (!htmlString) return "";
  return htmlString
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<p[^>]*>\s*(&nbsp;|\s)*\s*<\/p>/gi, "")
    .replace(/^(<br\s*\/?>)+|(<br\s*\/?>)+$/gi, "")
    .trim();
};

// status: 0 = Closed, 1 = Open, 2 = Opening soon
function getStatusInfo(status) {
  if (status === 0) return { text: "Closed", dot: "bg-secondary" };
  if (status === 2) return { text: "Opening soon", dot: "bg-warning" };
  return { text: "Open now", dot: "bg-success" };
}

function SectionHeading({ children, className = "", as: Tag = "h2" }) {
  if (!children) return null;
  return (
    <Tag
      className={`fw-bold ${className}`}
      style={{
        lineHeight: 1.15,
        letterSpacing: "-0.02em",
      }}
    >
      {children}
    </Tag>
  );
}

function Stars({ rating = 5, size = 13 }) {
  return (
    <span className="d-inline-flex" style={{ gap: "1px" }}>
      {[1, 2, 3, 4, 5].map((s) =>
        s <= rating ? (
          <FaStar key={s} size={size} className="text-warning" />
        ) : (
          <FaRegStar key={s} size={size} className="text-secondary" />
        ),
      )}
    </span>
  );
}

function FaqAccordion({ faqs }) {
  return (
    <Accordion defaultActiveKey="0">
      {faqs.map((faq, i) => (
        <Accordion.Item eventKey={String(i)} key={i}>
          <Accordion.Header as="h3">
            <span className="text-danger fw-bold me-2">Q.</span>
            <span className="fw-semibold">{faq.question}</span>
          </Accordion.Header>
          <Accordion.Body className="text-body">
            <span className="text-success fw-bold me-2">A.</span>
            {faq.answer}
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

export default function LocationProfilePage({ location }) {
  const profile = location || {};

  const faqs = Array.isArray(profile.faqs) ? profile.faqs : [];

  const pageTitle =
    profile.seo_title ||
    `24/7 Emergency Room in ${profile.city}, ${profile.state} | SignatureCare ER`;
  const pageDescription =
    profile.meta_description ||
    `Walk-in 24/7 emergency room in ${profile.city}, ${profile.state}. Board-certified ER physicians, CT, X-ray, labs, and pediatric emergency care. Call ${profile.tel}.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["MedicalBusiness", "EmergencyService"],
        "@id": mainURL + "/" + profile.slug + "#business",
        name: `SignatureCare Emergency Center - ${profile.city}`,
        image: profile.media
          ? laravelURL + "/storage/" + profile.media.path
          : undefined,
        telephone: profile.tel,
        address: {
          "@type": "PostalAddress",
          streetAddress: profile.street,
          addressLocality: profile.city,
          addressRegion: profile.state,
          postalCode: profile.zip,
          addressCountry: "US",
        },
        geo:
          profile.latitude && profile.longitude
            ? {
                "@type": "GeoCoordinates",
                latitude: profile.latitude,
                longitude: profile.longitude,
              }
            : undefined,
        url: mainURL + "/" + profile.slug,
        openingHoursSpecification: profile.is_24_7
          ? {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ],
              opens: "00:00",
              closes: "23:59",
            }
          : undefined,
        aggregateRating: profile.google_rating
          ? {
              "@type": "AggregateRating",
              ratingValue: profile.google_rating,
              reviewCount: profile.google_review_count,
            }
          : undefined,
        areaServed: profile.nearby_cities
          ? profile.nearby_cities.split(",").map((c) => c.trim())
          : undefined,
      },
      ...(faqs.length > 0
        ? [
            {
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: { "@type": "Answer", text: f.answer },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={mainURL + "/" + profile.slug} />

        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={mainURL + "/" + profile.slug} />
        {profile.media && (
          <meta
            property="og:image"
            content={laravelURL + "/storage/" + profile.media.path}
          />
        )}
        {profile.updated_at && (
          <meta property="article:modified_time" content={profile.updated_at} />
        )}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        {profile.media && (
          <meta
            name="twitter:image"
            content={laravelURL + "/storage/" + profile.media.path}
          />
        )}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {profile?.head && parse(profile.head)}
      </Head>

      <div className="sl-bg-cream text-dark" style={{ paddingBottom: "90px" }}>
        {/* ============ OPEN-NOW BANNER ============ */}
        <div className="sl-banner-open bg-danger text-white position-relative overflow-hidden">
          <div className="container position-relative d-flex flex-wrap align-items-center justify-content-center gap-3 py-2 text-center small">
            <span
              className="sl-pulse-dot rounded-circle bg-white flex-shrink-0"
              style={{ width: "8px", height: "8px" }}
            />
            <span className="fw-bold small">
              {getStatusInfo(profile.status).text}
            </span>
            <span
              className="d-none d-md-inline-block"
              style={{
                width: "1px",
                height: "12px",
                background: "rgba(255,255,255,.4)",
              }}
            />
            <span className="d-none d-md-inline fw-medium opacity-75">
              {profile.banner_message}
            </span>
            <span
              className="d-none d-md-inline-block"
              style={{
                width: "1px",
                height: "12px",
                background: "rgba(255,255,255,.4)",
              }}
            />
            <a
              href={"tel:" + profile.tel}
              onClick={() => trackPhoneCall(profile.tel, profile.city)}
              className="d-inline-flex align-items-center bg-white text-dark fw-bold rounded-pill text-decoration-none py-1 px-2 gap-2 small"
            >
              <FaPhoneAlt size={10} /> Call {profile.tel}
            </a>
          </div>
        </div>

        {/* ============ HERO ============ */}
        <section className="bg-white py-5">
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-lg-6">
                <h1 className="display-6 fw-bold text-dark mb-3">
                  {profile.hero_title}
                </h1>

                {cleanHTML(profile.hero_subtitle) && (
                  <div
                    className="ck-content text-body lh-base mb-4 fs-6"
                    style={{ maxWidth: "560px" }}
                  >
                    {parse(
                      cleanHTML(profile.hero_subtitle),
                      richTextParseOptions,
                    )}
                  </div>
                )}

                {/* meta card */}
                <div className="sl-meta-card card shadow-sm overflow-hidden mb-4">
                  <div className="row g-0">
                    <div className="sl-meta-cell col-12 col-md-5 p-3">
                      <div
                        className="fw-bold text-uppercase text-muted mb-1 small"
                        style={{ letterSpacing: "0.1em" }}
                      >
                        Address
                      </div>
                      <div className="text-dark d-flex align-items-start gap-2 fw-bold lh-sm small">
                        <FaMapMarkerAlt
                          size={12}
                          className="text-danger flex-shrink-0 mt-1"
                        />
                        <span>
                          {profile.street}
                          <span className="d-block fw-medium text-muted mt-1 small">
                            {profile.city}, {profile.state} {profile.zip}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="sl-meta-cell col-12 col-md p-3">
                      <div
                        className="fw-bold text-uppercase text-muted mb-1 small"
                        style={{ letterSpacing: "0.1em" }}
                      >
                        Hours
                      </div>
                      <div className="fw-bold text-danger lh-sm small">
                        Open 24/7/365
                        <span className="d-block fw-medium text-muted mt-1 small">
                          Walk-ins welcome
                        </span>
                      </div>
                    </div>
                    <div className="sl-meta-cell col-12 col-md p-3">
                      <div
                        className="fw-bold text-uppercase text-muted mb-1 small"
                        style={{ letterSpacing: "0.1em" }}
                      >
                        Rating
                      </div>
                      <div className="text-dark d-flex align-items-center gap-2 fw-bold lh-sm small">
                        <span>{profile.google_rating}</span>
                        <Stars
                          rating={Math.round(profile.google_rating)}
                          size={11}
                        />
                      </div>
                      <span className="d-block fw-medium text-muted mt-1 small">
                        {(profile.google_review_count || 0).toLocaleString()}+
                        reviews
                      </span>
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="sl-hero-cta-row d-flex flex-nowrap gap-2">
                  <a
                    href={"tel:" + profile.tel}
                    className="sl-btn sl-btn-red bg-danger text-white d-inline-flex align-items-center justify-content-center gap-2 fw-semibold text-decoration-none text-nowrap rounded-3 py-2 px-3 flex-shrink-0 lh-1 small"
                    onClick={() => trackPhoneCall(profile.tel, profile.city)}
                  >
                    <FaPhoneAlt size={13} /> Call Us Now
                  </a>
                  <Link
                    href={profile.google || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="sl-btn sl-btn-dark bg-dark text-white d-inline-flex align-items-center justify-content-center gap-2 fw-semibold text-decoration-none text-nowrap rounded-3 py-2 px-3 flex-shrink-0 lh-1 small"
                    onClick={() => trackGetDirections(profile.city)}
                  >
                    <FaDirections size={13} /> Get Directions
                  </Link>
                  <Link
                    href={profile.acuity_url || "/emergency-room-appointment"}
                    target={profile.acuity_url ? "_blank" : undefined}
                    rel={profile.acuity_url ? "noreferrer" : undefined}
                    className="sl-btn sl-btn-outline bg-white text-dark d-inline-flex align-items-center justify-content-center gap-2 fw-semibold text-decoration-none text-nowrap border border-dark rounded-3 py-2 px-3 flex-shrink-0 lh-1 small"
                    onClick={() => trackBookAppointment(profile.slug)}
                  >
                    Get online Appointment <FaArrowRight size={11} />
                  </Link>
                </div>
              </div>

              <div className="col-lg-6">
                {profile.media ? (
                  <div
                    className="img-skeleton w-100 border rounded-4 overflow-hidden position-relative"
                    style={{ aspectRatio: "5/4" }}
                  >
                    <Image
                      src={laravelURL + "/storage/" + profile.media.path}
                      alt={
                        profile.media.alt_text ||
                        `${profile.city} Emergency Room`
                      }
                      fill
                      sizes="(max-width: 992px) 100vw, 600px"
                      className="object-fit-cover"
                      quality={85}
                      priority
                      fetchpriority="high"
                    />
                  </div>
                ) : (
                  <div
                    className="w-100 sl-bg-cream-deep border rounded-4"
                    style={{ aspectRatio: "5/4" }}
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ============ 911 DISCLAIMER ============ */}
        {cleanHTML(profile.disclaimer_html) && (
          <section className="sl-bg-cream text-dark">
            <div className="container d-flex flex-wrap align-items-center justify-content-center gap-3 py-2 text-center lh-base small">
              <div className="ck-content ck-content--inline fw-medium">
                {parse(
                  cleanHTML(profile.disclaimer_html),
                  richTextParseOptions,
                )}
              </div>
            </div>
          </section>
        )}

        {/* ============ REVIEWS + MAP ============ */}
        <section className="bg-white py-5">
          <div className="container">
            <div className="row g-5 align-items-stretch">
              <div className="col-lg-6 d-flex flex-column">
                <SectionHeading className="mb-3">
                  {profile.reviews_title}
                </SectionHeading>
                {cleanHTML(profile.reviews_subtitle) && (
                  <div className="ck-content text-body lh-base mb-3 fs-6">
                    {parse(
                      cleanHTML(profile.reviews_subtitle),
                      richTextParseOptions,
                    )}
                  </div>
                )}
                <div className="d-flex align-items-center gap-3 mb-4 p-3 sl-bg-cream rounded-4">
                  <div className="display-5 fw-bold lh-1 text-dark">
                    {profile.google_rating}
                  </div>
                  <div>
                    <Stars
                      rating={Math.round(profile.google_rating)}
                      size={16}
                    />
                    <div className="text-muted small mt-1">
                      {(profile.google_review_count || 0).toLocaleString()}+
                      Google reviews
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-column gap-3">
                  {(profile.reviews || []).map((r, i) => (
                    <div
                      key={i}
                      className="sl-review card bg-white border-0 border-start border-3 border-danger shadow-sm"
                    >
                      <div className="card-body p-3 py-2">
                        <div className="mb-1">
                          <Stars rating={r.rating} size={11} />
                        </div>
                        <p className="text-body fst-italic mb-2 lh-sm small position-relative ps-3">
                          <span className="position-absolute top-0 start-0 text-danger lh-1 fs-3 fw-bold">
                            &ldquo;
                          </span>
                          {r.body}
                        </p>
                        <div className="fw-semibold text-dark small">
                          — {r.author}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {(profile.google_review_url || profile.google) && (
                  <Link
                    href={profile.google_review_url || profile.google}
                    target="_blank"
                    rel="noreferrer"
                    className="sl-btn sl-btn-outline bg-white text-dark d-inline-flex align-items-center justify-content-center gap-2 fw-semibold text-decoration-none text-nowrap border border-dark rounded-3 py-2 px-3 mt-4 lh-1 small align-self-start"
                  >
                    See more {profile.city} reviews <FaArrowRight size={11} />
                  </Link>
                )}
              </div>

              <div className="col-lg-6 d-flex flex-column">
                <SectionHeading className="mb-3">
                  {profile.map_title}
                </SectionHeading>
                <div className="text-dark mb-3">{profile.address}</div>

                <div className="position-relative border rounded-4 overflow-hidden shadow-sm">
                  <LocationMap
                    height="500px"
                    location={{
                      name: `SignatureCare ER - ${profile.city}`,
                      address: profile.address,
                      latitude: profile.latitude || "33.1085",
                      longitude: profile.longitude || "-96.8033",
                    }}
                  />
                  <div
                    className="position-absolute bg-white d-flex align-items-center gap-3 p-3 rounded-4 shadow"
                    style={{
                      zIndex: 10,
                      bottom: "14px",
                      left: "14px",
                      right: "14px",
                    }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center flex-shrink-0 bg-danger text-white rounded-3"
                      style={{ width: "44px", height: "44px" }}
                    >
                      <FaMapMarkerAlt size={20} />
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <div className="fw-bold text-dark lh-sm small">
                        SignatureCare ER · {profile.city}
                      </div>
                      <div className="text-muted mt-1 small">
                        {profile.address}
                      </div>
                      <div className="d-flex align-items-center gap-3 mt-1 small">
                        <span className="d-inline-flex align-items-center fw-semibold gap-1">
                          <span
                            className={`rounded-circle ${getStatusInfo(profile.status).dot}`}
                            style={{ width: "6px", height: "6px" }}
                          />
                          {getStatusInfo(profile.status).text}
                        </span>
                        <span className="text-muted">
                          <FaStar
                            size={11}
                            className="text-warning me-1"
                            style={{ marginTop: "-2px" }}
                          />
                          <strong className="text-dark">
                            {profile.google_rating}
                          </strong>{" "}
                          ({(profile.google_review_count || 0).toLocaleString()}
                          +)
                        </span>
                      </div>
                    </div>
                    <a
                      href={profile.google || "#"}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => trackGetDirections(profile.city)}
                      className="sl-btn sl-btn-dark bg-dark text-white d-inline-flex align-items-center justify-content-center gap-2 fw-semibold text-decoration-none text-nowrap rounded-pill py-2 px-3 flex-shrink-0 lh-1 small"
                    >
                      <FaArrowRight size={11} /> Directions
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ WHY CHOOSE / TILES ============ */}
        <section className="sl-bg-cream py-5">
          <div className="container">
            <div
              className="text-center mx-auto mb-5"
              style={{ maxWidth: "780px" }}
            >
              <SectionHeading className="mb-3">
                {profile.why_choose_title}
              </SectionHeading>
              {cleanHTML(profile.why_choose_subtitle) && (
                <div className="ck-content text-body fs-6 lh-lg mb-0">
                  {parse(
                    cleanHTML(profile.why_choose_subtitle),
                    richTextParseOptions,
                  )}
                </div>
              )}
            </div>

            <div className="row g-3">
              {(profile.decision_tiles || []).map((tile, i) => {
                const Icon = ICON_MAP[tile.icon];
                return (
                  <div key={i} className="col-12 col-sm-6 col-md-4">
                    <div className="sl-tile card h-100">
                      <div className="card-body d-flex align-items-center gap-3">
                        <div
                          className="sl-tile-icon bg-danger-subtle text-danger d-flex align-items-center justify-content-center flex-shrink-0 rounded-3"
                          style={{ width: "44px", height: "44px" }}
                        >
                          {Icon && <Icon size={20} />}
                        </div>
                        <div className="fw-semibold text-dark lh-sm fs-6">
                          {tile.label}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============ ER vs URGENT CARE ============ */}
        <section className="bg-white py-5">
          <div className="container">
            <div className="row g-5 align-items-center">
              <div className="col-lg-6 order-lg-2">
                {profile.er_urgent_media?.path ||
                profile.slider_images?.[0]?.media?.path ? (
                  <div
                    className="img-skeleton w-100 border rounded-4 overflow-hidden position-relative"
                    style={{ aspectRatio: "4/3" }}
                  >
                    <Image
                      src={
                        laravelURL +
                        "/storage/" +
                        (profile.er_urgent_media?.path ||
                          profile.slider_images[0].media.path)
                      }
                      alt={
                        profile.er_urgent_media?.alt_text ||
                        profile.slider_images?.[0]?.media?.alt_text ||
                        `Inside ${profile.city}`
                      }
                      fill
                      sizes="(max-width: 992px) 100vw, 500px"
                      className="object-fit-cover"
                      quality={80}
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div
                    className="w-100 sl-bg-cream-deep border rounded-4"
                    style={{ aspectRatio: "4/3" }}
                  />
                )}
              </div>
              <div className="col-lg-6 order-lg-1">
                <SectionHeading className="mb-3">
                  {profile.er_urgent_title}
                </SectionHeading>
                {cleanHTML(profile.er_urgent_subtitle) && (
                  <div className="ck-content text-body fs-6 lh-lg mb-4">
                    {parse(
                      cleanHTML(profile.er_urgent_subtitle),
                      richTextParseOptions,
                    )}
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="fw-bold text-dark mb-2">
                    Choose ER care for:
                  </h3>
                  <div className="row g-2">
                    {(profile.er_conditions || []).map((c, i) => (
                      <div
                        key={i}
                        className="col-12 col-sm-6 d-flex align-items-start gap-2 text-body lh-sm small"
                      >
                        <FaCheckCircle
                          size={13}
                          className="text-danger flex-shrink-0 mt-1"
                        />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="fw-bold text-dark mb-2">
                    Urgent care may be better for:
                  </h3>
                  <div className="row g-2">
                    {(profile.urgent_care_conditions || []).map((c, i) => (
                      <div
                        key={i}
                        className="col-12 col-sm-6 d-flex align-items-start gap-2 text-body lh-sm small"
                      >
                        <FaCheckCircle
                          size={13}
                          className="text-muted flex-shrink-0 mt-1"
                        />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-dark fw-semibold fs-4 mt-5 mb-0 lh-base">
              Still not sure? Call us now at{" "}
              <a
                href={"tel:" + profile.tel}
                onClick={() => trackPhoneCall(profile.tel, profile.city)}
                className="text-danger fw-bold text-decoration-underline"
              >
                {profile.tel}
              </a>
              , and our team can help guide you.
            </p>
          </div>
        </section>

        {/* ============ TIMELINE ============ */}
        <section className="sl-bg-cream py-5 border-top border-bottom">
          <div className="container">
            <div className="mb-4" style={{ maxWidth: "760px" }}>
              <SectionHeading className="mb-3">
                {profile.timeline_title}
              </SectionHeading>
              {cleanHTML(profile.timeline_subtitle) && (
                <div className="ck-content text-muted mb-0 lh-base fs-6">
                  {parse(
                    cleanHTML(profile.timeline_subtitle),
                    richTextParseOptions,
                  )}
                </div>
              )}
            </div>

            <div className="row g-0">
              {(profile.timeline_steps || []).map((step, i) => (
                <div key={i} className="col-md-3 col-6">
                  <div
                    className={`sl-step card rounded-0 h-100 ${step.active ? "sl-step-active" : ""}`}
                    style={{ marginRight: "-1px", marginBottom: "-1px" }}
                  >
                    <div className="card-body">
                      <div
                        className="sl-step-num bg-dark text-white d-flex align-items-center justify-content-center rounded-circle fw-bold mb-3 small"
                        style={{ width: "36px", height: "36px" }}
                      >
                        {i + 1}
                      </div>
                      <h3
                        className="fw-bold text-dark mb-2 fs-6"
                        style={{ letterSpacing: "-0.01em" }}
                      >
                        {step.title}
                      </h3>
                      <p className="text-muted mb-3 lh-base small">
                        {step.body}
                      </p>
                      <div
                        className="fw-bold text-uppercase text-success small"
                        style={{ letterSpacing: "0.1em" }}
                      >
                        {step.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ INSIDE GALLERY ============ */}
        {profile.slider_images?.length > 0 && (
          <section className="bg-white py-5">
            <div className="container">
              <div className="mb-4">
                <SectionHeading className="mb-3">
                  {profile.gallery_title}
                </SectionHeading>
                {cleanHTML(profile.gallery_subtitle) && (
                  <div className="ck-content text-body lh-base mb-3 fs-6">
                    {parse(
                      cleanHTML(profile.gallery_subtitle),
                      richTextParseOptions,
                    )}
                  </div>
                )}
                <ul className="list-unstyled text-muted mb-0 lh-base small d-flex flex-wrap gap-3 mt-3">
                  {(profile.gallery_features || []).map((feature, i) => (
                    <li key={i} className="d-flex align-items-center gap-2">
                      <FaCheckCircle
                        size={13}
                        className="text-danger flex-shrink-0"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sl-gallery">
                {profile.slider_images.slice(0, 5).map((item, key) => (
                  <div
                    key={key}
                    className="sl-gallery-cell sl-bg-cream-deep position-relative rounded-4 overflow-hidden"
                  >
                    <Image
                      fill
                      src={laravelURL + "/storage/" + item.media?.path}
                      alt={
                        item.media?.alt_text || `${profile.city} Emergency Room`
                      }
                      sizes="(max-width: 768px) 100vw, (max-width: 992px) 50vw, 33vw"
                      className="object-fit-cover"
                      quality={75}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ============ INSURANCE ============ */}
        <section className="sl-bg-cream py-5">
          <div className="container">
            <div className="card bg-white">
              <div className="card-body p-5">
                <SectionHeading className="mb-3">
                  {profile.insurance_title}
                </SectionHeading>
                {cleanHTML(profile.insurance_body_html) && (
                  <div
                    className="ck-content"
                    onClick={(e) => {
                      const link = e.target.closest("a[href^='tel:']");
                      if (link) trackPhoneCall(profile.tel, profile.city);
                    }}
                  >
                    {parse(
                      cleanHTML(profile.insurance_body_html),
                      richTextParseOptions,
                    )}
                  </div>
                )}
                <div className="d-flex flex-wrap gap-2">
                  <a
                    href={"tel:" + profile.tel}
                    className="sl-btn sl-btn-red bg-danger text-white d-inline-flex align-items-center justify-content-center gap-2 fw-semibold text-decoration-none rounded-3 py-2 px-3 lh-base small text-start"
                    onClick={() => trackPhoneCall(profile.tel, profile.city)}
                  >
                    <FaPhoneAlt size={13} className="flex-shrink-0" /> Call our{" "}
                    {profile.city} ER about insurance concerns
                  </a>
                  <Link
                    href="/insurance-information"
                    className="sl-btn sl-btn-outline bg-white text-dark d-inline-flex align-items-center justify-content-center gap-2 fw-semibold text-decoration-none text-nowrap border border-dark rounded-3 py-2 px-3 lh-1 small"
                  >
                    Read facility notice <FaArrowRight size={11} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        {faqs.length > 0 && (
          <section className="bg-white py-5">
            <div className="container">
              <div className="text-center mb-4">
                <SectionHeading>{profile.faq_title}</SectionHeading>
                {cleanHTML(profile.faq_subtitle) && (
                  <div className="ck-content text-body lh-base mt-3 mb-0 fs-6">
                    {parse(
                      cleanHTML(profile.faq_subtitle),
                      richTextParseOptions,
                    )}
                  </div>
                )}
              </div>
              <FaqAccordion faqs={faqs} />
            </div>
          </section>
        )}

        {/* ============ CLOSING CTA BAND ============ */}
        <section className="bg-dark text-white py-5 text-center">
          <div className="container">
            <h2
              className="fw-bold text-white mb-3"
              style={{ lineHeight: 1.15, letterSpacing: "-0.02em" }}
            >
              {profile.closing_title}
            </h2>
            {cleanHTML(profile.closing_subtitle) && (
              <div
                className="ck-content mx-auto mb-4 lh-base fs-6"
                style={{ color: "#c8c2b5", maxWidth: "560px" }}
              >
                {parse(
                  cleanHTML(profile.closing_subtitle),
                  richTextParseOptions,
                )}
              </div>
            )}
            <div className="d-flex flex-wrap justify-content-center gap-2">
              <a
                href={"tel:" + profile.tel}
                onClick={() => trackPhoneCall(profile.tel, profile.city)}
                className="sl-btn sl-btn-red bg-danger text-white d-inline-flex align-items-center justify-content-center gap-2 fw-semibold text-decoration-none text-nowrap rounded-3 py-3 px-4 lh-1 small"
              >
                <FaPhoneAlt size={14} /> Call {profile.tel}
              </a>
              <Link
                href={profile.google || "#"}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackGetDirections(profile.city)}
                className="sl-btn bg-white text-dark d-inline-flex align-items-center justify-content-center gap-2 fw-semibold text-decoration-none text-nowrap rounded-3 py-3 px-4 lh-1 small"
              >
                <FaDirections size={14} /> Get directions
              </Link>
              <Link
                href={profile.acuity_url || "/emergency-room-appointment"}
                target={profile.acuity_url ? "_blank" : undefined}
                rel={profile.acuity_url ? "noreferrer" : undefined}
                onClick={() => trackBookAppointment(profile.slug)}
                className="sl-btn sl-btn-outline bg-transparent text-white d-inline-flex align-items-center justify-content-center gap-2 fw-semibold text-decoration-none text-nowrap border border-white rounded-3 py-3 px-4 lh-1 small"
              >
                <FaCheckCircle size={14} /> Get online Appointment
              </Link>
            </div>
          </div>
        </section>

        {/* ============ SOCIAL MEDIA ============ */}
        {(profile.facebook ||
          profile.twitter ||
          profile.youtube ||
          profile.instagram ||
          profile.linkedin ||
          profile.tiktok) && (
          <section className="sl-bg-cream py-4 text-center">
            <div className="container">
              {profile.facebook && (
                <SocialIcon
                  url={profile.facebook}
                  network="facebook"
                  style={{ height: 40, width: 40, margin: "0px 1px" }}
                  title="Facebook"
                />
              )}
              {profile.twitter && (
                <SocialIcon
                  url={profile.twitter}
                  network="x"
                  style={{ height: 40, width: 40, margin: "0px 1px" }}
                  title="X"
                />
              )}
              {profile.youtube && (
                <SocialIcon
                  url={profile.youtube}
                  network="youtube"
                  style={{ height: 40, width: 40, margin: "0px 1px" }}
                  title="YouTube"
                />
              )}
              {profile.instagram && (
                <SocialIcon
                  url={profile.instagram}
                  network="instagram"
                  style={{ height: 40, width: 40, margin: "0px 1px" }}
                  title="Instagram"
                />
              )}
              {profile.linkedin && (
                <SocialIcon
                  url={profile.linkedin}
                  network="linkedin"
                  style={{ height: 40, width: 40, margin: "0px 1px" }}
                  title="LinkedIn"
                />
              )}
              {profile.tiktok && (
                <SocialIcon
                  url={profile.tiktok}
                  network="tiktok"
                  style={{ height: 40, width: 40, margin: "0px 1px" }}
                  title="TikTok"
                />
              )}
            </div>
          </section>
        )}
      </div>

      {/* ============ STICKY MOBILE BAR ============ */}
      <nav
        className="position-fixed d-md-none bg-dark p-2 shadow-lg"
        aria-label="Quick actions"
        style={{
          left: "12px",
          right: "12px",
          bottom: "12px",
          borderRadius: "18px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "6px",
          zIndex: 1050,
        }}
      >
        <a
          href={"tel:" + profile.tel}
          onClick={() => trackPhoneCall(profile.tel, profile.city)}
          className="bg-danger text-white d-flex flex-column align-items-center justify-content-center gap-1 text-decoration-none fw-bold rounded-3 small"
          style={{ height: "54px" }}
        >
          <FaPhoneAlt size={16} />
          Call
        </a>
        <Link
          href={profile.google || "#"}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackGetDirections(profile.city)}
          className="text-white d-flex flex-column align-items-center justify-content-center gap-1 text-decoration-none fw-bold rounded-3 small"
          style={{ height: "54px" }}
        >
          <FaDirections size={16} />
          Directions
        </Link>
        <Link
          href={profile.acuity_url || "/emergency-room-appointment"}
          target={profile.acuity_url ? "_blank" : undefined}
          rel={profile.acuity_url ? "noreferrer" : undefined}
          onClick={() => trackBookAppointment(profile.slug)}
          className="text-white d-flex flex-column align-items-center justify-content-center gap-1 text-decoration-none fw-bold rounded-3 small"
          style={{ height: "54px" }}
        >
          <FaCheckCircle size={16} />
          Appointment
        </Link>
      </nav>
    </>
  );
}

// Backend returns these as JSON-encoded strings; parse once here so the
// component can treat them as arrays.
const JSON_ARRAY_FIELDS = [
  "faqs",
  "decision_tiles",
  "timeline_steps",
  "er_conditions",
  "urgent_care_conditions",
  "gallery_features",
  "reviews",
];

function normalizeLocation(data) {
  if (!data || typeof data !== "object") return {};
  for (const field of JSON_ARRAY_FIELDS) {
    const value = data[field];
    if (typeof value === "string") {
      try {
        data[field] = JSON.parse(value);
      } catch {
        data[field] = null;
      }
    }
  }
  return data;
}

export const getStaticProps = async () => {
  try {
    const [locationRes, layoutData] = await Promise.all([
      http.get("/admin/location-profiles/frisco").catch(() => ({ data: {} })),
      getLayoutData(),
    ]);

    return {
      props: {
        location: normalizeLocation(locationRes.data),
        layoutData,
      },
      revalidate: 300,
    };
  } catch (err) {
    console.error("location-profile fetch error:", err.message);
    return {
      props: {
        location: normalizeLocation({}),
        layoutData: await getLayoutData(),
      },
      revalidate: 60,
    };
  }
};
