import React from 'react';
import { Helmet } from 'react-helmet-async';

export const SITE_URL  = 'https://planahosting.in';
export const SITE_NAME = 'Plan A Hosting';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
const TWITTER_HANDLE = '@planahosting';

interface SEOHeadProps {
    title: string;
    description: string;
    canonical?: string;
    keywords?: string;
    ogType?: 'website' | 'article';
    ogImage?: string;
    noIndex?: boolean;
    /** Pass one schema object or an array of schema objects */
    schema?: object | object[];
    /** Article publish date (ISO string) */
    publishedTime?: string;
    /** Article modified date (ISO string) */
    modifiedTime?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
    title,
    description,
    canonical,
    keywords,
    ogType = 'website',
    ogImage = DEFAULT_OG_IMAGE,
    noIndex = false,
    schema,
    publishedTime,
    modifiedTime,
}) => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : SITE_URL;
    const schemas = schema ? (Array.isArray(schema) ? schema : [schema]) : [];

    return (
        <Helmet>
            {/* ── Primary ──────────────────────────────────────────── */}
            <html lang="en" />
            <title>{fullTitle}</title>
            <meta name="description"        content={description} />
            {keywords && <meta name="keywords" content={keywords} />}
            <meta name="robots"             content={noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'} />
            <meta name="author"             content={SITE_NAME} />
            <link rel="canonical"           href={canonicalUrl} />

            {/* ── Geographic / Regional ────────────────────────────── */}
            <meta name="geo.region"         content="IN" />
            <meta name="geo.country"        content="India" />
            <meta name="geo.placename"      content="India" />
            <meta name="language"           content="English" />
            <meta name="target"             content="all" />
            <meta name="rating"             content="general" />
            <meta name="revisit-after"      content="7 days" />

            {/* ── Open Graph ───────────────────────────────────────── */}
            <meta property="og:type"        content={ogType} />
            <meta property="og:site_name"   content={SITE_NAME} />
            <meta property="og:title"       content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image"       content={ogImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt"   content={`${SITE_NAME} — Domain Registration & Web Hosting India`} />
            <meta property="og:url"         content={canonicalUrl} />
            <meta property="og:locale"      content="en_IN" />
            {publishedTime && <meta property="article:published_time" content={publishedTime} />}
            {modifiedTime  && <meta property="article:modified_time"  content={modifiedTime} />}

            {/* ── Twitter Card ─────────────────────────────────────── */}
            <meta name="twitter:card"        content="summary_large_image" />
            <meta name="twitter:site"        content={TWITTER_HANDLE} />
            <meta name="twitter:creator"     content={TWITTER_HANDLE} />
            <meta name="twitter:title"       content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image"       content={ogImage} />
            <meta name="twitter:image:alt"   content={`${SITE_NAME} — Domain Registration & Web Hosting India`} />

            {/* ── JSON-LD Structured Data ───────────────────────────── */}
            {schemas.map((s, i) => (
                <script key={i} type="application/ld+json">
                    {JSON.stringify(s)}
                </script>
            ))}
        </Helmet>
    );
};

export default SEOHead;
