import { Metadata } from "next"
import { websiteConfig } from "@lib/website.config"

export const metadata: Metadata = {
  title: `About Us | ${websiteConfig.name}`,
  description: `Learn about ${websiteConfig.name} - ${websiteConfig.seo.defaultDescription}`,
}

export default function AboutUsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold mb-6">About Us</h1>

        <div className="space-y-6 text-gray-700">
          <p className="text-lg leading-relaxed">
            Welcome to <strong>{websiteConfig.name}</strong>, your premier
            destination for designer luxury eyewear. We specialize in offering
            an exclusive collection of premium sunglasses, eyeglasses, and
            frames from the world's most renowned brands.
          </p>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
            <p className="leading-relaxed">
              Our mission is to provide our customers with access to the finest
              luxury eyewear collections while ensuring unmatched quality,
              style, and customer service. We believe that everyone deserves to
              experience the perfect blend of fashion and functionality in their
              eyewear.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">What We Offer</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Premium designer sunglasses from top luxury brands</li>
              <li>High-quality eyeglasses and prescription frames</li>
              <li>Exclusive collections for men, women, and kids</li>
              <li>Authentic products with guaranteed quality</li>
              <li>Expert customer service and support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Why Choose Us</h2>
            <p className="leading-relaxed">
              At {websiteConfig.name}, we are committed to excellence in every
              aspect of our business. From carefully curated product selections
              to exceptional customer care, we strive to make your shopping
              experience seamless and enjoyable. Our team is dedicated to
              helping you find the perfect eyewear that matches your style and
              needs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">
              Contact Information
            </h2>
            <p className="leading-relaxed">
              Have questions or need assistance? We're here to help! Reach out
              to us at:
            </p>
            <div className="mt-4 space-y-2">
              <p>
                <strong>Phone:</strong>{" "}
                <a
                  href={websiteConfig.contact.phoneLink}
                  className="text-blue-600 hover:underline"
                >
                  {websiteConfig.contact.phoneFormatted}
                </a>
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <a
                  href={websiteConfig.contact.emailLink}
                  className="text-blue-600 hover:underline"
                >
                  {websiteConfig.contact.email}
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
