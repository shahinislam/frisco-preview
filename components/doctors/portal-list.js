import React from 'react'
import Link from 'next/link';

export default function PortalList({ allPortals, portalSlug }) {

    return (
        <>
            <ul className="list-unstyled border border-danger border-4 p-2 text-center">
                <li className="px-0"><b>IMPORTANT LINKS</b></li>
                <li className="px-0 my-2">
                    <Link href="/doctors" className='text-danger'>
                        <b>Portal Home</b>
                    </Link>
                </li>
                {allPortals?.map((portal, index) => (
                        <li className="px-0 my-2" key={index}>
                            <Link href={"/doctors/" + portal.slug} className={portal.slug === portalSlug ? 'link-dark' : 'text-danger'}>
                                <b>{portal.title.split(" ").slice(0, 3).join(" ")}</b>
                            </Link>
                        </li>
                    ))
                }
            </ul>
        </>
    )
}
