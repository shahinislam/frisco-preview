import Link from 'next/link';
import React from 'react'

export default function TopNavbar({ menuItems = [], style }) { // ← Add default
    
    // Return empty div if no menu items
    if (!menuItems || menuItems.length === 0) {
        return <div style={{ height: '28px', backgroundColor: 'hsl(0,100%,40%)' }}></div>;
    }

    return (
        <>
            <div className='text-center border-bottom d-flex align-items-center justify-content-center' style={{ backgroundColor: 'hsl(0,100%,40%)', minHeight: '28px', ...style }}>
                <div className="d-inline-flex flex-wrap small align-items-center">
                    {menuItems.map((nav, index) => (
                        <div key={index} className={`px-2 d-flex align-items-center ${menuItems.length !== index + 1 ? 'border-end' : ''}`}>
                            {nav.submenu?.length > 0 ? (
                                <div className="dropdown top-dropdown">
                                    <Link
                                        href={nav.url || '#'}
                                        className={`text-white ${nav.submenu?.length > 0 ? "dropdown-toggle" : ""}`}
                                        type="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                        style={{ display: 'inline-block' }}
                                    >
                                        <small>
                                            {nav.title || 'Menu'}
                                        </small>
                                    </Link>
                                    <ul className="dropdown-menu top-dropdown-menu rounded-bottom py-0">
                                        {nav.submenu.map((item, index) =>
                                            <li key={index}>
                                                <Link href={item.url || '#'} className="text-white dropdown-item">
                                                    <small>{item.title || 'Submenu'}</small>
                                                </Link>
                                                <div className='dropdown-divider'></div>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            ) : (
                                <Link href={nav.url || '#'} type='button' className='text-white'>
                                    <small>
                                        {nav.title || 'Menu'}
                                    </small>
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}