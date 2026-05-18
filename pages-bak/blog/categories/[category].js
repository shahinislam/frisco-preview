import { useState } from 'react'
import { useRouter } from 'next/router';
import http from '../../../components/utils/http';
import laravelURL from '../../../components/utils/laravel-url';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import mainURL from '../../../components/utils/main-url';
import blogHref from '../../../components/utils/blog-href';
import { getLayoutData } from "../../../components/utils/getLayoutData";
import dynamic from 'next/dynamic';

const Pagination = dynamic(() => import("react-js-pagination"), {
  ssr: false,
  loading: () => <div style={{ height: "40px" }} />,
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function BlogByCategory({ newsVideos, blogList }) {
    const router = useRouter();
    const { category } = router.query;
    const [blogs, setBlogs] = useState(blogList?.data || []);
    const [activePage, setActivePage] = useState(blogList?.current_page || 1);
    const [total, setTotal] = useState(blogList?.total || 0);
    const [perPage, setPerPage] = useState(blogList?.per_page || 10);

    const fetchBlogs = async (pageNumber) => {
        const res = await http.get(`/blogs/categories/${newsVideos ? 'news' : category}?page=${pageNumber}`);
        const data = res.data;
        setBlogs(data.data);
        setTotal(data.total);
        setPerPage(data.per_page);
        setActivePage(data.current_page);
        if (!newsVideos) {
            router.push(`/blog/categories/${category}?page=${pageNumber}`, undefined, { shallow: true });
        }
    }

    const handlePageChange = (pageNumber) => {
        fetchBlogs(pageNumber);
    }

    const getDescription = (description) => {
        return { __html: description.replace(/<[^>]+>/g, '').slice(0, 169) };
    }

    return (
        <>
            {!newsVideos &&
                <div>
                    <Head>
                        <title>{`${category ? category.charAt(0).toUpperCase() + category.slice(1) + ' | ' : ''}Blog | SignatureCare Emergency Center`}</title>
                        <meta name="description" content="Keep your body in tiptop condition with SignatureCare Emergency Center&#039;s emergency room blog and resource center to learn how to avoid common accidents." />
                        <link rel="canonical" href={mainURL + "/blog/categories/" + (category || '')} />
                        <link rel="next" href={"/blog/page/" + (activePage + 1)} />
                        <meta property="og:title" content={`${category || 'Blog'} | SignatureCare Emergency Center`} />
                        <meta property="og:url" content={mainURL + "/blog/categories/" + (category || '')} />
                    </Head>

                    <div className='bg-dark mb-5 text-white'>
                        <div className='container text-center'>
                            <h1 className='py-2 text-capitalize'>{category}</h1>
                        </div>
                    </div>
                </div>
            }

            <section className="container">
                {blogs?.map((blog, index) => (
                        <div key={index} className='mb-5'>
                            <div className='row'>
                                <div className='col-md-3'>
                                    <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3' }} className="img-skeleton">
                                        <Image
                                            src={laravelURL + "/storage/" + blog.media?.path}
                                            alt={blog.media?.alt_text || blog.title}
                                            fill
                                            sizes='(max-width: 768px) 100vw, 200px'
                                            style={{ objectFit: 'cover' }}
                                            {...(index === 0 ? { priority: true } : { loading: "lazy" })}
                                        />
                                    </div>
                                </div>
                                <div className='col-md-9 mt-2'>
                                    <Link href={blogHref(blog)}><h2 className='text-danger mb-3'><b>{blog.title}</b></h2></Link>
                                    <div dangerouslySetInnerHTML={getDescription(blog.description)} />
                                </div>
                            </div>
                            {!newsVideos &&
                                <div>
                                    <div className='py-1 mt-3 border-top border-bottom'>
                                        <small>
                                            By <span className='text-danger'>SignatureCare ER</span>
                                            | {formatDate(blog.date)}<i> </i>
                                            | Categories: {blog.categories &&
                                                blog.categories.map((category, index) => (
                                                    <span key={index}>
                                                        {index > 0 ? ', ' : ''}
                                                        <Link href={'/blog/categories/' + category.slug} className='text-danger'>{category.name}</Link>
                                                    </span>
                                                ))
                                            }
                                        </small>
                                    </div>
                                </div>
                            }
                        </div>
                    ))
                }

                <div className='d-flex justify-content-center'>
                    <Pagination className='text-danger'
                        activePage={activePage}
                        itemsCountPerPage={perPage}
                        totalItemsCount={total}
                        pageRangeDisplayed={5}
                        onChange={handlePageChange}
                        itemClass="page-item"
                        linkClass="page-link"
                    />
                </div>
            </section>
        </>
    )
}

export async function getServerSideProps(context) {
    context.res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

    const { category } = context.params;
    const page = context.query.page || 1;

    try {
        const [blogRes, layoutData] = await Promise.all([
            http.get(`/blogs/categories/${category}?page=${page}`),
            getLayoutData(),
        ]);

        return {
            props: {
                blogList: blogRes.data,
                layoutData,
            },
        };
    } catch (error) {
        console.error('Error fetching category data:', error.message);

        return {
            props: {
                blogList: { data: [], total: 0, per_page: 10, current_page: 1 },
                layoutData: {},
            },
        };
    }
}
