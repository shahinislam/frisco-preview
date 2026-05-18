import { useEffect, useState } from 'react'
import Pagination from 'react-js-pagination';
import { FaSearch } from 'react-icons/fa';
import { Alert } from 'react-bootstrap';
import { useRouter } from 'next/router';
import http from '../components/utils/http';
import Link from 'next/link';
import LocationList from '../components/templates/location-list';
import laravelURL from '../components/utils/laravel-url';
import Image from 'next/image';
import Head from 'next/head';
import mainURL from '../components/utils/main-url';
import blogHref from '../components/utils/blog-href';
import { getLayoutData } from "../components/utils/getLayoutData";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

export default function Search({ blogList, locationSidebar }) {
    const router = useRouter();
    const { search } = router.query;
    const [blogs, setBlogs] = useState(blogList.data);
    const [activePage, setActivePage] = useState(1);
    const [total, setTotal] = useState(blogList.total);
    const [perPage, setPerPage] = useState(blogList.per_page);
    const [searchInput, setSearchInput] = useState(search || '');
    const [show, setShow] = useState(false);

    // Update searchInput when URL query changes
    useEffect(() => {
        if (search) {
            setSearchInput(search);
        }
    }, [search]);

    const fetchBlogs = async (pageNumber) => {
        const res = await http.get(`/blogs/search?search=${searchInput}&page=${pageNumber}`);
        const data = await res.data;
        setBlogs(data.data);
        setTotal(data.total);
        setPerPage(data.per_page);
        setActivePage(data.current_page);
        router.push(`/search?search=${searchInput}&page=${pageNumber}`, undefined, { shallow: true });
        data.data.length === 0 ? setShow(true) : setShow(false);
    }

    const handleSearch = (e) => {
        e.preventDefault(); // Prevent form submission
        if (searchInput.trim()) {
            fetchBlogs(1);
        }
    }

    const handlePageChange = (pageNumber) => {
        fetchBlogs(pageNumber);
    }

    const getDescription = (description) => {
        return { __html: description.substring(0, 300) };
    }

    // Generate SEO-friendly title and description
    const pageTitle = search 
        ? `Search Results for "${search}" - SignatureCare Emergency Center Blog`
        : 'Search Blogs - SignatureCare Emergency Center';
    
    const pageDescription = search
        ? `Find emergency care articles and health information about "${search}" from SignatureCare Emergency Center's 24-hour ER blog.`
        : 'Search SignatureCare Emergency Center blog for emergency care tips, health advice, and medical information.';

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={mainURL + `/search${search ? `?search=${encodeURIComponent(search)}` : ''}`} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:url" content={mainURL + `/search${search ? `?search=${encodeURIComponent(search)}` : ''}`} />
                {/* No index for search result pages */}
                <meta name="robots" content="noindex, follow" />
            </Head>

            <div className="bg-dark">
                <div className="container text-center">
                    <h1 className="py-2 text-white h3">
                        {search ? `Search Results for "${search}"` : 'Blog Search'}
                    </h1>
                </div>
            </div>

            <div className="container">
                <div className='row mt-5'>
                    <div className='col-md-9'>
                        <section>
                            <h2>{search ? 'Refine your search' : 'Search our blog'}</h2>
                            <br />
                            <div>
                                {search 
                                    ? "Didn't find what you were looking for? Try a different search term."
                                    : "Search for emergency care tips, health advice, and medical information."
                                }
                            </div>
                            <br />
                            <form onSubmit={handleSearch}>
                                <div 
                                    className="input-group input-group-lg mb-3 shadow-sm" 
                                    style={{ 
                                        borderRadius: '50px', 
                                        overflow: 'hidden',
                                        border: '2px solid #f0f0f0'
                                    }}
                                >
                                    <span 
                                        className="input-group-text bg-white border-0 ps-4" 
                                        style={{ borderRadius: '50px 0 0 50px' }}
                                    >
                                        <FaSearch className="text-danger" />
                                    </span>
                                    <input 
                                        value={searchInput} 
                                        onChange={(e) => setSearchInput(e.target.value)} 
                                        type="search" 
                                        className="form-control border-0 shadow-none" 
                                        placeholder="Search blog posts..." 
                                        aria-label="Search blog posts" 
                                        autoFocus 
                                    />
                                    <button 
                                        type="submit" 
                                        className="btn btn-danger border-0 px-4"
                                        style={{ 
                                            borderRadius: '0 50px 50px 0',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Search
                                    </button>
                                </div>
                            </form>
                            <br />
                            <hr className='curve' />
                            <br />
                        </section>

                        {search && blogs.length > 0 && (
                            <div className="mb-4">
                                <p className="text-muted">
                                    Found <strong>{total}</strong> result{total !== 1 ? 's' : ''} for &ldquo;<strong>{search}</strong>&rdquo;
                                </p>
                            </div>
                        )}

                        <div className='row'>
                            {blogs &&
                                blogs.map((blog, index) => (
                                    <div className='col-md-4 mb-5 d-flex align-items-stretch' key={index}>
                                        <article className="card">
                                            <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3' }} className="img-skeleton">
                                                <Image
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 33vw"
                                                    style={{ objectFit: 'cover' }}
                                                    src={laravelURL + "/storage/" + blog.media?.path}
                                                    alt={blog.media?.alt_text || blog.title}
                                                    loading={index < 3 ? "eager" : "lazy"}
                                                />
                                            </div>
                                            <div className="card-body">
                                                <div className="card-text">
                                                    <Link href={blogHref(blog)}>
                                                        <h3 className='text-danger mb-3 h5'>
                                                            <b>{blog.title}</b>
                                                        </h3>
                                                    </Link>
                                                    <div className='py-1 mt-3'>
                                                        <small>
                                                            By <span className='text-danger'>SignatureCare ER</span>
                                                            {' | '}
                                                            <time dateTime={blog.date}>
                                                                {formatDate(blog.date)}
                                                            </time>
                                                            {blog.categories && blog.categories.length > 0 && (
                                                                <>
                                                                    {' | '}Categories: {blog.categories.map((category, index) => (
                                                                        <span key={index}>
                                                                            {index > 0 ? ', ' : ''}
                                                                            <Link href={'/blog/categories/' + category.slug} className='text-danger'>
                                                                                {category.name}
                                                                            </Link>
                                                                        </span>
                                                                    ))}
                                                                </>
                                                            )}
                                                        </small>
                                                    </div>
                                                    <hr />
                                                    <p>{blog.meta_description}</p>
                                                </div>
                                            </div>
                                        </article>
                                    </div>
                                ))
                            }
                        </div>

                        {show &&
                            <Alert variant="danger" onClose={() => setShow(false)} dismissible>
                                <Alert.Heading>No results found</Alert.Heading>
                                <p>
                                    Couldn&apos;t find what you&apos;re looking for! Try different keywords or browse our <Link href="/blog" className="text-danger"><strong>blog categories</strong></Link>.
                                </p>
                            </Alert>
                        }

                        {total > perPage && (
                            <div className='d-flex justify-content-center'>
                                <Pagination 
                                    className='text-danger'
                                    activePage={activePage}
                                    itemsCountPerPage={perPage}
                                    totalItemsCount={total}
                                    pageRangeDisplayed={5}
                                    onChange={handlePageChange}
                                    itemClass="page-item"
                                    linkClass="page-link"
                                />
                            </div>
                        )}
                    </div>
                    <aside className='col-md-3'>
                        <LocationList locationSidebar={locationSidebar} />
                    </aside>
                </div>
            </div>
            <br />
            <br />
            <br />
        </>
    )
}

export const getServerSideProps = async (context) => {
    context.res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

    const { query } = context;
    const { search } = query
    const { page } = query
    const queryString = search ? search : '';
    const activePage = page ? page : '';
    const url = `/blogs/search?search=${queryString}&page=${activePage}`;
    const res = await http.get(url);
    const data = await res.data;
    const locationList = await http.get('/admin/navigations/location-sidebar');
    const locationSidebar = await locationList.data;
    const layoutData = await getLayoutData();

    return {
        props: {
            blogList: data,
            locationSidebar: JSON.parse(locationSidebar.menus),
            layoutData,
        },
    }
}