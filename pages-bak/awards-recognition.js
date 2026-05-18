import Head from "next/head";
import Image from "next/image";
import React from "react";
import http from "../components/utils/http";
import laravelURL from "../components/utils/laravel-url";
import mainURL from "../components/utils/main-url";
import SkipTheWait from "../components/utils/skip-the-wait";
import ReactDOMServer from "react-dom/server";
import parse from "html-react-parser";
import { getLayoutData } from "../components/utils/getLayoutData";

export default function AwardRecognition({ awards, page }) {
  const element = <SkipTheWait />;

  return (
    <>
      <Head>
        <title>{page.seo_title}</title>
        <meta name="description" content={page.meta_description} />
        <link rel="canonical" href={mainURL + "/awards-recognition/"} />
        <meta property="og:title" content={page.seo_title} />
        <meta property="og:url" content={mainURL + "/awards-recognition/"} />
        <meta
          property="og:image"
          content={laravelURL + "/storage/" + page.media?.path}
        />

        {page?.head && parse(page?.head)}
      </Head>

      <section>
        <div className="text-center bg-dark text-white">
          <h1 className="py-2">{page.title}</h1>
        </div>
      </section>

      <br />

      <div className="container-fluid px-0">
        {page.image_show && page.media ? (
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', maxHeight: '600px' }} className="mb-4 img-skeleton">
            <Image
              src={laravelURL + "/storage/" + page.media?.path}
              alt={page.media?.alt_text || page.title}
              fill
              sizes="100vw"
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        ) : null}
      </div>

      <br />

      <section className="container">
        <div className="ck-content">
          <div
            dangerouslySetInnerHTML={{
              __html: page.description.replace(
                "skip-the-wait",
                ReactDOMServer.renderToStaticMarkup(element)
              ),
            }}
          />
        </div>
      </section>

      <br />
      <section>
        <center>
          <hr className="w-50 curve" />
        </center>
      </section>
      <br />

      <div className="container">
        <div className="row">
          {awards &&
            awards.map((award, index) => (
              <div className="col-md-4 d-flex align-items-stretch mb-4" key={index}>
                <div className="text-center w-100">
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '190px',
                      maxWidth: '300px',
                      margin: '0 auto',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    className="award-image-container"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1) translateY(-10px)';
                      e.currentTarget.style.filter = 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1) translateY(0)';
                      e.currentTarget.style.filter = 'none';
                    }}
                  >
                    <Image
                      src={laravelURL + "/storage/" + award.media?.path}
                      alt={award.media?.alt_text || "Award image"}
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      style={{ objectFit: 'contain' }}
                      loading="lazy"
                    />
                  </div>
                  <br />
                  <p>
                    <b>
                      <i>{award.host} - </i>
                    </b>
                    {award.title}
                  </p>
                  <hr />
                </div>
              </div>
            ))}
        </div>
      </div>

      <br />
      <br />
      <br />

      {page?.bottom && parse(page?.bottom)}
    </>
  );
}

export const getStaticProps = async () => {
  try {
    // Fetch both endpoints in parallel
    const [awardsRes, textRes, layoutData] = await Promise.all([
      http.get("/admin/awards"),
      http.get("/admin/pages/awards-recognition-text"),
      getLayoutData(),
    ]);

    const awards = awardsRes.data || [];
    const page = textRes.data || {};

    return {
      props: {
        awards,
        page,
        layoutData,
      },
      revalidate: 10,
    };
  } catch (err) {
    console.error("Error fetching awards page data:", err.message);

    // Option 1: Return 404 page
    return { notFound: true };

    // Option 2: Or fallback empty props to still build
    // return {
    //   props: {
    //     awards: [],
    //     page: {},
    //   },
    //   revalidate: 10,
    // };
  }
};
