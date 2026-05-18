import Head from 'next/head';
import Image from 'next/image';
import laravelURL from '../utils/laravel-url';
import SkipTheWait from '../utils/skip-the-wait';
import mainURL from '../utils/main-url';
import LocationList from '../templates/location-list';
import SymptomList from '../templates/symptom-list';
import LocationPreview from '../templates/location-preview';
import parse from 'html-react-parser';
import { addLazyLoadWithSkeleton } from '../utils/lazy-images';

export default function Page({ page, canonicalPath, faqSchema, locations, locationSidebar, symptomSidebar }) {
    // ✅ Parse description with SkipTheWait replacement (no ReactDOMServer needed)
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
                <link rel='canonical' href={mainURL + '/' + (canonicalPath || page.slug)} />

                <meta property="og:title" content={page.title} />
                <meta property="og:description" content={page.meta_description} />
                <meta property="og:url" content={mainURL + '/' + (canonicalPath || page.slug)} />
                <meta property="og:image" content={laravelURL + '/storage/' + page.media?.path} />

                {page.updated_at && <meta property="article:modified_time" content={page.updated_at} />}

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={page.title} />
                <meta name="twitter:description" content={page.meta_description} />
                <meta name="twitter:image" content={laravelURL + '/storage/' + page.media?.path} />

                {page?.head && parse(page?.head)}
                {faqSchema && (
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                    />
                )}
            </Head>

            <div className='bg-dark text-white'>
                <div className='container text-center'>
                    <h1 className='py-2'>{page.title}</h1>
                </div>
            </div>
            <br />
            <div className='container'>
                <div className='row'>
                    <div className={`${page.right_nav ? 'col-md-9' : 'col-md-12'}`}>
                        {page.image_show ? page.media && (
                            <div style={{ position: 'relative', width: '100%',
                                aspectRatio: '16/9', maxHeight: '600px' }} className="mb-4 img-skeleton">    
                                    <Image
                                    src={laravelURL + "/storage/" + page.media?.path}
                                    alt={page.media?.alt_text || page.title}
                                    fill  // ✅ Use fill instead of width/height
                                    sizes="(max-width: 768px) 100vw, 100vw"
                                    style={{ objectFit: 'cover' }}  // ✅ Keep objectFit
                                    quality={75}
                                    priority
                                    fetchpriority="high"
                                    />
                                </div>
                        ) : ''}
                        
                        <section>
                            <div className='ck-content'>
                                {/* ✅ Use parse with replace instead of ReactDOMServer */}
                                {page.description && parse(addLazyLoadWithSkeleton(page.description), parseOptions)}
                            </div>
                        </section>

                        <section>
                            {page.bottom_nav === 'location' && (
                                <div>
                                    <hr className='curve my-4' />
                                    <LocationPreview locations={locations} />
                                </div>
                            )}
                        </section>
                    </div>
                    <div className={`${page.right_nav ? 'col-md-3' : ''}`}>
                        {page.right_nav === 'location' && (
                            <LocationList locationSidebar={locationSidebar} />
                        )}
                        {page.right_nav === 'symptom' && (
                            <SymptomList symptomSidebar={symptomSidebar} />
                        )}
                    </div>
                </div>
            </div>
            <br />
            <br />

            {page?.bottom && parse(page?.bottom)}
        </>
    )
}