export function addLazyLoadToImages(htmlString) {
  if (!htmlString) return "";

  return secureExternalLinks(
    htmlString.replace(/<img /g, '<img loading="lazy" '),
  );
}

export function addLazyLoadWithSkeleton(htmlString) {
  if (!htmlString) return "";

  return secureExternalLinks(
    htmlString.replace(/<img\s([^>]*?)(?:class="([^"]*)")?([^>]*)>/gi, (_match, before, existingClass, after) => {
      const classes = existingClass ? `img-skeleton ${existingClass}` : 'img-skeleton';
      return `<img loading="lazy" class="${classes}" ${before}${after}>`;
    }),
  );
}

function secureExternalLinks(htmlString) {
  return htmlString.replace(
    /<a\s([^>]*?)href="(https?:\/\/(?!(?:www\.)?ercare24\.com)[^"]*)"([^>]*)>/gi,
    (_match, before, url, after) => {
      let attrs = before + after;
      if (!attrs.includes("target=")) attrs += ' target="_blank"';
      if (!attrs.includes("rel=")) attrs += ' rel="noopener noreferrer"';
      return `<a ${attrs}href="${url}">`;
    },
  );
}
