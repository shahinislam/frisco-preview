import laravelURL from "../components/utils/laravel-url";
import mainURL from "../components/utils/main-url";

const SITEMAP_URL = laravelURL + "/api/admin/sitemap";

function toDate(timestamp) {
  return timestamp ? timestamp.split("T")[0] : new Date().toISOString().split("T")[0];
}

function generateSiteMap(pages, subLocations) {
  const today = new Date().toISOString().split("T")[0];

  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!--We manually set some URLs we know already-->
     	<url>
	   		<loc>${mainURL}</loc>
	   		<lastmod>${today}</lastmod>
	   	</url>
     	<url>
	   		<loc>${mainURL + "/join-our-team"}</loc>
	   		<lastmod>${today}</lastmod>
	   	</url>
     	<url>
	   		<loc>${mainURL + "/blog"}</loc>
	   		<lastmod>${today}</lastmod>
	   	</url>
     	<url>
	   		<loc>${mainURL + "/membership-login"}</loc>
	   		<lastmod>${today}</lastmod>
	   	</url>
     	<url>
	   		<loc>${mainURL + "/grade"}</loc>
	   		<lastmod>${today}</lastmod>
	   	</url>
     	<url>
	   		<loc>${mainURL + "/locations"}</loc>
	   		<lastmod>${today}</lastmod>
	   	</url>
       	<url>
	   		<loc>${mainURL + "/awards-recognition"}</loc>
	   		<lastmod>${today}</lastmod>
	   	</url>
       	<url>
	   		<loc>${mainURL + "/closest-emergency-room"}</loc>
	   		<lastmod>${today}</lastmod>
	   	</url>
       	<url>
	   		<loc>${mainURL + "/contact-us"}</loc>
	   		<lastmod>${today}</lastmod>
	   	</url>
       	<url>
	   		<loc>${mainURL + "/emergency-room-appointment"}</loc>
	   		<lastmod>${today}</lastmod>
	   	</url>
       	<url>
	   		<loc>${mainURL + "/news"}</loc>
	   		<lastmod>${today}</lastmod>
	   	</url>
       	<url>
	   		<loc>${mainURL + "/scholarship"}</loc>
	   		<lastmod>${today}</lastmod>
	   	</url>
       	<url>
	   		<loc>${mainURL + "/search"}</loc>
	   		<lastmod>${today}</lastmod>
	   	</url>
		${subLocations
      .map((loc) => {
        return `<url>
					<loc>${`${mainURL}/locations/${loc.slug}`}</loc>
					<lastmod>${toDate(loc.updated_at)}</lastmod>
				</url>`;
      })
      .join("")}
     	${pages
        .filter((page) => page.slug !== "not-here")
        .map((page) => {
          return `<url>
						<loc>${`${mainURL}/${page.slug}`}</loc>
						<lastmod>${toDate(page.updated_at)}</lastmod>
					</url>`;
        })
        .join("")}
   	</urlset>
 	`;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({ res }) {
  // Single API call for all sitemap data with updated_at dates
  const request = await fetch(SITEMAP_URL);
  const data = await request.json();

  const sitemap = generateSiteMap(data.pages || [], data.subLocations || []);
  res.setHeader("Content-Type", "text/xml");
  // we send the XML to the browser
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;
