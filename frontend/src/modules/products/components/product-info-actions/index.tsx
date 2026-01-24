"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@medusajs/ui"
import Modal from "@modules/common/components/modal"
import useToggleState from "@lib/hooks/use-toggle-state"
import WoodMartIcon from "@modules/common/icons/woodmart-icon"
import { sdk } from "@lib/config"
import { FiShare2, FiCopy } from "react-icons/fi"
import { FaFacebookF, FaTwitter, FaWhatsapp } from "react-icons/fa"
import { HttpTypes } from "@medusajs/types"

type ProductInfoActionsProps = {
  productId: string
  product?: HttpTypes.StoreProduct
}

const ProductInfoActions = ({ productId, product }: ProductInfoActionsProps) => {
  const sizeGuideState = useToggleState(false)
  const deliveryReturnState = useToggleState(false)
  const askQuestionState = useToggleState(false)

  // Get size chart data from product metadata
  const lensWidth = product?.metadata?.lens_width ? String(product.metadata.lens_width) : null
  const lensBridge = product?.metadata?.lens_bridge ? String(product.metadata.lens_bridge) : null
  const armLength = product?.metadata?.arm_length ? String(product.metadata.arm_length) : null

  // Modal state for the Share popup
  const [shareModalOpen, setShareModalOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false) 
  const [hasNativeShare, setHasNativeShare] = React.useState(false)

  const currentUrl = typeof window !== "undefined" ? window.location.href : ""

  // Check for native share support only on client side
  useEffect(() => {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      setHasNativeShare(true)
    }
  }, [])

  const handleCopyLink = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      console.error("Clipboard API not available")
      return
    }
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      // close the share modal after copying
      setShareModalOpen(false)
    } catch (e) {
      console.error("Copy failed", e)
    }
  }

  const handleShareNative = async () => {
    if (typeof navigator === "undefined" || !(navigator as any).share) {
      // fallback: keep modal open for manual share options
      setShareModalOpen(true)
      return
    }
    try {
      await (navigator as any).share({ 
        title: typeof document !== "undefined" ? document.title : "", 
        url: currentUrl 
      })
      setShareModalOpen(false)
    } catch (e) {
      console.error("Share failed", e)
    }
  }

  const openPopup = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=600")
    setShareModalOpen(false)
  }

  return (
    <div className="flex flex-wrap gap-3 mt-4 relative">
  <div className="flex flex-wrap gap-3 mt-4">
  <Button
    variant="transparent"
    onClick={sizeGuideState.open}
    className="text-sm flex items-center gap-2 bg-gray-50 border border-gray-400 rounded-md px-3 py-2 hover:bg-gray-200 transition-colors whitespace-nowrap"
  >
    <WoodMartIcon iconContent="f13f" size={16} />
    Size Guide
  </Button>

  <Button
    variant="transparent"
    onClick={deliveryReturnState.open}
    className="text-sm flex items-center gap-2 bg-gray-50 border border-gray-400 rounded-md px-3 py-2 hover:bg-gray-200 transition-colors whitespace-nowrap"
  >
    <WoodMartIcon iconContent="f123" size={16} />
    Delivery & Return
  </Button>

  <Button
    variant="transparent"
    onClick={askQuestionState.open}
    className="text-sm flex items-center gap-2 bg-gray-50 border border-gray-400 rounded-md px-3 py-2 hover:bg-gray-200 transition-colors whitespace-nowrap"
  >
    <WoodMartIcon iconContent="f128" size={16} />
    Ask a Question
  </Button>

  <Button
    variant="transparent"
    onClick={() => setShareModalOpen(true)}
    className="text-sm flex items-center gap-2 bg-gray-50 border border-gray-400 rounded-md px-3 py-2 hover:bg-gray-200 transition-colors whitespace-nowrap"
    aria-expanded={shareModalOpen}
    aria-haspopup="dialog"
  >
    <FiShare2 className="w-4 h-4" aria-hidden />
    Share
  </Button>



        <Modal isOpen={shareModalOpen} close={() => setShareModalOpen(false)} size="small">
          <Modal.Title>Share</Modal.Title>
          <Modal.Body>
            <div className="grid gap-3">
              <button
                className="w-full text-left px-4 py-3 rounded hover:bg-gray-50 flex items-center gap-4 border border-gray-100"
                onClick={() => openPopup(`https://wa.me/?text=${encodeURIComponent(currentUrl)}`)}
                aria-label="Share on WhatsApp"
              >
                <FaWhatsapp className="w-6 h-6 text-green-600" aria-hidden />
                <div>
                  <div className="text-sm font-medium">WhatsApp</div>
                  <div className="text-xs text-ui-fg-subtle">Share via WhatsApp</div>
                </div>
              </button>

              <button
                className="w-full text-left px-4 py-3 rounded hover:bg-gray-50 flex items-center gap-4 border border-gray-100"
                onClick={() => openPopup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`)}
                aria-label="Share on Facebook"
              >
                <FaFacebookF className="w-6 h-6 text-blue-600" aria-hidden />
                <div>
                  <div className="text-sm font-medium">Facebook</div>
                  <div className="text-xs text-ui-fg-subtle">Share on Facebook</div>
                </div>
              </button>

              <button
                className="w-full text-left px-4 py-3 rounded hover:bg-gray-50 flex items-center gap-4 border border-gray-100"
                onClick={() => openPopup(`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`)}
                aria-label="Share on Twitter"
              >
                <FaTwitter className="w-6 h-6 text-sky-500" aria-hidden />
                <div>
                  <div className="text-sm font-medium">Twitter</div>
                  <div className="text-xs text-ui-fg-subtle">Post a Tweet</div>
                </div>
              </button>

              <button
                className="w-full text-left px-4 py-3 rounded hover:bg-gray-50 flex items-center gap-4 border border-gray-100"
                onClick={handleCopyLink}
                aria-label="Copy link"
              >
                <FiCopy className="w-6 h-6 text-ui-fg-subtle" aria-hidden />
                <div>
                  <div className="text-sm font-medium">{copied ? "Copied!" : "Copy link"}</div>
                  <div className="text-xs text-ui-fg-subtle">Copy product URL to clipboard</div>
                </div>
              </button>

              {hasNativeShare && (
                <button
                  className="w-full text-left px-4 py-3 rounded hover:bg-gray-50 flex items-center gap-4 border border-gray-100"
                  onClick={handleShareNative}
                  aria-label="Share"
                >
                  <FiShare2 className="w-6 h-6" aria-hidden />
                  <div>
                    <div className="text-sm font-medium">Share...</div>
                    <div className="text-xs text-ui-fg-subtle">Use your device's share dialog</div>
                  </div>
                </button>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShareModalOpen(false)}>Close</Button>
          </Modal.Footer>
        </Modal>

      </div>

      {/* Size Guide Modal */}      <Modal
        isOpen={sizeGuideState.state}
        close={sizeGuideState.close}
        size="large"
      >
        <Modal.Title>Size Guide</Modal.Title>
        <Modal.Body>
          <div className="w-full py-6">
            <div className="flex flex-row gap-4 justify-center items-stretch">
              <div className="flex-1 flex flex-col border border-gray-300 rounded p-4">
                <div className="flex-1 flex items-center justify-center mb-3">
                  <img
                    src="/images/size-chart/lens-width.webp"
                    alt="Lens Width Size Chart"
                    className="w-full h-auto object-contain max-h-full"
                  />
                </div>
                <h3 className="text-sm font-semibold text-center text-ui-fg-base">
                  Lens Width: {lensWidth || "N/A"}
                </h3>
              </div>
              <div className="flex-1 flex flex-col border border-gray-300 rounded p-4">
                <div className="flex-1 flex items-center justify-center mb-3">
                  <img
                    src="/images/size-chart/lens-bridge.webp"
                    alt="Lens Bridge Size Chart"
                    className="w-full h-auto object-contain max-h-full"
                  />
                </div>
                <h3 className="text-sm font-semibold text-center text-ui-fg-base">
                  Lens bridge: {lensBridge || "N/A"}
                </h3>
              </div>
              <div className="flex-1 flex flex-col border border-gray-300 rounded p-4">
                <div className="flex-1 flex items-center justify-center mb-3">
                  <img
                    src="/images/size-chart/arm-len.webp"
                    alt="Arm Length Size Chart"
                    className="w-full h-auto object-contain max-h-full"
                  />
                </div>
                <h3 className="text-sm font-semibold text-center text-ui-fg-base">
                  Arm length: {armLength || "N/A"}
                </h3>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Delivery & Return Modal */}
      <Modal
        isOpen={deliveryReturnState.state}
        close={deliveryReturnState.close}
        size="medium"
      >
        <Modal.Title>Delivery & Return</Modal.Title>
        <Modal.Body>
          <div className="w-full max-h-[60vh] overflow-y-auto py-6 space-y-6 pr-2">
            <div>
              <h3 className="font-semibold text-base mb-3">Delivery</h3>
              <div className="text-small-regular text-ui-fg-base space-y-3">
                <p>
                  <strong>100% authenticity guaranteed.</strong>
                </p>
                <p>
                  Orders typically shipped within 2 Working Days of purchase.
                  Items ordered on weekends or holidays will be shipped the next
                  business day
                </p>
                <p>
                  All items are securely packaged and shipped from our US-based
                  Distribution Center
                </p>
                <p>A tracking number is provided for all shipments</p>
                <p>
                  If you are shipping to a College or Apartment Building or any
                  place where the mail is left outside for anyone to take it
                  make sure to use a USPS Signature Required shipping option
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-base mb-3">
                Return & Exchanges Policy
              </h3>
              <div className="text-small-regular text-ui-fg-base space-y-3">
                <ul className="list-disc list-inside space-y-2">
                  <li>Place the original package into a shipping carton.</li>
                  <li>
                    Include the invoice and the reason for the return. If
                    defective, please specify the defect.
                  </li>
                  <li>
                    Please do not place stickers or shipping labels on the
                    original manufacturer&apos;s package.
                  </li>
                  <li>
                    The RMA number must be written clearly on the shipping
                    carton to prevent refusal.
                  </li>
                </ul>
                <p>
                  If you are not satisfied with your purchase, you may exchange
                  or return it for a refund within 15 days from shipping from
                  our warehouse (excluding shipping and handling charges) Note:
                  you may exchange or return it for a refund within 14 days from
                  delivery for Pre-Owned items.
                </p>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Ask a Question Modal */}
      <AskQuestionModal
        isOpen={askQuestionState.state}
        close={askQuestionState.close}
        productId={productId}
        type="question"
      />
    </div>
  )
}

type AskQuestionModalProps = {
  isOpen: boolean
  close: () => void
  productId: string
  type?: "question" | "custom_delivery" | "customize_product"
}

const AskQuestionModal = ({ isOpen, close, productId, type = "question" }: AskQuestionModalProps) => {
  const [formData, setFormData] = useState({
    type: type as "question" | "custom_delivery" | "customize_product",
    name: "",
    email: "",
    customer_mobile: "",
    subject: "",
    message: "",
    address_1: "",
    address_2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    country_code: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update formData.type when type prop changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      type: type,
    }))
  }, [type])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // For question type, set address fields to "n/a"
      const isQuestionType = formData.type === "question"
      const addressData = isQuestionType
        ? {
            address_1: "n/a",
            address_2: "n/a",
            city: "n/a",
            state: "n/a",
            postal_code: "n/a",
            country: "n/a",
            country_code: "n/a",
          }
        : {
            address_1: formData.address_1,
            address_2: formData.address_2 || null,
            city: formData.city,
            state: formData.state || null,
            postal_code: formData.postal_code,
            country: formData.country,
            country_code: formData.country_code || null,
          }

      const response = await sdk.client.fetch<{ product_query: any }>(
        `/store/product-queries`,
        {
          method: "POST",
          body: {
            type: formData.type,
            product_id: productId,
            customer_name: formData.name,
            customer_email: formData.email,
            customer_mobile: formData.customer_mobile,
            subject: formData.subject,
            message: formData.message,
            address: addressData,
          },
        }
      )

      setSubmitSuccess(true)
      setTimeout(() => {
        setSubmitSuccess(false)
        setFormData({
          type: type,
          name: "",
          email: "",
          customer_mobile: "",
          subject: "",
          message: "",
          address_1: "",
          address_2: "",
          city: "",
          state: "",
          postal_code: "",
          country: "",
          country_code: "",
        })
        close()
      }, 2000)
    } catch (error: any) {
      console.error("Error submitting form:", error)
      const errorMessage = error?.message || error?.response?.data?.message || "An error occurred. Please try again."
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} close={close} size="large">
      <Modal.Title>Ask a Question</Modal.Title>
      <Modal.Body>
        <div className="w-full max-w-full overflow-hidden">
          {submitSuccess ? (
            <div className="text-center py-8">
              <p className="text-green-600 font-semibold mb-2">
                Thank you for your query!
              </p>
              <p className="text-small-regular text-ui-fg-base">
                We&apos;ll get back to you as soon as possible.
              </p>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto p-2">
              <form id="product-query-form" onSubmit={handleSubmit} className="space-y-3 py-2">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium mb-1 text-ui-fg-base"
                    >
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-1 text-ui-fg-base"
                    >
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label
                    htmlFor="customer_mobile"
                    className="block text-sm font-medium mb-1 text-ui-fg-base"
                  >
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="customer_mobile"
                    name="customer_mobile"
                    type="tel"
                    value={formData.customer_mobile}
                    onChange={handleChange}
                    required
                    placeholder="Enter your mobile number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive focus:border-transparent text-sm"
                  />
                </div>
                
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium mb-1 text-ui-fg-base"
                  >
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Enter the subject of your question"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive focus:border-transparent text-sm"
                  />
                </div>
                
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-1 text-ui-fg-base"
                  >
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive focus:border-transparent text-sm"
                    placeholder="Enter your question or message"
                  />
                </div>

                {/* Only show address fields for non-question types */}
                {formData.type !== "question" && (
                  <div className="border-t pt-3 mt-3">
                    <h3 className="text-sm font-semibold mb-3 text-ui-fg-base">Address</h3>
                    <div className="space-y-3">
                      <div>
                        <label
                          htmlFor="address_1"
                          className="block text-sm font-medium mb-1 text-ui-fg-base"
                        >
                          Address Line 1 <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="address_1"
                          name="address_1"
                          type="text"
                          value={formData.address_1}
                          onChange={handleChange}
                          required
                          placeholder="Street address, P.O. box"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="address_2"
                          className="block text-sm font-medium mb-1 text-ui-fg-base"
                        >
                          Address Line 2 (Optional)
                        </label>
                        <input
                          id="address_2"
                          name="address_2"
                          type="text"
                          value={formData.address_2}
                          onChange={handleChange}
                          placeholder="Apartment, suite, unit, building, floor, etc."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive focus:border-transparent text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor="city"
                            className="block text-sm font-medium mb-1 text-ui-fg-base"
                          >
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="city"
                            name="city"
                            type="text"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            placeholder="Enter city"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="state"
                            className="block text-sm font-medium mb-1 text-ui-fg-base"
                          >
                            State/Province
                          </label>
                          <input
                            id="state"
                            name="state"
                            type="text"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="Enter state or province"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor="postal_code"
                            className="block text-sm font-medium mb-1 text-ui-fg-base"
                          >
                            Postal Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="postal_code"
                            name="postal_code"
                            type="text"
                            value={formData.postal_code}
                            onChange={handleChange}
                            required
                            placeholder="Enter postal code"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="country"
                            className="block text-sm font-medium mb-1 text-ui-fg-base"
                          >
                            Country <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="country"
                            name="country"
                            type="text"
                            value={formData.country}
                            onChange={handleChange}
                            required
                            placeholder="Enter country"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="country_code"
                          className="block text-sm font-medium mb-1 text-ui-fg-base"
                        >
                          Country Code (Optional)
                        </label>
                        <input
                          id="country_code"
                          name="country_code"
                          type="text"
                          value={formData.country_code}
                          onChange={handleChange}
                          placeholder="e.g., +1, +44"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </Modal.Body>
      {!submitSuccess && (
        <Modal.Footer>
          <Button
            type="button"
            variant="secondary"
            onClick={close}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="product-query-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  )
}

export default ProductInfoActions
