"use client"

import { useState, useEffect } from "react"
import { HiOutlineMenu } from "react-icons/hi"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import WoodMartIcon from "@modules/common/icons/woodmart-icon"
import CompareButton from "@modules/layout/components/compare-button"
import LikedButton from "@modules/layout/components/liked-button"

export default function MobileMenu() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showing, setShowing] = useState(false)

  useEffect(() => {
    if (menuOpen) {
      setShowing(true)
    } else {
      const t = setTimeout(() => setShowing(false), 300)
      return () => clearTimeout(t)
    }
  }, [menuOpen])

  return (
    <>
      {/* Hamburger button */}
      <button
        className="md:hidden"
        onClick={() => setMenuOpen((s) => !s)}
        aria-label="Toggle Menu"
      >
        <HiOutlineMenu size={24} />
      </button>

      {/* Mobile Menu Overlay (always mounted while animating) */}
      {/** Use `showing` to keep the overlay mounted during close animation */}
      {showing && (
        <div
          className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMenuOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`absolute left-0 top-0 h-full w-[80%] max-w-sm bg-white p-5 shadow-lg transform transition-transform duration-300 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            {/* NOTE: removed top X close button per design */}

            {/* NAV LINKS */}
            <div className="flex flex-col text-sm">
              <LocalizedClientLink href="/" onClick={() => setMenuOpen(false)} className="py-4 border-b border-gray-200">
                SUNGLASSES
              </LocalizedClientLink>

              <LocalizedClientLink href="/store" onClick={() => setMenuOpen(false)} className="py-4 border-b border-gray-200">
                EYEGLASSES
              </LocalizedClientLink>

              <LocalizedClientLink href="/collections" onClick={() => setMenuOpen(false)} className="py-4 border-b border-gray-200">
                SHOP BY BRAND
              </LocalizedClientLink>

              <LocalizedClientLink href="/cart" onClick={() => setMenuOpen(false)} className="py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <WoodMartIcon iconContent="f126" size={20} />
                  <span className="text-sm font-semibold">CART</span>
                </div>
              </LocalizedClientLink>

              <LikedButton asMenuItem label="WISHLIST" />

              <CompareButton asMenuItem label="COMPARE" />

              <LocalizedClientLink href="/account" onClick={() => setMenuOpen(false)} className="py-4 border-b border-gray-200 flex items-center gap-3">
                <span>👤</span>
                <span className="text-sm font-semibold">LOGIN / REGISTER</span>
              </LocalizedClientLink>

            </div>
          </div>
        </div>
      )}
    </>
  )
}

