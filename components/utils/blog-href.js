export default function blogHref(item) {
  return "/" + (item?.prefix ? item.prefix + "/" : "") + item?.slug;
}
