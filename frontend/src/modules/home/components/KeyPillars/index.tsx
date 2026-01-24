"use client"

import { FiRefreshCw, FiTruck, FiGrid } from "react-icons/fi"

const pillars = [
  {
    title: "Easy Exchanges",
    description:
      "Returns and exchanges are easy and worry-free — just the way they should be.",
    icon: FiRefreshCw,
  },
  {
    title: "Free Shipping",
    description:
      "Free shipping on eligible orders. Exclusions apply. We deliver to PO boxes.",
    icon: FiTruck,
  },
  {
    title: "Largest Catalog",
    description:
      "Discover branded eyewear across all price tiers — the widest selection online.",
    icon: FiGrid,
  },
]

export default function KeyPillars() {
  return (
    <div className="w-full max-w-8xl mx-auto px-5 py-6">
      <div
        className="
          grid grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          gap-4
        "
      >
        {pillars.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.title}
              className="
                bg-[#f7f3ea]
                rounded-xl
                p-6
                flex
                flex-col
                items-center
                text-center
                transition
                hover:shadow-md
              "
            >
              {/* Icon */}
              <div className="mb-4">
                <Icon className="w-8 h-8 text-gray-700" />
              </div>

              {/* Title */}
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
