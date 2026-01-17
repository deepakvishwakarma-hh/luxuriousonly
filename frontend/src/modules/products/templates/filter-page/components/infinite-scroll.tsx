"use client"

import { useRef, useEffect } from "react"

type InfiniteScrollProps = {
  onLoadMore: () => void
  isLoading: boolean
  hasMore: boolean
  children: React.ReactNode
}

export default function InfiniteScroll({
  onLoadMore,
  isLoading,
  hasMore,
  children,
}: InfiniteScrollProps) {
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const target = observerTarget.current
    if (!target) return

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && !isLoading && hasMore) {
        onLoadMore()
      }
    }

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
    })

    observer.observe(target)

    return () => {
      observer.unobserve(target)
    }
  }, [onLoadMore, isLoading, hasMore])

  return (
    <div>
      {children}
      <div ref={observerTarget} className="py-8 text-center">
        {isLoading && <p className="text-ui-fg-subtle">Loading more products...</p>}
      </div>
    </div>
  )
}
