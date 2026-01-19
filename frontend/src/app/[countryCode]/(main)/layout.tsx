import { Metadata } from "next"
import { getBaseURL } from "@lib/util/env"
import Nav from "@modules/layout/templates/nav"
import { retrieveCustomer } from "@lib/data/customer"
import Footer from "@modules/layout/templates/footer"
import { StoreCartShippingOption } from "@medusajs/types"
import { listCartOptions, retrieveCart } from "@lib/data/cart"
import CategoryNavigation from "@modules/layout/templates/category-nav"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  const customer = await retrieveCustomer().catch(() => null)
  const cart = await retrieveCart().catch(() => null)
  let shippingOptions: StoreCartShippingOption[] = []

  if (cart) {
    try {
      const { shipping_options } = await listCartOptions()
      shippingOptions = shipping_options || []
    } catch (error) {
      console.error("Error fetching shipping options:", error)
      shippingOptions = []
    }
  }

  return (
    <>
      <div className="w-full h-screen flex--">
        <main className="border-dashed flex-1  ml-0 md:ml-[60px]-- w-full h-screen --overflow-y-auto overflow-x-hidden--  ">
          <Nav />
          <CategoryNavigation />
          {customer && cart && (
            <CartMismatchBanner customer={customer} cart={cart} />
          )}

          {cart && (
            <FreeShippingPriceNudge
              variant="popup"
              cart={cart}
              shippingOptions={shippingOptions}
            />
          )}
          {props.children}
          <Footer />
        </main>
      </div>
    </>
  )
}
