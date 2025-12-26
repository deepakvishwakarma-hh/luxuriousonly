"use client"

import { useState } from "react"
import { FaPhone, FaEnvelope } from "react-icons/fa"
import { IoArrowUp } from "react-icons/io5"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Footer = () => {
  const [email, setEmail] = useState("")

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEmail("")
  }

  return (
    <footer className="w-full bg-black text-gray-400">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ================= MAIN GRID ================= */}
        <div className="py-10 sm:py-14 lg:py-16">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">

            {/* ABOUT */}
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-white font-bold text-sm mb-4 uppercase">
                About
              </h3>
              <p className="text-sm leading-relaxed mb-4">
                Explore Designer Luxury Eyewear at luxuryeyewear.in. Our exclusive
                collection of premium Sunglasses, Eyeglasses & Frames offers
                unmatched quality and style.
              </p>

              <div className="space-y-3">
                <a
                  href="tel:+919871981806"
                  className="flex items-center gap-3 hover:text-white"
                >
                  <FaPhone size={14} />
                  <span className="text-sm">+91 9871981806</span>
                </a>

                <a
                  href="mailto:support@luxuryeyewear.in"
                  className="flex items-center gap-3 hover:text-white"
                >
                  <FaEnvelope size={14} />
                  <span className="text-sm">support@luxuryeyewear.in</span>
                </a>
              </div>
            </div>

            {/* INFORMATION */}
            <div>
              <h3 className="text-white font-bold text-sm mb-4 uppercase">
                Information
              </h3>
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
                      className="hover:text-white"
                    >
                      {label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* POPULAR BRANDS */}
            <div>
              <h3 className="text-white font-bold text-sm mb-4 uppercase">
                Popular Brands
              </h3>
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
                      className="hover:text-white"
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
              <h3 className="text-white font-bold text-sm mb-4 uppercase">
                Quick Shop
              </h3>
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
                      className="hover:text-white"
                    >
                      {label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* NEWSLETTER + QUICK LINKS */}
            <div>
              <h3 className="text-white font-bold text-sm mb-3 uppercase">
                Newsletter
              </h3>
              <p className="text-sm mb-4">
                Get updates on offers & new arrivals.
              </p>

              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row gap-2 mb-6"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  className="flex-1 px-3 py-2 text-sm bg-gray-900 border border-gray-700 rounded text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-white text-black rounded"
                >
                  Subscribe
                </button>
              </form>

              <h3 className="text-white font-bold text-sm mb-3 uppercase">
                Quick Links
              </h3>
              <ul className="space-y-2 text-sm">
                <li><LocalizedClientLink href="/account">My Account</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/wishlist">Wishlist</LocalizedClientLink></li>
                <li><LocalizedClientLink href="/track-order">Track Order</LocalizedClientLink></li>
              </ul>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM BAR ================= */}
        <div className="border-t border-gray-800 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-gray-500 text-center">
            © 2025 Luxuryeyewear.in — All Rights Reserved
          </p>

          <button
            onClick={scrollToTop}
            className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center hover:bg-gray-800"
          >
            <IoArrowUp size={18} />
          </button>
        </div>

      </div>
    </footer>
  )
}

export default Footer
