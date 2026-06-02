import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react'
import http from '../../components/utils/http';
import laravelURL from '../../components/utils/laravel-url';
import mainURL from '../../components/utils/main-url';
import Image from 'next/image';
import parse from 'html-react-parser'
import { getLayoutData } from "../../components/utils/getLayoutData";

const LocationList = dynamic(() => import('../../components/templates/location-list'), {
    loading: () =>
        <div className="text-center">
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>,
});

export default function JobPostShow({ jobPost, locations, locationSidebar }) {
    const router = useRouter();

    if (router.isFallback) {
        return <h1>Loading...</h1>
    }

    return (
        <>
            <div>
                <Head>
                    <title>{jobPost.seo_title}</title>
                    <meta name="description" content={jobPost.meta_description} />
                    <link rel='canonical' href={mainURL + '/join-our-team/' + jobPost.slug} />

                    <meta property="og:title" content={jobPost.title} />
                    <meta property="og:description" content={jobPost.meta_description} />
                    <meta property="og:url" content={mainURL + '/join-our-team/' + jobPost.slug} />
                    <meta property="og:image" content={laravelURL + '/storage/' + jobPost.image} />

                    {jobPost?.head &&
                        parse(jobPost?.head)
                    }
                </Head>

                <div className='bg-dark text-white'>
                    <div className='container text-center'>
                        <h3 className='py-2'>{jobPost.title}</h3>
                    </div>
                </div>
    
                <div className='container'>
                    <div className='row'>
                        <div className='col-md-9'>
                            <br />
                            {jobPost.image_show ?
                                jobPost.media &&
                                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', marginBottom: '1rem' }} className="img-skeleton">
                                    <Image
                                        src={laravelURL + "/storage/" + jobPost.media?.path}
                                        alt={jobPost.media?.alt_text || jobPost.title}
                                        fill
                                        sizes="100vw"
                                        style={{ objectFit: 'contain' }}
                                    />
                                </div>
                                :
                                ''
                            }
                            <br />
                            <section>
                                <div className='ck-content'>
                                    <div dangerouslySetInnerHTML={{ __html: jobPost.description }} />
                                </div>
                            </section>
                            <p>Please use our <Link href='/join-our-team/online-application' className='text-danger'>Online Application</Link> to apply for this position or simply complete the form below. Those we are interested in interviewing will be contacted.</p>
                            <div>
                                <center style={{ fontSize: '12px' }}>
                                    SignatureCare Emergency Center does not discriminate on the basis of race, color, religion, sex, sexual orientation, age, national
                                    origin, marital status, citizenship status, physical or mental disability or veteran status.
                                    The above job description is intended to describe the general content of and requirements of the performance of this job. It
                                    is not to be construed as an exhaustive statement of duties, responsibilities or requirements.
                                    The statements in this job description are intended to describe the essential nature and level of work performed by CMAs
                                    assigned to this job. They are not intended to be an exhaustive list of all responsibilities, duties & skills required of CMAs so
                                    classified.
                                </center>
                            </div>
                            <div className="d-grid gap-2">
                                <Link href='/join-our-team/online-application' className='btn btn-danger mb-5 mt-3'>APPLY NOW</Link>
                            </div>
                        </div>

                        <div className='col-md-3'>
                            <LocationList locationSidebar={locationSidebar} />
                        </div>
                    </div>
                </div>
            </div>

            {jobPost?.bottom &&
                parse(jobPost?.bottom)
            }
        </>
    )
}

export const getStaticPaths = async () => {
  try {
    const res = await http.get('/admin/job-posts');
    const data = res.data || [];
    const paths = data.map(job => ({
      params: { job: job.slug },
    }));

    return {
      paths,
      fallback: true,
    };
  } catch (err) {
    console.error('Error fetching job posts for static paths:', err.message);
    return {
      paths: [],
      fallback: true,
    };
  }
};

export const getStaticProps = async (context) => {
  try {
    const slug = context.params.job;

    const [jobRes, locationsRes, sidebarRes, layoutData] = await Promise.all([
      http.get('/admin/job-posts/' + slug),
      http.get('/admin/locations'),
      http.get('/admin/navigations/location-sidebar'),
      getLayoutData()
    ]);

    return {
      props: {
        jobPost: jobRes.data || {},
        locations: locationsRes.data || [],
        locationSidebar: JSON.parse(sidebarRes.data?.menus || '[]'),
        layoutData
      },
      revalidate: 10,
    };
  } catch (err) {
    console.error('Error fetching job post data:', err.message);
    return { notFound: true };
  }
};
