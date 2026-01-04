import { Metadata } from "next"
import { websiteConfig } from "@lib/website.config"

export const metadata: Metadata = {
  title: `Terms & Conditions | ${websiteConfig.name}`,
  description: `Read our terms and conditions to understand the rules and regulations for using ${websiteConfig.name} and making purchases.`,
}

export default function TermsConditionsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold mb-6">Terms & Conditions</h1>
        
        <div className="space-y-6 text-gray-700">
          <p className="text-lg leading-relaxed">
            Welcome to {websiteConfig.name}. These Terms and Conditions govern your use of our website 
            and the purchase of products from us. By accessing our website and making a purchase, 
            you agree to be bound by these terms.
          </p>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using {websiteConfig.name}, you accept and agree to be bound by these 
              Terms and Conditions. If you do not agree with any part of these terms, you must 
              not use our website or make purchases.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Use of Website</h2>
            <p className="leading-relaxed mb-4">
              You agree to use our website only for lawful purposes and in a way that does not:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Interfere with or disrupt the website's operation</li>
              <li>Attempt to gain unauthorized access to any part of the website</li>
              <li>Transmit any viruses, malware, or harmful code</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Product Information</h2>
            <p className="leading-relaxed">
              We strive to provide accurate product descriptions, images, and pricing information. 
              However, we do not warrant that product descriptions, images, or other content on 
              our website are accurate, complete, reliable, current, or error-free. Product colors 
              may vary due to display settings and photography.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Pricing and Payment</h2>
            <p className="leading-relaxed mb-4">
              All prices are displayed in the currency applicable to your region and are subject 
              to change without notice. We reserve the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modify prices at any time</li>
              <li>Refuse or cancel orders for pricing errors</li>
              <li>Require payment before shipping</li>
              <li>Use third-party payment processors for secure transactions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Orders and Acceptance</h2>
            <p className="leading-relaxed">
              When you place an order, you are making an offer to purchase products. We reserve 
              the right to accept or reject any order for any reason, including but not limited 
              to product availability, pricing errors, or suspected fraud. Order confirmation 
              does not constitute acceptance of your order.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Intellectual Property</h2>
            <p className="leading-relaxed">
              All content on this website, including text, graphics, logos, images, and software, 
              is the property of {websiteConfig.name} or its content suppliers and is protected by 
              copyright and other intellectual property laws. You may not reproduce, distribute, 
              or create derivative works without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Limitation of Liability</h2>
            <p className="leading-relaxed">
              To the fullest extent permitted by law, {websiteConfig.name} shall not be liable for 
              any indirect, incidental, special, consequential, or punitive damages, or any loss 
              of profits or revenues, whether incurred directly or indirectly, or any loss of data, 
              use, goodwill, or other intangible losses resulting from your use of our website or products.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Indemnification</h2>
            <p className="leading-relaxed">
              You agree to indemnify and hold harmless {websiteConfig.name}, its officers, directors, 
              employees, and agents from any claims, damages, losses, liabilities, and expenses 
              (including legal fees) arising from your use of the website, violation of these 
              terms, or infringement of any rights of another party.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Governing Law</h2>
            <p className="leading-relaxed">
              These Terms and Conditions shall be governed by and construed in accordance with 
              the laws of India. Any disputes arising from these terms or your use of the website 
              shall be subject to the exclusive jurisdiction of the courts in India.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Modifications to Terms</h2>
            <p className="leading-relaxed">
              We reserve the right to modify these Terms and Conditions at any time. Changes will 
              be effective immediately upon posting on the website. Your continued use of the 
              website after changes are posted constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Severability</h2>
            <p className="leading-relaxed">
              If any provision of these Terms and Conditions is found to be invalid or unenforceable, 
              the remaining provisions shall continue in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Information</h2>
            <p className="leading-relaxed">
              If you have any questions about these Terms and Conditions, please contact us:
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

