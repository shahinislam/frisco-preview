import Head from 'next/head';
import laravelURL from '../utils/laravel-url';
import Link from 'next/link';
import Image from 'next/image';
import SkipTheWait from '../utils/skip-the-wait';
import mainURL from '../utils/main-url';
import { trackGetDirections } from '../utils/gtm';
import parse from 'html-react-parser';
import { addLazyLoadWithSkeleton } from '../utils/lazy-images';
import dynamic from 'next/dynamic';

// ✅ Dynamic imports
const LocationMap = dynamic(() => import('../templates/LocationMap'), {
  ssr: false,
  loading: () => (
    <div
      className="bg-light d-flex align-items-center justify-content-center"
      style={{ height: "400px", borderRadius: "8px" }}
    >
      <div className="spinner-border text-danger" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  ),
});

// ✅ Dynamic import for SocialIcon (only loads when needed)
const SocialIcon = dynamic(
  () => import('react-social-icons').then(mod => mod.SocialIcon),
  { ssr: false, loading: () => <span style={{ width: 40, height: 40, display: 'inline-block' }} /> }
);

const cleanHTML = (htmlString) => {
    if (!htmlString) return '';
    
    return htmlString
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<p[^>]*>\s*(&nbsp;|\s)*\s*<\/p>/gi, '')
        .replace(/^(<br\s*\/?>)+|(<br\s*\/?>)+$/gi, '')
        .trim();
};

export default function Location({ location, locationContent }) {
    // ✅ Parse description with SkipTheWait replacement (no ReactDOMServer needed)
    const parseOptions = {
      replace: (domNode) => {
        if (
          domNode.attribs &&
          (domNode.attribs.class === "skip-the-wait" ||
            domNode.attribs.id === "skip-the-wait")
        ) {
          return <SkipTheWait url={location.acuity_url} />;
        }
        if (domNode.type === "text" && domNode.data === "skip-the-wait") {
          return <SkipTheWait url={location.acuity_url} />;
        }
      },
    };

    return (
        <>
            <div>
                <Head>
                    <title>{location.seo_title}</title>
                    <meta name="description" content={location.meta_description} />
                    <link rel='canonical' href={mainURL + '/' + location.slug} />

                    <meta property="og:title" content={location.seo_title} />
                    <meta property="og:description" content={location.meta_description} />
                    <meta property="og:url" content={mainURL + '/' + location.slug} />
                    <meta property="og:image" content={laravelURL + '/storage/' + location.media?.path} />

                    {location.updated_at && <meta property="article:modified_time" content={location.updated_at} />}

                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:title" content={location.seo_title} />
                    <meta name="twitter:description" content={location.meta_description} />
                    <meta name="twitter:image" content={laravelURL + '/storage/' + location.media?.path} />

                    {location?.head && parse(location?.head)}
                </Head>

                <div className='bg-dark text-white'>
                    <div className='text-center'>
                        <h1 className='py-2'>{location.title}</h1>
                    </div>
                </div>

                <div className="py-3 text-center">
                    <h2>{location.subtitle}</h2>
                </div>

                <div className="bg-white text-center shadow border-bottom p-inline-5">
                    {/* ✅ Dynamic SocialIcon components */}
                    {location.facebook && <SocialIcon url={location.facebook} network="facebook" style={{ height: 40, width: 40, margin: '0px 1px' }} title='Facebook' />}
                    {location.twitter && <SocialIcon url={location.twitter} network="x" style={{ height: 40, width: 40, margin: '0px 1px' }} title='X' />}
                    {location.youtube && <SocialIcon url={location.youtube} network="youtube" style={{ height: 40, width: 40, margin: '0px 1px' }} title='Youtube' />}
                    {location.instagram && <SocialIcon url={location.instagram} network="instagram" style={{ height: 40, width: 40, margin: '0px 1px' }} title='Instagram' />}
                    {location.linkedin && <SocialIcon url={location.linkedin} network="linkedin" style={{ height: 40, width: 40, margin: '0px 1px' }} title='Linkedin' />}
                    {location.tiktok && <SocialIcon url={location.tiktok} network="tiktok" style={{ height: 40, width: 40, margin: '0px 1px' }} title='TikTok' />}
                </div>

                <br />

                <div className='container'>
                    <div className='row'>
                        <div className='col-md-6'>
                            <section>
                                <div className='ck-content'>
                                    <div dangerouslySetInnerHTML={{ __html: location.subheading }} />
                                </div>
                            </section>

                            <SkipTheWait url={location.acuity_url} />
                            
                            <br />

                            <address>
                                <Link href={location.google || ''} target={"_blank"} className="btn btn-danger" onClick={() => trackGetDirections(location.name)}>Get Direction</Link> <b>Address:</b> {location.address}
                                <p>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={laravelURL + "/storage/" + location.tel_media?.path}
                                        alt={location.tel_media?.alt_text || 'Phone Icon'}
                                        style={{
                                            height: '1em',
                                            width: 'auto',
                                            verticalAlign: 'middle',
                                            display: 'inline'
                                        }}
                                    />
                                    &nbsp;/&nbsp;
                                    <b style={{ verticalAlign: 'middle' }}>
                                        Tel:&nbsp;
                                        <Link href={"tel:" + location.tel} style={{ color: 'hsl(0,100%,50%)' }}>
                                            {location.tel}
                                        </Link>
                                    </b>
                                </p>
                            </address>

                            {location.image_show && location.media && (
                                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', maxHeight: '600px' }} className="mb-4 img-skeleton">
                                    <Image
                                        src={laravelURL + "/storage/" + location.media?.path}
                                        alt={location.media?.alt_text || location.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                                        style={{ objectFit: 'cover' }}
                                        quality={75}
                                        priority
                                        fetchpriority="high"
                                    />
                                </div>
                            )}

                            <div className='w-100 d-block' style={{ maxWidth: '100%' }}>
                                <div className='ck-content'>
                                    {/* ✅ Use parse with replace instead of ReactDOMServer */}
                                    {location.description && parse(addLazyLoadWithSkeleton(location.description), parseOptions)}
                                </div>
                            </div>
                        </div>

                        <div className='col-md-6'>
                            {location.accreditation && 
                                cleanHTML(location.accreditation) && (
                                    <div className='ck-content'>
                                        <div dangerouslySetInnerHTML={{ __html: cleanHTML(location.accreditation) }} />
                                    </div>
                                )}

                            {/* ✅ Dynamic LocationMap component */}
                            <LocationMap location={location} />

                            <br />
                            <section>
                                {location.destination && location.destination.length > 20 && (
                                    <div className='ck-content'>
                                        <div dangerouslySetInnerHTML={{ __html: location.destination }} />
                                    </div>
                                )}

                                <div className='row'>
                                    <div className='col-md-12 mb-3'>
                                        <p className="fw-bold">Inside {location.subtitle}</p>
                                        {location.slider_images?.map((item, key) =>
                                            <div key={key} className="mb-3">
                                                <div style={{ position: 'relative', width: '100%', aspectRatio: '500/380' }} className="img-skeleton">
                                                    <Image
                                                        src={laravelURL + "/storage/" + item.media?.path}
                                                        alt={item.media?.alt_text || location.title}
                                                        fill
                                                        sizes="(max-width: 768px) 100vw, 500px"
                                                        style={{ objectFit: 'cover' }}
                                                        quality={75}
                                                        loading="lazy"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className='col-md-12 mb-3'>
                                        {location.vid && location.vid_media?.path && (
                                            <video 
                                                width="500" 
                                                height="350" 
                                                className="d-block w-100 h-100" 
                                                controls 
                                                preload="metadata"
                                                playsInline
                                            >
                                                <source src={laravelURL + "/storage/" + location.vid_media.path} type="video/mp4" />
                                                Your browser does not support HTML video.
                                            </video>
                                        )}
                                    </div>
                                </div>
                            </section>
                            <br />
                        </div>
                    </div>
                    <br />
                </div>
            </div>

            {location?.bottom && parse(location?.bottom)}
        </>
    )
}