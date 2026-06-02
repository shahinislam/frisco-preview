import { useEffect, useState } from "react";
import Head from "next/head";
import http from "../../components/utils/http";
import laravelURL from "../../components/utils/laravel-url";
import Image from "next/image";
import SkipTheWait from "../../components/utils/skip-the-wait";

import mainURL from "../../components/utils/main-url";
import parse from "html-react-parser";
import { addLazyLoadWithSkeleton } from "../../components/utils/lazy-images";
import { getLayoutData } from "../../components/utils/getLayoutData";
import dynamic from "next/dynamic";

// ✅ Dynamic imports - only load when needed
const Map = dynamic(() => import("../../components/templates/MapSearch"), {
  ssr: false,
  loading: () => <div style={{ height: "400px" }} className="bg-light" />,
});

const LocationMap = dynamic(
  () => import("../../components/templates/LocationMap"),
  {
    ssr: false,
    loading: () => (
      <div
        className="sk-hero"
        style={{ height: "400px", borderRadius: "8px" }}
      />
    ),
  },
);

const ShareButtons = dynamic(
  () => import("../../components/utils/ShareButtons"),
  {
    ssr: false,
    loading: () => <div style={{ height: "36px" }} />,
  },
);

const cleanHTML = (htmlString) => {
  if (!htmlString) return "";

  return htmlString
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<p[^>]*>\s*(&nbsp;|\s)*\s*<\/p>/gi, "")
    .replace(/^(<br\s*\/?>)+|(<br\s*\/?>)+$/gi, "")
    .trim();
};

export default function LocationShow({ location, locationContent }) {
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  // ✅ Parse description with SkipTheWait replacement (no ReactDOMServer needed)
  const parseOptions = {
    replace: (domNode) => {
      // Replace skip-the-wait placeholder with actual component
      if (
        domNode.attribs &&
        (domNode.attribs.class === "skip-the-wait" ||
          domNode.attribs.id === "skip-the-wait")
      ) {
        return <SkipTheWait url={location.acuity_url} />;
      }
      // Check for text content containing skip-the-wait
      if (domNode.type === "text" && domNode.data === "skip-the-wait") {
        return <SkipTheWait url={location.acuity_url} />;
      }
    },
  };

  return (
    <>
      <div>
        <Head>
          <title>{location.seo_title}</title>
          <meta name="description" content={location.meta_description} />
          <link
            rel="canonical"
            href={mainURL + "/locations/" + location.slug}
          />

          <meta property="og:title" content={location.title} />
          <meta property="og:description" content={location.meta_description} />
          <meta
            property="og:url"
            content={mainURL + "/locations/" + location.slug}
          />
          <meta
            property="og:image"
            content={laravelURL + "/storage/" + location.img}
          />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={location.title} />
          <meta
            name="twitter:description"
            content={location.meta_description}
          />
          <meta
            name="twitter:image"
            content={laravelURL + "/storage/" + location.img}
          />

          {location?.head && parse(location?.head)}
        </Head>

        <div className="bg-dark text-white">
          <div className="text-center">
            <h1 className="py-2">{location.title}</h1>
          </div>
        </div>
        <br />
        <br />
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <section>
                <div className="ck-content">
                  <div
                    dangerouslySetInnerHTML={{ __html: location.subheading }}
                  />
                </div>
              </section>
              <br />
              <SkipTheWait url={location.acuity_url} />
              <br />
              {location.image_show && location.media && (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16/9",
                    maxHeight: "600px",
                  }}
                  className="mb-4 img-skeleton"
                >
                  <Image
                    src={laravelURL + "/storage/" + location.media?.path}
                    alt={location.media?.alt_text || location.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                    style={{ objectFit: "cover" }}
                    quality={75}
                    priority
                    fetchpriority="high"
                  />
                </div>
              )}

              <div className="w-100 d-block" style={{ maxWidth: "100%" }}>
                <div className="ck-content">
                  {location.description &&
                    parse(
                      addLazyLoadWithSkeleton(location.description),
                      parseOptions,
                    )}
                </div>
              </div>

              <br />
              <div>
                <b>
                  Enter your zip code below to see the SignatureCare Emergency
                  Center 24-hour Emergency Room near you.
                </b>
              </div>
              <br />

              {/* ✅ Dynamic Map component */}
              <Map />
            </div>

            <div className="col-md-6">
              {location.accreditation && cleanHTML(location.accreditation) && (
                <div className="ck-content">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: cleanHTML(location.accreditation),
                    }}
                  />
                </div>
              )}

              {/* ✅ Dynamic LocationMap component */}
              <LocationMap location={location} />

              <br />
              <section>
                <p className="fw-bold">Inside {location.title}</p>
                {location.slider_images?.map((item, key) => (
                  <div key={key} className="mb-3">
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "500/380",
                      }}
                      className="img-skeleton"
                    >
                      <Image
                        fill
                        src={laravelURL + "/storage/" + item.media?.path}
                        alt={item.media?.alt_text || location.title}
                        sizes="(max-width: 768px) 100vw, 500px"
                        style={{ objectFit: "cover" }}
                        quality={75}
                        loading="lazy"
                      />
                    </div>
                  </div>
                ))}
              </section>
              <br />
            </div>
          </div>
          <br />
        </div>
        <br />
        <section className="container">
          <div className="mb-3">
            <div className="py-1 mt-3 border-top border-bottom">
              <small>
                By <span className="text-danger">SignatureCare ER </span>
              </small>
            </div>
          </div>
          <div className="card border-0 shadow">
            <div className="card-body p-4">
              <div className="row text-center">
                <div className="col-md">
                  Share this useful information with your friends!
                </div>
                <div className="col-md">
                  {/* ✅ Dynamic ShareButtons component */}
                  <ShareButtons url={currentUrl} />
                </div>
              </div>
            </div>
          </div>
        </section>
        <br />
        <br />
        <br />
      </div>

      {location?.bottom && parse(location?.bottom)}
    </>
  );
}

export const getStaticPaths = async () => {
  try {
    const res = await http.get("/admin/sub-locations");
    const data = res.data || [];
    const paths = data.map((location) => ({
      params: { locationSlug: location.slug },
    }));

    return {
      paths,
      fallback: "blocking",
    };
  } catch (err) {
    console.error(
      "Error fetching sub-locations for static paths:",
      err.message,
    );
    return {
      paths: [],
      fallback: "blocking",
    };
  }
};

export const getStaticProps = async (context) => {
  try {
    const slug = context.params.locationSlug;

    const [locationRes, layoutData] = await Promise.all([
      http.get("/admin/sub-locations/" + slug),
      getLayoutData(),
    ]);

    return {
      props: {
        location: locationRes.data || {},
        layoutData,
      },
      revalidate: 300, // 5 minutes
    };
  } catch (err) {
    console.error("Error fetching location data:", err.message);
    return { notFound: true };
  }
};
