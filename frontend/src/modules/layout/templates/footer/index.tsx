"use client"

import { useState } from "react"
import { FaEnvelope } from "react-icons/fa"
import { IoArrowUp, IoChevronDown } from "react-icons/io5"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { websiteConfig } from "@lib/website.config"
import useToggleState from "@lib/hooks/use-toggle-state"

const Footer = () => {
  const [email, setEmail] = useState("")

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEmail("")
  }

  // Mobile accordion states
  const informationState = useToggleState(false)
  const popularBrandsState = useToggleState(false)
  const quickShopState = useToggleState(false)
  const quickLinksState = useToggleState(false)

  return (
    <footer className="w-full bg-black text-white">
      <div className="max-w-8xl mx-auto px-5">
        {/* ================= TOP SECTION ================= */}
        <div className="py-8 lg:py-12 border-b border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* LEFT: Brand & About Content */}
            <div>
              <h2 className="text-3xl font-bold uppercase mb-2 font-urbanist">
                {websiteConfig.shortName}
              </h2>
              <div className="h-px bg-gray-700 w-16 mb-3"></div>

              {/* About Content */}
              <p className="text-sm leading-relaxed mb-4 text-white">
                {websiteConfig.company.description}
              </p>

              <div className="space-y-3">
                <a
                  href={websiteConfig.contact.emailLink}
                  className="flex items-center gap-3 text-white hover:text-gray-300"
                >
                  <FaEnvelope size={14} />
                  <span className="text-sm">{websiteConfig.contact.email}</span>
                </a>
              </div>
            </div>

            {/* RIGHT: Newsletter */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4 font-urbanist">
                Subscribe for exclusive offers
              </h3>
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex gap-0 mb-3"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-4 py-3 text-sm bg-transparent border border-white text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button
                  type="submit"
                  className="px-6 py-3 text-sm font-semibold bg-white text-black hover:bg-gray-100 transition-colors"
                >
                  Subscribe
                </button>
              </form>
              <p className="text-xs text-gray-400">
                By subscribing you agree with our{" "}
                <LocalizedClientLink
                  href="/privacy-policy"
                  className="underline hover:text-white"
                >
                  Privacy Policy
                </LocalizedClientLink>
              </p>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM SECTION ================= */}
        <div className="py-8 lg:py-12">
          {/* Desktop: Grid Layout */}
          <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* INFORMATION */}
            <div>
              <h4 className="text-gray-400 font-semibold text-sm mb-4 uppercase font-urbanist">
                Information
              </h4>
              <ul className="space-y-2 text-sm">
                {[
                  ["About us", "/about-us"],
                  ["Contact us", "/contact-us"],
                  ["Return & Refund Policy", "/return-refund-policy"],
                  ["Delivery & Shipping", "/delivery-shipping"],
                  ["Privacy Policy", "/privacy-policy"],
                  ["Terms & Conditions", "/terms-conditions"],
                ].map(([label, link]) => (
                  <li key={link}>
                    <LocalizedClientLink
                      href={link}
                      className="text-white hover:text-gray-300"
                    >
                      {label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* POPULAR BRANDS */}
            <div>
              <h4 className="text-gray-400 font-semibold text-sm mb-4 uppercase font-urbanist">
                Popular Brands
              </h4>
              <ul className="space-y-2 text-sm">
                {[
                  "Burberry",
                  "Carrera",
                  "Gucci",
                  "Ic Berlin",
                  "Tom Ford",
                  "Versace",
                ].map((brand) => (
                  <li key={brand}>
                    <LocalizedClientLink
                      href={`/brands/${brand.toLowerCase().replace(" ", "-")}`}
                      className="text-white hover:text-gray-300"
                    >
                      {brand} Glasses
                    </LocalizedClientLink>
                  </li>
                ))}
                <li>
                  <LocalizedClientLink
                    href="/brands"
                    className="font-medium text-gray-300 hover:text-white"
                  >
                    View All Brands →
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            {/* QUICK SHOP */}
            <div>
              <h4 className="text-gray-400 font-semibold text-sm mb-4 uppercase font-urbanist">
                Quick Shop
              </h4>
              <ul className="space-y-2 text-sm">
                {[
                  ["Shop Sunglasses", "/sunglasses"],
                  ["Men Sunglasses", "/sunglasses/men"],
                  ["Women Sunglasses", "/sunglasses/women"],
                  ["Kids Sunglasses", "/sunglasses/kids"],
                  ["Shop Glasses", "/glasses"],
                  ["Men Glasses", "/glasses/men"],
                  ["Women Glasses", "/glasses/women"],
                ].map(([label, link]) => (
                  <li key={link}>
                    <LocalizedClientLink
                      href={link}
                      className="text-white hover:text-gray-300"
                    >
                      {label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* QUICK LINKS */}
            <div>
              <h4 className="text-gray-400 font-semibold text-sm mb-4 uppercase font-urbanist">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <LocalizedClientLink href="/account" className="text-white hover:text-gray-300">
                    My Account
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/wishlist" className="text-white hover:text-gray-300">
                    Wishlist
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/track-order" className="text-white hover:text-gray-300">
                    Track Order
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
          </div>

          {/* Mobile: Accordion Layout */}
          <div className="lg:hidden space-y-4">
            {/* Information Accordion */}
            <div className="border-b border-gray-800 pb-4">
              <button
                onClick={informationState.toggle}
                className="w-full flex items-center justify-between text-left"
              >
                <h4 className="text-gray-400 font-semibold text-sm uppercase font-urbanist">
                  Information
                </h4>
                <IoChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${informationState.state ? "rotate-180" : ""
                    }`}
                />
              </button>
              {informationState.state && (
                <ul className="mt-4 space-y-2 text-sm">
                  {[
                    ["About us", "/about-us"],
                    ["Contact us", "/contact-us"],
                    ["Return & Refund Policy", "/return-refund-policy"],
                    ["Delivery & Shipping", "/delivery-shipping"],
                    ["Privacy Policy", "/privacy-policy"],
                    ["Terms & Conditions", "/terms-conditions"],
                  ].map(([label, link]) => (
                    <li key={link}>
                      <LocalizedClientLink
                        href={link}
                        className="text-white hover:text-gray-300"
                      >
                        {label}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Popular Brands Accordion */}
            <div className="border-b border-gray-800 pb-4">
              <button
                onClick={popularBrandsState.toggle}
                className="w-full flex items-center justify-between text-left"
              >
                <h4 className="text-gray-400 font-semibold text-sm uppercase font-urbanist">
                  Popular Brands
                </h4>
                <IoChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${popularBrandsState.state ? "rotate-180" : ""
                    }`}
                />
              </button>
              {popularBrandsState.state && (
                <ul className="mt-4 space-y-2 text-sm">
                  {[
                    "Burberry",
                    "Carrera",
                    "Gucci",
                    "Ic Berlin",
                    "Tom Ford",
                    "Versace",
                  ].map((brand) => (
                    <li key={brand}>
                      <LocalizedClientLink
                        href={`/brands/${brand.toLowerCase().replace(" ", "-")}`}
                        className="text-white hover:text-gray-300"
                      >
                        {brand} Glasses
                      </LocalizedClientLink>
                    </li>
                  ))}
                  <li>
                    <LocalizedClientLink
                      href="/brands"
                      className="font-medium text-gray-300 hover:text-white"
                    >
                      View All Brands →
                    </LocalizedClientLink>
                  </li>
                </ul>
              )}
            </div>

            {/* Quick Shop Accordion */}
            <div className="border-b border-gray-800 pb-4">
              <button
                onClick={quickShopState.toggle}
                className="w-full flex items-center justify-between text-left"
              >
                <h4 className="text-gray-400 font-semibold text-sm uppercase font-urbanist">
                  Quick Shop
                </h4>
                <IoChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${quickShopState.state ? "rotate-180" : ""
                    }`}
                />
              </button>
              {quickShopState.state && (
                <ul className="mt-4 space-y-2 text-sm">
                  {[
                    ["Shop Sunglasses", "/sunglasses"],
                    ["Men Sunglasses", "/sunglasses/men"],
                    ["Women Sunglasses", "/sunglasses/women"],
                    ["Kids Sunglasses", "/sunglasses/kids"],
                    ["Shop Glasses", "/glasses"],
                    ["Men Glasses", "/glasses/men"],
                    ["Women Glasses", "/glasses/women"],
                  ].map(([label, link]) => (
                    <li key={link}>
                      <LocalizedClientLink
                        href={link}
                        className="text-white hover:text-gray-300"
                      >
                        {label}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Quick Links Accordion */}
            <div className="border-b border-gray-800 pb-4">
              <button
                onClick={quickLinksState.toggle}
                className="w-full flex items-center justify-between text-left"
              >
                <h4 className="text-gray-400 font-semibold text-sm uppercase font-urbanist">
                  Quick Links
                </h4>
                <IoChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${quickLinksState.state ? "rotate-180" : ""
                    }`}
                />
              </button>
              {quickLinksState.state && (
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <LocalizedClientLink href="/account" className="text-white hover:text-gray-300">
                      My Account
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink href="/wishlist" className="text-white hover:text-gray-300">
                      Wishlist
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink href="/track-order" className="text-white hover:text-gray-300">
                      Track Order
                    </LocalizedClientLink>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* ================= COPYRIGHT BAR ================= */}
        <div className="border-t border-gray-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative">
          <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
            {websiteConfig.company.copyright}
          </p>

          {/* Scroll to Top Button */}
          <button
            onClick={scrollToTop}
            className="w-10 h-10 rounded-full border border-gray-700 bg-black flex items-center justify-center hover:bg-gray-900 transition-colors absolute right-0 bottom-6 sm:relative sm:bottom-0"
            aria-label="Scroll to top"
          >
            <IoArrowUp className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer
