import { Metadata } from "next";

import { listCollections } from "@lib/data/collections";
import { getRegion } from "@lib/data/regions";
import { getBaseURL } from "@lib/util/env";
import HeroCarouselTemplate from "@modules/layout/templates/hero-carousel";
import DiscountBar from "@modules/home/components/discount-bar";
import TopCatalog from "@modules/home/components/top-catalog";
import BrandSlider from "@modules/home/components/brand-slider";
import KeyPillars from "@modules/home/components/KeyPillars";
import HomepageListing from "@modules/home/components/homepage-listing";
import { websiteConfig } from "@lib/website.config";

type Props = {
  params: Promise<{ countryCode: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { countryCode } = params;
  const region = await getRegion(countryCode);

  const countryName =
    region?.countries?.find((c) => c.iso_2 === countryCode)?.display_name ||
    countryCode.toUpperCase();

  const regionName = region?.name || "Store";
  const siteName = websiteConfig.shortName;
  const companyName = websiteConfig.name || websiteConfig.displayName;
  const title = `${companyName} - Premium Luxury Products | ${countryName}`;
  const description = `Discover premium luxury products at ${siteName}. Shop the finest collection of high-end items delivered to ${countryName}. Free shipping on orders over $100.`;

  const baseURL = getBaseURL();
  const canonical = `${baseURL}/${countryCode}`;

  return {
    title,
    description,
    keywords: [
      "luxury products",
      "premium goods",
      "high-end items",
      "luxury shopping",
      countryName,
      regionName,
    ],
    authors: [{ name: companyName }],
    creator: companyName,
    publisher: companyName,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonical,
      siteName: companyName,
      title,
      description,
      images: [
        {
          url: `${baseURL}/images/logos/brand-square.png`,
          width: 1200,
          height: 1200,
          alt: `${siteName} - Premium Luxury Products`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseURL}/images/logos/brand-square.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function Home(props: Props) {
  const params = await props.params;
  const { countryCode } = params;

  const region = await getRegion(countryCode);
  const { collections } = await listCollections({
    fields: "id, handle, title",
  });

  if (!collections || !region) {
    return null;
  }

  const countryName =
    region?.countries?.find((c) => c.iso_2 === countryCode)?.display_name ||
    countryCode.toUpperCase();

  const baseURL = getBaseURL();
  const canonical = `${baseURL}/${countryCode}`;
  const companyName = websiteConfig.name || websiteConfig.displayName;

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: companyName,
    url: canonical,
    description: `Discover premium luxury products at ${companyName}. Shop the finest collection of high-end items delivered to ${countryName}.`,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseURL}/${countryCode}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: companyName,
    url: baseURL,
    logo: `${baseURL}${websiteConfig.logo.path}`,
    description: "Premium luxury products and high-end items",
    address: {
      "@type": "PostalAddress",
      addressCountry: countryCode.toUpperCase(),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationData),
        }}
      />
      <HeroCarouselTemplate />
      <DiscountBar />
      <TopCatalog />
      <div className="space-y-12 sm:space-y-16">
        <BrandSlider />
        <div className="max-w-8xl mx-auto px-5">
          <HomepageListing
            sortBy="created_at"
            page={1}
            countryCode={countryCode}
          />
        </div>
        <KeyPillars />
      </div>
      {/* <TopCatalog /> */}
    </>
  );
}
