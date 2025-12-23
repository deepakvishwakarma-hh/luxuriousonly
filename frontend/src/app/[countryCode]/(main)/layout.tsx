import { Metadata } from "next"

import { getBaseURL } from "@lib/util/env"
import { listCartOptions, retrieveCart } from "@lib/data/cart"
// import Aside from "@modules/layout/templates/aside"
import { retrieveCustomer } from "@lib/data/customer"
import { StoreCartShippingOption } from "@medusajs/types"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import CategoryNavigation from "@modules/layout/templates/category-nav"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  const customer = await retrieveCustomer()
  const cart = await retrieveCart()
  let shippingOptions: StoreCartShippingOption[] = []

  if (cart) {
    const { shipping_options } = await listCartOptions()

    shippingOptions = shipping_options
  }

  return (
    <>
      <div className="w-full h-screen flex--">
        {/* <Aside /> */}

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
