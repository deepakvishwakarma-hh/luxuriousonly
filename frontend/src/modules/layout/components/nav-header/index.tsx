"use client"

import { useCustomer } from "@lib/hooks/use-customer"
import AccountDropdown from "@modules/layout/components/account-dropdown"
import CompareButton from "@modules/layout/components/compare-button"
import LikedButton from "@modules/layout/components/liked-button"
import NavSearch from "@modules/layout/components/nav-search"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import WoodMartIcon from "@modules/common/icons/woodmart-icon"

type NavHeaderProps = {
  cartButton: React.ReactNode
  onToggleMobileSearch?: () => void
}

export default function NavHeader({
  cartButton,
  onToggleMobileSearch,
}: NavHeaderProps) {
  const { customer, isLoading } = useCustomer()

  return (
    <>
      {/* ================= CENTER (Desktop Search) ================= */}
      <div className="hidden md:flex flex-1 justify-center px-10">
        <NavSearch />
      </div>

      {/* ================= RIGHT ================= */}
      <div className="flex items-center gap-x-3 md:gap-x-6">
        {/* Mobile search button */}
        <button
          type="button"
          className="md:hidden p-2 rounded-md hover:bg-ui-bg-subtle transition-colors"
          onClick={onToggleMobileSearch}
          aria-label="Toggle search"
        >
          <NavSearchIcon />
        </button>

        {/* Mobile cart icon (mobile only, placed after search) */}
        <LocalizedClientLink
          href="/cart"
          className="md:hidden p-2 rounded-md hover:bg-ui-bg-subtle transition-colors"
          aria-label="Cart"
        >
          <WoodMartIcon iconContent="f126" size={20} />
        </LocalizedClientLink>

        {/* Account ONLY on desktop */}
        <div className="hidden md:block">
          <AccountDropdown customer={customer} isLoading={isLoading} />
        </div>

        {/* Compare and Liked only on md+ (hidden on small screens) */}
        <div className="hidden md:block">
          <CompareButton />
        </div>

        <div className="hidden md:block">
          <LikedButton />
        </div>

        {/* Desktop cart button */}
        <div className="hidden md:block">
          {cartButton}
        </div>
      </div>
    </>
  )
}

// Small icon wrapper so we don't import woodmart icon in several files
function NavSearchIcon() {
  const WoodMartIcon = require("@modules/common/icons/woodmart-icon").default
  return <WoodMartIcon iconContent="f130" size={20} className="text-gray-600" />
}
