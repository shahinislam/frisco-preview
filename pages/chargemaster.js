import http from '../components/utils/http';
import { useRouter } from 'next/router';
import Head from 'next/head';
import mainURL from '../components/utils/main-url';
import LocationPreview from '../components/templates/location-preview';
import Social from '../components/utils/social';
import laravelURL from '../components/utils/laravel-url';
import { getLayoutData } from "../components/utils/getLayoutData"; // ← ADD THIS

export default function Chargemaster({ locations, chargemaster }) {
    const router = useRouter();

    if (router.isFallback) {
        return <h1>Loading...</h1>
    }

    return (
        <>
            <Head>
                <title>SignatureCare Emergency Center ER Master Charge List</title>
                <meta name="description" content="SignatureCare Emergency Center emergency room charge master list showing our charges. 24-hour ER and emergency center provides emergency care" />
                <link rel="canonical" href={mainURL + "/chargemaster"} />
                <meta property="og:title" content="SignatureCare Emergency Center ER Master Charge List" />
                <meta property="og:url" content={mainURL + "/chargemaster"} />
            </Head>

            <div className='bg-dark text-white'>
                <div className='container text-center'>
                    <h1 className='py-2'>SignatureCare ER Charge Master List</h1>
                </div>
            </div>
            <br />

            <div className='container'>
                <center>
                    <h2>SignatureCare Emergency Center Charge Master List</h2>
                    <br />
                    <Social />
                </center>
                <br />
                <hr className='curve' />
                <br />
                <LocationPreview locations={locations} chargemaster={laravelURL + '/storage/' + chargemaster} />
            </div>

            <br />
            <br />
        </>
    )
}

export const getStaticProps = async () => {
  try {
    const [locationsRes, chargeRes, layoutData] = await Promise.all([
      http.get('/admin/locations'),
      http.get('/admin/chargemaster'),
      getLayoutData(),
    ]);

    return {
      props: {
        locations: locationsRes.data || [],
        chargemaster: chargeRes.data || [],
        layoutData,
      },
      revalidate: 10,
    };
  } catch (err) {
    console.error('Error fetching static props:', err.message);
    return { notFound: true };
  }
};
