"use client"

import { useState, Fragment } from "react"
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { ArrowRightOnRectangle } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"
import User from "@modules/common/icons/user"
import MapPin from "@modules/common/icons/map-pin"
import Package from "@modules/common/icons/package"
import Spinner from "@modules/common/icons/spinner"
import { HttpTypes } from "@medusajs/types"
import { signout } from "@lib/data/customer"

type AccountDropdownProps = {
  customer: HttpTypes.StoreCustomer | null
  isLoading?: boolean
}

export default function AccountDropdown({ customer, isLoading = false }: AccountDropdownProps) {
  const { countryCode } = useParams() as { countryCode: string }
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await signout(countryCode)
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Spinner size={16} />
        <span className="text-small-regular text-ui-fg-subtle">Loading...</span>
      </div>
    )
  }

  // When logged in, show account icon that redirects to /account
  if (customer) {
    return (
      <button
        onClick={() => router.push(`/${countryCode}/account`)}
        className="flex items-center justify-center p-2 hover:bg-ui-bg-subtle rounded-md transition-colors"
        aria-label="Go to account"
        title="Account"
      >
        <User size={20} />
      </button>
    )
  }

  // Not logged in - show login link
  return (
    <LocalizedClientLink
      href="/account"
      className="hover:text-ui-fg-base flex items-center relative"
    >
      <User size={20} />
    </LocalizedClientLink>
  )
}
