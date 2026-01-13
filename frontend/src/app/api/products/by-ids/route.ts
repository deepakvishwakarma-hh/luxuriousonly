import { NextRequest, NextResponse } from "next/server"
import { getProductsByIds } from "@lib/data/products"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const idsParam = searchParams.get("ids")
    const countryCode = searchParams.get("countryCode")
    const regionId = searchParams.get("regionId")

    if (!idsParam) {
      return NextResponse.json(
        { error: "Product IDs are required" },
        { status: 400 }
      )
    }

    if (!countryCode && !regionId) {
      return NextResponse.json(
        { error: "Country code or region ID is required" },
        { status: 400 }
      )
    }

    let productIds: string[]
    try {
      productIds = JSON.parse(idsParam)
      if (!Array.isArray(productIds) || productIds.length === 0) {
        return NextResponse.json({ products: [] })
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid product IDs format" },
        { status: 400 }
      )
    }

    const products = await getProductsByIds({
      productIds,
      countryCode: countryCode || undefined,
      regionId: regionId || undefined,
    })

    return NextResponse.json({ products })
  } catch (error: any) {
    console.error("[GET /api/products/by-ids] Error:", error)
    return NextResponse.json(
      {
        error: error?.message || "Failed to fetch products",
      },
      { status: error?.status || 500 }
    )
  }
}
