import Image from 'next/image';
import Link from 'next/link';
import React, { createContext } from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import http from '../utils/http';
import { signOut, useSession } from 'next-auth/react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import Head from 'next/head';
import { useLayout } from '../../contexts/LayoutContext'; // ← ADD THIS

export const PortalContext = createContext(null);

export default function PortalLayout({ children }) {
    const [showPortal, setShowPortal] = useState(false);
    const [flash, setFlash] = useState('');
    const [portals, setPortals] = useState([]);
    const { data: session, status } = useSession();
    
    // ← GET MAIN LAYOUT DATA (for navigation/footer)
    const layoutData = useLayout();

    useEffect(() => {
        if (session?.user?.doctor_token && session?.user?.doctor_token !== 'pending') {
            http.get('/admin/physicians-portal', {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + session?.user?.doctor_token
                }
            }).then(res => {
                setPortals(res.data)
                setShowPortal(true);
            })
        } else if (session?.user?.doctor_token === 'pending') {
            setFlash(session?.user?.name + ', Account pending admin approval.')
        }
    }, [session, status]);

    return (
        <>
            <Head>
                <title>SignatureCare Emergency Center Physicians Portal</title>
                <meta name="description" content="Physicians training portal for SignatureCare Emergency Center, your neighborhood 24-hour emergency center located throughout Texas"></meta>
            </Head>

            {showPortal ?
                <div className='container'>
                    {status === "authenticated" &&
                        <DropdownButton id="dropdown-basic-button" variant='light' className='d-flex justify-content-end' title={session?.user?.name}>
                            <Dropdown.Item href="/doctors/profile">
                                <span type="button" className='float-right'>My Profile</span>
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item as="button" onClick={() => signOut()}>
                                Sign out
                            </Dropdown.Item>
                        </DropdownButton>
                    }
                    <h2 className='text-center text-underline mt-3'><u>SignatureCare Emergency Center Physicians Portal</u></h2>
                    <section>
                        <br />
                        {portals &&
                            <div className="d-flex flex-wrap justify-content-center">
                                <div>
                                    <Link href='/doctors' className={typeof window !== 'undefined' && window.location.pathname.split("/").pop() === 'doctors' ? 'link-dark' : 'text-danger'}>
                                        <b>Portal Home</b>
                                    </Link>
                                    <div className="vr mx-2"></div>
                                </div>
                                {portals.map((portal, index) => (
                                    <div key={index}>
                                        {index !== 0 ? <div className="vr mx-2"></div> : ''}
                                        <Link href={'/doctors/' + portal.slug} className={typeof window !== 'undefined' && window.location.pathname.split("/").pop() === portal.slug ? 'link-dark' : 'text-danger'}>
                                            <b>{portal.title.split(" ").slice(0, 3).join(" ")}</b>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        }
                        <br />
                        <center>
                            <span style={{ backgroundColor: 'yellow' }}>
                                <i>Log into <Link href='https://vpn.signature.care/' className='text-danger' target='_blank' rel='noopener noreferrer'>Internal VPN Portal</Link> to review EHR System.</i>
                            </span>
                        </center>
                        <hr className='curve' />
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }} className="img-skeleton">
                            <Image fill sizes="100vw" style={{ objectFit: 'cover' }} src='/assets/physicians-portal-top-banner.jpg?v=2' alt='physicians-portal-top-banner' />
                        </div>
                    </section>

                    <br />

                    {/* Outlet */}
                    <PortalContext.Provider value={portals}>
                        {children}
                    </PortalContext.Provider>
                </div>
                :
                <div className="d-flex justify-content-center align-items-center vh-100">
                    <div className='shadow-lg p-5 mb-5 fw-bold rounded text-center'>
                        {flash &&
                            <div className='text-danger font-italic'>
                                {flash}
                                <br />
                            </div>
                        }
                        <div>
                            You need to be logged in to view this content. Please <Link href='/membership-login' className='text-danger'>Log In.</Link>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}