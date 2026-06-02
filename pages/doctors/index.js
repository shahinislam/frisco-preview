import { useContext } from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import Link from 'next/link';
import laravelURL from '../../components/utils/laravel-url';
import Image from 'next/image';
import PortalLayout, { PortalContext } from '../../components/doctors/portal-layout';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { getLayoutData } from '../../components/utils/getLayoutData'; // ← ADD THIS

export default function PortalHome() {
    const router = useRouter();
    const portals = useContext(PortalContext);
    const [prior, setPrior] = useState([]);
    const { data: session } = useSession();

    useEffect(() => {
        const token = session?.user?.doctor_token;
        if (!token || token === 'pending') {
            router.push('/membership-login')
        }

        const index = portals.findIndex(item => item.slug === 'pre-orientation-portal');
        setPrior(portals[index]);
    }, [router, portals, session]);

    return (
        <>
            <Head>
                <title>Welcome to SignatureCare Emergency Center Physicians Portal.</title>
            </Head>
            <section>
                <center>
                    <h3>Welcome to SignatureCare Emergency Center&apos;s Physicians&apos; Portal.</h3>
                    <br />
                    <p><em>IMPORTANT: You must sign-in to view the content of these pages. If you are having difficulty viewing this page after signing in, please contact us at <Link className='text-danger' href="mailto:webmaster@ercare24.com">webmaster@ercare24.com</Link>.</em></p>
                </center>
            </section>
            <section className='border border-danger border-5 p-4'>
                {prior &&
                    <center>
                        <div>
                            <span style={{ backgroundColor: 'yellow' }}><b>{prior.title} – Watch Prior to Attending Your Orientation</b></span>
                        </div>
                        <br />
                        <Link className='text-danger' href={'/doctors/' + prior.slug}>
                            <div style={{ position: 'relative', width: '100%', aspectRatio: '3/2', maxWidth: '600px', margin: '0 auto' }} className="img-skeleton">
                                <Image
                                    src={laravelURL + "/storage/" + prior.media?.path}
                                    alt={prior.media?.alt_text || prior.title}
                                    fill
                                    sizes='(max-width: 768px) 100vw, 600px'
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                            <br />
                            <b>Click to watch videos</b>
                        </Link>
                    </center>
                }
            </section>
            <br />
            <br />
            <section>
                <div className='row'>
                    {portals &&
                        portals.map((portal, index) => (
                            portal.id !== prior.id &&
                            <div className='col-md-6 col-sm-12 mb-4' key={index}>
                                <center>
                                    <div>
                                        <span><b>{portal.title}</b></span>
                                    </div>
                                    <br />
                                    <Link className='text-danger' href={'/doctors/' + portal.slug}>
                                        <div style={{ position: 'relative', width: '100%', aspectRatio: '3/2' }} className="img-skeleton">
                                            <Image
                                                src={laravelURL + "/storage/" + portal.media?.path}
                                                alt={portal.media?.alt_text || portal.title}
                                                fill
                                                sizes='(max-width: 768px) 100vw, 50vw'
                                                style={{ objectFit: 'cover' }}
                                                loading="lazy"
                                            />
                                        </div>
                                        <br />
                                        <b>Click to watch videos</b>
                                    </Link>
                                </center>
                                <br />
                                <div className='border border-bottom border-danger border-2'></div>
                            </div>
                        ))
                    }
                </div>
            </section>
            <br />
            <br />
            <br />
        </>
    )
}

// ← ADD getServerSideProps (requires auth)
export async function getServerSideProps(context) {
    const layoutData = await getLayoutData();
    
    return {
        props: {
            layoutData,
        },
    };
}

// Remove SessionProvider from getLayout
PortalHome.getLayout = function getLayout(page) {
    return <PortalLayout>{page}</PortalLayout>  // ✅ No SessionProvider here
}