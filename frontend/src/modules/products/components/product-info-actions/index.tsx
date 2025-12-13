"use client"

import React, { useState } from "react"
import { Button } from "@medusajs/ui"
import Modal from "@modules/common/components/modal"
import useToggleState from "@lib/hooks/use-toggle-state"
import Input from "@modules/common/components/input"
import WoodMartIcon from "@modules/common/icons/woodmart-icon"

const ProductInfoActions = () => {
  const sizeGuideState = useToggleState(false)
  const deliveryReturnState = useToggleState(false)
  const askQuestionState = useToggleState(false)

  return (
    <div className="flex flex-wrap gap-3 mt-4">
      <Button
        variant="transparent"
        onClick={sizeGuideState.open}
        className="text-sm flex items-center gap-2"
      >
        <WoodMartIcon iconContent="f13f" size={16} />
        Size Guide
      </Button>
      <Button
        variant="transparent"
        onClick={deliveryReturnState.open}
        className="text-sm flex items-center gap-2"
      >
        <WoodMartIcon iconContent="f123" size={16} />
        Delivery & Return
      </Button>
      <Button
        variant="transparent"
        onClick={askQuestionState.open}
        className="text-sm flex items-center gap-2"
      >
        <WoodMartIcon iconContent="f128" size={16} />
        Ask a Question
      </Button>

      {/* Size Guide Modal */}
      <Modal
        isOpen={sizeGuideState.state}
        close={sizeGuideState.close}
        size="large"
      >
        <Modal.Title>Size Guide</Modal.Title>
        <Modal.Body>
          <div className="w-full py-6">
            <div className="space-y-4">
              <p className="text-small-regular text-ui-fg-base">
                Please refer to the size chart below to find your perfect fit.
                Measurements are in inches.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Size
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Chest
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Waist
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Length
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">XS</td>
                      <td className="border border-gray-300 px-4 py-2">
                        34-36
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        28-30
                      </td>
                      <td className="border border-gray-300 px-4 py-2">26</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">S</td>
                      <td className="border border-gray-300 px-4 py-2">
                        36-38
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        30-32
                      </td>
                      <td className="border border-gray-300 px-4 py-2">27</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">M</td>
                      <td className="border border-gray-300 px-4 py-2">
                        38-40
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        32-34
                      </td>
                      <td className="border border-gray-300 px-4 py-2">28</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">L</td>
                      <td className="border border-gray-300 px-4 py-2">
                        40-42
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        34-36
                      </td>
                      <td className="border border-gray-300 px-4 py-2">29</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">XL</td>
                      <td className="border border-gray-300 px-4 py-2">
                        42-44
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        36-38
                      </td>
                      <td className="border border-gray-300 px-4 py-2">30</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">XXL</td>
                      <td className="border border-gray-300 px-4 py-2">
                        44-46
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        38-40
                      </td>
                      <td className="border border-gray-300 px-4 py-2">31</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-small-regular text-ui-fg-subtle">
                <p className="font-semibold mb-2">How to Measure:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <strong>Chest:</strong> Measure around the fullest part of
                    your chest
                  </li>
                  <li>
                    <strong>Waist:</strong> Measure around your natural
                    waistline
                  </li>
                  <li>
                    <strong>Length:</strong> Measure from the top of the
                    shoulder to the hem
                  </li>
                </ul>
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
              <h3 className="font-semibold text-base mb-2">Delivery</h3>
              <div className="text-small-regular text-ui-fg-base space-y-2">
                <p>
                  <strong>Standard Delivery:</strong> 3-5 business days
                </p>
                <p>
                  <strong>Express Delivery:</strong> 1-2 business days
                </p>
                <p>
                  <strong>Free Shipping:</strong> Available on orders over $100
                </p>
                <p>
                  Your package will arrive at your pick up location or in the
                  comfort of your home. You will receive a tracking number once
                  your order ships.
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-base mb-2">Returns</h3>
              <div className="text-small-regular text-ui-fg-base space-y-2">
                <p>
                  <strong>Return Period:</strong> 30 days from delivery date
                </p>
                <p>
                  <strong>Condition:</strong> Items must be unworn, unwashed,
                  and with original tags attached
                </p>
                <p>
                  <strong>Exchanges:</strong> Is the fit not quite right? No
                  worries - we&apos;ll exchange your product for a new one.
                </p>
                <p>
                  <strong>Easy Returns:</strong> Just return your product and
                  we&apos;ll refund your money. No questions asked – we&apos;ll
                  do our best to make sure your return is hassle-free.
                </p>
                <p>
                  To initiate a return, please contact our customer service team
                  or use the return portal in your account.
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
      />
    </div>
  )
}

type AskQuestionModalProps = {
  isOpen: boolean
  close: () => void
}

const AskQuestionModal = ({ isOpen, close }: AskQuestionModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

    // Simulate API call - replace with actual API endpoint
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Form submitted:", formData)
      setSubmitSuccess(true)
      setTimeout(() => {
        setSubmitSuccess(false)
        setFormData({ name: "", email: "", phone: "", message: "" })
        close()
      }, 2000)
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} close={close} size="medium">
      <Modal.Title>Ask a Question</Modal.Title>
      <Modal.Body>
        <div className="w-full py-6">
          {submitSuccess ? (
            <div className="text-center py-8">
              <p className="text-green-600 font-semibold mb-2">
                Thank you for your question!
              </p>
              <p className="text-small-regular text-ui-fg-base">
                We&apos;ll get back to you as soon as possible.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <Input
                name="phone"
                type="tel"
                label="Phone"
                value={formData.phone}
                onChange={handleChange}
              />
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
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive focus:border-transparent"
                  placeholder="Enter your question or message"
                />
              </div>
              <Modal.Footer>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={close}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </Modal.Footer>
            </form>
          )}
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default ProductInfoActions
