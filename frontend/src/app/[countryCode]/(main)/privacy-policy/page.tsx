import { Metadata } from "next"
import { websiteConfig } from "@lib/website.config"

export const metadata: Metadata = {
  title: `Privacy Policy | ${websiteConfig.name}`,
  description: `Read our privacy policy to understand how ${websiteConfig.name} collects, uses, and protects your personal information.`,
}

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-700">
          <p className="text-lg leading-relaxed">
            At {websiteConfig.name}, we are committed to protecting your privacy. This Privacy Policy 
            explains how we collect, use, disclose, and safeguard your information when you visit 
            our website and make purchases.
          </p>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
            <p className="leading-relaxed mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Personal Information:</strong> Name, email address, phone number, shipping and billing addresses</li>
              <li><strong>Payment Information:</strong> Credit card details, billing information (processed securely through payment gateways)</li>
              <li><strong>Account Information:</strong> Username, password, and account preferences</li>
              <li><strong>Order Information:</strong> Purchase history, product preferences, and order details</li>
              <li><strong>Communication Data:</strong> Correspondence with our customer service team</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Automatically Collected Information</h2>
            <p className="leading-relaxed mb-4">
              When you visit our website, we automatically collect certain information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>IP address and browser type</li>
              <li>Device information and operating system</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website addresses</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
            <p className="leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your orders, products, and services</li>
              <li>Send you marketing communications (with your consent)</li>
              <li>Improve our website, products, and services</li>
              <li>Prevent fraud and enhance security</li>
              <li>Comply with legal obligations</li>
              <li>Respond to your inquiries and provide customer support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Information Sharing</h2>
            <p className="leading-relaxed mb-4">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Providers:</strong> Third-party companies that help us operate our business (payment processors, shipping companies, etc.)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
            <p className="mt-4 leading-relaxed">
              All third-party service providers are required to maintain the confidentiality of your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
            <p className="leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your 
              personal information against unauthorized access, alteration, disclosure, or destruction. 
              However, no method of transmission over the internet is 100% secure, and we cannot 
              guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Cookies and Tracking Technologies</h2>
            <p className="leading-relaxed">
              We use cookies and similar tracking technologies to enhance your browsing experience, 
              analyze website traffic, and personalize content. You can control cookies through your 
              browser settings, but disabling cookies may affect website functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>
            <p className="leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access and receive a copy of your personal information</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to or restrict processing of your information</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent where processing is based on consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Data Retention</h2>
            <p className="leading-relaxed">
              We retain your personal information for as long as necessary to fulfill the purposes 
              outlined in this Privacy Policy, unless a longer retention period is required or 
              permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Children's Privacy</h2>
            <p className="leading-relaxed">
              Our website is not intended for children under the age of 18. We do not knowingly 
              collect personal information from children. If you believe we have collected 
              information from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to This Policy</h2>
            <p className="leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any 
              material changes by posting the new policy on this page and updating the "Last Updated" 
              date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
            <p className="leading-relaxed">
              If you have questions or concerns about this Privacy Policy or our data practices, 
              please contact us:
            </p>
            <div className="mt-4 space-y-2">
              <p><strong>Email:</strong> <a href={websiteConfig.contact.emailLink} className="text-blue-600 hover:underline">{websiteConfig.contact.email}</a></p>
              <p><strong>Phone:</strong> <a href={websiteConfig.contact.phoneLink} className="text-blue-600 hover:underline">{websiteConfig.contact.phoneFormatted}</a></p>
            </div>
          </section>

          <p className="text-sm text-gray-500 mt-8">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  )
}

