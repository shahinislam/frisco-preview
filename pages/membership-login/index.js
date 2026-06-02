import { Button, Card, Alert } from "react-bootstrap";
// import { useState } from "react";
// import axios from "axios";
// import { useRouter } from 'next/router';
import laravelURL from "../../components/utils/laravel-url";
// import Link from 'next/link';
import Head from "next/head";
import mainURL from "../../components/utils/main-url";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
// import ReCAPTCHA from 'react-google-recaptcha';
import http from "../../components/utils/http";
import parse from "html-react-parser";
import { getLayoutData } from "../../components/utils/getLayoutData";

export default function MembershipLogin({ page }) {
  async function handleSignIn(e) {
    e.preventDefault();
    await signIn("google", { callbackUrl: "/doctors" });
    // console.log(data)
  }

  return (
    <>
      <Head>
        <title>{page?.seo_title}</title>
        <meta name="description" content={page.meta_description} />
        <link rel="canonical" href={mainURL + "/membership-login/"} />
        <meta property="og:title" content={page?.seo_title} />
        <meta property="og:url" content={mainURL + "/membership-login/"} />
        <meta
          property="og:image"
          content={laravelURL + "/storage/" + page.media?.path}
        />

        {page?.head && parse(page?.head)}
      </Head>

      <div className="bg-dark text-white">
        <div className="container text-center">
          <h1 className="py-2">{page?.title}</h1>
        </div>
      </div>

      <br />

      <section className="d-flex align-items-center justify-content-center">
        <Card text="dark border-0" className="col-md-6 col-12">
          <Card.Body>
            <div className="ck-content">
              {page?.description && (
                <div dangerouslySetInnerHTML={{ __html: page.description }} />
              )}
            </div>
            <br />

            <div className="d-grid gap-2">
              <Button
                onClick={handleSignIn}
                variant="outline-danger"
                type="submit"
                className="mt-2 rounded-pill fs-3"
                style={{ transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                  e.currentTarget.style.backgroundColor = '#dc3545';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.color = '';
                }}
              >
                <FcGoogle className="fs-1" /> Continue with Google
              </Button>
            </div>
          </Card.Body>
          <br />
        </Card>
      </section>
      <br />
      <br />
      <br />
    </>
  );
}

export const getStaticProps = async () => {
  try {
    const res = await http.get("/admin/pages/membership-login-text");
    const layoutData = await getLayoutData();

    return {
      props: {
        page: res.data || {},
        layoutData,
      },
      revalidate: 10,
    };
  } catch (err) {
    console.error("Error fetching membership login page data:", err.message);
    return { notFound: true };
  }
};
