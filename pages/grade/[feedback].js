import React, { useState } from 'react'

import Image from 'next/image';
import { AiTwotoneDislike, AiTwotoneLike } from 'react-icons/ai';
import LikeModal from '../../components/grade/like-modal';
import UnlikeModal from '../../components/grade/unlike-modal';
import Head from 'next/head';
import http from '../../components/utils/http';
import mainURL from '../../components/utils/main-url';
import { getLayoutData } from "../../components/utils/getLayoutData";
import laravelURL from '../../components/utils/laravel-url';

export default function Feedback({ location }) {
    const [like, setLike] = useState('btn-outline-success');
    const [unlike, setUnlike] = useState('btn-outline-danger');
    const [likeModalShow, setLikeModalShow] = useState(false);
    const [unlikeModalShow, setUnlikeModalShow] = useState(false);


    // Generate structured data for Local Business Review
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": `SignatureCare Emergency Center - ${location.name}`,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": location.street,
            "addressLocality": location.city,
            "addressRegion": "TX",
            "postalCode": location.zip,
            "addressCountry": "US"
        },
        "url": `${mainURL}/grade/${location.slug}`,
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "5",
            "reviewCount": "100"
        }
    };

    return (
        <>
            <Head>
                <title>Review SignatureCare ER {location.name} - Rate Your Experience</title>
                <meta name="description" content={`Share your experience at SignatureCare Emergency Center in ${location.name}. Your review helps us improve our 24-hour emergency care services.`} />
                <meta name="keywords" content={`${location.name} emergency room review, 24-hour ER ${location.name}, emergency center rating, ${location.city} urgent care`} />
                <link rel='canonical' href={mainURL + '/grade/' + location.slug} />
                
                {/* Open Graph */}
                <meta property="og:title" content={`Review SignatureCare ER ${location.name}`} />
                <meta property="og:description" content={`Share your experience at SignatureCare Emergency Center in ${location.name}`} />
                <meta property="og:url" content={mainURL + '/grade/' + location.slug} />

                {/* Structured Data */}
                <script 
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
            </Head>

            <LikeModal 
                location={location.slug} 
                likeModalShow={likeModalShow} 
                close={() => setLikeModalShow(false)} 
                google={location.google} 
                facebook={location.facebook} 
            />
            <UnlikeModal 
                location={location.slug} 
                unlikeModalShow={unlikeModalShow} 
                close={() => setUnlikeModalShow(false)} 
            />

            {/* Header */}
            <div className='bg-dark text-white mb-5'>
                <div className='container text-center'>
                    <h1 className='py-2 h3'>Rate Your Experience</h1>
                </div>
            </div>

            <section className='container mb-5'>
                <div className='row justify-content-center'>
                    <div className='col-12 col-lg-10 col-xl-8'>
                        {/* Hero Section with Gradient Overlay */}
                        <div className='position-relative mb-4 rounded-4 overflow-hidden shadow-lg' style={{ height: '250px' }}>
                            <Image
                                src={location.media?.path ? laravelURL + `/storage/${location.media.path}` : '/assets/verticle-social-media.png'}
                                alt={`SignatureCare Emergency Center - ${location.name}`}
                                fill
                                priority
                                className='object-fit-cover'
                            />
                            <div 
                                className='position-absolute w-100 h-100'
                                style={{
                                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))',
                                }}
                            />
                            <div className='position-absolute bottom-0 start-0 p-4 text-white'>
                                <h2 className='h4 mb-1 fw-bold'>SignatureCare ER - {location.name}</h2>
                                <p className='mb-0 small opacity-75'>
                                    {location.street}, {location.city}, TX {location.zip}
                                </p>
                            </div>
                        </div>

                        {/* Main Question */}
                        <div className='text-center mb-4'>
                            <h2 className='mb-2'>How was your experience?</h2>
                            <p className='text-muted'>Your feedback matters to us and helps other patients</p>
                        </div>

                        {/* Feedback Buttons - Large & Attractive */}
                        <div className='row g-3 mb-4'>
                            {/* Positive Review */}
                            <div className='col-6'>
                                <button 
                                    className={`btn ${like} w-100 position-relative overflow-hidden`}
                                    style={{
                                        height: '220px',
                                        borderRadius: '16px',
                                        transition: 'all 0.3s ease',
                                        borderWidth: '3px',
                                        fontSize: '18px'
                                    }}
                                    onMouseEnter={() => setLike('btn-success')}
                                    onMouseLeave={() => setLike('btn-outline-success')}
                                    onClick={() => setLikeModalShow(true)}
                                >
                                    <div className='d-flex flex-column align-items-center justify-content-center h-100'>
                                        <div className='mb-3' style={{ 
                                            width: '90px', 
                                            height: '90px', 
                                            borderRadius: '50%',
                                            background: like === 'btn-success' ? 'rgba(255,255,255,0.2)' : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            <AiTwotoneLike size={50} />
                                        </div>
                                        <span className='fw-bold'>Great</span>
                                        <span className='fw-bold'>Experience</span>
                                    </div>
                                </button>
                            </div>

                            {/* Negative Review */}
                            <div className='col-6'>
                                <button 
                                    className={`btn ${unlike} w-100 position-relative overflow-hidden`}
                                    style={{
                                        height: '220px',
                                        borderRadius: '16px',
                                        transition: 'all 0.3s ease',
                                        borderWidth: '3px',
                                        fontSize: '18px'
                                    }}
                                    onMouseEnter={() => setUnlike('btn-danger')}
                                    onMouseLeave={() => setUnlike('btn-outline-danger')}
                                    onClick={() => setUnlikeModalShow(true)}
                                >
                                    <div className='d-flex flex-column align-items-center justify-content-center h-100'>
                                        <div className='mb-3' style={{ 
                                            width: '90px', 
                                            height: '90px', 
                                            borderRadius: '50%',
                                            background: unlike === 'btn-danger' ? 'rgba(255,255,255,0.2)' : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            <AiTwotoneDislike size={50} />
                                        </div>
                                        <span className='fw-bold'>Needs</span>
                                        <span className='fw-bold'>Improvement</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Trust Badge */}
                        <div className='card bg-light border-0'>
                            <div className='card-body p-3 text-center'>
                                <p className='mb-0 small text-muted'>
                                    🔒 Your review is secure and may be shared publicly to help other patients
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export const getStaticPaths = async () => {
  try {
    const res = await http.get('/admin/locations');
    const data = res.data || [];
    const paths = data
      .filter(location => location.status !== 2)
      .map(location => ({
        params: { feedback: location.slug },
      }));

    return {
      paths,
      fallback: "blocking",
    };
  } catch (err) {
    console.error('Error fetching locations for static paths:', err.message);
    return {
      paths: [],
      fallback: "blocking",
    };
  }
};

export const getStaticProps = async (context) => {
  try {
    const slug = context.params.feedback;
    const res = await http.get('/admin/locations/' + slug);
    const layoutData = await getLayoutData();

    return {
      props: {
        location: res.data || {},
        layoutData
      },
      revalidate: 10,
    };
  } catch (err) {
    console.error('Error fetching location data:', err.message);
    return { notFound: true };
  }
};