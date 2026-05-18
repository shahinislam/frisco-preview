import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import http from "../../components/utils/http";
import laravelURL from "../../components/utils/laravel-url";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import mainURL from "../../components/utils/main-url";
import blogHref from "../../components/utils/blog-href";
import { useRouter } from "next/router";
import { getLayoutData } from "../../components/utils/getLayoutData";
import dynamic from "next/dynamic";

// ✅ Dynamic import for Pagination (only loads when needed)
const Pagination = dynamic(() => import("react-js-pagination"), {
  ssr: false,
  loading: () => <div style={{ height: "40px" }} />,
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

export default function BlogPage({ blogList }) {
  const router = useRouter();
  const [blogs, setBlogs] = useState(blogList.data);
  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState(blogList.total);
  const [perPage, setPerPage] = useState(blogList.per_page);
  const [searchInput, setSearchInput] = useState("");

  // ❌ REMOVED: Swal - was imported but never used

  const fetchBlogs = async (pageNumber) => {
    const res = await http.get(`/blogs/categories?page=${pageNumber}`);
    const data = await res.data;
    setBlogs(data.data);
    setTotal(data.total);
    setPerPage(data.per_page);
    setActivePage(data.current_page);
    router.push("/blog?page=" + pageNumber, undefined, { shallow: true });
  };

  const handlePageChange = (pageNumber) => {
    fetchBlogs(pageNumber);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?search=${searchInput}`);
    }
  };

  const getDescription = (description) => {
    return { __html: description.replace(/<[^>]+>/g, "").slice(0, 169) };
  };

  return (
    <>
      <Head>
        <title>Blog | SignatureCare Emergency Center</title>
        <meta
          name="description"
          content="Keep your body in tiptop condition with SignatureCare Emergency Center&#039;s emergency room blog and resource center to learn how to avoid common accidents."
        />
        <link rel="canonical" href={mainURL + "/blog"} />
        <link rel="next" href={"/blog/page/" + activePage} />
        <meta property="og:title" content="Blog" />
        <meta property="og:url" content={mainURL + "/blog"} />
      </Head>

      <div className="bg-dark mb-5 text-white">
        <div className="container text-center">
          <h1 className="py-2">Blog</h1>
        </div>
      </div>

      <section className="container">
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
                  placeholder="Search blogs..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
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

        {blogs &&
          blogs.map((blog, index) => (
            <div key={index} className="mb-5">
              <div className="row">
                <div className="col-md-3">
                  {blog.media && (
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3' }} className="img-skeleton">
                      <Image
                        src={laravelURL + "/storage/" + blog.media.path}
                        alt={blog.media.alt_text || blog.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 200px"
                        style={{ objectFit: 'cover' }}
                        {...(index === 0
                          ? { priority: true, fetchpriority: "high" }
                          : { loading: "lazy" }
                        )}
                      />
                    </div>
                  )}
                </div>
                <div className="col-md-9">
                  <div className="mt-3">
                    <Link href={blogHref(blog)}>
                      <h2 className="text-danger mb-3">
                        <b>{blog.title}</b>
                      </h2>
                    </Link>
                    <div
                      dangerouslySetInnerHTML={getDescription(blog.description)}
                    />
                  </div>
                </div>
              </div>
              <div className="py-1 mt-3 border-top border-bottom">
                <small>
                  By <span className="text-danger">SignatureCare ER </span>|{" "}
                  {/* ✅ Using native date formatting instead of moment */}
                  {formatDate(blog.date)}
                  <i> </i>| Categories:{" "}
                  {blog.categories &&
                    blog.categories.map((category, index) => (
                      <span key={index}>
                        {index > 0 ? ", " : ""}
                        <Link
                          href={"/blog/categories/" + category.slug}
                          className="text-danger"
                        >
                          {category.name}
                        </Link>
                      </span>
                    ))}
                </small>
              </div>
            </div>
          ))}

        <div className="d-flex justify-content-center">
          <Pagination
            className="text-danger"
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
  );
}

export const getServerSideProps = async (context) => {
  context.res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  const { query } = context;
  const { page } = query;
  const activePage = page ? page : "";
  const res = await http.get(`/blogs/categories?page=${activePage}`);
  const data = await res.data;
  const layoutData = await getLayoutData();

  return {
    props: { blogList: data, layoutData },
  };
};