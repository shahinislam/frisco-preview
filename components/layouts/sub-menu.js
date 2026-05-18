import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react'
// import { TiPlus, TiMinus } from "react-icons/ti";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const isExternalLink = (url) => {
    if (!url || typeof url !== "string") return false;
    if (url.startsWith("/") || url.startsWith("#")) return false;
    try {
        const parsed = new URL(url);
        const host = parsed.hostname.toLowerCase();
        return host !== "ercare24.com" && !host.endsWith(".ercare24.com");
    } catch {
        return false;
    }
};

export default function Submenu({ submenus, id, count }) {
    const [openDropdown, setOpenDropdown] = useState(null);
    const router = useRouter();
    const uri = router.asPath;
    count++;

    useEffect(() => {
        setOpenDropdown(null);
    }, [router])

    const handleDropdownToggle = (menuTitle) => {
        setOpenDropdown(openDropdown === menuTitle ? null : menuTitle);
    };

    const activeMenu = (tree) => {
        let result = JSON.stringify(tree).includes(uri + '"');
        return result;
    }

    return (
        <>
            <ul className="dropdown-menu m-0 p-0 border-0 rounded-0 shadow" aria-labelledby={id}>
                {submenus?.map((submenu, index) => {
                    const prefix = count === 1 ? '- ' : (count === 2 ? '-- ' : (count === 3 ? '--- ' : ''));
                    const hasUrl = Boolean(submenu.url);
                    const hasChildren = submenu.submenu?.length > 0;

                    return (
                    <li key={index} className={`dropdown-submenu d-md-flex border-bottom border-danger ${uri !== '/' && submenu.url === uri ? "active" : ""} ${uri !== '/' && activeMenu(submenu.submenu) ? 'active' : ''}`}>
                        {/* For Large Screen */}
                        {hasUrl ? (
                            <Link
                                href={submenu.url}
                                target={isExternalLink(submenu.url) ? "_blank" : undefined}
                                rel={isExternalLink(submenu.url) ? "noopener noreferrer" : undefined}
                                className="dropdown-item nav-link text-white d-none d-lg-block"
                            >
                                <span className='d-md-none'>{prefix}</span>
                                {submenu.title}
                            </Link>
                        ) : (
                            <span className="dropdown-item nav-link text-white d-none d-lg-block disabled text-dark">
                                <span className='d-md-none'>{prefix}</span>
                                {submenu.title}
                            </span>
                        )}
                        {/* For Mobile Screen */}
                        {hasUrl ? (
                            <Link
                                href={submenu.url}
                                target={isExternalLink(submenu.url) ? "_blank" : undefined}
                                rel={isExternalLink(submenu.url) ? "noopener noreferrer" : undefined}
                                className="dropdown-item nav-link text-white d-lg-none d-inline-block w-75"
                            >
                                <span className='d-md-none'>{prefix}</span>
                                {submenu.title}
                            </Link>
                        ) : (
                            <span className="dropdown-item nav-link text-white d-lg-none d-inline-block w-75 disabled text-dark">
                                <span className='d-md-none'>{prefix}</span>
                                {submenu.title}
                            </span>
                        )}

                        {hasChildren ?
                            <a
                                className='d-md-none d-inline-block nav-link px-2 me-2 float-end link-dark bg-danger'
                                id={submenu.title} data-bs-toggle="dropdown" data-bs-auto-close="outside"
                                onClick={() => handleDropdownToggle(submenu.title)}
                            >
                                {
                                    openDropdown === submenu.title ?
                                        <IoIosArrowUp className='ti-minus-mobile float-end fw-bold' />
                                        : <IoIosArrowDown className='ti-plus-mobile float-end fw-bold' />
                                }
                            </a>
                            : ''
                        }
                        {hasChildren ? <Submenu submenus={submenu.submenu} id={submenu.title} count={count} /> : ''}
                    </li>
                    );
                })}
            </ul>
        </>
    )
}
