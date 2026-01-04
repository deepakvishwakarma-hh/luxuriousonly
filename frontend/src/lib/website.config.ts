/**
 * Website Configuration
 * Centralized configuration for all brand-related information
 * Update this file to change brand details across the entire website
 */

export const websiteConfig = {
    // Brand Identity
    name: "Luxuryeyewear.in",
    displayName: "Luxuryeyewear.in",
    shortName: "Luxurious Only",
    tagline: "Designer Luxury Eyewear",

    // Contact Information
    contact: {
        phone: "+91 9871981806",
        phoneFormatted: "+91 9871981806",
        phoneLink: "tel:+919871981806",
        email: "support@luxuryeyewear.in",
        emailLink: "mailto:support@luxuryeyewear.in",
        businessHours: {
            weekdays: "Mon-Sat, 10:00 AM - 7:00 PM IST",
            sunday: "Closed",
        },
    },

    // Logo Configuration
    logo: {
        path: "/logo.avif",
        alt: "Luxuryeyewear.in",
        desktop: {
            width: 205,
            height: 66,
        },
        mobile: {
            width: 160,
            height: 50,
        },
    },

    // Domain & URLs
    domain: "luxuryeyewear.in",
    websiteUrl: "https://luxuryeyewear.in",

    // Social Media (add as needed)
    social: {
        // facebook: "",
        // instagram: "",
        // twitter: "",
    },

    // Company Information
    company: {
        description: "Explore Designer Luxury Eyewear at luxuryeyewear.in. Our exclusive collection of premium Sunglasses, Eyeglasses & Frames offers unmatched quality and style.",
        copyright: `© ${new Date().getFullYear()} Luxuryeyewear.in — All Rights Reserved`,
    },

    // SEO Defaults
    seo: {
        defaultTitle: "Luxuryeyewear.in",
        defaultDescription: "Your destination for designer luxury eyewear including premium sunglasses, eyeglasses, and frames.",
    },
} as const

// Helper functions for common use cases
export const getBrandName = () => websiteConfig.name
export const getBrandDisplayName = () => websiteConfig.displayName
export const getBrandShortName = () => websiteConfig.shortName
export const getContactPhone = () => websiteConfig.contact.phone
export const getContactEmail = () => websiteConfig.contact.email
export const getLogoPath = () => websiteConfig.logo.path
export const getCopyright = () => websiteConfig.company.copyright

