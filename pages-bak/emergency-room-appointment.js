import Head from 'next/head'
import mainURL from '../components/utils/main-url'
import LocationPreviewWithImage from '../components/templates/location-preview-with-image'
import http from '../components/utils/http'
import SkipTheWait from '../components/utils/skip-the-wait';
import laravelURL from '../components/utils/laravel-url'
import parse from 'html-react-parser'
import { addLazyLoadWithSkeleton } from '../components/utils/lazy-images'
import { getLayoutData } from "../components/utils/getLayoutData";


export default function GetAppointment({ page, locations }) {
    const element = <SkipTheWait />;
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
                <title>{page.seo_title}</title>
                <meta name="description" content={page.meta_description} />
                <link rel="canonical" href={mainURL + "/emergency-room-appointment/"} />
                <meta property="og:title" content={page.seo_title} />
                <meta property="og:url" content={mainURL + "/emergency-room-appointment/"} />
                <meta property="article:modified_time" content="2022-10-24T17:50:51+00:00" />
                <meta property="og:image" content={laravelURL + '/storage/' + page.media?.path} />

                {page?.head &&
                    parse(page?.head)
                }
            </Head>
            <div className='bg-dark text-white'>
                <div className='container text-center'>
                    <h1 className='py-2'>{page.title}</h1>
                </div>
            </div>
            <br />
            <br />
            <br />
            <div className='container'>
                {/* Editable text comming from backend */}
                <section>
                    <div className='ck-content'>
                        {page.description && parse(addLazyLoadWithSkeleton(page.description), parseOptions)}
                    </div>
                </section>

                <center>
                    <hr className='w-50 curve' />
                </center>

                <LocationPreviewWithImage locations={locations} appointment={true} />

                <br />
                <br />
            </div>

            {page?.bottom &&
                parse(page?.bottom)
            }
        </>
    )
}

export const getServerSideProps = async (context) => {
  context.res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  try {
    const [locationsRes, pageRes, layoutData] = await Promise.all([
      http.get('/admin/locations'),
      http.get('/admin/pages/emergency-room-appointment-text'),
      getLayoutData(),
    ]);

    return {
      props: {
        locations: locationsRes.data || [],
        page: pageRes.data || {},
        layoutData,
      },
    };
  } catch (err) {
    console.error('Error fetching server side props:', err.message);
    return { notFound: true };
  }
};