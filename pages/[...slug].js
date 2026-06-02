import Head from "next/head";
import http from "../components/utils/http";
import { getLayoutData } from "../components/utils/getLayoutData";
import dynamic from "next/dynamic";
import ContentSkeleton from "../components/skeletons/ContentSkeleton";
import mainURL from "../components/utils/main-url";

// ✅ Dynamic imports - only load the component that's needed
const Page = dynamic(() => import("../components/page-body/page"), {
  loading: () => <ContentSkeleton />,
});

const Symptom = dynamic(() => import("../components/page-body/symptom"), {
  loading: () => <ContentSkeleton />,
});

const Blog = dynamic(() => import("../components/page-body/blog"), {
  loading: () => <ContentSkeleton />,
});

const Location = dynamic(() => import("../components/page-body/location"), {
  loading: () => <ContentSkeleton />,
});

export default function PageShow({
  page,
  canonicalPath,
  faqSchema,
  locations,
  locationSidebar,
  symptomSidebar,
}) {
  switch (page?.type) {
    case "page":
      return (
        <Page
          page={page?.content}
          canonicalPath={canonicalPath}
          faqSchema={faqSchema}
          locations={locations}
          locationSidebar={locationSidebar}
          symptomSidebar={symptomSidebar}
        />
      );
    case "symptom":
      return (
        <Symptom symptom={page?.content} symptomSidebar={symptomSidebar} />
      );
    case "location":
      return (
        <Location location={page?.content} />
      );
    case "blog":
      return <Blog blog={page?.content} locationSidebar={locationSidebar} />;
    default:
      return (
        <>
          <Head>
            <title>SignatureCare Emergency Center</title>
            <meta
              name="description"
              content="SignatureCare Emergency Center 24-Hour Emergency Rooms in Texas."
            />
            <link
              rel="canonical"
              href={mainURL + "/" + (canonicalPath || "")}
            />
            <meta name="robots" content="noindex, follow" />
          </Head>
        </>
      );
  }
}

export const getStaticPaths = async () => {
  try {
    const res = await http.get("/admin/next-paths");
    const data = await res.data;

    const paths = data.map((path) => ({ params: { slug: path.split("/") } }));

    return {
      paths,
      fallback: "blocking",
    };
  } catch (err) {
    console.error("Error fetching paths:", err.message);
    return {
      paths: [],
      fallback: "blocking",
    };
  }
};

export const getStaticProps = async (context) => {
  try {
    const slugArr = context.params.slug;
    const slug = slugArr[slugArr.length - 1];
    const requestedPrefix =
      slugArr.length > 1 ? slugArr.slice(0, -1).join("/") : null;

    const res = await http.get("/admin/next-pages/" + slug);
    const data = res.data;

    if (!data) {
      return { notFound: true };
    }

    if (data?.type === "not-here") {
      return {
        redirect: {
          destination: "/not-here",
          permanent: false,
        },
      };
    }

    const actualPrefix = data?.content?.prefix || null;

    // Wrong prefix → 404
    if (requestedPrefix && requestedPrefix !== actualPrefix) {
      return { notFound: true };
    }

    // Bare slug but content has a prefix → 301 redirect to canonical URL
    if (!requestedPrefix && actualPrefix) {
      return {
        redirect: {
          destination: "/" + actualPrefix + "/" + slug,
          permanent: true,
        },
      };
    }

    // Fetch all data including layout data
    const [
      locationRes,
      locationListRes,
      symptomListRes,
      layoutData,
    ] = await Promise.all([
      http.get("/admin/locations"),
      http.get("/admin/navigations/location-sidebar"),
      http.get("/admin/navigations/symptom-sidebar"),
      getLayoutData(),
    ]);

    const locations = locationRes.data;
    const locationSidebar = JSON.parse(locationListRes.data.menus || "[]");
    const symptomSidebar = JSON.parse(symptomListRes.data.menus || "[]");

    // Find the full URL path from main menu for canonical (prefixed content uses its own prefix)
    const findMenuUrl = (menus, slug) => {
      for (const item of menus) {
        if (item.url && item.url !== '/' && item.url.endsWith('/' + slug)) {
          return item.url.replace(/^\//, '');
        }
        if (item.submenu?.length) {
          const found = findMenuUrl(item.submenu, slug);
          if (found) return found;
        }
      }
      return null;
    };

    const canonicalPath = actualPrefix
      ? actualPrefix + "/" + slug
      : findMenuUrl(layoutData.mainMenu || [], slug) || slug;

    // Build FAQPage structured data for the FAQ page
    let faqSchema = null;
    if (slug === 'faqs' && data?.content?.description) {
      const parts = data.content.description.split(/<h2>/i);
      const faqItems = [];
      for (const part of parts) {
        const qMatch = part.match(/<strong>(.*?)<\/strong>/i);
        if (!qMatch) continue;
        const question = qMatch[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
        const afterH2 = part.split(/<\/h2>/i)[1];
        if (!afterH2) continue;
        const answer = afterH2.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
        if (question && answer) {
          faqItems.push({ question, answer });
        }
      }
      if (faqItems.length > 0) {
        faqSchema = {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map(({ question, answer }) => ({
            '@type': 'Question',
            name: question,
            acceptedAnswer: { '@type': 'Answer', text: answer },
          })),
        };
      }
    }

    return {
      props: {
        page: data,
        canonicalPath,
        faqSchema,
        locations,
        locationSidebar,
        symptomSidebar,
        layoutData,
      },
      revalidate: 300, // 5 minutes
    };
  } catch (err) {
    console.error("Error in getStaticProps:", err.message);
    return { notFound: true };
  }
};
