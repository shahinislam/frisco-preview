import Head from "next/head";
import Link from "next/link";
import mainURL from "../components/utils/main-url";
import { getLayoutData } from "../components/utils/getLayoutData";

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Page Not Found - SignatureCare Emergency Center</title>
        <meta name="description" content="The page you are looking for could not be found." />
        <link rel="canonical" href={mainURL + "/404"} />
      </Head>

      <div className="container text-center py-5">
        <h1 className="display-1 fw-bold text-danger">404</h1>
        <h2 className="mb-3">Page Not Found</h2>
        <p className="text-muted mb-4">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Link href="/" className="btn btn-danger px-4">
            Go Home
          </Link>
          <Link href="/locations" className="btn btn-outline-danger px-4">
            Find a Location
          </Link>
        </div>
      </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    const layoutData = await getLayoutData();
    return { props: { layoutData } };
  } catch {
    return { props: { layoutData: {} } };
  }
}
