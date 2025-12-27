"use client"

import { useState, Fragment } from "react"
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import { useParams, usePathname } from "next/navigation"
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

  if (!customer) {
    return (
      <LocalizedClientLink
        href="/account"
        className="hover:text-ui-fg-base uppercase  font-bold text-ui-fg-base
        text-[13px]
        "
      >
        LOGIN / REGISTER
      </LocalizedClientLink>
    )
  }

  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
          <PopoverButton className="flex items-center gap-2 hover:text-ui-fg-base text-small-regular">
            <span>My Account</span>
            <ChevronDown
              className={`transform transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </PopoverButton>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <PopoverPanel className="absolute right-0 top-full mt-2 w-56 bg-white border border-ui-border-base rounded-md shadow-lg z-50">
              <div className="py-2">
                <LocalizedClientLink
                  href="/account"
                  onClick={close}
                  className={`flex items-center gap-2 px-4 py-2 hover:bg-ui-bg-subtle ${
                    pathname?.includes("/account") &&
                    !pathname?.includes("/account/profile") &&
                    !pathname?.includes("/account/addresses") &&
                    !pathname?.includes("/account/orders")
                      ? "bg-ui-bg-subtle font-semibold"
                      : ""
                  }`}
                >
                  <User size={16} />
                  <span>Overview</span>
                </LocalizedClientLink>
                <LocalizedClientLink
                  href="/account/profile"
                  onClick={close}
                  className={`flex items-center gap-2 px-4 py-2 hover:bg-ui-bg-subtle ${
                    pathname?.includes("/account/profile")
                      ? "bg-ui-bg-subtle font-semibold"
                      : ""
                  }`}
                >
                  <User size={16} />
                  <span>Profile</span>
                </LocalizedClientLink>
                <LocalizedClientLink
                  href="/account/addresses"
                  onClick={close}
                  className={`flex items-center gap-2 px-4 py-2 hover:bg-ui-bg-subtle ${
                    pathname?.includes("/account/addresses")
                      ? "bg-ui-bg-subtle font-semibold"
                      : ""
                  }`}
                >
                  <MapPin size={16} />
                  <span>Addresses</span>
                </LocalizedClientLink>
                <LocalizedClientLink
                  href="/account/orders"
                  onClick={close}
                  className={`flex items-center gap-2 px-4 py-2 hover:bg-ui-bg-subtle ${
                    pathname?.includes("/account/orders")
                      ? "bg-ui-bg-subtle font-semibold"
                      : ""
                  }`}
                >
                  <Package size={16} />
                  <span>Orders</span>
                </LocalizedClientLink>
                <div className="border-t border-ui-border-base my-1" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-ui-bg-subtle w-full text-left text-small-regular"
                >
                  <ArrowRightOnRectangle />
                  <span>Logout</span>
                </button>
              </div>
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
