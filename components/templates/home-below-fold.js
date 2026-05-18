import parse from "html-react-parser";
import Image from "next/image";
import Link from "next/link";
import { FaInfoCircle, FaArrowRight } from "react-icons/fa";
import { RiServiceLine } from "react-icons/ri";
import { LiaAwardSolid } from "react-icons/lia";
import laravelURL from "../utils/laravel-url";
import { addLazyLoadWithSkeleton } from "../utils/lazy-images";

export default function HomeBelowFold({ page, sectionFive, sectionSix }) {
  return (
    <>
      {/* Section 3 */}
      <div className="container mb-5">
        <div className="ck-content">
          {page?.third && parse(addLazyLoadWithSkeleton(page?.third))}
        </div>
      </div>
      {/* Section 4 */}
      <div className="bg-info bg-opacity-10 mb-5">
        <div className="container text-center">
          <button
            className="btn btn-danger btn-sm rounded-pill mx-2"
            disabled
          >
            <FaInfoCircle /> IMPORTANT INFO{" "}
          </button>
          <div
            className="ck-content d-inline-flex mt-3"
            style={{ margin: "0", padding: "0" }}
          >
            {page?.fourth && parse(addLazyLoadWithSkeleton(page?.fourth))}
          </div>
        </div>
      </div>
      {/* Section 5 */}
      <div className="container mb-5 section-5">
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {sectionFive?.map((section, index) => (
            <div className="col" key={index}>
              <div className="card h-100 p-3">
                <div
                  className="card-cover-image overflow-hidden img-skeleton"
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "1/1",
                  }}
                >
                  <Image
                    src={laravelURL + "/storage/" + section.media?.path}
                    alt={section.media?.alt_text || section.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="card-img-top"
                    style={{ objectFit: "cover" }}
                    quality={60}
                    loading="lazy"
                  />
                </div>
                <div className="card-body">
                  <h2 className="card-title fw-bold">{section.title}</h2>
                  <p className="card-text">{section.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <br />
      {/* Section 6 */}
      <div className="card border-0 mb-5">
        <div className="row g-0">
          <div className="col-md-5">
            <div
              style={{
                position: "relative",
                width: "100%",
                minHeight: "500px",
                height: "100%",
              }}
              className="rounded-end overflow-hidden"
            >
              <Image
                src={laravelURL + "/storage/" + sectionSix.media?.path}
                alt={sectionSix.media?.alt_text || sectionSix.heading}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                style={{ objectFit: "cover" }}
                quality={60}
                loading="lazy"
              />
            </div>
          </div>
          <div className="col-md-7 container-sm p-3 p-md-5 bg-info bg-opacity-10">
            <div className="p-md-5" id="featured-3">
              <h2 className="pb-2">{sectionSix.heading}</h2>
              <p>{sectionSix.subheading}</p>
              <div className="row g-4 py-5 row-cols-1 row-cols-lg-3">
                {sectionSix?.icons?.map((section, index) => (
                  <div
                    key={index}
                    className="feature col d-flex align-items-start flex-column bd-highlight"
                  >
                    <div className="feature-icon d-inline-flex align-items-center justify-content-center bg-gradient fs-1 mb-3">
                      <Image
                        src={laravelURL + "/storage/" + section.media?.path}
                        alt={section.media?.alt_text || section.title}
                        width={70}
                        height={70}
                        sizes="70px"
                        quality={70}
                        loading="lazy"
                      />
                    </div>
                    <div className="feature-content">
                      <h3 className="fw-bold">{section.title}</h3>
                      <p>{section.description}</p>
                    </div>
                    <div className="feature-link mt-auto">
                      <Link
                        href={section.link}
                        className="icon-link fw-bold d-inline-flex mt-auto"
                      >
                        Read About {section.title}{" "}
                        <FaArrowRight className="arrow-right mt-1 ms-1" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="feature-button fw-bold">
                <Link
                  href="/er-services/emergency-care"
                  className="btn btn-outline-info p-3"
                >
                  <RiServiceLine /> More Conditions We Treat
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Section 7 */}
      <div className="container mb-5">
        <div className="ck-content">
          {page?.seventh && parse(addLazyLoadWithSkeleton(page?.seventh))}
        </div>
        <div className="feature-button fw-bold">
          <Link
            href="/awards-recognition"
            className="btn btn-outline-info p-3"
          >
            <LiaAwardSolid /> See Our Other Awards
          </Link>
        </div>
      </div>
      {/* Bottom */}
      {page?.bottom && parse(addLazyLoadWithSkeleton(page?.bottom))}
    </>
  );
}
