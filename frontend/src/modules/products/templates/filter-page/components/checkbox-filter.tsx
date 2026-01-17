"use client"

import { useState } from "react"
import AccordionFilter from "./accordion-filter"

type CheckboxFilterProps = {
  label: string
  options: Array<{ id?: string; name: string; slug?: string } | string>
  selectedValues: string[]
  onChange: (value: string) => void
  getValue: (option: Array<{ id?: string; name: string; slug?: string } | string>[number]) => string
  getLabel: (option: Array<{ id?: string; name: string; slug?: string } | string>[number]) => string
}

export default function CheckboxFilter({
  label,
  options,
  selectedValues,
  onChange,
  getValue,
  getLabel,
}: CheckboxFilterProps) {
  if (!options || options.length === 0) return null

  const hasSelectedValues = selectedValues.length > 0

  return (
    <AccordionFilter label={label} hasSelectedValues={hasSelectedValues}>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {options.map((option) => {
          const value = getValue(option)
          const optionLabel = getLabel(option)
          const key = typeof option === "string" ? option : option.id || value
          const isChecked = selectedValues.includes(value)

          return (
            <label
              key={key}
              className="flex items-center cursor-pointer group hover:bg-gray-50 px-2 py-1.5 rounded-md transition-colors"
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => {
                  e.preventDefault()
                  onChange(value)
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(value)
                }}
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-2 focus:ring-black focus:ring-offset-0 cursor-pointer accent-black"
              />
              <span className={`ml-3 text-sm flex-1 ${
                isChecked ? "text-gray-900 font-medium" : "text-gray-600"
              }`}>
                {optionLabel}
              </span>
            </label>
          )
        })}
      </div>
    </AccordionFilter>
  )
}


