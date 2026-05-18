import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import parse from "html-react-parser";
import {
  FaPhoneAlt,
  FaDirections,
  FaCheckCircle,
  FaUserMd,
  FaXRay,
  FaChild,
  FaBed,
  FaClock,
  FaShieldAlt,
  FaStar,
  FaRegStar,
  FaMapMarkerAlt,
  FaChevronDown,
  FaArrowRight,
} from "react-icons/fa";

import http from "../components/utils/http";
import laravelURL from "../components/utils/laravel-url";
import mainURL from "../components/utils/main-url";
import { getLayoutData } from "../components/utils/getLayoutData";
import { addLazyLoadWithSkeleton } from "../components/utils/lazy-images";
import {
  trackBookAppointment,
  trackGetDirections,
  trackPhoneCall,
} from "../components/utils/gtm";

const LocationMap = dynamic(
  () => import("../components/templates/LocationMap"),
  {
    ssr: false,
    loading: () => <div style={{ height: "500px", borderRadius: "16px", background: "var(--sl-cream-deep)" }} />,
  },
);

const DUMMY_PARENT = {
  tel: "(972) 542-0700",
  street: "16300 State Hwy 121",
  city: "Frisco",
  state: "TX",
  zip: "75035",
  address: "16300 State Hwy 121, Frisco, TX 75035",
  google: "https://maps.google.com/?q=16300+State+Hwy+121+Frisco+TX+75035",
  is_24_7: true,
  google_rating: 4.9,
  google_review_count: 482,
  nearby_cities: "Plano, Allen, McKinney, The Colony, Little Elm",
  reviews: [
    {
      author: "Sarah M.",
      rating: 5,
      body:
        "Was seen by a doctor within 5 minutes of walking in. The staff was professional, kind, and the facility was spotless.",
    },
    {
      author: "James T.",
      rating: 5,
      body:
        "Brought my son in late at night with a high fever. Pediatric care was excellent. Doctor explained everything clearly.",
    },
    {
      author: "Maria L.",
      rating: 5,
      body:
        "Severe abdominal pain — they got me in for a CT scan immediately, diagnosed appendicitis fast, and arranged transfer for surgery.",
    },
  ],
  faqs: [
    {
      question: "Are you open 24/7?",
      answer:
        "Yes. SignatureCare Emergency Center Frisco is open 24 hours a day, 365 days a year.",
    },
    {
      question: "Do I need an appointment?",
      answer:
        "No. Walk-ins are welcome at any time. Online check-in is optional and does not delay emergency care.",
    },
    {
      question: "Are you an urgent care?",
      answer:
        "No. SignatureCare Emergency Center Frisco is a licensed freestanding emergency room with board-certified ER physicians, CT, X-ray, and onsite lab services.",
    },
    {
      question: "Do you treat children?",
      answer:
        "Yes. We treat both adult and pediatric emergencies, including high fever, dehydration, asthma, injuries, and severe abdominal pain.",
    },
    {
      question: "Do you have CT, X-ray, and lab testing?",
      answer:
        "Yes. CT, X-ray, ultrasound, and lab services are available onsite when ordered by the ER physician.",
    },
    {
      question: "Can I call before coming in?",
      answer:
        "Yes. You can call us anytime with questions about your symptoms, insurance, or what to expect.",
    },
    {
      question: "When should I call 911?",
      answer:
        "Call 911 for life-threatening symptoms — severe chest pain, stroke symptoms, severe breathing difficulty, major trauma, or any emergency requiring immediate ambulance care.",
    },
  ],
};

const DECISION_TILES = [
  { icon: FaUserMd, label: "Doctor in 10 minutes or less" },
  { icon: FaXRay, label: "CT, X-ray & lab onsite" },
  { icon: FaChild, label: "Adults & children treated" },
  { icon: FaBed, label: "Private treatment rooms" },
  { icon: FaClock, label: "Open 24/7/365" },
  { icon: FaShieldAlt, label: "Call with insurance questions" },
];

const ER_CONDITIONS = [
  "Chest pain",
  "Severe abdominal pain",
  "Difficulty breathing",
  "Severe allergic reactions",
  "Head injuries",
  "Deep cuts or lacerations",
  "Broken bones or fractures",
  "Dehydration needing IV fluids",
  "High fever in children",
  "Severe vomiting or diarrhea",
  "Possible appendicitis",
  "Pediatric emergencies",
];

const URGENT_CARE_CONDITIONS = [
  "Routine medication refills",
  "School physicals",
  "Mild cold symptoms",
  "Routine vaccines",
  "Simple non-urgent visits",
];

const TIMELINE_STEPS = [
  {
    title: "Walk in",
    body:
      "A nurse greets you within a minute. No forms to fill out before you're seen.",
    time: "0–2 min",
    active: true,
  },
  {
    title: "Quick triage",
    body:
      "Vitals, history, and your concern — all in a private room, never a crowded hallway.",
    time: "2–8 min",
  },
  {
    title: "See a doctor",
    body:
      "Board-certified ER physician at your bedside. CT, X-ray, or labs start immediately if needed.",
    time: "Under 10 min",
  },
  {
    title: "Treat & discharge",
    body:
      "Clear plan, prescriptions sent to your pharmacy, and a follow-up call the next day.",
    time: "Most visits < 90 min",
  },
];

const GALLERY_FEATURES = [
  "Multi-slice CT",
  "Digital X-ray",
  "Ultrasound",
  "COLA-certified lab onsite",
  "Pediatric-friendly rooms",
  "Welcoming lobby",
];

const cleanHTML = (htmlString) => {
  if (!htmlString) return "";
  return htmlString
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<p[^>]*>\s*(&nbsp;|\s)*\s*<\/p>/gi, "")
    .replace(/^(<br\s*\/?>)+|(<br\s*\/?>)+$/gi, "")
    .trim();
};

function Eyebrow({ children, className = "" }) {
  return (
    <div
      className={`text-uppercase fw-semibold mb-2 text-dark fs-3 ${className}`}
      style={{ letterSpacing: "0.08em" }}
    >
      {children}
    </div>
  );
}

function SectionHeading({ children, className = "" }) {
  return (
    <h2
      className={`fw-bold ${className}`}
      style={{
        lineHeight: 1.15,
        letterSpacing: "-0.02em",
      }}
    >
      {children}
    </h2>
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
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <div className="border rounded overflow-hidden bg-white">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className={i > 0 ? "border-top" : ""}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="sl-faq-btn text-dark d-flex align-items-center justify-content-between w-100 px-4 py-3 bg-transparent border-0 text-start fw-semibold fs-6"
            >
              <span className="pe-3">{faq.question}</span>
              <FaChevronDown
                size={14}
                className={`sl-faq-chevron text-muted flex-shrink-0 ${isOpen ? "sl-rotated" : ""}`}
              />
            </button>
            {isOpen && (
              <div
                className="px-4 pb-4 text-body lh-lg fs-6"
              >
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function FriscoDummy2({ location }) {
  const [, setCurrentUrl] = useState("");
  const parent = { ...DUMMY_PARENT, ...(location.location || {}) };

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const pageTitle =
    location.seo_title ||
    `24/7 Emergency Room in ${parent.city}, ${parent.state} | SignatureCare ER`;
  const pageDescription =
    location.meta_description ||
    `Walk-in 24/7 emergency room in ${parent.city}, ${parent.state}. Board-certified ER physicians, CT, X-ray, labs, and pediatric emergency care. Call ${parent.tel}.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["MedicalBusiness", "EmergencyService"],
        "@id": mainURL + "/frisco-dummy-2#business",
        name: `SignatureCare Emergency Center - ${parent.city}`,
        image: location.media
          ? laravelURL + "/storage/" + location.media.path
          : undefined,
        telephone: parent.tel,
        address: {
          "@type": "PostalAddress",
          streetAddress: parent.street,
          addressLocality: parent.city,
          addressRegion: parent.state,
          postalCode: parent.zip,
          addressCountry: "US",
        },
        geo:
          location.latitude && location.longitude
            ? {
                "@type": "GeoCoordinates",
                latitude: location.latitude,
                longitude: location.longitude,
              }
            : undefined,
        url: mainURL + "/frisco-dummy-2",
        openingHoursSpecification: parent.is_24_7
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
        aggregateRating: parent.google_rating
          ? {
              "@type": "AggregateRating",
              ratingValue: parent.google_rating,
              reviewCount: parent.google_review_count,
            }
          : undefined,
        areaServed: parent.nearby_cities
          ? parent.nearby_cities.split(",").map((c) => c.trim())
          : undefined,
      },
      {
        "@type": "FAQPage",
        mainEntity: parent.faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={mainURL + "/frisco-dummy-2"} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={mainURL + "/frisco-dummy-2"} />
        {location.media && (
          <meta
            property="og:image"
            content={laravelURL + "/storage/" + location.media.path}
          />
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <div className="sl-bg-cream text-dark" style={{ paddingBottom: "90px" }}>
        {/* ============ OPEN-NOW BANNER ============ */}
        <div className="sl-banner-open bg-danger text-white position-relative overflow-hidden">
          <div
            className="container position-relative d-flex flex-wrap align-items-center justify-content-center gap-3 py-2 text-center small"
          >
            <span
              className="sl-pulse-dot rounded-circle bg-white flex-shrink-0"
              style={{ width: "8px", height: "8px" }}
            />
            <span className="fw-bold small">
              Open right now
            </span>
            <span className="d-none d-md-inline-block" style={{ width: "1px", height: "12px", background: "rgba(255,255,255,.4)" }} />
            <span className="d-none d-md-inline fw-medium opacity-75">
              Walk in anytime · No appointment · Doctor in 10 min or less
            </span>
            <span className="d-none d-md-inline-block" style={{ width: "1px", height: "12px", background: "rgba(255,255,255,.4)" }} />
            <a
              href={"tel:" + parent.tel}
              onClick={() => trackPhoneCall(parent.tel, parent.city)}
              className="d-inline-flex align-items-center bg-white text-dark fw-bold rounded-pill text-decoration-none py-1 px-2 gap-2 small"
            >
              <FaPhoneAlt size={10} /> Call {parent.tel}
            </a>
          </div>
        </div>

        {/* ============ HERO ============ */}
        <section className="sl-bg-cream py-5">
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-lg-6">
                <div
                  className="d-inline-flex align-items-center gap-2 bg-white border rounded-pill fw-semibold text-body mb-3 py-1 px-3 small"
                >
                  <span
                    className="rounded-circle bg-danger"
                    style={{ width: "7px", height: "7px", boxShadow: "0 0 0 3px rgba(204,0,0,.13)" }}
                  />
                  Open now · 24/7/365
                </div>

                <h1
                  className="fw-bold text-dark mb-3"
                  style={{ lineHeight: 1.05, letterSpacing: "-0.025em" }}
                >
                  24-Hour Emergency Room<br />
                  in {parent.city}, {parent.state}
                </h1>

                <p
                  className="text-body lh-base mb-4 fs-6"
                  style={{ maxWidth: "560px" }}
                >
                  Walk in anytime. Board-certified ER physicians, CT, X-ray,
                  labs, IV medications, stitches, fractures, chest pain,
                  abdominal pain, migraine, and pediatric emergency care.
                </p>

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
                    <div
                      className="text-dark d-flex align-items-start gap-2 fw-bold lh-sm small"
                    >
                      <FaMapMarkerAlt size={12} className="text-danger flex-shrink-0 mt-1" />
                      <span>
                        {parent.street}
                        <span className="d-block fw-medium text-muted mt-1 small">
                          {parent.city}, {parent.state} {parent.zip}
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
                    <div
                      className="text-dark d-flex align-items-center gap-2 fw-bold lh-sm small"
                    >
                      <span>{parent.google_rating}</span>
                      <Stars rating={5} size={11} />
                    </div>
                    <span className="d-block fw-medium text-muted mt-1 small">
                      {parent.google_review_count.toLocaleString()}+ reviews
                    </span>
                  </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="sl-hero-cta-row d-flex flex-nowrap gap-2">
                  <a
                    href={"tel:" + parent.tel}
                    className="sl-btn sl-btn-red bg-danger text-white d-inline-flex align-items-center justify-content-center gap-2 fw-semibold text-decoration-none text-nowrap rounded-3 py-2 px-3 flex-shrink-0 lh-1 small"
                    onClick={() => trackPhoneCall(parent.tel, parent.city)}
                  >
                    <FaPhoneAlt size={13} /> Call Us Now
                  </a>
                  <Link
                    href={parent.google}
                    target="_blank"
                    rel="noreferrer"
                    className="sl-btn sl-btn-dark bg-dark text-white d-inline-flex align-items-center justify-content-center gap-2 fw-semibold text-decoration-none text-nowrap rounded-3 py-2 px-3 flex-shrink-0 lh-1 small"
                    onClick={() => trackGetDirections(parent.city)}
                  >
                    <FaDirections size={13} /> Get Directions
                  </Link>
                  <Link
                    href={location.acuity_url || "/emergency-room-appointment"}
                    target={location.acuity_url ? "_blank" : undefined}
                    rel={location.acuity_url ? "noreferrer" : undefined}
                    className="sl-btn sl-btn-outline bg-white text-dark d-inline-flex align-items-center justify-content-center gap-2 fw-semibold text-decoration-none text-nowrap border border-dark rounded-3 py-2 px-3 flex-shrink-0 lh-1 small"
                    onClick={() => trackBookAppointment("frisco-dummy-2")}
                  >
                    Start Online Check-In <FaArrowRight size={11} />
                  </Link>
                </div>
              </div>

              <div className="col-lg-6">
                {location.media ? (
                  <div
                    className="img-skeleton w-100 border rounded-4 overflow-hidden position-relative"
                    style={{ aspectRatio: "5/4" }}
                  >
                    <Image
                      src={laravelURL + "/storage/" + location.media.path}
                      alt={location.media.alt_text || `${parent.city} Emergency Room`}
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
        <section className="sl-bg-cream-deep text-dark">
          <div
            className="container d-flex flex-wrap align-items-center justify-content-center gap-3 py-2 text-center lh-base small"
          >
            <FaShieldAlt size={12} className="text-success flex-shrink-0" />
            <span className="fw-medium">
              <strong className="text-dark">Walk-ins are always welcome.</strong>{" "}
              Online check-in is optional. For a life-threatening emergency:
            </span>
            <a
              href="tel:911"
              className="d-inline-flex align-items-center gap-2 fw-bold rounded-pill text-decoration-none py-1 px-2 small"
              style={{ background: "#ffd9a8", color: "#5c2e0e", letterSpacing: "0.02em" }}
            >
              <FaPhoneAlt size={10} /> Call 911
            </a>
          </div>
        </section>

        {/* ============ REVIEWS + MAP ============ */}
        <section className="bg-white py-5">
          <div className="container">
            <div className="row g-5">
              <div className="col-lg-6">
                <Eyebrow>What our patients say</Eyebrow>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Stars size={18} />
                  <strong className="fs-6">{parent.google_rating}</strong>
                  <span className="text-muted small">
                    out of 5 ({parent.google_review_count.toLocaleString()}+ reviews)
                  </span>
                </div>

                <div className="text-muted fst-italic mb-2 small">
                  Sample reviews shown below — actual Google reviews will display here.
                </div>

                <div className="d-flex flex-column gap-3">
                  {parent.reviews.map((r, i) => (
                    <div key={i} className="sl-review card sl-bg-cream">
                      <div className="card-body">
                        <div className="mb-2">
                          <Stars rating={r.rating} size={12} />
                        </div>
                        <p
                          className="text-body fst-italic mb-3 lh-base small"
                        >
                          &ldquo;{r.body}&rdquo;
                        </p>
                        <div
                          className="fw-semibold text-dark small"
                        >
                          — {r.author}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="#"
                  className="d-inline-flex align-items-center gap-2 mt-3 text-dark fw-semibold text-decoration-underline small"
                  style={{ textUnderlineOffset: "3px" }}
                >
                  See more {parent.city} reviews <FaArrowRight size={11} />
                </Link>
              </div>

              <div className="col-lg-6">
                <Eyebrow>Visit our {parent.city} ER</Eyebrow>
                <h3 className="fs-4 fw-bold mb-2 text-dark" style={{ letterSpacing: "-0.01em" }}>
                  {parent.address}
                </h3>
                <div className="text-muted mb-3 small">
                  Open 24 hours · 365 days a year
                </div>

                <div className="position-relative border rounded-4 overflow-hidden">
                  <LocationMap
                    height="500px"
                    location={{
                      name: `SignatureCare ER - ${parent.city}`,
                      address: parent.address,
                      latitude: location.latitude || "33.1085",
                      longitude: location.longitude || "-96.8033",
                    }}
                  />
                  <div
                    className="position-absolute bg-white d-flex align-items-center gap-2 py-2 px-3 rounded-3 shadow"
                    style={{ zIndex: 10, top: "14px", left: "14px", right: "14px" }}
                  >
                    <div className="flex-grow-1 min-w-0">
                      <div
                        className="d-inline-flex align-items-center gap-2 bg-dark text-white rounded-pill fw-bold mb-1 py-1 px-2 small"
                        style={{ letterSpacing: "0.06em" }}
                      >
                        <span
                          className="rounded-circle bg-danger"
                          style={{ width: "6px", height: "6px", boxShadow: "0 0 0 3px rgba(204,0,0,.2)" }}
                        />
                        LIVE · {parent.city.toUpperCase()}
                      </div>
                      <div className="text-muted lh-sm small">
                        {parent.address}
                      </div>
                    </div>
                    <a
                      href={parent.google}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => trackGetDirections(parent.city)}
                      aria-label="Get directions"
                      className="d-flex align-items-center justify-content-center sl-bg-cream rounded text-dark flex-shrink-0" style={{ width: "34px", height: "34px" }}
                    >
                      <FaDirections size={14} />
                    </a>
                  </div>
                  <div
                    className="position-absolute bg-white d-flex align-items-center gap-3 p-3 rounded-4 shadow"
                    style={{ zIndex: 10, bottom: "14px", left: "14px", right: "14px" }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center flex-shrink-0 bg-danger text-white rounded-3" style={{ width: "44px", height: "44px" }}
                    >
                      <FaMapMarkerAlt size={20} />
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <div className="fw-bold text-dark lh-sm small">
                        SignatureCare ER · {parent.city}
                      </div>
                      <div className="text-muted mt-1 small">
                        {parent.address}
                      </div>
                      <div className="d-flex align-items-center gap-3 mt-1 small">
                        <span
                          className="d-inline-flex align-items-center fw-semibold text-success gap-1"
                        >
                          <span
                            className="rounded-circle bg-success"
                            style={{ width: "6px", height: "6px" }}
                          />
                          Open now
                        </span>
                        <span className="text-muted">
                          <FaStar size={11} className="text-warning me-1" style={{ marginTop: "-2px" }} />
                          <strong className="text-dark">{parent.google_rating}</strong>{" "}
                          ({parent.google_review_count.toLocaleString()}+)
                        </span>
                      </div>
                    </div>
                    <a
                      href={parent.google}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => trackGetDirections(parent.city)}
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
        <section className="sl-bg-cream-deep py-5">
          <div className="container">
            <div className="text-center mx-auto mb-5" style={{ maxWidth: "780px" }}>
              <SectionHeading className="mb-3">
                Why Choose SignatureCare Emergency Center?
              </SectionHeading>
              <p className="text-body fs-6 lh-lg mb-0">
                We are nationally accredited, open 24 hours a day, and highly
                rated by our patients. Our physicians are experienced, and we
                are committed to providing an experience that reduces the
                stress of visiting an emergency room.
              </p>
            </div>

            <div className="row g-3">
              {DECISION_TILES.filter(
                (t) => t.label !== "Open 24/7/365" || parent.is_24_7,
              ).map((tile, i) => {
                const Icon = tile.icon;
                return (
                  <div key={i} className="col-6 col-md-4">
                    <div className="sl-tile card h-100">
                      <div className="card-body d-flex align-items-start gap-3">
                        <div
                          className="sl-tile-icon bg-danger-subtle text-danger d-flex align-items-center justify-content-center flex-shrink-0 rounded-3" style={{ width: "44px", height: "44px" }}
                        >
                          <Icon size={20} />
                        </div>
                        <div
                          className="fw-semibold text-dark pt-2 lh-sm fs-6"
                        >
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
                {location.slider_images?.[0]?.media?.path ? (
                  <div
                    className="img-skeleton w-100 border rounded-4 overflow-hidden position-relative"
                    style={{ aspectRatio: "4/3" }}
                  >
                    <Image
                      src={laravelURL + "/storage/" + location.slider_images[0].media.path}
                      alt={location.slider_images[0].media.alt_text || `Inside ${parent.city}`}
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
                  Not sure whether you need an ER or urgent care?
                </SectionHeading>
                <p className="text-body fs-6 lh-lg mb-4">
                  Come to SignatureCare Emergency Center in {parent.city} for
                  symptoms or injuries that may need advanced testing, imaging,
                  IV medications, or immediate physician evaluation.
                </p>

                <div className="mb-4">
                  <h3 className="fw-bold text-dark mb-2">
                    Choose ER care for:
                  </h3>
                  <div className="row g-2">
                    {ER_CONDITIONS.map((c, i) => (
                      <div
                        key={i}
                        className="col-12 col-sm-6 d-flex align-items-start gap-2 text-body lh-sm small"
                      >
                        <FaCheckCircle size={13} className="text-danger flex-shrink-0 mt-1" />
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
                    {URGENT_CARE_CONDITIONS.map((c, i) => (
                      <div
                        key={i}
                        className="col-12 col-sm-6 d-flex align-items-start gap-2 text-body lh-sm small"
                      >
                        <FaCheckCircle size={13} className="text-muted flex-shrink-0 mt-1" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <a
                    href={"tel:" + parent.tel}
                    className="sl-btn sl-btn-dark bg-dark text-white d-inline-flex align-items-center justify-content-center gap-2 fw-semibold text-decoration-none text-nowrap rounded-3 py-2 px-3 lh-1 small"
                    onClick={() => trackPhoneCall(parent.tel, parent.city)}
                  >
                    <FaPhoneAlt size={13} /> Still unsure? Call us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ TIMELINE ============ */}
        <section className="sl-bg-cream-deep py-5 border-top border-bottom">
          <div className="container">
            <div className="mb-4" style={{ maxWidth: "760px" }}>
              <Eyebrow>When you arrive</Eyebrow>
              <SectionHeading className="mb-3">
                From walk-in to discharge — here&rsquo;s what happens.
              </SectionHeading>
              <p className="text-muted mb-0 lh-base fs-6">
                No mystery. No long waiting room. Average door-to-discharge is
                under 90 minutes for most visits.
              </p>
            </div>

            <div className="row g-0">
              {TIMELINE_STEPS.map((step, i) => (
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

        {/* ============ ABOUT (CONDITIONAL) ============ */}
        {/* {(location.subheading || location.description) && (
          <section className="sl-bg-cream py-5">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-lg-9">
                  <Eyebrow>About this location</Eyebrow>
                  <SectionHeading className="mb-4">
                    Inside SignatureCare {parent.city}
                  </SectionHeading>
                  {location.subheading && (
                    <div className="ck-content text-body mb-3 fs-6"
                         style={{ lineHeight: 1.65 }}
                         dangerouslySetInnerHTML={{ __html: location.subheading }} />
                  )}
                  {location.description && (
                    <div className="ck-content text-body fs-6"
                         style={{ lineHeight: 1.7 }}>
                      {parse(addLazyLoadWithSkeleton(location.description))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )} */}

        {/* ============ INSIDE GALLERY ============ */}
        {location.slider_images?.length > 0 && (
          <section className="sl-bg-cream py-5">
            <div className="container">
              <div className="mb-4">
                <Eyebrow>Inside our {parent.city} ER</Eyebrow>
                <ul className="list-unstyled text-muted mb-0 lh-base small d-flex flex-wrap gap-3 mt-3">
                  {GALLERY_FEATURES.map((feature, i) => (
                    <li key={i} className="d-flex align-items-center gap-2">
                      <FaCheckCircle size={13} className="text-danger flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sl-gallery">
                {location.slider_images.slice(0, 5).map((item, key) => (
                  <div
                    key={key}
                    className="sl-gallery-cell sl-bg-cream-deep position-relative rounded-4 overflow-hidden"
                  >
                    <Image
                      fill
                      src={laravelURL + "/storage/" + item.media?.path}
                      alt={item.media?.alt_text || `${parent.city} Emergency Room`}
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
        <section className="bg-white py-5">
          <div className="container">
            <div className="row g-4 align-items-stretch">
              <div className="col-lg-7">
                <div className="card sl-bg-cream h-100">
                  <div className="card-body p-5">
                  <Eyebrow>Insurance & billing</Eyebrow>
                  <h2
                    className="fw-bold mb-3"
                    style={{
                      lineHeight: 1.15,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Have questions about coverage? Call us first.
                  </h2>
                  <p className="text-body mb-3 lh-lg fs-6">
                    SignatureCare Emergency Center {parent.city} is a licensed
                    freestanding emergency room. ER billing works differently
                    than urgent care or a clinic. If you have questions about
                    insurance, benefits, or what to expect, our {parent.city}{" "}
                    team will explain it before you come in.
                  </p>
                  <p className="text-body fs-6 lh-lg mb-3">
                    <strong>We accept most insurance plans</strong>, including
                    Workers&rsquo; Compensation. No commitment — just a clear
                    answer.
                  </p>
                  <p
                    className="text-muted fst-italic border-top pt-3 mb-4 lh-base small"
                  >
                    <strong className="text-dark fst-normal">Facility notice:</strong>{" "}
                    SignatureCare is a freestanding emergency medical care
                    facility. Visit fees may include facility fees, observation
                    fees, and physician fees. For life-threatening emergencies
                    call 911 or go to the nearest ER.
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    <a
                      href={"tel:" + parent.tel}
                      className="sl-btn sl-btn-red bg-danger text-white d-inline-flex align-items-center justify-content-center gap-2 fw-semibold text-decoration-none text-nowrap rounded-3 py-2 px-3 lh-1 small"
                      onClick={() => trackPhoneCall(parent.tel, parent.city)}
                    >
                      <FaPhoneAlt size={13} /> Call {parent.city} about insurance
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

              <div className="col-lg-5">
                <div className="card shadow h-100">
                  <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <div
                        className="fw-bold text-uppercase text-muted small"
                        style={{ letterSpacing: "0.1em" }}
                      >
                        {parent.city} billing line
                      </div>
                      <div
                        className="fw-bold text-dark mt-1 lh-sm fs-4"
                        style={{ letterSpacing: "-0.02em" }}
                      >
                        {parent.tel}
                      </div>
                    </div>
                    <span
                      className="bg-danger-subtle text-danger rounded-pill fw-bold text-nowrap py-1 px-2 small"
                      style={{ letterSpacing: "0.04em" }}
                    >
                      Open now
                    </span>
                  </div>

                  <div
                    className="border-top pt-3 text-body lh-lg small"
                  >
                    Our {parent.city} team can walk you through insurance,
                    benefits, and what to expect — before you come in. No
                    commitment.
                  </div>

                  <div className="d-flex gap-2 mt-4">
                    <a
                      href={"tel:" + parent.tel}
                      onClick={() => trackPhoneCall(parent.tel, parent.city)}
                      className="sl-btn sl-btn-dark bg-dark text-white d-inline-flex align-items-center justify-content-center gap-2 fw-semibold text-decoration-none text-nowrap rounded-3 py-2 px-3 flex-fill lh-1 small"
                    >
                      Call now
                    </a>
                    <Link
                      href="/insurance-information"
                      className="sl-btn sl-btn-outline bg-white text-dark d-inline-flex align-items-center justify-content-center gap-2 fw-semibold text-decoration-none text-nowrap border border-dark rounded-3 py-2 px-3 flex-fill lh-1 small"
                    >
                      Read notice
                    </Link>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section className="sl-bg-cream py-5">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-9">
                <div className="text-center mb-4">
                  <SectionHeading>Frequently Asked Questions</SectionHeading>
                </div>
                <FaqAccordion faqs={parent.faqs} />
              </div>
            </div>
          </div>
        </section>

        {/* ============ SERVICE LINE PILLS ============ */}
        {/* <section className="bg-white py-5 text-center">
          <div className="container">
            <Eyebrow>Coming soon</Eyebrow>
            <h3 className="fs-4 fw-bold text-dark mb-4"
                style={{ letterSpacing: "-0.01em" }}>
              More {parent.city} ER services
            </h3>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              {[
                "Pediatric ER", "Chest Pain", "Abdominal Pain",
                "Stitches & Fractures", "CT Scan", "Dehydration / IV Fluids",
              ].map((s) => (
                <span
                  key={s}
                  className="sl-svc-pill sl-bg-cream text-body border d-inline-block rounded-pill fw-medium py-2 px-3"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </section> */}

        {/* ============ CLOSING CTA BAND ============ */}
        <section className="bg-dark text-white py-5 text-center">
          <div className="container">
            <h2
              className="fw-bold text-white mb-3"
              style={{ lineHeight: 1.15, letterSpacing: "-0.02em" }}
            >
              We&rsquo;re open. Walk in anytime.
            </h2>
            <p
              className="mx-auto mb-4 lh-base fs-6"
              style={{ color: "#c8c2b5", maxWidth: "560px" }}
            >
              No appointment needed. Board-certified ER physicians ready 24/7
              at {parent.address}.
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              <a
                href={"tel:" + parent.tel}
                onClick={() => trackPhoneCall(parent.tel, parent.city)}
                className="sl-btn sl-btn-red bg-danger text-white d-inline-flex align-items-center justify-content-center gap-2 fw-semibold text-decoration-none text-nowrap rounded-3 py-3 px-4 lh-1 small"
              >
                <FaPhoneAlt size={14} /> Call {parent.tel}
              </a>
              <Link
                href={parent.google}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackGetDirections(parent.city)}
                className="sl-btn bg-white text-dark d-inline-flex align-items-center justify-content-center gap-2 fw-semibold text-decoration-none text-nowrap rounded-3 py-3 px-4 lh-1 small"
              >
                <FaDirections size={14} /> Get directions
              </Link>
              <Link
                href={location.acuity_url || "/emergency-room-appointment"}
                target={location.acuity_url ? "_blank" : undefined}
                rel={location.acuity_url ? "noreferrer" : undefined}
                onClick={() => trackBookAppointment("frisco-dummy-2")}
                className="sl-btn sl-btn-outline bg-transparent text-white d-inline-flex align-items-center justify-content-center gap-2 fw-semibold text-decoration-none text-nowrap border border-white rounded-3 py-3 px-4 lh-1 small"
              >
                <FaCheckCircle size={14} /> Start Online Check-In
              </Link>
            </div>
          </div>
        </section>
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
          href={"tel:" + parent.tel}
          onClick={() => trackPhoneCall(parent.tel, parent.city)}
          className="bg-danger text-white d-flex flex-column align-items-center justify-content-center gap-1 text-decoration-none fw-bold rounded-3 small"
          style={{ height: "54px" }}
        >
          <FaPhoneAlt size={16} />
          Call
        </a>
        <Link
          href={parent.google}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackGetDirections(parent.city)}
          className="text-white d-flex flex-column align-items-center justify-content-center gap-1 text-decoration-none fw-bold rounded-3 small"
          style={{ height: "54px" }}
        >
          <FaDirections size={16} />
          Directions
        </Link>
        <Link
          href={location.acuity_url || "/emergency-room-appointment"}
          target={location.acuity_url ? "_blank" : undefined}
          rel={location.acuity_url ? "noreferrer" : undefined}
          onClick={() => trackBookAppointment("frisco-dummy-2")}
          className="text-white d-flex flex-column align-items-center justify-content-center gap-1 text-decoration-none fw-bold rounded-3 small"
          style={{ height: "54px" }}
        >
          <FaCheckCircle size={16} />
          Check-in
        </Link>
      </nav>
    </>
  );
}

export const getStaticProps = async () => {
  try {
    const [locationRes, layoutData] = await Promise.all([
      http.get("/admin/sub-locations/frisco").catch(() => ({ data: {} })),
      getLayoutData(),
    ]);

    return {
      props: {
        location: locationRes.data || {},
        layoutData,
      },
      revalidate: 300,
    };
  } catch (err) {
    console.error("frisco-dummy-2 fetch error:", err.message);
    return {
      props: {
        location: {},
        layoutData: await getLayoutData(),
      },
      revalidate: 60,
    };
  }
};
