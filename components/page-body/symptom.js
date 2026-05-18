import Head from "next/head";
import Image from "next/image";
import laravelURL from "../utils/laravel-url";
import SkipTheWait from "../utils/skip-the-wait";
import mainURL from "../utils/main-url";
import SymptomList from "../templates/symptom-list";
import parse from "html-react-parser";
import { addLazyLoadWithSkeleton } from "../utils/lazy-images";

export default function Symptom({ symptom, symptomSidebar }) {
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

  return (
    <>
      <Head>
        <title>{symptom.seo_title}</title>
        <meta name="description" content={symptom.meta_description} />
        <link rel="canonical" href={mainURL + "/" + symptom.slug} />

        <meta property="og:title" content={symptom.title} />
        <meta property="og:description" content={symptom.meta_description} />
        <meta property="og:url" content={mainURL + "/" + symptom.slug} />
        <meta
          property="og:image"
          content={laravelURL + "/storage/" + symptom.media?.path}
        />

        {symptom.updated_at && <meta property="article:modified_time" content={symptom.updated_at} />}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={symptom.title} />
        <meta name="twitter:description" content={symptom.meta_description} />
        <meta name="twitter:image" content={laravelURL + '/storage/' + symptom.media?.path} />

        {symptom?.head && parse(symptom?.head)}
      </Head>

      <div className="bg-dark text-white">
        <div className="container text-center">
          <h1 className="py-2">{symptom.title}</h1>
        </div>
      </div>
      <br />
      <div className="container">
        <div className="row">
          <div className="col-md-8">
            {symptom.image_show
              ? symptom.media && (
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', maxHeight: '600px' }} className="mb-4 img-skeleton">
                    <Image
                      src={laravelURL + "/storage/" + symptom.media?.path}
                      alt={symptom.media?.alt_text || symptom.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 66vw"
                      style={{ objectFit: "cover" }}
                      quality={75}
                      priority
                      fetchpriority="high"
                    />
                  </div>
                )
              : ""}
            <br />
            <br />
            <section>
              <div className="ck-content">
                {/* ✅ Use parse with replace instead of ReactDOMServer */}
                {symptom.description &&
                  parse(addLazyLoadWithSkeleton(symptom.description), parseOptions)}
              </div>
            </section>
          </div>
          <div className="col-md-4">
            <SymptomList symptomSidebar={symptomSidebar} />
          </div>
        </div>
      </div>
      <br />
      <br />

      {symptom?.bottom && parse(symptom?.bottom)}
    </>
  );
}
