"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@medusajs/ui"
import Modal from "@modules/common/components/modal"
import useToggleState from "@lib/hooks/use-toggle-state"
import Input from "@modules/common/components/input"
import WoodMartIcon from "@modules/common/icons/woodmart-icon"
import { sdk } from "@lib/config"
import { FiShare2, FiCopy } from "react-icons/fi"
import { FaFacebookF, FaTwitter, FaWhatsapp } from "react-icons/fa"

type ProductInfoActionsProps = {
  productId: string
}

const ProductInfoActions = ({ productId }: ProductInfoActionsProps) => {
  const sizeGuideState = useToggleState(false)
  const deliveryReturnState = useToggleState(false)
  const askQuestionState = useToggleState(false)

  // Modal state for the Share popup
  const [shareModalOpen, setShareModalOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false) 

  const currentUrl = typeof window !== "undefined" ? window.location.href : ""

  const handleCopyLink = async () => {
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
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({ title: document.title, url: currentUrl })
        setShareModalOpen(false)
      } catch (e) {
        console.error("Share failed", e)
      }
    } else {
      // fallback: keep modal open for manual share options
      setShareModalOpen(true)
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

              {(navigator as any).share && (
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
                  Lens Width: 52 mm
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
                  Lens bridge: 18 mm
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
                  Arm length: 145 mm
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
          <div className="w-full py-6 space-y-6">
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
  type?: "question" | "query" | "custom_delivery" | "customize_product"
}

const AskQuestionModal = ({ isOpen, close, productId, type }: AskQuestionModalProps) => {
  const [formData, setFormData] = useState({
    type: (type || "query") as "question" | "query" | "custom_delivery" | "customize_product",
    name: "",
    email: "",
    phone: "",
    subject: type === "question" ? "Question" : "",
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
    if (type) {
      setFormData((prev) => ({
        ...prev,
        type: type,
        // Set default subject for question type
        subject: type === "question" ? "Question" : prev.subject,
      }))
    }
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

    // Frontend validation
    const validationErrors: string[] = []

    // Always required fields
    if (!formData.name?.trim()) {
      validationErrors.push("Name is required")
    }
    if (!formData.email?.trim()) {
      validationErrors.push("Email is required")
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      validationErrors.push("Please enter a valid email address")
    }
    if (!formData.phone?.trim()) {
      validationErrors.push("Phone is required")
    }
    if (!formData.message?.trim()) {
      validationErrors.push("Message is required")
    }

    // Validation for non-question types
    if (formData.type !== "question") {
      if (!formData.subject?.trim()) {
        validationErrors.push("Subject is required")
      }
      if (!formData.address_1?.trim()) {
        validationErrors.push("Address Line 1 is required")
      }
      if (!formData.city?.trim()) {
        validationErrors.push("City is required")
      }
      if (!formData.postal_code?.trim()) {
        validationErrors.push("Postal Code is required")
      }
      if (!formData.country?.trim()) {
        validationErrors.push("Country is required")
      }
    }

    if (validationErrors.length > 0) {
      setError(validationErrors.join(". "))
      setIsSubmitting(false)
      return
    }

    try {
      const response = await sdk.client.fetch<{ product_query: any }>(
        `/store/product-queries`,
        {
          method: "POST",
          body: {
            type: formData.type,
            product_id: productId,
            customer_name: formData.name,
            customer_email: formData.email,
            customer_mobile: formData.phone,
            subject: formData.type === "question" ? "Question" : formData.subject || null,
            message: formData.message,
            address: formData.type === "question" ? null : {
              address_1: formData.address_1,
              address_2: formData.address_2 || null,
              city: formData.city,
              state: formData.state || null,
              postal_code: formData.postal_code,
              country: formData.country,
              country_code: formData.country_code || null,
            },
          },
        }
      )

      setSubmitSuccess(true)
      setTimeout(() => {
        setSubmitSuccess(false)
        setFormData({
          type: (type || "query") as "question" | "query" | "custom_delivery" | "customize_product",
          name: "",
          email: "",
          phone: "",
          subject: type === "question" ? "Question" : "",
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
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <form id="product-query-form" onSubmit={handleSubmit} className="space-y-3 py-2">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                    {error}
                  </div>
                )}
                
                {!type && (
                  <div>
                    <label
                      htmlFor="type"
                      className="block text-sm font-medium mb-1 text-ui-fg-base"
                    >
                      Query Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive focus:border-transparent text-sm"
                    >
                      <option value="question">Question</option>
                      <option value="query">Query</option>
                      <option value="custom_delivery">Custom Delivery Request</option>
                      <option value="customize_product">Product Customization Request</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    name="name"
                    type="text"
                    label="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    name="email"
                    type="email"
                    label="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Input  
                  name="phone"
                  type="tel"
                  label="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                
                {formData.type !== "question" && (
                  <div className="grid grid-cols-1 gap-3">
                    <Input
                      name="subject"
                      type="text"
                      label="Subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}
                
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

                {formData.type !== "question" && (
                  <div className="border-t pt-3 mt-3">
                    <h3 className="text-sm font-semibold mb-3 text-ui-fg-base">Address</h3>
                    <div className="space-y-3">
                      <Input
                        name="address_1"
                        type="text"
                        label="Address Line 1"
                        value={formData.address_1}
                        onChange={handleChange}
                        required
                      />
                      <Input
                        name="address_2"
                        type="text"
                        label="Address Line 2 (Optional)"
                        value={formData.address_2}
                        onChange={handleChange}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          name="city"
                          type="text"
                          label="City"
                          value={formData.city}
                          onChange={handleChange}
                          required
                        />
                        <Input
                          name="state"
                          type="text"
                          label="State/Province"
                          value={formData.state}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          name="postal_code"
                          type="text"
                          label="Postal Code"
                          value={formData.postal_code}
                          onChange={handleChange}
                          required
                        />
                        <Input
                          name="country"
                          type="text"
                          label="Country"
                          value={formData.country}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <Input
                        name="country_code"
                        type="text"
                        label="Country Code (Optional)"
                        value={formData.country_code}
                        onChange={handleChange}
                      />
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
