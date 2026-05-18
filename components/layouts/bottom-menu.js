import React from 'react'
import Link from 'next/link';

export default function BottomMenu({ menuItems }) {
    return (
        <>
            <section className='d-flex justify-content-center pt-2 pb-4'>
                <div className='mb-5'>
                    <div className="d-flex flex-wrap justify-content-center align-items-center gap-1">
                        {menuItems?.map((nav, index) => (
                            <React.Fragment key={index}>
                                <Link
                                    href={nav.url}
                                    className="px-2 py-2 text-dark bottom-menu text-decoration-none position-relative"
                                    style={{
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        transition: 'all 0.3s ease',
                                        letterSpacing: '0.3px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = '#dc3545';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = '#212529';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    {nav.title}
                                </Link>
                                {index !== menuItems.length - 1 && (
                                    <span
                                        className="text-danger"
                                        style={{
                                            fontSize: '18px',
                                            fontWeight: '300',
                                            opacity: '0.5'
                                        }}
                                    >
                                        •
                                    </span>
                                )}
                            </React.Fragment>
                        ))
                        }
                    </div>
                </div>
            </section>
        </>
    )
}
