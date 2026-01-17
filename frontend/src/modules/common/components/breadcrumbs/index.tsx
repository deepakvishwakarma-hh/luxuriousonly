import Link from "next/link"

type BreadcrumbItem = {
  label: string
  href?: string // if no href => it's the current page (not clickable)
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`text-sm text-gray-300 flex items-center justify-center gap-2 ${className}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={index} className="flex items-center gap-2">
            {!isLast && item.href ? (
              <Link href={item.href} className="hover:text-white transition">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-white font-medium" : ""}>
                {item.label}
              </span>
            )}

            {!isLast && <span className="text-gray-500">/</span>}
          </div>
        )
      })}
    </nav>
  )
}
