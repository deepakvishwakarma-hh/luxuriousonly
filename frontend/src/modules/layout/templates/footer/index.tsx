"use client"

import { useState } from "react"
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa"
import { IoArrowUp } from "react-icons/io5"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { WEBSITE_DOMAIN, WEBSITE_NAME } from "@lib/brand"

const Footer = () => {
  const [email, setEmail] = useState("")

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log("Newsletter subscription:", email)
    setEmail("")
  }

  return (
    <>
      {/* Top Section */}
      {/* <div className="w-full bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Shop Glasses, Sunglasses, Prescription Sunglasses & Eyeglasses Online
          </h2>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-4xl">
            {WEBSITE_DOMAIN !== "none" ? WEBSITE_DOMAIN : "luxuriousmart.com"} is
            a leading e-commerce portal for eyewear in the USA. We offer a large
            online selection of authentic designer luxury sunglasses, eyeglasses,
            and frames. Our sunglasses and eyeglasses are available for men and
            women in diverse styles and trendy colors.
          </p>
        </div>
      </div> */}

      {/* Footer Section */}
      <footer className="w-full bg-gray-800 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
            {/* About Luxuriousmart Column */}
            <div className="lg:col-span-2">
              <h3 className="text-white font-semibold text-lg mb-4">
                About {WEBSITE_NAME}
              </h3>
              <div className="space-y-3 text-sm leading-relaxed">
                <p>
                  {WEBSITE_NAME} curates a collection of high-end eyewear that
                  combines style, quality, and authenticity. Our mission is to
                  provide premium-quality designer eyeglasses and sunglasses to
                  our customers.
                </p>
                <p>
                  We partner with top eyewear brands to bring you the latest
                  trends and timeless classics. Every product in our collection
                  is carefully selected to ensure authenticity and customer
                  satisfaction.
                </p>
                <div className="pt-2">
                  <p className="mb-1">
                    <span className="font-medium">Phone:</span>{" "}
                    <a
                      href="tel:+16613346334"
                      className="hover:text-white transition-colors"
                    >
                      +1 661-334-6334
                    </a>
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    <a
                      href="mailto:support@luxuriousmart.com"
                      className="hover:text-white transition-colors"
                    >
                      support@luxuriousmart.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Information Column */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">
                Information
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <LocalizedClientLink
                    href="/about-us"
                    className="hover:text-white transition-colors"
                  >
                    About us
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/faqs"
                    className="hover:text-white transition-colors"
                  >
                    Faqs
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/contact-us"
                    className="hover:text-white transition-colors"
                  >
                    Contact us
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/return-refund-policy"
                    className="hover:text-white transition-colors"
                  >
                    Return & Refund Policy
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/returns-exchanges-policy"
                    className="hover:text-white transition-colors"
                  >
                    Returns and Exchanges Policy
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/delivery-shipping"
                    className="hover:text-white transition-colors"
                  >
                    Delivery & Shipping
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/privacy-policy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/terms-conditions"
                    className="hover:text-white transition-colors"
                  >
                    Terms & Conditions
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            {/* Shop By Popular Brands Column */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">
                Shop By Popular Brands
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <LocalizedClientLink
                    href="/brands/burberry"
                    className="hover:text-white transition-colors"
                  >
                    Burberry Glasses
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/brands/carrera"
                    className="hover:text-white transition-colors"
                  >
                    Carrera Sunglasses
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/brands/gucci"
                    className="hover:text-white transition-colors"
                  >
                    Gucci Glasses
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/brands/le-north"
                    className="hover:text-white transition-colors"
                  >
                    Le North Glasses
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/brands/tom-ford"
                    className="hover:text-white transition-colors"
                  >
                    Tom Ford Glasses
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/brands/versace"
                    className="hover:text-white transition-colors"
                  >
                    Versace Sunglasses
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/brands/prada"
                    className="hover:text-white transition-colors"
                  >
                    Prada Glasses
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/brands/philippe-charriol"
                    className="hover:text-white transition-colors"
                  >
                    Philippe Charriol Glasses
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/brands"
                    className="hover:text-white transition-colors font-medium"
                  >
                    View All Eyewear Brands
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            {/* Quick Shop & Newsletter Column */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">
                Quick Shop
              </h3>
              <ul className="space-y-2 text-sm mb-8">
                <li>
                  <LocalizedClientLink
                    href="/sunglasses"
                    className="hover:text-white transition-colors"
                  >
                    Shop Sunglasses
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/sunglasses/men"
                    className="hover:text-white transition-colors"
                  >
                    Sunglasses for Men
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/sunglasses/women"
                    className="hover:text-white transition-colors"
                  >
                    Sunglasses for Women
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/glasses"
                    className="hover:text-white transition-colors"
                  >
                    Shop Glasses Frames
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/glasses/men"
                    className="hover:text-white transition-colors"
                  >
                    Glasses for Men
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/glasses/women"
                    className="hover:text-white transition-colors"
                  >
                    Glasses for Women
                  </LocalizedClientLink>
                </li>
              </ul>

              {/* Newsletter Sign Up */}
              <div className="mb-6">
                <h3 className="text-white font-semibold text-lg mb-4">
                  Newsletter Sign Up
                </h3>
                <p className="text-sm mb-4">
                  Sign up for new arrivals, offers, and more!
                </p>
                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                  />
                  <button
                    type="submit"
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors uppercase text-sm"
                  >
                    SEND
                  </button>
                </form>
              </div>

              {/* Social Media Icons */}
              <div className="flex gap-4 mb-6">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <FaFacebookF className="text-white" size={16} />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <FaInstagram className="text-white" size={16} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                >
                  <FaTwitter className="text-white" size={16} />
                </a>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-white font-semibold text-lg mb-4">
                  Quick Links
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <LocalizedClientLink
                      href="/account"
                      className="hover:text-white transition-colors"
                    >
                      My Account
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink
                      href="/wishlist"
                      className="hover:text-white transition-colors"
                    >
                      Wishlist
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink
                      href="/track-order"
                      className="hover:text-white transition-colors"
                    >
                      Track your order
                    </LocalizedClientLink>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-black w-full">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <p className="text-white text-xs md:text-sm">
              Copyright © 2025
              {WEBSITE_DOMAIN} All Rights Reserved.
            </p>
            <button
              onClick={scrollToTop}
              className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
              aria-label="Scroll to top"
            >
              <IoArrowUp className="text-gray-300" size={18} />
            </button>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer
