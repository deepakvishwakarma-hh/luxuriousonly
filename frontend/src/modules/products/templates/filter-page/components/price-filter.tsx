"use client"

import { Range, getTrackBackground } from "react-range"

type PriceFilterProps = {
  priceRange: { min: number; max: number }
  priceValues: number[]
  onPriceChange: (min: number, max: number) => void
}

export default function PriceFilter({
  priceRange,
  priceValues,
  onPriceChange,
}: PriceFilterProps) {
  return (
    <div className="pb-6 border-b border-gray-200">
      <label className="block text-sm font-medium mb-4 text-gray-700">
        Price
      </label>
      <div className="px-2">
        <Range
          values={priceValues}
          step={1}
          min={priceRange.min}
          max={priceRange.max}
          onChange={(values) => {
            // Ensure min is always <= max
            const [min, max] =
              values[0] <= values[1]
                ? [values[0], values[1]]
                : [values[1], values[0]]

            onPriceChange(min, max)
          }}
          renderTrack={({ props, children }) => {
            const { key, ...restProps } = props as any
            return (
              <div
                key={key}
                {...restProps}
                style={{
                  ...restProps.style,
                  height: "8px",
                  width: "100%",
                  background: getTrackBackground({
                    values: priceValues,
                    colors: ["#e5e7eb", "#000", "#e5e7eb"],
                    min: priceRange.min,
                    max: priceRange.max,
                  }),
                  borderRadius: "0px",
                }}
              >
                {children}
              </div>
            )
          }}
          renderThumb={({ props, index }) => {
            const { key, ...restProps } = props as any
            return (
              <div
                key={key}
                {...restProps}
                style={{
                  ...restProps.style,
                  height: "24px",
                  width: "4px",
                  borderRadius: "0px",
                  backgroundColor: "#000",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  outline: "none",
                }}
              />
            )
          }}
        />
        <div className="mt-4 text-sm text-gray-400">
          Price: ${priceValues[0].toFixed(0)} — ${priceValues[1].toFixed(0)}
        </div>
      </div>
    </div>
  )
}

