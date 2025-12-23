"use client"

import { useState } from "react"
import { FaPhone, FaEnvelope } from "react-icons/fa"
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
      <footer className="w-full bg-black text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-12 lg:py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
              {/* About Column */}
              <div className="lg:col-span-1">
                <h3 className="text-white font-bold text-base mb-5 uppercase tracking-wide">
                  About
                </h3>
                <div className="space-y-4 text-sm leading-relaxed text-gray-400">
                  <p>
                    Explore Designer Luxury Eyewear at luxuryeyewear.in Our
                    exclusive collection of premium Sunglasses, Eyeglasses,
                    Glasses & Frames offers unmatched quality and style.
                  </p>
                  <div className="pt-2 space-y-3">
                    <a
                      href="tel:+919871981806"
                      className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
                    >
                      <FaPhone
                        className="text-gray-500 group-hover:text-white transition-colors"
                        size={16}
                      />
                      <span>+91 9871981806</span>
                    </a>
                    <a
                      href="mailto:support@luxuryeyewear.in"
                      className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
                    >
                      <FaEnvelope
                        className="text-gray-500 group-hover:text-white transition-colors"
                        size={16}
                      />
                      <span>support@luxuryeyewear.in</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Information Column */}
              <div>
                <h3 className="text-white font-bold text-base mb-5 uppercase tracking-wide">
                  Information
                </h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <LocalizedClientLink
                      href="/about-us"
                      className="text-gray-400 hover:text-white transition-colors inline-block"
                    >
                      About us
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink
                      href="/contact-us"
                      className="text-gray-400 hover:text-white transition-colors inline-block"
                    >
                      Contact us
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink
                      href="/return-refund-policy"
                      className="text-gray-400 hover:text-white transition-colors inline-block"
                    >
                      Return & Refund Policy
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink
                      href="/delivery-shipping"
                      className="text-gray-400 hover:text-white transition-colors inline-block"
                    >
                      Delivery & Shipping
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink
                      href="/privacy-policy"
                      className="text-gray-400 hover:text-white transition-colors inline-block"
                    >
                      Privacy Policy
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink
                      href="/terms-conditions"
                      className="text-gray-400 hover:text-white transition-colors inline-block"
                    >
                      Terms & Conditions
                    </LocalizedClientLink>
                  </li>
                </ul>
              </div>

              {/* Shop By Popular Brands Column */}
              <div>
                <h3 className="text-white font-bold text-base mb-5 uppercase tracking-wide">
                  Popular Brands
                </h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <LocalizedClientLink
                      href="/brands/burberry"
                      className="text-gray-400 hover:text-white transition-colors inline-block"
                    >
                      Burberry Glasses
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink
                      href="/brands/carrera"
                      className="text-gray-400 hover:text-white transition-colors inline-block"
                    >
                      Carrera Sunglasses
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink
                      href="/brands/gucci"
                      className="text-gray-400 hover:text-white transition-colors inline-block"
                    >
                      Gucci Glasses
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink
                      href="/brands/ic-berlin"
                      className="text-gray-400 hover:text-white transition-colors inline-block"
                    >
                      Ic Berlin Glasses
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink
                      href="/brands/tom-ford"
                      className="text-gray-400 hover:text-white transition-colors inline-block"
                    >
                      Tom Ford Glasses
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink
                      href="/brands/versace"
                      className="text-gray-400 hover:text-white transition-colors inline-block"
                    >
                      Versace Sunglasses
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink
                      href="/brands/philippe-charriol"
                      className="text-gray-400 hover:text-white transition-colors inline-block"
                    >
                      Philippe Charriol Glasses
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink
                      href="/brands"
                      className="text-gray-300 hover:text-white transition-colors inline-block font-medium"
                    >
                      View All Brands →
                    </LocalizedClientLink>
                  </li>
                </ul>
              </div>

              {/* Quick Shop Column */}
              <div>
                <h3 className="text-white font-bold text-base mb-5 uppercase tracking-wide">
                  Quick Shop
                </h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <LocalizedClientLink
                      href="/sunglasses"
                      className="text-gray-400 hover:text-white transition-colors inline-block"
                    >
                      Shop sunglasses
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink
                      href="/sunglasses/men"
                      className="text-gray-400 hover:text-white transition-colors inline-block"
                    >
                      Sunglasses for Men
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink
                      href="/sunglasses/women"
                      className="text-gray-400 hover:text-white transition-colors inline-block"
                    >
                      Sunglasses for Women
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink
                      href="/sunglasses/kids"
                      className="text-gray-400 hover:text-white transition-colors inline-block"
                    >
                      Kids Sunglasses
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink
                      href="/glasses"
                      className="text-gray-400 hover:text-white transition-colors inline-block"
                    >
                      Shop Glasses Frames
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink
                      href="/glasses/men"
                      className="text-gray-400 hover:text-white transition-colors inline-block"
                    >
                      Glasses for Men
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink
                      href="/glasses/women"
                      className="text-gray-400 hover:text-white transition-colors inline-block"
                    >
                      Glasses for Women
                    </LocalizedClientLink>
                  </li>
                </ul>
              </div>

              {/* Newsletter & Quick Links Column */}
              <div>
                {/* Newsletter Sign Up */}
                <div className="mb-8">
                  <h3 className="text-white font-bold text-base mb-4 uppercase tracking-wide">
                    Newsletter
                  </h3>
                  <p className="text-sm mb-5 text-gray-400">
                    Sign up for new arrivals, offers, and more!
                  </p>
                  <form
                    onSubmit={handleNewsletterSubmit}
                    className="flex flex-col sm:flex-row gap-0"
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-l text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all text-sm"
                    />
                    <button
                      type="submit"
                      className="bg-white hover:bg-gray-100 text-black font-semibold py-3 px-6 rounded-r transition-colors uppercase text-xs whitespace-nowrap tracking-wider"
                    >
                      Subscribe
                    </button>
                  </form>
                </div>

                {/* Quick Links */}
                <div>
                  <h3 className="text-white font-bold text-base mb-5 uppercase tracking-wide">
                    Quick Links
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li>
                      <LocalizedClientLink
                        href="/account"
                        className="text-gray-400 hover:text-white transition-colors inline-block"
                      >
                        My Account
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink
                        href="/wishlist"
                        className="text-gray-400 hover:text-white transition-colors inline-block"
                      >
                        Wishlist
                      </LocalizedClientLink>
                    </li>
                    <li>
                      <LocalizedClientLink
                        href="/track-order"
                        className="text-gray-400 hover:text-white transition-colors inline-block"
                      >
                        Track Your Order
                      </LocalizedClientLink>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800"></div>

          {/* Bottom Bar */}
          <div className="py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 relative">
              <p className="text-gray-500 text-xs sm:text-sm text-center sm:text-left">
                Copyright © 2025 Luxuryeyewear.In All Rights Reserved.
              </p>
              <button
                onClick={scrollToTop}
                className="w-10 h-10 rounded-full bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 flex items-center justify-center transition-all group"
                aria-label="Scroll to top"
              >
                <IoArrowUp
                  className="text-white group-hover:text-white transition-colors"
                  size={20}
                />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer
