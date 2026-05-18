import ContactForm from '../components/templates/contact-form';
import Link from 'next/link';
import Head from 'next/head';
import mainURL from '../components/utils/main-url';
import http from '../components/utils/http';
import Social from '../components/utils/social';
import LocationPreview from '../components/templates/location-preview';
import SkipTheWait from '../components/utils/skip-the-wait';
import ReactDOMServer from 'react-dom/server';
import laravelURL from '../components/utils/laravel-url';
import parse from 'html-react-parser';
import { getLayoutData } from "../components/utils/getLayoutData";
import { Alert } from 'react-bootstrap';
import { FaEnvelope, FaMapMarkerAlt, FaExclamationTriangle } from 'react-icons/fa';

export default function ContactUs({ page, locations }) {
    const element = <SkipTheWait />;

    return (
        <>
            <Head>
                <title>{page.seo_title}</title>
                <meta name="description" content={page.meta_description} />
                <link rel="canonical" href={mainURL + "/contact-us/"} />
                <meta property="og:title" content="Contact Us" />
                <meta property="og:url" content={mainURL + "/contact-us/"} />
                <meta property="article:modified_time" content="2022-10-21T19:19:48+00:00" />
                <meta property="og:image" content={laravelURL + '/storage/' + page.media?.path} />

                {page?.head &&
                    parse(page?.head)
                }
            </Head>
            <section>
                <div className='text-center bg-dark text-white'>
                    <h1 className='py-2'>{page.title}</h1>
                </div>
            </section>

            <div className='container my-4'>
                <section className='mb-4'>
                    <div className='text-center'>
                        <h2>Visit SignatureCare <span className='text-danger'>Emergency Center</span> – Open 24 Hours!</h2>
                    </div>
                </section>

                {/* Social media link */}
                <Social />

                <div className='d-flex justify-content-center my-4'>
                    <hr className='curve w-50' />
                </div>

                {/* Editable text comming from backend */}
                <section className='mb-4'>
                    <div className='ck-content'>
                        <div dangerouslySetInnerHTML={{ __html: page.description.replace("skip-the-wait", ReactDOMServer.renderToStaticMarkup(element)) }} />
                    </div>
                </section>

                <section className='mb-4'>
                    <div>
                        <h2 className='mb-3'>
                            <FaEnvelope className='text-danger me-2' size={28} />
                            <b>Contact Form</b>
                        </h2>
                        <ContactForm />
                    </div>
                </section>

                <section className='my-4'>
                    <Alert variant='warning' className='border-0 shadow-sm'>
                        <div className='d-flex align-items-start'>
                            <FaExclamationTriangle className='text-warning me-3 mt-1 flex-shrink-0' size={20} />
                            <small className='lh-sm'>
                                <i><strong>Important:</strong> This contact form is not to be used in case of an emergency. This contact form is sent to the corporate office for NON EMERGENCY related inquiries about SignatureCare Emergency Centers. If you have a medical emergency, please do not fill out this form and contact one of our emergency centers right away or call 911. No information on this website should be considered medical advice. In order to be treated and given a diagnosis, you must be seen by a doctor. This website is to be used for informational purpose only, and information to contact one of our emergency centers when you need directions to the nearest ER or need to call the nearest emergency center. If you are looking for information on careers with SignatureCare Emergency Center, please visit the <Link href='/join-our-team/' className='text-danger fw-bold'>Careers page</Link> and use the contact form, and our <Link href='/join-our-team/online-application/' className='text-danger fw-bold'>Online application</Link>.</i>
                            </small>
                        </div>
                    </Alert>
                </section>

                <section className='my-4'>
                    <div className='text-center mb-4'>
                        <h2>
                            <FaMapMarkerAlt className='text-danger me-2' size={28} />
                            You can also reach the closest Emergency Room.
                        </h2>
                    </div>

                    <LocationPreview locations={locations} />
                </section>
            </div>

            {page?.bottom &&
                parse(page?.bottom)
            }
        </>
    )
}

export const getStaticProps = async () => {
  try {
    const [locationsRes, pageRes, layoutData] = await Promise.all([
      http.get('/admin/locations'),
      http.get('/admin/pages/contact-us-text'),
      getLayoutData(),
    ]);

    return {
      props: {
        locations: locationsRes.data || [],
        page: pageRes.data || {},
        layoutData,
      },
      revalidate: 10,
    };
  } catch (err) {
    console.error('Error fetching static props:', err.message);
    return { notFound: true };
  }
};
