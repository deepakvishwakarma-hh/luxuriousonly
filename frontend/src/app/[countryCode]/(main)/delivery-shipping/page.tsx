import { Metadata } from "next"
import { websiteConfig } from "@lib/website.config"

export const metadata: Metadata = {
  title: `Delivery & Shipping | ${websiteConfig.name}`,
  description: `Learn about our delivery and shipping policies at ${websiteConfig.name}. Find information about shipping times, costs, and tracking.`,
}

export default function DeliveryShippingPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold mb-6">Delivery & Shipping</h1>
        
        <div className="space-y-6 text-gray-700">
          <p className="text-lg leading-relaxed">
            At {websiteConfig.name}, we are committed to delivering your orders safely and on time. 
            Here's everything you need to know about our shipping and delivery process.
          </p>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Shipping Options</h2>
            <p className="leading-relaxed mb-4">
              We offer various shipping options to meet your needs:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Standard Shipping:</strong> 5-7 business days</li>
              <li><strong>Express Shipping:</strong> 2-3 business days</li>
              <li><strong>Same-Day Delivery:</strong> Available in select areas (subject to order placement time)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Processing Time</h2>
            <p className="leading-relaxed">
              All orders are processed within 1-2 business days (excluding weekends and holidays). 
              Once your order is confirmed and payment is verified, we'll prepare it for shipment. 
              You'll receive an email confirmation with your tracking number once your order ships.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Shipping Costs</h2>
            <p className="leading-relaxed mb-4">
              Shipping costs vary based on:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Delivery location</li>
              <li>Shipping method selected</li>
              <li>Order weight and dimensions</li>
            </ul>
            <p className="mt-4 leading-relaxed">
              <strong>Free Shipping:</strong> We offer free standard shipping on orders above a certain value. 
              Check your cart for current free shipping eligibility.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Order Tracking</h2>
            <p className="leading-relaxed">
              Once your order ships, you'll receive a tracking number via email. You can use this 
              number to track your package's journey from our warehouse to your doorstep. 
              Simply click on the tracking link in your email or visit the carrier's website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Delivery Areas</h2>
            <p className="leading-relaxed">
              We currently ship throughout India. We're working on expanding our international 
              shipping options. For international orders, please contact our customer service 
              team for availability and shipping costs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Delivery Instructions</h2>
            <p className="leading-relaxed mb-4">
              To ensure smooth delivery:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide a complete and accurate delivery address</li>
              <li>Include contact information (phone number) for delivery coordination</li>
              <li>Ensure someone is available to receive the package, or provide delivery instructions</li>
              <li>Check your email regularly for delivery updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Failed Deliveries</h2>
            <p className="leading-relaxed">
              If a delivery attempt fails due to an incorrect address, unavailability, or other reasons, 
              the package will be returned to our warehouse. Additional shipping charges may apply 
              for re-delivery. Please ensure your delivery information is accurate.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Damaged or Lost Packages</h2>
            <p className="leading-relaxed">
              If your package arrives damaged or is lost in transit, please contact us immediately. 
              We'll work with the shipping carrier to resolve the issue and ensure you receive your 
              order or a full refund.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Holiday Shipping</h2>
            <p className="leading-relaxed">
              During peak holiday seasons, processing and delivery times may be extended. 
              We recommend placing orders early to ensure timely delivery. Check our website 
              for holiday shipping deadlines.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Questions About Shipping?</h2>
            <p className="leading-relaxed">
              If you have any questions about shipping or delivery, please don't hesitate to contact us:
            </p>
            <div className="mt-4 space-y-2">
              <p><strong>Email:</strong> <a href={websiteConfig.contact.emailLink} className="text-blue-600 hover:underline">{websiteConfig.contact.email}</a></p>
              <p><strong>Phone:</strong> <a href={websiteConfig.contact.phoneLink} className="text-blue-600 hover:underline">{websiteConfig.contact.phoneFormatted}</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

