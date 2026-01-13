"use client"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"
import RecentlyViewedProducts from "../recently-viewed-products"
import { Brand } from "@lib/data/brands"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
  region: HttpTypes.StoreRegion
  visibleFields?: string[]
  brand?: Brand | null
}

type ProductTabProps = {
  product: HttpTypes.StoreProduct
  visibleFields?: string[]
  brand?: Brand | null
}

const ProductTabs = ({
  product,
  countryCode,
  region,
  visibleFields,
  brand,
}: ProductTabsProps) => {
  const tabs = [
    {
      label: "Product Details",
      component: (
        <ProductInfoTab
          product={product}
          visibleFields={visibleFields}
          brand={brand}
        />
      ),
    },

    {
      label: "Product Description",
      component: <ProductDescriptionTab product={product} />,
    },
    {
      label: "Recently Viewed Products",
      component: (
        <RecentlyViewedProducts
          currentProductId={product.id}
          countryCode={countryCode}
        />
      ),
    },
  ]

  return (
    <div className="w-full mt-3">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product, visibleFields, brand }: ProductTabProps) => {
  const formatKey = (key: string): string => {
    const raw = key.includes(".") ? key.split(".").slice(-1)[0] : key
    return raw
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "-"
    if (typeof value === "boolean") return value ? "Yes" : "No"
    if (Array.isArray(value)) return value.join(", ")
    if (typeof value === "object") return JSON.stringify(value, null, 2)
    return String(value)
  }

  const resolveKey = (obj: any, key: string, brand?: Brand | null) => {
    // if brand field requested, prefer provided brand prop, then product.brand fallback
    if (key === "brand") {
      if (brand && brand.name) return brand.name
      if (Object.prototype.hasOwnProperty.call(obj, "brand")) {
        const prodBrand = obj["brand"]
        if (prodBrand && typeof prodBrand === "object")
          return prodBrand.name || prodBrand
        return prodBrand
      }
    }

    // support nested keys with dot notation
    if (key.includes(".")) {
      return key.split(".").reduce((acc: any, part: string) => {
        if (acc === undefined || acc === null) return undefined
        return acc[part]
      }, obj)
    }

    // direct property on product
    if (Object.prototype.hasOwnProperty.call(obj, key)) return obj[key]

    // fallback to metadata
    if (obj.metadata && Object.prototype.hasOwnProperty.call(obj.metadata, key))
      return obj.metadata[key]

    return undefined
  }

  // If visibleFields provided, render only those. Otherwise fall back to showing all metadata entries.
  const fieldsToRender =
    visibleFields && visibleFields.length > 0
      ? visibleFields.map((k) => ({
          key: formatKey(k),
          value: formatValue(resolveKey(product, k, brand)),
        }))
      : product.metadata
      ? Object.entries(product.metadata).map(([key, value]) => ({
          key: formatKey(key),
          value: formatValue(value),
        }))
      : []

  return (
    <div className="text-small-regular border border-gray-200">
      <div className="flex flex-col">
        {fieldsToRender.map((field, index) => (
          <div key={index} className="flex flex-row gap-4 even:border-y">
            <span className="font-semibold min-w-[50%] p-2">{field.key}</span>
            <span className="text-ui-fg-base border-l p-2">{field.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
const ProductDescriptionTab = ({ product }: ProductTabProps) => {
  return (
    <div className="text-sm text-gray-700 py-8">
      <p>{product.description}</p>
    </div>
  )
}

export default ProductTabs
