import { Metadata } from "next"
import { websiteConfig } from "@lib/website.config"

export const metadata: Metadata = {
  title: `Return & Refund Policy | ${websiteConfig.name}`,
  description: `Learn about our return and refund policy at ${websiteConfig.name}. Understand our terms for returns, exchanges, and refunds.`,
}

export default function ReturnRefundPolicyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold mb-6">Return & Refund Policy</h1>
        
        <div className="space-y-6 text-gray-700">
          <p className="text-lg leading-relaxed">
            At {websiteConfig.name}, we want you to be completely satisfied with your purchase. 
            If you're not happy with your order, we're here to help.
          </p>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Return Eligibility</h2>
            <p className="leading-relaxed mb-4">
              To be eligible for a return, your item must be:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Unused and in the same condition as when you received it</li>
              <li>In its original packaging with all tags and labels attached</li>
              <li>Returned within the specified return period (typically 7-14 days from delivery)</li>
              <li>Accompanied by the original receipt or proof of purchase</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Return Process</h2>
            <ol className="list-decimal pl-6 space-y-3">
              <li>Contact our customer service team at <a href={websiteConfig.contact.emailLink} className="text-blue-600 hover:underline">{websiteConfig.contact.email}</a> or call us at <a href={websiteConfig.contact.phoneLink} className="text-blue-600 hover:underline">{websiteConfig.contact.phoneFormatted}</a> to initiate a return.</li>
              <li>Provide your order number and reason for return.</li>
              <li>Our team will provide you with a Return Authorization (RA) number and return instructions.</li>
              <li>Package the item securely in its original packaging and include the RA number.</li>
              <li>Ship the item back to the address provided by our customer service team.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Refund Processing</h2>
            <p className="leading-relaxed mb-4">
              Once we receive and inspect your returned item, we will:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Process your refund within 5-7 business days</li>
              <li>Refund the amount to your original payment method</li>
              <li>Send you a confirmation email once the refund is processed</li>
            </ul>
            <p className="mt-4 leading-relaxed">
              <strong>Note:</strong> Shipping charges are typically non-refundable unless the return is due to our error or a defective product.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Non-Returnable Items</h2>
            <p className="leading-relaxed mb-4">
              The following items cannot be returned:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Items that have been used, worn, or damaged by the customer</li>
              <li>Items without original packaging or tags</li>
              <li>Items returned after the return period has expired</li>
              <li>Customized or personalized items (unless defective)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Exchanges</h2>
            <p className="leading-relaxed">
              We currently do not offer direct exchanges. If you need a different size or style, 
              please return the original item and place a new order. We'll process your return 
              refund as quickly as possible.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Defective or Damaged Items</h2>
            <p className="leading-relaxed">
              If you receive a defective or damaged item, please contact us immediately. 
              We will arrange for a replacement or full refund, including return shipping costs. 
              Please include photos of the defect or damage when contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Questions?</h2>
            <p className="leading-relaxed">
              If you have any questions about our return and refund policy, please contact us at:
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

