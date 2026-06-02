import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import http from '../../components/utils/http';
import laravelURL from '../../components/utils/laravel-url';
import mainURL from '../../components/utils/main-url';
import { getLayoutData } from "../../components/utils/getLayoutData";

export default function LocationPage({ locations }) {
    return (
        <>
            <Head>
                <title>Emergency Room Locations</title>
                <meta name="description" content="SignatureCare Emergency Center 24-Hour Emergency Rooms in Texas - Houston, Austin, Odessa, Midland, Texarkana, College Station, Sugar Land, Stafford, etc" />
                <link rel="canonical" href={mainURL + "/locations"} />
                <meta property="og:title" content="Locations Archive" />
                <meta property="og:url" content={mainURL + "/locations"} />

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Emergency Room Locations" />
                <meta name="twitter:description" content="SignatureCare Emergency Center 24-Hour Emergency Rooms in Texas - Houston, Austin, Odessa, Midland, Texarkana, College Station, Sugar Land, Stafford, etc" />
            </Head>

            <div className='bg-dark text-white mb-5'>
                <div className='container text-center'>
                    <h1 className='py-2'>Locations</h1>
                </div>
            </div>

            <section className="container">
                {locations?.map((location, index) => (
                    <div key={index} className='mb-5'>
                        <div className='row'>
                            <div className='col-md-3'>
                                {/* ✅ Fixed: Aspect ratio container to prevent CLS */}
                                <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3' }} className="mb-4 img-skeleton">
                                    <Image
                                        src={laravelURL + "/storage/" + location.media?.path}
                                        alt={location.media?.alt_text || location.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 25vw"
                                        style={{ objectFit: 'cover' }}
                                        {...(index === 0
                                            ? { priority: true, fetchpriority: "high" }
                                            : { loading: "lazy" }
                                        )}
                                    />
                                </div>
                            </div>
                            <div className='col-md-9'>
                                <Link href={'/locations/' + location.slug}>
                                    <h2 className='text-danger mb-3'>
                                        <b>{location.title}</b>
                                    </h2>
                                </Link>
                                <div className='ck-content'>
                                    <div dangerouslySetInnerHTML={{ __html: location.description.replace(/<[^>]+>/g, '').slice(0, 169) }} />
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className='py-1 mt-3 border-top border-bottom'>
                                <small>
                                    By <span className='text-danger'>SignatureCare ER </span>
                                </small>
                            </div>
                        </div>
                    </div>
                ))}
            </section>
        </>
    )
}

export const getServerSideProps = async (context) => {
  context.res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  try {
    const [locationsRes, layoutData] = await Promise.all([
      http.get('/admin/sub-locations'),
      getLayoutData(),
    ]);

    return {
      props: {
        locations: locationsRes.data || [],
        layoutData,
      },
    };
  } catch (err) {
    console.error('Error fetching locations:', err.message);
    return { notFound: true };
  }
};