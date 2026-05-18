import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import laravelURL from "../utils/laravel-url";
import SkipTheWait from "../utils/skip-the-wait";
import mainURL from "../utils/main-url";
import blogHref from "../utils/blog-href";
import LocationList from "../templates/location-list";
import parse from "html-react-parser";
import { addLazyLoadWithSkeleton } from "../utils/lazy-images";
import dynamic from "next/dynamic";

// ✅ Dynamic import for ShareButtons
const ShareButtons = dynamic(() => import("../utils/ShareButtons"), {
  ssr: false,
  loading: () => <div style={{ height: "36px" }} />,
});

const formatDate = (dateString, format = "long") => {
  const date = new Date(dateString);
  if (format === "short") {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ✅ Format date for datetime attribute (ISO format)
const formatDateISO = (dateString) => {
  return new Date(dateString).toISOString();
};

export default function Blog({ blog, locationSidebar }) {
  const [currentUrl, setCurrentUrl] = useState("");
  const blogPath = blogHref(blog);

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  // ✅ Parse description with SkipTheWait replacement (no ReactDOMServer needed)
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

  // Generate JSON-LD structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.meta_description,
    image: blog.media?.path ? laravelURL + "/storage/" + blog.media.path : "",
    datePublished: blog.date,
    dateModified: blog.updated_at || blog.date,
    author: {
      "@type": "Organization",
      name: "SignatureCare Emergency Center",
      url: mainURL,
    },
    publisher: {
      "@type": "Organization",
      name: "SignatureCare Emergency Center",
      logo: {
        "@type": "ImageObject",
        url: mainURL + "/assets/signaturecare-logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": mainURL + blogPath,
    },
    articleSection: blog.categories?.map((cat) => cat.name).join(", "),
    keywords: blog.categories?.map((cat) => cat.name).join(", "),
  };

  // Generate breadcrumb structured data
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: mainURL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: mainURL + "/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: blog.title,
        item: mainURL + blogPath,
      },
    ],
  };

  return (
    <>
      <Head>
        <title>{blog.seo_title}</title>
        <meta name="description" content={blog.meta_description} />
        <link rel="canonical" href={mainURL + blogPath} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" key="og:type" />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.meta_description} />
        <meta property="og:url" content={mainURL + blogPath} />
        <meta
          property="og:image"
          content={
            blog.media?.path ? laravelURL + "/storage/" + blog.media.path : ""
          }
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="article:published_time" content={blog.date} />
        <meta
          property="article:modified_time"
          content={blog.updated_at || blog.date}
        />
        <meta
          property="article:author"
          content="SignatureCare Emergency Center"
        />
        {blog.categories?.map((category, index) => (
          <meta key={index} property="article:tag" content={category.name} />
        ))}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={blog.meta_description} />
        <meta
          name="twitter:image"
          content={
            blog.media?.path ? laravelURL + "/storage/" + blog.media.path : ""
          }
        />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />

        {blog?.head && parse(blog?.head)}
      </Head>

      <article
        className="container"
        itemScope
        itemType="https://schema.org/BlogPosting"
      >
        <br />

        <div className="row">
          <div className="col-md-9">
            {/* Article Header */}
            <header>
              <h1
                className="mb-3 fw-bold"
                itemProp="headline"
                style={{ wordBreak: "break-word" }}
              >
                {blog.title}
              </h1>

              {/* Article Meta */}
              <div className="mb-4 text-muted">
                <small>
                  By{" "}
                  <span
                    itemProp="author"
                    itemScope
                    itemType="https://schema.org/Organization"
                  >
                    <span itemProp="name" className="text-danger">
                      SignatureCare ER
                    </span>
                  </span>
                  {" | "}
                  <time
                    itemProp="datePublished"
                    dateTime={formatDateISO(blog.date)}
                  >
                    {formatDate(blog.date)}
                  </time>
                  {blog.categories?.length > 0 && (
                    <>
                      {" | "}Categories:{" "}
                      {blog.categories.map((category, index) => (
                        <span key={index} itemProp="articleSection">
                          {index > 0 ? ", " : ""}
                          <Link
                            href={"/blog/categories/" + category.slug}
                            className="text-danger"
                          >
                            {category.name}
                          </Link>
                        </span>
                      ))}
                    </>
                  )}
                </small>
              </div>
            </header>

            {/* Featured Image */}
            {blog.image_show && blog.media && (
              <figure
                className="mb-4"
                itemProp="image"
                itemScope
                itemType="https://schema.org/ImageObject"
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "1200/630",
                  }}
                  className="rounded overflow-hidden img-skeleton"
                >
                  <Image
                    src={laravelURL + "/storage/" + blog.media.path}
                    alt={blog.media.alt_text || blog.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 1200px"
                    style={{ objectFit: "cover" }}
                    priority
                    fetchpriority="high"
                    itemProp="url"
                  />
                </div>
                {blog.media.alt_text && (
                  <meta itemProp="caption" content={blog.media.alt_text} />
                )}
              </figure>
            )}

            {/* Article Body */}
            <section itemProp="articleBody">
              <div className="ck-content">
                {/* ✅ Use parse with replace instead of ReactDOMServer */}
                {blog.description &&
                  parse(
                    addLazyLoadWithSkeleton(blog.description),
                    parseOptions,
                  )}
              </div>
            </section>

            <br />

            {/* Social Share Section */}
            <section aria-label="Share article">
              <div className="card border-0 bg-light">
                <div className="card-body p-4">
                  <div className="row text-center align-items-center">
                    <div className="col-md-5 mb-3 mb-md-0">
                      <strong>Share this article:</strong>
                    </div>
                    <div className="col-md-7">
                      <div className="d-flex justify-content-center gap-2">
                        {/* ✅ Dynamic ShareButtons component */}
                        <ShareButtons url={currentUrl} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <br />

            {/* Related Posts Section */}
            {blog.relatedBlog && blog.relatedBlog.length > 0 && (
              <section aria-label="Related blog posts">
                <h2 className="h4 mb-4">Related Articles</h2>

                <div
                  id="relatedBlogsCarousel"
                  className="carousel slide"
                  data-bs-ride="carousel"
                >
                  <div className="carousel-inner">
                    {blog.relatedBlog
                      .reduce((acc, relatedBlog, index) => {
                        const slideIndex = Math.floor(index / 3);
                        if (!acc[slideIndex]) {
                          acc[slideIndex] = [];
                        }
                        acc[slideIndex].push(relatedBlog);
                        return acc;
                      }, [])
                      .map((blogGroup, slideIndex) => (
                        <div
                          key={slideIndex}
                          className={`carousel-item ${slideIndex === 0 ? "active" : ""}`}
                        >
                          <div className="row justify-content-center g-3">
                            {blogGroup.map((relatedBlog, cardIndex) => (
                              <article
                                key={cardIndex}
                                className="col-12 col-md-4"
                              >
                                <div className="card border-0 shadow-sm h-100">
                                  <div
                                    style={{
                                      position: "relative",
                                      width: "100%",
                                      aspectRatio: "16/10",
                                    }}
                                    className="img-skeleton"
                                  >
                                    <Image
                                      src={
                                        relatedBlog.media?.path
                                          ? laravelURL +
                                            "/storage/" +
                                            relatedBlog.media.path
                                          : laravelURL +
                                            "/storage/blogs/default.jpg"
                                      }
                                      alt={
                                        relatedBlog.media?.alt_text ||
                                        relatedBlog.title
                                      }
                                      fill
                                      sizes="(max-width: 768px) 100vw, 320px"
                                      style={{ objectFit: "cover" }}
                                      loading="lazy"
                                    />
                                  </div>
                                  <div className="card-body">
                                    <h3 className="card-title h6">
                                      <Link
                                        href={blogHref(relatedBlog)}
                                        className="text-danger text-decoration-none"
                                      >
                                        {relatedBlog.title}
                                      </Link>
                                    </h3>
                                    <p className="card-text text-muted small">
                                      <time
                                        dateTime={formatDateISO(
                                          relatedBlog.date,
                                        )}
                                      >
                                        {formatDate(relatedBlog.date, "short")}
                                      </time>
                                    </p>
                                  </div>
                                </div>
                              </article>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>

                  {blog.relatedBlog.length > 3 && (
                    <>
                      <button
                        className="carousel-control-prev"
                        type="button"
                        data-bs-target="#relatedBlogsCarousel"
                        data-bs-slide="prev"
                        aria-label="Previous related posts"
                      >
                        <span
                          className="carousel-control-prev-icon bg-dark rounded-circle p-3"
                          aria-hidden="true"
                        ></span>
                        <span className="visually-hidden">Previous</span>
                      </button>
                      <button
                        className="carousel-control-next"
                        type="button"
                        data-bs-target="#relatedBlogsCarousel"
                        data-bs-slide="next"
                        aria-label="Next related posts"
                      >
                        <span
                          className="carousel-control-next-icon bg-dark rounded-circle p-3"
                          aria-hidden="true"
                        ></span>
                        <span className="visually-hidden">Next</span>
                      </button>

                      <div className="carousel-indicators">
                        {Array.from({
                          length: Math.ceil(blog.relatedBlog.length / 3),
                        }).map((_, index) => (
                          <button
                            key={index}
                            type="button"
                            data-bs-target="#relatedBlogsCarousel"
                            data-bs-slide-to={index}
                            className={index === 0 ? "active" : ""}
                            aria-current={index === 0 ? "true" : "false"}
                            aria-label={`Slide ${index + 1}`}
                          ></button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}

            <br />
            <br />
          </div>

          <aside className="col-md-3" aria-label="Sidebar">
            <LocationList locationSidebar={locationSidebar} />
          </aside>
        </div>
      </article>

      {blog?.bottom && parse(blog?.bottom)}
    </>
  );
}
