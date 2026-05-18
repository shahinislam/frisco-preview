import Head from 'next/head';
import Link from 'next/link';
import React, { useState } from 'react';
import http from '../components/utils/http';
import mainURL from '../components/utils/main-url';
import { getLayoutData } from "../components/utils/getLayoutData";
import dynamic from 'next/dynamic';
import Image from 'next/image';
import ListSkeleton from '../components/skeletons/ListSkeleton';

// Lazy load BlogByCategory — keep SSR so crawlers see article list
const BlogByCategory = dynamic(() => import('./blog/categories/[category]'), {
  loading: () => <ListSkeleton />,
});

// ✅ YouTube Lite component - loads thumbnail first, iframe on click
function YouTubeLite({ videoId, title }) {
  const [showIframe, setShowIframe] = useState(false);
  
  if (showIframe) {
    return (
      <iframe
        width="100%"
        height={315}
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title={title || 'YouTube video'}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  
  return (
    <div
      onClick={() => setShowIframe(true)}
      style={{
        position: 'relative',
        width: '100%',
        height: '315px',
        cursor: 'pointer',
        backgroundColor: '#000',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {/* YouTube thumbnail */}
      <Image
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        alt={title || 'YouTube video thumbnail'}
        fill
        style={{ objectFit: 'cover' }}
        sizes="(max-width: 768px) 100vw, 33vw"
        loading="lazy"
      />
      
      {/* Play button overlay */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '68px',
          height: '48px',
          backgroundColor: 'rgba(255, 0, 0, 0.8)',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 0, 0, 1)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 0, 0, 0.8)'}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
      
      {/* Click to play text */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '4px',
          fontSize: '12px',
        }}
      >
        Click to play
      </div>
    </div>
  );
}

// ✅ Extract video ID from YouTube URL
function getYouTubeId(url) {
  const regex = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export default function NewsPage({ videos, newsBlogs }) {
  return (
    <>
      <Head>
        <title>Emergency Room News &amp; Videos: SignatureCare Emergency Center</title>
        <meta name="description" content="Latest emergency room news and videos from SignatureCare Emergency Center, 24-hour emergency rooms in Houston, Austin, Paris and other Texas cities." />
        <link rel="canonical" href={mainURL + "/news/"} />
        <meta property="og:title" content="News & Videos" />
        <meta property="og:url" content={mainURL + "/news/"} />
        <meta property="article:modified_time" content="2022-10-21T18:49:37+00:00" />
        <meta property="og:image" content="/assets/austin-er3.jpg" />
        <meta property="og:image:width" content={1000} />
        <meta property="og:image:height" content={609} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta name="twitter:label1" content="Est. reading time" />
        <meta name="twitter:data1" content="13 minutes" />
      </Head>

      <section>
        <div className="text-center bg-dark text-white">
          <h1 className="py-2">News &#38; Videos</h1>
        </div>
      </section>

      <br />
      <br />

      <section>
        <center>
          <h2 className="text-danger">
            <b>SignatureCare Emergency Center Videos</b>
          </h2>
        </center>
      </section>
      <br />

      <section>
        <center>
          <div className="w-50">
            <hr className="curve" />
          </div>
        </center>
      </section>

      <br />

      <section>
        <div className="container">
          <div className="row">
            {videos &&
              videos.map((video, index) => {
                const videoId = getYouTubeId(video.link);
                if (!videoId) return null;
                
                return (
                  <div className="col-md-4 mb-3" key={index}>
                    {/* ✅ Lazy YouTube - only loads iframe on click */}
                    <YouTubeLite videoId={videoId} title={video.title} />
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      <section>
        <center>
          <p>
            For additional videos, please go to our{' '}
            <Link
              href="https://www.youtube.com/channel/UCx4SjwyHoHNFY-BwP8f6EzQ/videos"
              className="text-danger"
              target="_blank"
              rel="noopener noreferrer"
            >
              YouTube Channel.
            </Link>
          </p>
          <hr className="curve w-50" />
        </center>
      </section>
      <br />

      <section>
        <center>
          <h2 className="text-danger">
            <b>Emergency Room (ER) News</b>
          </h2>
          <hr className="curve w-50" />
          <br />
        </center>
        {/* ✅ Lazy loaded BlogByCategory */}
        <BlogByCategory newsVideos={true} blogList={newsBlogs} />
      </section>

      <br />
      <br />
      <br />
    </>
  );
}

export const getStaticProps = async () => {
  try {
    const [videosRes, newsBlogsRes, layoutData] = await Promise.all([
      http.get('/admin/videos'),
      http.get('/blogs/categories/news?page=1'),
      getLayoutData(),
    ]);
    return {
      props: {
        videos: videosRes.data || [],
        newsBlogs: newsBlogsRes.data || { data: [], total: 0, per_page: 10, current_page: 1 },
        layoutData,
      },
      revalidate: 10,
    };
  } catch (err) {
    console.error('Error fetching news page data:', err.message);
    return { notFound: true };
  }
};