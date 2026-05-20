import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
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
  FaArrowRight,
  FaAmbulance,
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

const DUMMY_PARENT = {
  slug: "frisco",
  tel: "469-956-4326",
  street: "16300 State Hwy 121",
  city: "Frisco",
  state: "TX",
  zip: "75035",
  address: "16300 State Hwy 121, Frisco, TX 75035",
  google: "https://maps.google.com/?q=16300+State+Hwy+121+Frisco+TX+75035",
  is_24_7: true,
  status: 1,
  google_rating: 4.9,
  google_review_count: 482,
  nearby_cities: "Plano, Allen, McKinney, The Colony, Little Elm",

  // Section copy (overridable per location via API)
  hero_title: "24-Hour Emergency Room in Frisco, TX",
  hero_subtitle:
    "Walk in anytime. Board-certified ER physicians, CT, X-ray, labs, IV medications, stitches, fractures, chest pain, abdominal pain, migraine, and pediatric emergency care.",
  reviews_title: "What our patients say",
  reviews_subtitle: "",
  map_title: "Visit our Frisco ER",
  map_subtitle: "",
  why_choose_title: "Why Choose SignatureCare Emergency Center?",
  why_choose_subtitle:
    "We are nationally accredited, open 24 hours a day, and highly rated by our patients. Our physicians are experienced, and we are committed to providing an experience that reduces the stress of visiting an emergency room.",
  er_urgent_title: "Not sure whether you need an ER or urgent care?",
  er_urgent_subtitle:
    "Come to SignatureCare Emergency Center in Frisco for symptoms or injuries that may need advanced testing, imaging, IV medications, or immediate physician evaluation.",
  er_urgent_image: "",
  timeline_title: "When you arrive at our ER",
  timeline_subtitle:
    "From walk-in to discharge — here's what happens. No long wait in a crowded waiting room. Average time from walk in to discharge is under 90 minutes for most patients.",
  gallery_title: "Inside our Frisco ER",
  gallery_subtitle: "",
  insurance_title: "Insurance and Billing Questions?",
  insurance_subtitle: "",
  faq_title: "Frequently Asked Questions",
  faq_subtitle: "",
  closing_title: "We're open. Walk in anytime.",
  closing_subtitle:
    "No appointment needed. Board-certified ER physicians available 24/7 at our Frisco Emergency Room.",

  // Rich content blocks (HTML allowed for embedded links / emphasis)
  banner_message:
    "Walk in anytime · No appointment · See a doctor in 10 minutes or less",
  disclaimer_html:
    '<strong class="text-dark">Walk-ins are always welcome.</strong> Online appointment is optional. If this is a life-threatening emergency, please <a href="tel:911" class="text-dark fw-bold text-decoration-underline small">call 911.</a>',
  insurance_body_html:
    '<p class="text-body mb-3 lh-lg fs-6">SignatureCare Emergency Center in Frisco is a licensed freestanding emergency room. ER billing is different from urgent care billing. If you have questions about insurance, benefits, or what to expect, please call our Frisco team, and we will help explain the process. We bill most national insurance plans, including Workers&rsquo; Compensation. Please call our facility at <a href="tel:469-956-4326" class="text-danger fw-bold text-decoration-underline">469-956-4326</a> for information regarding your specific insurance coverage if you still have questions. We are open 24/7.</p><p class="text-body fs-6 lh-lg mb-4">If you are experiencing a serious or life-threatening emergency, call 911 or go to the nearest emergency room.</p>',

  reviews: [
    {
      author: "Sarah M.",
      rating: 5,
      body: "Was seen by a doctor within 5 minutes of walking in. The staff was professional, kind, and the facility was spotless.",
    },
    {
      author: "James T.",
      rating: 5,
      body: "Brought my son in late at night with a high fever. Pediatric care was excellent. Doctor explained everything clearly.",
    },
    {
      author: "Maria L.",
      rating: 5,
      body: "Severe abdominal pain — they got me in for a CT scan immediately, diagnosed appendicitis fast, and arranged transfer for surgery.",
    },
  ],
};

function getDefaultFaqs(parent) {
  return [
    {
      question: "Are you open 24/7?",
      answer: `Yes. SignatureCare Emergency Center ${parent.city} is open 24 hours a day, 365 days a year.`,
    },
    {
      question: "Do I need an appointment?",
      answer:
        "No. Walk-ins are always welcome. If you prefer, you can book an appointment online but it is not necessary.",
    },
    {
      question: "Are you an urgent care?",
      answer: `No. SignatureCare Emergency Center ${parent.city} is a licensed freestanding emergency room with board-certified ER physicians, CT, X-ray, and onsite lab services.`,
    },
    {
      question: "Do you treat children?",
      answer:
        "Yes. We treat all adults and children, including pediatric emergencies, such as high fever, dehydration, asthma, injuries, and severe abdominal pain, and more.",
    },
    {
      question: "Do you have CT, X-ray, and lab testing?",
      answer:
        "Yes, we offer CT scan, X-ray, and laboratory services onsite 24/7.",
    },
    {
      question: "Can I call before coming in?",
      answer: `Yes, you can call our ${parent.city} emergency center at ${parent.tel} anytime, 24/7/365, with any questions you may have.`,
    },
    {
      question: "When should I call 911?",
      answer: "Call 911 for all life-threatening medical emergencies.",
    },
  ];
}

const DECISION_TILES = [
  { icon: FaShieldAlt, label: "Accredited for quality and excellence" },
  { icon: FaUserMd, label: "See board-certified doctor in 10 minutes or less" },
  { icon: FaXRay, label: "CT, X-ray, and COLA-approved Laboratory onsite" },
  { icon: FaBed, label: "Private treatment rooms with free blankets" },
  {
    icon: FaChild,
    label: "Adults and children, including pediatrics, treated",
  },
  { icon: FaClock, label: "Open 24 hours, 7 days, 365 days a year" },
  {
    icon: FaPhoneAlt,
    label: "Streamlined billing. Call with insurance questions",
  },
  {
    icon: FaStar,
    label: "Highly rated emergency care by our beloved patients",
  },
  {
    icon: FaAmbulance,
    label: "Seamless ambulance transfer to area hospitals if necessary",
  },
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
    body: "A nurse greets you within minutes of your arrival.",
    time: "0–2 min",
    active: true,
  },
  {
    title: "Quick triage",
    body: "Your vitals taken and concerns addressed.",
    time: "2–8 min",
  },
  {
    title: "See a doctor",
    body: "Board-certified ER physician at your bedside. CT, X-ray, or labs start immediately if needed.",
    time: "Under 10 min",
  },
  {
    title: "Treat & discharge",
    body: "Clear plan, prescriptions sent to your pharmacy, and a follow-up call the next day.",
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

// status: 0 = Closed, 1 = Open, 2 = Opening soon
function getStatusInfo(status) {
  if (status === 0) return { text: "Closed", dot: "bg-secondary" };
  if (status === 2) return { text: "Opening soon", dot: "bg-warning" };
  return { text: "Open now", dot: "bg-success" };
}

function SectionHeading({ children, className = "", as: Tag = "h2" }) {
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
          <Accordion.Header as="h3">{faq.question}</Accordion.Header>
          <Accordion.Body>{faq.answer}</Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

export default function FriscoDummy2({ location }) {
  const [, setCurrentUrl] = useState("");
  const parent = {
    ...DUMMY_PARENT,
    ...location,
    ...(location.parent || {}),
  };

  const faqs = parent.faqs || getDefaultFaqs(parent);

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
        "@id": mainURL + "/" + parent.slug + "#business",
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
          (parent.latitude || location.latitude) &&
          (parent.longitude || location.longitude)
            ? {
                "@type": "GeoCoordinates",
                latitude: parent.latitude || location.latitude,
                longitude: parent.longitude || location.longitude,
              }
            : undefined,
        url: mainURL + "/" + parent.slug,
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
        mainEntity: faqs.map((f) => ({
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
        <link rel="canonical" href={mainURL + "/" + parent.slug} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={mainURL + "/" + parent.slug} />
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
          <div className="container position-relative d-flex flex-wrap align-items-center justify-content-center gap-3 py-2 text-center small">
            <span
              className="sl-pulse-dot rounded-circle bg-white flex-shrink-0"
              style={{ width: "8px", height: "8px" }}
            />
            <span className="fw-bold small">
              {getStatusInfo(parent.status).text}
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
              {parent.banner_message}
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
              href={"tel:" + parent.tel}
              onClick={() => trackPhoneCall(parent.tel, parent.city)}
              className="d-inline-flex align-items-center bg-white text-dark fw-bold rounded-pill text-decoration-none py-1 px-2 gap-2 small"
            >
              <FaPhoneAlt size={10} /> Call {parent.tel}
            </a>
          </div>
        </div>

        {/* ============ HERO ============ */}
        <section className="bg-white py-5">
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-lg-6">
                <div className="d-inline-flex align-items-center gap-2 bg-white border rounded-pill fw-semibold text-body mb-3 py-1 px-3 small">
                  <span
                    className={`rounded-circle ${getStatusInfo(parent.status).dot}`}
                    style={{ width: "7px", height: "7px" }}
                  />
                  {getStatusInfo(parent.status).text}
                  {parent.is_24_7 && parent.status === 1 && " · 24/7/365"}
                </div>

                <h1 className="display-6 fw-bold text-dark mb-3">
                  {parent.hero_title}
                </h1>

                {parent.hero_subtitle && (
                  <p
                    className="text-body lh-base mb-4 fs-6"
                    style={{ maxWidth: "560px" }}
                  >
                    {parent.hero_subtitle}
                  </p>
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
                      <div className="text-dark d-flex align-items-center gap-2 fw-bold lh-sm small">
                        <span>{parent.google_rating}</span>
                        <Stars
                          rating={Math.round(parent.google_rating)}
                          size={11}
                        />
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
                    onClick={() => trackBookAppointment(parent.slug)}
                  >
                    Get online Appointment <FaArrowRight size={11} />
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
                      alt={
                        location.media.alt_text ||
                        `${parent.city} Emergency Room`
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
        <section className="sl-bg-cream text-dark">
          <div className="container d-flex flex-wrap align-items-center justify-content-center gap-3 py-2 text-center lh-base small">
            <FaShieldAlt size={12} className="text-success flex-shrink-0" />
            <span
              className="fw-medium"
              dangerouslySetInnerHTML={{ __html: parent.disclaimer_html }}
            />
          </div>
        </section>

        {/* ============ REVIEWS + MAP ============ */}
        <section className="bg-white py-5">
          <div className="container">
            <div className="row g-5 align-items-stretch">
              <div className="col-lg-6 d-flex flex-column">
                <SectionHeading className="mb-3">
                  {parent.reviews_title}
                </SectionHeading>
                {parent.reviews_subtitle && (
                  <p className="text-body lh-base mb-3 fs-6">
                    {parent.reviews_subtitle}
                  </p>
                )}
                <div className="d-flex align-items-center gap-3 mb-4 p-3 sl-bg-cream rounded-4">
                  <div className="display-5 fw-bold lh-1 text-dark">
                    {parent.google_rating}
                  </div>
                  <div>
                    <Stars size={16} />
                    <div className="text-muted small mt-1">
                      {parent.google_review_count.toLocaleString()}+ Google
                      reviews
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-column gap-3">
                  {parent.reviews.map((r, i) => (
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

                {(parent.google_review_url || parent.google) && (
                  <Link
                    href={parent.google_review_url || parent.google}
                    target="_blank"
                    rel="noreferrer"
                    className="sl-btn sl-btn-outline bg-white text-dark d-inline-flex align-items-center justify-content-center gap-2 fw-semibold text-decoration-none text-nowrap border border-dark rounded-3 py-2 px-3 mt-4 lh-1 small align-self-start"
                  >
                    See more {parent.city} reviews <FaArrowRight size={11} />
                  </Link>
                )}
              </div>

              <div className="col-lg-6 d-flex flex-column">
                <SectionHeading as="h3" className="mb-3 fs-6">
                  {parent.map_title}
                </SectionHeading>
                {parent.map_subtitle && (
                  <p className="text-body lh-base mb-3 fs-6">
                    {parent.map_subtitle}
                  </p>
                )}
                <div className="text-dark mb-1">{parent.address}</div>
                <div className="text-muted mb-3 small">
                  Open 24 hours · 365 days a year
                </div>

                <div className="position-relative border rounded-4 overflow-hidden shadow-sm">
                  <LocationMap
                    height="500px"
                    location={{
                      name: `SignatureCare ER - ${parent.city}`,
                      address: parent.address,
                      latitude:
                        parent.latitude || location.latitude || "33.1085",
                      longitude:
                        parent.longitude || location.longitude || "-96.8033",
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
                        SignatureCare ER · {parent.city}
                      </div>
                      <div className="text-muted mt-1 small">
                        {parent.address}
                      </div>
                      <div className="d-flex align-items-center gap-3 mt-1 small">
                        <span className="d-inline-flex align-items-center fw-semibold gap-1">
                          <span
                            className={`rounded-circle ${getStatusInfo(parent.status).dot}`}
                            style={{ width: "6px", height: "6px" }}
                          />
                          {getStatusInfo(parent.status).text}
                        </span>
                        <span className="text-muted">
                          <FaStar
                            size={11}
                            className="text-warning me-1"
                            style={{ marginTop: "-2px" }}
                          />
                          <strong className="text-dark">
                            {parent.google_rating}
                          </strong>{" "}
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
        <section className="sl-bg-cream py-5">
          <div className="container">
            <div
              className="text-center mx-auto mb-5"
              style={{ maxWidth: "780px" }}
            >
              <SectionHeading className="mb-3">
                {parent.why_choose_title}
              </SectionHeading>
              {parent.why_choose_subtitle && (
                <p className="text-body fs-6 lh-lg mb-0">
                  {parent.why_choose_subtitle}
                </p>
              )}
            </div>

            <div className="row g-3">
              {DECISION_TILES.filter(
                (t) =>
                  t.label !== "Open 24 hours, 7 days, 365 days a year" ||
                  parent.is_24_7,
              ).map((tile, i) => {
                const Icon = tile.icon;
                return (
                  <div key={i} className="col-6 col-md-4">
                    <div className="sl-tile card h-100">
                      <div className="card-body d-flex align-items-start gap-3">
                        <div
                          className="sl-tile-icon bg-danger-subtle text-danger d-flex align-items-center justify-content-center flex-shrink-0 rounded-3"
                          style={{ width: "44px", height: "44px" }}
                        >
                          <Icon size={20} />
                        </div>
                        <div className="fw-semibold text-dark pt-2 lh-sm fs-6">
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
                {parent.er_urgent_image ||
                location.slider_images?.[0]?.media?.path ? (
                  <div
                    className="img-skeleton w-100 border rounded-4 overflow-hidden position-relative"
                    style={{ aspectRatio: "4/3" }}
                  >
                    <Image
                      src={
                        parent.er_urgent_image ||
                        laravelURL +
                          "/storage/" +
                          location.slider_images[0].media.path
                      }
                      alt={
                        location.slider_images?.[0]?.media?.alt_text ||
                        `Inside ${parent.city}`
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
                  {parent.er_urgent_title}
                </SectionHeading>
                {parent.er_urgent_subtitle && (
                  <p className="text-body fs-6 lh-lg mb-4">
                    {parent.er_urgent_subtitle}
                  </p>
                )}

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
                    {URGENT_CARE_CONDITIONS.map((c, i) => (
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
                href={"tel:" + parent.tel}
                onClick={() => trackPhoneCall(parent.tel, parent.city)}
                className="text-danger fw-bold text-decoration-underline"
              >
                {parent.tel}
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
                {parent.timeline_title}
              </SectionHeading>
              {parent.timeline_subtitle && (
                <p className="text-muted mb-0 lh-base fs-6">
                  {parent.timeline_subtitle}
                </p>
              )}
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

        {/* ============ INSIDE GALLERY ============ */}
        {location.slider_images?.length > 0 && (
          <section className="bg-white py-5">
            <div className="container">
              <div className="mb-4">
                <SectionHeading className="mb-3">
                  {parent.gallery_title}
                </SectionHeading>
                {parent.gallery_subtitle && (
                  <p className="text-body lh-base mb-3 fs-6">
                    {parent.gallery_subtitle}
                  </p>
                )}
                <ul className="list-unstyled text-muted mb-0 lh-base small d-flex flex-wrap gap-3 mt-3">
                  {GALLERY_FEATURES.map((feature, i) => (
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
                {location.slider_images.slice(0, 5).map((item, key) => (
                  <div
                    key={key}
                    className="sl-gallery-cell sl-bg-cream-deep position-relative rounded-4 overflow-hidden"
                  >
                    <Image
                      fill
                      src={laravelURL + "/storage/" + item.media?.path}
                      alt={
                        item.media?.alt_text || `${parent.city} Emergency Room`
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
                  {parent.insurance_title}
                </SectionHeading>
                {parent.insurance_subtitle && (
                  <p className="text-body lh-base mb-3 fs-6">
                    {parent.insurance_subtitle}
                  </p>
                )}
                <div
                  onClick={(e) => {
                    const link = e.target.closest("a[href^='tel:']");
                    if (link) trackPhoneCall(parent.tel, parent.city);
                  }}
                  dangerouslySetInnerHTML={{
                    __html: parent.insurance_body_html,
                  }}
                />
                <div className="d-flex flex-wrap gap-2">
                  <a
                    href={"tel:" + parent.tel}
                    className="sl-btn sl-btn-red bg-danger text-white d-inline-flex align-items-center justify-content-center gap-2 fw-semibold text-decoration-none text-nowrap rounded-3 py-2 px-3 lh-1 small"
                    onClick={() => trackPhoneCall(parent.tel, parent.city)}
                  >
                    <FaPhoneAlt size={13} /> Call our {parent.city} ER about
                    insurance concerns
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
        <section className="bg-white py-5">
          <div className="container">
            <div className="text-center mb-4">
              <SectionHeading>{parent.faq_title}</SectionHeading>
              {parent.faq_subtitle && (
                <p className="text-body lh-base mt-3 mb-0 fs-6">
                  {parent.faq_subtitle}
                </p>
              )}
            </div>
            <FaqAccordion faqs={faqs} />
          </div>
        </section>

        {/* ============ CLOSING CTA BAND ============ */}
        <section className="bg-dark text-white py-5 text-center">
          <div className="container">
            <h2
              className="fw-bold text-white mb-3"
              style={{ lineHeight: 1.15, letterSpacing: "-0.02em" }}
            >
              {parent.closing_title}
            </h2>
            {parent.closing_subtitle && (
              <p
                className="mx-auto mb-4 lh-base fs-6"
                style={{ color: "#c8c2b5", maxWidth: "560px" }}
              >
                {parent.closing_subtitle}
              </p>
            )}
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
                onClick={() => trackBookAppointment(parent.slug)}
                className="sl-btn sl-btn-outline bg-transparent text-white d-inline-flex align-items-center justify-content-center gap-2 fw-semibold text-decoration-none text-nowrap border border-white rounded-3 py-3 px-4 lh-1 small"
              >
                <FaCheckCircle size={14} /> Get online Appointment
              </Link>
            </div>
          </div>
        </section>

        {/* ============ SOCIAL MEDIA ============ */}
        {(parent.facebook ||
          parent.twitter ||
          parent.youtube ||
          parent.instagram ||
          parent.linkedin ||
          parent.tiktok) && (
          <section className="sl-bg-cream py-4 text-center">
            <div className="container">
              {parent.facebook && (
                <SocialIcon
                  url={parent.facebook}
                  network="facebook"
                  style={{ height: 40, width: 40, margin: "0px 1px" }}
                  title="Facebook"
                />
              )}
              {parent.twitter && (
                <SocialIcon
                  url={parent.twitter}
                  network="x"
                  style={{ height: 40, width: 40, margin: "0px 1px" }}
                  title="X"
                />
              )}
              {parent.youtube && (
                <SocialIcon
                  url={parent.youtube}
                  network="youtube"
                  style={{ height: 40, width: 40, margin: "0px 1px" }}
                  title="YouTube"
                />
              )}
              {parent.instagram && (
                <SocialIcon
                  url={parent.instagram}
                  network="instagram"
                  style={{ height: 40, width: 40, margin: "0px 1px" }}
                  title="Instagram"
                />
              )}
              {parent.linkedin && (
                <SocialIcon
                  url={parent.linkedin}
                  network="linkedin"
                  style={{ height: 40, width: 40, margin: "0px 1px" }}
                  title="LinkedIn"
                />
              )}
              {parent.tiktok && (
                <SocialIcon
                  url={parent.tiktok}
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
          onClick={() => trackBookAppointment(parent.slug)}
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
    console.error("frisco sub-location fetch error:", err.message);
    return {
      props: {
        location: {},
        layoutData: await getLayoutData(),
      },
      revalidate: 60,
    };
  }
};
