import { Helmet } from 'react-helmet-async';

interface SeoHeadProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
}

const SITE_URL = 'https://wandr-travel-test.netlify.app';

export default function SeoHead({ title, description, path = '', image }: SeoHeadProps) {
  const url = `${SITE_URL}${path}`;
  const fullTitle = title.includes('Wandr') ? title : `${title} | Wandr`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
