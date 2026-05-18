import http from '../components/utils/http';
import LocationList from '../components/templates/location-list';
import SkipTheWait from '../components/utils/skip-the-wait';
import { useRouter } from 'next/router';
import Head from 'next/head';
import mainURL from '../components/utils/main-url';
import LocationPreview from '../components/templates/location-preview';
import laravelURL from '../components/utils/laravel-url';
import parse from 'html-react-parser';
import { addLazyLoadWithSkeleton } from '../components/utils/lazy-images';
import { getLayoutData } from "../components/utils/getLayoutData";
import dynamic from 'next/dynamic';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { FaLocationArrow } from 'react-icons/fa';

// ✅ Dynamic import for Map
const Map = dynamic(() => import('../components/templates/MapSearch'), {
  ssr: false,
  loading: () => (
    <section>
      <Form.Label>Enter your postal code, city and / or state</Form.Label>
      <InputGroup className="mb-3" size="lg">
        <Form.Control
          type="text"
          className="shadow-none"
          placeholder="Loading map..."
          disabled
        />
        <Button id="button-addon2" disabled>
          <FaLocationArrow />
        </Button>
      </InputGroup>

      <div
        className="position-relative bg-light d-flex align-items-center justify-content-center"
        style={{
          height: "450px",
          borderRadius: "8px",
          border: "2px dashed #dee2e6"
        }}
      >
        <div className="text-center">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="#dc3545"
            style={{ marginBottom: "12px" }}
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <div className="fw-bold text-dark">Find Your Closest Emergency Room</div>
        </div>
      </div>
    </section>
  ),
});

export default function ClosestEmergencyRoom({ page, locations, locationSidebar }) {
    const router = useRouter();

    if (router.isFallback) {
        return <h1>Loading...</h1>
    }

    // ✅ Parse description with SkipTheWait replacement (no ReactDOMServer needed)
    const parseOptions = {
      replace: (domNode) => {
        // Replace skip-the-wait placeholder with actual component
        if (
          domNode.attribs &&
          (domNode.attribs.class === "skip-the-wait" ||
            domNode.attribs.id === "skip-the-wait")
        ) {
          return <SkipTheWait />;
        }
        // Check for text content containing skip-the-wait
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
                <link rel="canonical" href={mainURL + "/closest-emergency-room"} />
                <meta property="og:title" content={page.seo_title} />
                <meta property="og:url" content={mainURL + "/closest-emergency-room"} />
                <meta property="article:modified_time" content="2022-10-21T19:00:08+00:00" />
                <meta property="og:image" content={laravelURL + '/storage/' + page.media?.path} />

                {page?.head && parse(page?.head)}
            </Head>

            <div className='bg-dark text-white'>
                <div className='container text-center'>
                    <h1 className='py-2'>Closest Emergency Room</h1>
                </div>
            </div>
            <br />
            <div className='container'>
                <div className='row'>
                    <div className='col-md-9'>

                        <Map />

                        <br />
                        <section>
                            <div className='ck-content'>
                                {/* ✅ Use parse with replace instead of ReactDOMServer */}
                                {page.description && parse(addLazyLoadWithSkeleton(page.description), parseOptions)}
                            </div>
                        </section>
                        <br />
                        <section>
                            <LocationPreview locations={locations} />
                        </section>
                    </div>
                    <div className='col-md-3'>
                        <LocationList locationSidebar={locationSidebar} />
                    </div>
                </div>
            </div>
            <br />
            <br />
            <br />
            <br />

            {page?.bottom && parse(page?.bottom)}
        </>
    )
}

export const getStaticProps = async () => {
  try {
    const [locationsRes, pageRes, sidebarRes, layoutData] = await Promise.all([
      http.get('/admin/locations'),
      http.get('/admin/pages/closest-emergency-room-text'),
      http.get('/admin/navigations/location-sidebar'),
      getLayoutData(),
    ]);

    return {
      props: {
        locations: locationsRes.data || [],
        page: pageRes.data || {},
        locationSidebar: JSON.parse(sidebarRes.data?.menus || '[]'),
        layoutData,
      },
      revalidate: 10,
    };
  } catch (err) {
    console.error('Error fetching static props:', err.message);
    return { notFound: true };
  }
};