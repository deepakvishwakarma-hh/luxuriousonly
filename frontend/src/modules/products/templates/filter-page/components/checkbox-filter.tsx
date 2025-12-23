"use client"

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

  return (
    <div className="pb-6 border-b border-gray-200">
      <label className="block text-sm font-medium mb-2 text-gray-700">
        {label}
      </label>
      <div className="space-y-2">
        {options.map((option) => {
          const value = getValue(option)
          const optionLabel = getLabel(option)
          const key = typeof option === "string" ? option : option.id || value

          return (
            <label key={key} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedValues.includes(value)}
                onChange={() => onChange(value)}
                className="mr-2"
              />
              <span className="text-sm text-gray-400">{optionLabel}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

