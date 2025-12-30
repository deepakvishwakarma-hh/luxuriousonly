"use client"

import { Suspense, useState } from "react"
import Image from "next/image"
import { HiOutlineMenu, HiX } from "react-icons/hi"
import { useCustomer } from "@lib/hooks/use-customer"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import NavSearch from "@modules/layout/components/nav-search"
import AccountDropdown from "@modules/layout/components/account-dropdown"
import CompareButton from "@modules/layout/components/compare-button"
import LikedButton from "@modules/layout/components/liked-button"

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { customer, isLoading } = useCustomer()

  return (
    <div className="sticky top-0 inset-x-0 z-50 bg-white border-b border-ui-border-base">
      {/* ================= HEADER ================= */}
      <header className="h-16 md:h-20">
       <nav className="relative px-4 md:px-10 flex items-center justify-between w-full h-full">
  
  {/* ================= LEFT ================= */}
  <div className="flex items-center gap-3">
    {/* Hamburger (mobile only) */}
    <button
      className="md:hidden"
      onClick={() => setMenuOpen(true)}
      aria-label="Open Menu"
    >
      <HiOutlineMenu size={24} />
    </button>

    {/* Logo (DESKTOP ONLY → LEFT SIDE) */}
    <LocalizedClientLink href="/" className="hidden md:flex items-center">
      <Image
        src="/logo.avif"
        alt="Luxurious Mart"
        width={205}
        height={66}
        className="object-contain"
      />
    </LocalizedClientLink>
  </div>

      {/* ================= MOBILE CENTER LOGO ================= */}
      <LocalizedClientLink
        href="/"
        className="md:hidden absolute left-1/2 -translate-x-1/2 flex items-center"
      >
        <Image
          src="/logo.avif"
          alt="Luxurious Mart"
          width={160}
          height={50}
          className="object-contain"
        />
      </LocalizedClientLink>

      {/* ================= CENTER (Desktop Search) ================= */}
      <div className="hidden md:flex flex-1 justify-center px-10">
        <NavSearch />
      </div>

      {/* ================= RIGHT ================= */}
      <div className="flex items-center gap-x-3 md:gap-x-6">
        {/* Account ONLY on desktop */}
        <div className="hidden md:block">
          <AccountDropdown customer={customer} isLoading={isLoading} />
        </div>

        <div className="hidden sm:block">
          <CompareButton />
        </div>

        <LikedButton />

        <Suspense fallback={<span className="text-sm">Cart (0)</span>}>
          <CartButton />
        </Suspense>
      </div>
    </nav>

      </header>

      {/* Mobile Search */}
      <div className="px-4 pb-3 md:hidden">
        <NavSearch />
      </div>

      {/* ================= HAMBURGER MENU ================= */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="absolute left-0 top-0 h-full w-[80%] max-w-sm bg-white p-5 shadow-lg">
            
            {/* Close */}
            <button className="mb-6" onClick={() => setMenuOpen(false)}>
              <HiX size={24} />
            </button>

            {/* LOGIN / REGISTER INSIDE MENU */}
            <div className="mb-6">
              <AccountDropdown customer={customer} isLoading={isLoading} />
            </div>

            {/* NAV LINKS */}
            <div className="flex flex-col gap-4 text-sm">
              <LocalizedClientLink href="/" onClick={() => setMenuOpen(false)}>
                Home
              </LocalizedClientLink>

              <LocalizedClientLink href="/store" onClick={() => setMenuOpen(false)}>
                Shop
              </LocalizedClientLink>

              <LocalizedClientLink href="/collections" onClick={() => setMenuOpen(false)}>
                Collections
              </LocalizedClientLink>

              <LocalizedClientLink href="/about" onClick={() => setMenuOpen(false)}>
                About Us
              </LocalizedClientLink>

              <LocalizedClientLink href="/contact" onClick={() => setMenuOpen(false)}>
                Contact
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
