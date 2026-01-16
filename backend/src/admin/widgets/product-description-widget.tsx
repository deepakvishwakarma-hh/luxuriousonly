import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Button, Text } from "@medusajs/ui";
import { AdminProduct, DetailWidgetProps } from "@medusajs/types";

import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { sdk } from "../lib/config";
import { toast } from "@medusajs/ui";

// The widget
const ProductWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(data.description || "");

  const handleSave = async () => {
    setLoading(true);
    try {
      // Send request to your custom API endpoint
      await sdk.admin.product.update(data.id, {
        description: value,
      });
      toast.success("Product description saved successfully");
    } catch (error) {
      console.error("Failed to save:", error);
      toast.error("Failed to save product description");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header Section */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <Heading
          level="h2"
          className="text-xl font-semibold text-gray-900 mb-2"
        >
          Product Description
        </Heading>
        <Text className="text-sm text-gray-500">
          Edit the product description using the rich text editor below
        </Text>
      </div>

      {/* Editor Section */}
      <div className="mb-6">
        <div className="rounded-lg border border-gray-300 overflow-hidden bg-white shadow-inner">
          <style>{`
            .ql-container {
              min-height: 300px;
              max-height: 500px;
              font-size: 14px;
            }
            .ql-editor {
              min-height: 300px;
              padding: 16px;
            }
            .ql-toolbar {
              border-top: none;
              border-left: none;
              border-right: none;
              border-bottom: 1px solid #e5e7eb;
              padding: 12px;
              background-color: #f9fafb;
            }
            .ql-container {
              border-bottom: none;
              border-left: none;
              border-right: none;
              border-top: none;
            }
            .ql-editor.ql-blank::before {
              color: #9ca3af;
              font-style: normal;
            }
          `}</style>
          <ReactQuill
            theme="snow"
            value={value}
            onChange={setValue}
            placeholder="Enter product description here..."
            modules={{
              toolbar: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                [{ color: [] }, { background: [] }],
                [{ align: [] }],
                ["link", "image"],
                ["clean"],
              ],
            }}
          />
        </div>
      </div>

      {/* Action Section */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          variant="secondary"
          disabled={loading}
          onClick={() => setValue(data.description || "")}
          className="min-w-[100px]"
        >
          Reset
        </Button>
        <Button
          variant="primary"
          disabled={loading || value === (data.description || "")}
          onClick={handleSave}
          className="min-w-[100px] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </span>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </Container>
  );
};

// The widget's configurations
export const config = defineWidgetConfig({
  zone: "product.details.after",
});

export default ProductWidget;
