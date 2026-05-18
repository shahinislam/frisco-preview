import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react'
import { FaSearch, FaStar, FaChevronRight } from 'react-icons/fa';
import http from '../../components/utils/http';
import laravelURL from '../../components/utils/laravel-url';
import mainURL from '../../components/utils/main-url';
import { getLayoutData } from "../../components/utils/getLayoutData";

export default function Grade({ locations }) {
    const [filterLocation, setFilterLocation] = useState(locations);
    const [searchInput, setSearchInput] = useState('');
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const searchLocation = (search) => {
        const result = locations.filter((location) => {
            return location.name.toLowerCase().match(search.toLowerCase());
        });
        setFilterLocation(result);
    }

    const handleSearch = (e) => {
        e.preventDefault();
        searchLocation(searchInput);
    }

    return (
        <>
            <Head>
                <title>Review Us Today - SignatureCare Emergency Center, TX</title>
                <meta name="description" content="Write a review today. Rate us and let us know about the service you received at SignatureCare Emergency Center, TX" />
                <meta name="keywords" content="signaturecare emergency center, 24-hour emergency room, 24-hour er, emergency center, emergency clinic" />
                <link rel='canonical' href={mainURL + '/grade/'} />
                <meta property="og:title" content="Review Us Today - SignatureCare Emergency Center" />
                <meta property="og:url" content={mainURL + '/grade/'} />
            </Head>

            <div className='bg-dark text-white mb-5'>
                <div className='container text-center'>
                    <h1 className='py-2 h3'>Review Our Locations</h1>
                </div>
            </div>

            <section className='container mb-5'>
                {/* Beautiful Search Box */}
                <div className="row justify-content-center mb-5">
                    <div className="col-md-8 col-lg-6">
                        <form onSubmit={handleSearch}>
                            <div 
                                className="input-group input-group-lg shadow" 
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
                                    <FaSearch className="text-danger" size={18} />
                                </span>
                                <input 
                                    type="search"
                                    className="form-control border-0 shadow-none"
                                    placeholder="Search locations..."
                                    value={searchInput}
                                    onChange={(e) => {
                                        setSearchInput(e.target.value);
                                        searchLocation(e.target.value);
                                    }}
                                    aria-label="Search locations"
                                    style={{ 
                                        fontSize: '16px',
                                        paddingLeft: '8px'
                                    }}
                                />
                                <button 
                                    className="btn btn-danger border-0 px-4" 
                                    type="submit"
                                    style={{ 
                                        borderRadius: '0 50px 50px 0',
                                        fontWeight: '600',
                                        fontSize: '15px'
                                    }}
                                >
                                    Search
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className='row'>
                    {filterLocation && filterLocation.length > 0 ? (
                        filterLocation.map((location, index) => (
                            <article className='col-md-4 mb-4' key={index}>
                                <Link href={`/grade/${location.slug}`} className='text-decoration-none'>
                                    <div
                                        className='position-relative overflow-hidden rounded img-skeleton'
                                        style={{
                                            minHeight: '250px',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            transform: hoveredIndex === index ? 'translateY(-5px)' : 'translateY(0)',
                                            boxShadow: hoveredIndex === index
                                                ? '0 8px 24px rgba(0, 0, 0, 0.2)'
                                                : '0 2px 8px rgba(0, 0, 0, 0.1)'
                                        }}
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                    >
                                        <Image
                                            src={laravelURL + '/storage/' + location.media?.path}
                                            alt={`Review SignatureCare Emergency Center in ${location.name}, ${location.city}`}
                                            width={300}
                                            height={250}
                                            sizes='100vw'
                                            className='w-100 d-block'
                                            style={{
                                                filter: hoveredIndex === index ? 'brightness(40%)' : 'brightness(50%)',
                                                objectFit: 'cover',
                                                height: '250px',
                                                transition: 'all 0.3s ease',
                                                transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)'
                                            }}
                                        />
                                        <div className='position-absolute top-50 start-0 translate-middle-y text-white p-4 w-100'>
                                            <h2 className='h5 mb-2'>
                                                <strong>SignatureCare ER - {location.name}</strong>
                                            </h2>
                                            <p className='mb-3 small'>
                                                {location.street}<br />
                                                {location.city}, TX {location.zip}
                                            </p>
                                            <div
                                                className='d-inline-flex align-items-center px-3 py-2 rounded'
                                                style={{
                                                    backgroundColor: 'rgba(220, 53, 69, 0.9)',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    transition: 'all 0.3s ease',
                                                    transform: hoveredIndex === index ? 'translateX(5px)' : 'translateX(0)'
                                                }}
                                            >
                                                <FaStar className='me-2' size={14} />
                                                Write a Review
                                                <FaChevronRight className='ms-2' size={12} />
                                            </div>
                                        </div>

                                        {/* Hover overlay indicator */}
                                        <div
                                            className='position-absolute top-0 end-0 m-3'
                                            style={{
                                                opacity: hoveredIndex === index ? 1 : 0,
                                                transition: 'opacity 0.3s ease'
                                            }}
                                        >
                                            <div
                                                className='bg-white text-danger rounded-circle d-flex align-items-center justify-content-center'
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                <FaChevronRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </article>
                        ))
                    ) : (
                        <div className='col-12 text-center py-5'>
                            <p className='text-muted'>No locations found. Try a different search term.</p>
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}

export const getServerSideProps = async (context) => {
  context.res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  try {
    const res = await http.get('/admin/locations');
    const data = res.data || [];
    const layoutData = await getLayoutData();
    const locations = data.filter(location => (location.name !== 'Greater Texas Division ' && location.status !== 2));

    return {
      props: {
        locations,
        layoutData
      },
    };
  } catch (err) {
    console.error('Error fetching locations:', err.message);
    return { notFound: true };
  }
};