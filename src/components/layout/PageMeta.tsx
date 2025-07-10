import React from 'react';
import { Helmet } from 'react-helmet-async';

interface PageMetaProps {
  title?: string;
  description?: string;
}

const SITE_TITLE = 'VacantCourt';
const SITE_DESCRIPTION = 'Find and get notified about available tennis, pickleball, and basketball courts near you.';
const SITE_URL = 'https://vacantcourt.netlify.app';

const PageMeta: React.FC<PageMetaProps> = ({ title, description }) => {
  const pageTitle = title ? `${title} | ${SITE_TITLE}` : SITE_TITLE;
  
  const pageDescription = description || SITE_DESCRIPTION;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />

      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={SITE_URL} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
    </Helmet>
  );
};

export default PageMeta;