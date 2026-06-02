import Head from "next/head";
import Link from "next/link";
import { getLayoutData } from "../components/utils/getLayoutData";

export default function Custom500() {
  return (
    <>
      <Head>
        <title>Server Error - SignatureCare Emergency Center</title>
        <meta name="description" content="Something went wrong on our end. Please try again later." />
      </Head>

      <div className="container text-center py-5">
        <h1 className="display-1 fw-bold text-danger">500</h1>
        <h2 className="mb-3">Something Went Wrong</h2>
        <p className="text-muted mb-4">
          We are experiencing a temporary issue. Please try again in a few moments.
        </p>
        <Link href="/" className="btn btn-danger px-4">
          Go Home
        </Link>
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
