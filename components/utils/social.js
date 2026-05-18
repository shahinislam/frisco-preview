import Link from 'next/link'
import React from 'react'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

export default function Social() {
    return (
        <>
            <section>
                <div className='text-center'>
                    <Link href='https://www.facebook.com/SignatureCareMontrose/'>
                        <span className='py-2 px-2 mx-1 rounded text-white' style={{ backgroundColor: '#3B5998' }}>
                            <FaFacebookF className='fa fa-2x' />
                        </span>
                    </Link>
                    <Link href='https://twitter.com/signaturecaretx'>
                        <span className='py-2 px-2 mx-1 rounded text-white' style={{ backgroundColor: '#000000ff' }}>
                            <FaXTwitter className='fa fa-2x' />
                        </span>
                    </Link>
                    <Link href='https://www.youtube.com/channel/UCx4SjwyHoHNFY-BwP8f6EzQ/videos'>
                        <span className='py-2 px-2 mx-1 rounded text-white' style={{ backgroundColor: '#CD201F' }}>
                            <FaYoutube className='fa fa-2x' />
                        </span>
                    </Link>
                    <Link href='http://www.instagram.com/signaturecareemergencyhouston'>
                        <span className='py-2 px-2 mx-1 rounded text-white' style={{ backgroundColor: '#3F729B' }}>
                            <FaInstagram className='fa fa-2x' />
                        </span>
                    </Link>
                    <Link href='https://www.linkedin.com/company/signaturecareemergencycenter'>
                        <span className='py-2 px-2 mx-1 rounded text-white' style={{ backgroundColor: '#0077B5' }}>
                            <FaLinkedinIn className='fa fa-2x' />
                        </span>
                    </Link>
                </div>
            </section>
        </>
    )
}
