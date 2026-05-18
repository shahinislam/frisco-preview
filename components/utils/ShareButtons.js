import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  PinterestIcon,
  PinterestShareButton,
  XIcon,
  TwitterShareButton,
} from "react-share";

export default function ShareButtons({ url }) {
  return (
    <div>
      <FacebookShareButton
        windowWidth="800"
        windowHeight="500"
        url={url}
        quote="Share Blog Post..."
      >
        <FacebookIcon size={36} />
      </FacebookShareButton>
      <TwitterShareButton
        windowWidth="800"
        windowHeight="500"
        url={url}
        quote="Share Blog Post..."
      >
        <XIcon size={36} />
      </TwitterShareButton>
      <LinkedinShareButton
        windowWidth="800"
        windowHeight="500"
        url={url}
        quote="Share Blog Post..."
      >
        <LinkedinIcon size={36} />
      </LinkedinShareButton>
      <PinterestShareButton
        windowWidth="800"
        windowHeight="500"
        url={url}
        quote="Share Blog Post..."
      >
        <PinterestIcon size={36} />
      </PinterestShareButton>
      <EmailShareButton
        windowWidth="800"
        windowHeight="500"
        url={url}
        quote="Share Blog Post..."
      >
        <EmailIcon size={36} />
      </EmailShareButton>
    </div>
  );
}