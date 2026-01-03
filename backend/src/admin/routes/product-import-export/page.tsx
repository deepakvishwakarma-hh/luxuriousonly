import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ArrowUpTray, ArrowDownTray } from "@medusajs/icons";
import {
  Container,
  Heading,
  Button,
  Text,
  Toaster,
  toast,
  Label,
  Textarea,
  Tabs,
  Select,
} from "@medusajs/ui";
import { sdk } from "../../lib/config";
import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";

const ProductImportExportPage = () => {
  const [activeTab, setActiveTab] = useState<"upload" | "export">("upload");
  const [csvContent, setCsvContent] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [sampleProductCount, setSampleProductCount] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (csv: string) => {
      try {
        // Use fetch directly to have better control over error handling
        const baseUrl = import.meta.env.VITE_BACKEND_URL || "/";
        
        if (!csv || csv.trim().length === 0) {
          throw new Error("CSV content is empty. Please provide valid CSV data.");
        }
        
        let response: Response;
        try {
          response = await fetch(`${baseUrl}/admin/products/import`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              csv,
              filename: "products-import.csv",
            }),
          });
        } catch (networkError: any) {
          // Handle network errors (connection issues, CORS, etc.)
          throw new Error(
            `Network error: ${networkError.message || "Failed to connect to server. Please check your connection and try again."}`
          );
        }

        let data: any;
        try {
          data = await response.json();
        } catch (parseError) {
          // If response is not JSON, try to get text
          const text = await response.text();
          throw new Error(
            `Failed to parse response: ${text || response.statusText || "Unknown error"}`
          );
        }

        // Check if response indicates an error
        if (!response.ok) {
          const errorMessage = 
            data.message || 
            data.error?.message || 
            (data.errors && Array.isArray(data.errors) ? data.errors.join(", ") : null) ||
            `HTTP ${response.status}: ${response.statusText}`;
          
          const error = new Error(errorMessage);
          (error as any).errorData = {
            ...data,
            status: response.status,
            statusText: response.statusText,
          };
          throw error;
        }

        return data;
      } catch (error: any) {
        // Log the raw error for debugging
        console.error("Raw import error:", error);

        // If it's already our custom error, re-throw it
        if (error.errorData) {
          throw error;
        }

        // Extract error data from various possible error structures
        let errorData: any = null;

        // Try different error structures
        if (error.body) {
          errorData =
            typeof error.body === "string"
              ? JSON.parse(error.body)
              : error.body;
        } else if (error.response?.body) {
          errorData =
            typeof error.response.body === "string"
              ? JSON.parse(error.response.body)
              : error.response.body;
        } else if (error.response) {
          errorData =
            typeof error.response === "string"
              ? JSON.parse(error.response)
              : error.response;
        } else if (error.data) {
          errorData =
            typeof error.data === "string"
              ? JSON.parse(error.data)
              : error.data;
        } else if (typeof error === "object" && "message" in error) {
          errorData = error;
        }

        console.log("Extracted error data:", errorData);

        // Create a custom error with the error data attached
        const customError = new Error(
          errorData?.message || error.message || "Validation failed"
        );
        (customError as any).errorData = errorData || error;
        throw customError;
      }
    },
    onSuccess: (data: any) => {
      const createdCount = data.summary?.stats?.created || 0;
      const hasWarnings = data.warnings && data.warnings.failedProducts?.length > 0;
      
      if (hasWarnings) {
        const failedCount = data.warnings.failedProducts.length;
        toast.success("Products imported with warnings", {
          description: `Imported ${createdCount} products. ${failedCount} product(s) failed to process. Check console for details.`,
          duration: 10000,
        });
        
        // Log detailed warnings
        console.warn("Import warnings:", data.warnings);
        if (data.warnings.failedProducts) {
          console.warn("Failed products:", data.warnings.failedProducts);
        }
      } else {
        toast.success("Products imported successfully!", {
          description: `Imported ${createdCount} products. Transaction ID: ${data.transaction_id || "N/A"}`,
        });
      }
      
      setCsvContent("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (error: any) => {
      // Log the full error for debugging
      console.error("Import error:", error);

      let errorMessage = "Failed to import products";
      let errorDescription = "An error occurred during import";

      // Try multiple ways to extract error data
      let errorData: any = null;

      // Method 1: Check if errorData is attached
      if (error.errorData) {
        errorData = error.errorData;
      }
      // Method 2: Check error.body
      else if (error.body) {
        errorData =
          typeof error.body === "string" ? JSON.parse(error.body) : error.body;
      }
      // Method 3: Check error.response
      else if (error.response) {
        errorData = error.response.body || error.response;
      }
      // Method 4: Check if error itself has the data
      else if (error.missingCategories || error.missingBrands || error.errors) {
        errorData = error;
      }
      // Method 5: Try to parse error.message as JSON
      else if (error.message) {
        try {
          errorData = JSON.parse(error.message);
        } catch {
          // If not JSON, use the message as is
          errorDescription = error.message;
        }
      }

      // Process error data if we found it
      if (errorData) {
        errorMessage = 
          errorData.message || 
          errorData.error?.message || 
          "Validation failed";

        // Build detailed error description
        const errorParts: string[] = [];

        // Check for errors array first
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorParts.push(...errorData.errors);
        } else if (errorData.error?.errors && Array.isArray(errorData.error.errors)) {
          errorParts.push(...errorData.error.errors);
        }

        // Check for missing categories
        if (
          errorData.missingCategories &&
          Array.isArray(errorData.missingCategories) &&
          errorData.missingCategories.length > 0
        ) {
          errorParts.push(
            `❌ Missing categories: ${errorData.missingCategories.join(", ")}`
          );
        }

        // Check for missing brands
        if (
          errorData.missingBrands &&
          Array.isArray(errorData.missingBrands) &&
          errorData.missingBrands.length > 0
        ) {
          errorParts.push(
            `❌ Missing brands: ${errorData.missingBrands.join(", ")}`
          );
        }

        // Check for workflow errors
        if (errorData.error?.workflow) {
          errorParts.push(
            `⚠️ Workflow error: ${JSON.stringify(errorData.error.workflow)}`
          );
        }

        // Check for HTTP status information
        if (errorData.status) {
          errorParts.push(`HTTP Status: ${errorData.status} ${errorData.statusText || ""}`);
        }

        // Include error details if available
        if (errorData.error && typeof errorData.error === "object") {
          const errorObj = errorData.error;
          if (errorObj.message && errorObj.message !== errorMessage) {
            errorParts.push(`Details: ${errorObj.message}`);
          }
        }

        if (errorParts.length > 0) {
          errorDescription = errorParts.join("\n");
        } else if (errorData.message || errorData.error?.message) {
          errorDescription = errorData.message || errorData.error?.message;
        }
      }

      // If we still don't have a good description, use the error message
      if (
        errorDescription === "An error occurred during import" &&
        error.message
      ) {
        errorDescription = error.message;
      }
      
      // Last resort: show the raw error if available
      if (errorDescription === "An error occurred during import" && error.toString) {
        errorDescription = error.toString();
      }

      toast.error(errorMessage, {
        description: errorDescription,
        duration: 15000, // Show for 15 seconds to allow reading
      });
    },
    onSettled: () => {
      setIsImporting(false);
    },
  });

  // Export function
  const handleExport = async () => {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || "/";
      const response = await fetch(`${baseUrl}/admin/products/export`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `products-export-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Products exported successfully!", {
        description: "CSV file downloaded",
      });
    } catch (error: any) {
      toast.error("Failed to export products", {
        description: error.message || "An error occurred during export",
      });
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".csv")) {
      toast.error("Invalid file type", {
        description: "Please upload a CSV file. Only .csv files are supported.",
      });
      return;
    }

    // Validate file size (e.g., max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File too large", {
        description: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
      });
      return;
    }

    if (file.size === 0) {
      toast.error("Empty file", {
        description: "The uploaded file is empty. Please upload a file with content.",
      });
      return;
    }

    setIsImporting(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          if (!content || content.trim().length === 0) {
            toast.error("Empty file content", {
              description: "The CSV file appears to be empty or could not be read.",
            });
            setIsImporting(false);
            return;
          }
          setCsvContent(content);
          // Auto-submit after reading
          importMutation.mutate(content);
        } catch (contentError: any) {
          toast.error("Failed to process file content", {
            description: contentError.message || "An error occurred while processing the file content",
          });
          setIsImporting(false);
        }
      };
      reader.onerror = (error) => {
        const errorMessage = error instanceof Error 
          ? error.message 
          : "Could not read the CSV file. Please check the file and try again.";
        toast.error("Failed to read file", {
          description: errorMessage,
        });
        setIsImporting(false);
      };
      reader.onabort = () => {
        toast.error("File read cancelled", {
          description: "The file read operation was cancelled.",
        });
        setIsImporting(false);
      };
      reader.readAsText(file, "UTF-8");
    } catch (error: any) {
      const errorMessage = error instanceof Error
        ? error.message
        : "An error occurred while processing the file";
      toast.error("Failed to process file", {
        description: errorMessage,
      });
      setIsImporting(false);
    }
  };

  const handleManualImport = () => {
    if (!csvContent.trim()) {
      toast.error("CSV content is required", {
        description: "Please paste CSV content or upload a file",
      });
      return;
    }
    setIsImporting(true);
    importMutation.mutate(csvContent);
  };

  // Generate sample CSV data with specified number of products (each row creates a new product)
  const generateSampleCSV = (count: number = 1): string => {
    // Headers matching required-from-admin.md structure
    const headers = [
      "id",
      "product_id",
      "type",
      "sku",
      "gtin",
      "name",
      "subtitle",
      "description",
      "stock",
      "weight",
      "length",
      "width",
      "height",
      "sale_price",
      "regular_price",
      "categories",
      "tags",
      "thumbnail",
      "thumbnail_alt",
      "images",
      "images_alt",
      "brand",
      "model",
      "color_code",
      "gender",
      "rim_style",
      "shape",
      "frame_material",
      "size",
      "lens_width",
      "lens_height",
      "leng_bridge",
      "arm_length",
      "department",
      "condition",
      "days_of_delivery",
      "max_days_of_delivery",
      "days_of_delivery_out_of_stock",
      "max_days_of_delivery_out_of_stock",
      "delivery_note",
      "disabled_days",
      "keywords",
      "pattern",
      "age_group",
      "multipack",
      "is_bundle",
      "availablity_date",
      "adult_content",
      "region_availability",
      "published",
    ];

    // Sample products - products with same name but different sizes become variants
    const sampleProducts = [
      {
        id: "1",
        product_id: "",
        type: "product",
        sku: "RB-AVI-001-BLK-56",
        gtin: "8056597877001",
        name: "Ray-Ban Aviator Classic Black",
        subtitle: "Premium Quality",
        description:
          "Timeless aviator design with UV protection lenses and metal frame",
        stock: "50",
        weight: "25.5",
        length: "140",
        width: "55",
        height: "50",
        sale_price: "129.99",
        regular_price: "149.99",
        categories: "Sunglasses",
        tags: "classic,aviator,premium",
        thumbnail:
          "https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//m/i/orange-black-full-rim-square-meller-mel-s18834-sunglasses_238660_1_meller_22_11_2025.jpg",
        thumbnail_alt: "Ray-Ban Aviator Classic Black sunglasses thumbnail",
        images:
          "https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//m/i/orange-black-full-rim-square-meller-mel-s18834-sunglasses_238660_1_meller_22_11_2025.jpg|https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//m/i/orange-black-full-rim-square-meller-mel-s18834-sunglasses_238660_1_meller_22_11_2025.jpg",
        images_alt:
          "Ray-Ban Aviator Classic Black front view|Ray-Ban Aviator Classic Black side view",
        brand: "Ray-Ban",
        model: "Aviator",
        color_code: "BLK-001",
        gender: "Male",
        rim_style: "Full Rim",
        shape: "Aviator",
        frame_material: "Metal",
        size: "56mm",
        lens_width: "56",
        lens_height: "56",
        leng_bridge: "18",
        arm_length: "140",
        department: "Men",
        condition: "New",
        days_of_delivery: "3",
        max_days_of_delivery: "5",
        days_of_delivery_out_of_stock: "7",
        max_days_of_delivery_out_of_stock: "10",
        delivery_note: "Standard shipping",
        disabled_days: "Weekends",
        keywords: "ray-ban aviator sunglasses black",
        pattern: "None",
        age_group: "Adult",
        multipack: "0",
        is_bundle: "0",
        availablity_date: "2024-01-15",
        adult_content: "No",
        region_availability: "de,us,in,fr,it,gb,es",
        published: "1",
      },
      {
        id: "2",
        product_id: "",
        type: "product",
        sku: "RB-AVI-001-BLK-58",
        gtin: "8056597877002",
        name: "Ray-Ban Aviator Classic Black",
        subtitle: "Premium Quality",
        description:
          "Timeless aviator design with UV protection lenses and metal frame",
        stock: "45",
        weight: "25.5",
        length: "140",
        width: "55",
        height: "50",
        sale_price: "129.99",
        regular_price: "149.99",
        categories: "Sunglasses",
        tags: "classic,aviator,premium",
        thumbnail:
          "https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//m/i/orange-black-full-rim-square-meller-mel-s18834-sunglasses_238660_1_meller_22_11_2025.jpg",
        thumbnail_alt: "Ray-Ban Aviator Classic Black sunglasses thumbnail",
        images:
          "https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//m/i/orange-black-full-rim-square-meller-mel-s18834-sunglasses_238660_1_meller_22_11_2025.jpg|https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//m/i/orange-black-full-rim-square-meller-mel-s18834-sunglasses_238660_1_meller_22_11_2025.jpg",
        images_alt:
          "Ray-Ban Aviator Classic Black front view|Ray-Ban Aviator Classic Black side view",
        brand: "Ray-Ban",
        model: "Aviator",
        color_code: "BLK-001",
        gender: "Male",
        rim_style: "Full Rim",
        shape: "Aviator",
        frame_material: "Metal",
        size: "58mm",
        lens_width: "58",
        lens_height: "58",
        leng_bridge: "18",
        arm_length: "140",
        department: "Men",
        condition: "New",
        days_of_delivery: "3",
        max_days_of_delivery: "5",
        days_of_delivery_out_of_stock: "7",
        max_days_of_delivery_out_of_stock: "10",
        delivery_note: "Standard shipping",
        disabled_days: "Weekends",
        keywords: "ray-ban aviator sunglasses black",
        pattern: "None",
        age_group: "Adult",
        multipack: "0",
        is_bundle: "0",
        availablity_date: "2024-01-15",
        adult_content: "No",
        region_availability: "de,us,in,fr,it,gb,es",
        published: "1",
      },
      {
        id: "3",
        product_id: "",
        type: "product",
        sku: "RB-AVI-001-BLK-60",
        gtin: "8056597877003",
        name: "Ray-Ban Aviator Classic Black",
        subtitle: "Premium Quality",
        description:
          "Timeless aviator design with UV protection lenses and metal frame",
        stock: "40",
        weight: "26.0",
        length: "145",
        width: "60",
        height: "52",
        sale_price: "129.99",
        regular_price: "149.99",
        categories: "Sunglasses",
        tags: "classic,aviator,premium",
        thumbnail:
          "https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//m/i/orange-black-full-rim-square-meller-mel-s18834-sunglasses_238660_1_meller_22_11_2025.jpg",
        thumbnail_alt: "Ray-Ban Aviator Classic Black sunglasses thumbnail",
        images:
          "https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//m/i/orange-black-full-rim-square-meller-mel-s18834-sunglasses_238660_1_meller_22_11_2025.jpg|https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//m/i/orange-black-full-rim-square-meller-mel-s18834-sunglasses_238660_1_meller_22_11_2025.jpg",
        images_alt:
          "Ray-Ban Aviator Classic Black front view|Ray-Ban Aviator Classic Black side view",
        brand: "Ray-Ban",
        model: "Aviator",
        color_code: "BLK-001",
        gender: "Male",
        rim_style: "Full Rim",
        shape: "Aviator",
        frame_material: "Metal",
        size: "60mm",
        lens_width: "60",
        lens_height: "60",
        leng_bridge: "18",
        arm_length: "145",
        department: "Men",
        condition: "New",
        days_of_delivery: "3",
        max_days_of_delivery: "5",
        days_of_delivery_out_of_stock: "7",
        max_days_of_delivery_out_of_stock: "10",
        delivery_note: "Standard shipping",
        disabled_days: "Weekends",
        keywords: "ray-ban aviator sunglasses black",
        pattern: "None",
        age_group: "Adult",
        multipack: "0",
        is_bundle: "0",
        availablity_date: "2024-01-15",
        adult_content: "No",
        region_availability: "de,us,in,fr,it,gb,es",
        published: "1",
      },
      {
        id: "4",
        product_id: "",
        type: "product",
        sku: "OAK-HOL-001-MAT-56",
        gtin: "8056597877004",
        name: "Oakley Holbrook Matte Black",
        subtitle: "Sporty Style",
        description: "Iconic square frame design with Prizm lens technology",
        stock: "60",
        weight: "28.0",
        length: "135",
        width: "50",
        height: "48",
        sale_price: "179.99",
        regular_price: "199.99",
        categories: "Sunglasses",
        tags: "oakley,sport,prizm",
        thumbnail:
          "https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//m/i/orange-black-full-rim-square-meller-mel-s18834-sunglasses_238660_1_meller_22_11_2025.jpg",
        thumbnail_alt: "Oakley Holbrook Matte Black sunglasses thumbnail",
        images:
          "https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//m/i/orange-black-full-rim-square-meller-mel-s18834-sunglasses_238660_1_meller_22_11_2025.jpg|https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//m/i/orange-black-full-rim-square-meller-mel-s18834-sunglasses_238660_1_meller_22_11_2025.jpg",
        images_alt:
          "Oakley Holbrook Matte Black front view|Oakley Holbrook Matte Black side view",
        brand: "Oakley",
        model: "Holbrook",
        color_code: "MAT-001",
        gender: "Unisex",
        rim_style: "Full Rim",
        shape: "Square",
        frame_material: "Plastic",
        size: "56mm",
        lens_width: "56",
        lens_height: "56",
        leng_bridge: "19",
        arm_length: "135",
        department: "Unisex",
        condition: "New",
        days_of_delivery: "4",
        max_days_of_delivery: "6",
        days_of_delivery_out_of_stock: "8",
        max_days_of_delivery_out_of_stock: "12",
        delivery_note: "Express shipping available",
        disabled_days: "None",
        keywords: "oakley holbrook sunglasses matte black",
        pattern: "None",
        age_group: "Adult",
        multipack: "0",
        is_bundle: "0",
        availablity_date: "2024-01-16",
        adult_content: "No",
        region_availability: "de,us,in,fr,it,gb,es",
        published: "1",
      },
      {
        id: "5",
        product_id: "",
        type: "product",
        sku: "OAK-HOL-001-MAT-58",
        gtin: "8056597877005",
        name: "Oakley Holbrook Matte Black",
        subtitle: "Sporty Style",
        description: "Iconic square frame design with Prizm lens technology",
        stock: "55",
        weight: "28.0",
        length: "135",
        width: "50",
        height: "48",
        sale_price: "179.99",
        regular_price: "199.99",
        categories: "Sunglasses",
        tags: "oakley,sport,prizm",
        thumbnail:
          "https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//m/i/orange-black-full-rim-square-meller-mel-s18834-sunglasses_238660_1_meller_22_11_2025.jpg",
        thumbnail_alt: "Oakley Holbrook Matte Black sunglasses thumbnail",
        images:
          "https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//m/i/orange-black-full-rim-square-meller-mel-s18834-sunglasses_238660_1_meller_22_11_2025.jpg|https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//m/i/orange-black-full-rim-square-meller-mel-s18834-sunglasses_238660_1_meller_22_11_2025.jpg",
        images_alt:
          "Oakley Holbrook Matte Black front view|Oakley Holbrook Matte Black side view",
        brand: "Oakley",
        model: "Holbrook",
        color_code: "MAT-001",
        gender: "Unisex",
        rim_style: "Full Rim",
        shape: "Square",
        frame_material: "Plastic",
        size: "58mm",
        lens_width: "58",
        lens_height: "58",
        leng_bridge: "19",
        arm_length: "135",
        department: "Unisex",
        condition: "New",
        days_of_delivery: "4",
        max_days_of_delivery: "6",
        days_of_delivery_out_of_stock: "8",
        max_days_of_delivery_out_of_stock: "12",
        delivery_note: "Express shipping available",
        disabled_days: "None",
        keywords: "oakley holbrook sunglasses matte black",
        pattern: "None",
        age_group: "Adult",
        multipack: "0",
        is_bundle: "0",
        availablity_date: "2024-01-16",
        adult_content: "No",
        region_availability: "de,us,in,fr,it,gb,es",
        published: "1",
      },
      {
        id: "6",
        product_id: "",
        type: "product",
        sku: "OAK-HOL-001-MAT-60",
        gtin: "8056597877006",
        name: "Oakley Holbrook Matte Black",
        subtitle: "Sporty Style",
        description: "Iconic square frame design with Prizm lens technology",
        stock: "50",
        weight: "28.5",
        length: "140",
        width: "52",
        height: "50",
        sale_price: "179.99",
        regular_price: "199.99",
        categories: "Sunglasses",
        tags: "oakley,sport,prizm",
        thumbnail:
          "https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//m/i/orange-black-full-rim-square-meller-mel-s18834-sunglasses_238660_1_meller_22_11_2025.jpg",
        thumbnail_alt: "Oakley Holbrook Matte Black sunglasses thumbnail",
        images:
          "https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//m/i/orange-black-full-rim-square-meller-mel-s18834-sunglasses_238660_1_meller_22_11_2025.jpg|https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//m/i/orange-black-full-rim-square-meller-mel-s18834-sunglasses_238660_1_meller_22_11_2025.jpg",
        images_alt:
          "Oakley Holbrook Matte Black front view|Oakley Holbrook Matte Black side view",
        brand: "Oakley",
        model: "Holbrook",
        color_code: "MAT-001",
        gender: "Unisex",
        rim_style: "Full Rim",
        shape: "Square",
        frame_material: "Plastic",
        size: "60mm",
        lens_width: "60",
        lens_height: "60",
        leng_bridge: "19",
        arm_length: "140",
        department: "Unisex",
        condition: "New",
        days_of_delivery: "4",
        max_days_of_delivery: "6",
        days_of_delivery_out_of_stock: "8",
        max_days_of_delivery_out_of_stock: "12",
        delivery_note: "Express shipping available",
        disabled_days: "None",
        keywords: "oakley holbrook sunglasses matte black",
        pattern: "None",
        age_group: "Adult",
        multipack: "0",
        is_bundle: "0",
        availablity_date: "2024-01-16",
        adult_content: "No",
        region_availability: "de,us,in,fr,it,gb,es",
        published: "1",
      },
      {
        id: "7",
        product_id: "",
        type: "product",
        sku: "GUCCI-GG0061S-001-BLK-54",
        gtin: "8056597877007",
        name: "Gucci GG0061S Black",
        subtitle: "Luxury Collection",
        description:
          "Designer sunglasses with iconic GG logo and acetate frame",
        stock: "35",
        weight: "30.0",
        length: "145",
        width: "54",
        height: "50",
        sale_price: "450.00",
        regular_price: "500.00",
        categories: "Sunglasses",
        tags: "gucci,luxury,designer",
        thumbnail:
          "https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//m/i/orange-black-full-rim-square-meller-mel-s18834-sunglasses_238660_1_meller_22_11_2025.jpg",
        thumbnail_alt: "Gucci GG0061S Black sunglasses thumbnail",
        images:
          "https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//m/i/orange-black-full-rim-square-meller-mel-s18834-sunglasses_238660_1_meller_22_11_2025.jpg|https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//m/i/orange-black-full-rim-square-meller-mel-s18834-sunglasses_238660_1_meller_22_11_2025.jpg",
        images_alt:
          "Gucci GG0061S Black front view|Gucci GG0061S Black side view",
        brand: "Gucci",
        model: "GG0061S",
        color_code: "BLK-GG001",
        gender: "Female",
        rim_style: "Full Rim",
        shape: "Square",
        frame_material: "Acetate",
        size: "54mm",
        lens_width: "54",
        lens_height: "54",
        leng_bridge: "20",
        arm_length: "145",
        department: "Women",
        condition: "New",
        days_of_delivery: "5",
        max_days_of_delivery: "7",
        days_of_delivery_out_of_stock: "10",
        max_days_of_delivery_out_of_stock: "14",
        delivery_note: "Premium packaging included",
        disabled_days: "None",
        keywords: "gucci gg0061s sunglasses black designer",
        pattern: "None",
        age_group: "Adult",
        multipack: "0",
        is_bundle: "0",
        availablity_date: "2024-01-17",
        adult_content: "No",
        region_availability: "de,us,in,fr,it,gb,es",
        published: "1",
      },
      {
        id: "8",
        product_id: "",
        type: "product",
        sku: "GUCCI-GG0061S-001-BLK-56",
        gtin: "8056597877008",
        name: "Gucci GG0061S Black",
        subtitle: "Luxury Collection",
        description:
          "Designer sunglasses with iconic GG logo and acetate frame",
        stock: "30",
        weight: "30.5",
        length: "148",
        width: "56",
        height: "52",
        sale_price: "450.00",
        regular_price: "500.00",
        categories: "Sunglasses",
        tags: "gucci,luxury,designer",
        thumbnail:
          "https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//m/i/orange-black-full-rim-square-meller-mel-s18834-sunglasses_238660_1_meller_22_11_2025.jpg",
        thumbnail_alt: "Gucci GG0061S Black sunglasses thumbnail",
        images:
          "https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//m/i/orange-black-full-rim-square-meller-mel-s18834-sunglasses_238660_1_meller_22_11_2025.jpg|https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//m/i/orange-black-full-rim-square-meller-mel-s18834-sunglasses_238660_1_meller_22_11_2025.jpg",
        images_alt:
          "Gucci GG0061S Black front view|Gucci GG0061S Black side view",
        brand: "Gucci",
        model: "GG0061S",
        color_code: "BLK-GG001",
        gender: "Female",
        rim_style: "Full Rim",
        shape: "Square",
        frame_material: "Acetate",
        size: "56mm",
        lens_width: "56",
        lens_height: "56",
        leng_bridge: "20",
        arm_length: "148",
        department: "Women",
        condition: "New",
        days_of_delivery: "5",
        max_days_of_delivery: "7",
        days_of_delivery_out_of_stock: "10",
        max_days_of_delivery_out_of_stock: "14",
        delivery_note: "Premium packaging included",
        disabled_days: "None",
        keywords: "gucci gg0061s sunglasses black designer",
        pattern: "None",
        age_group: "Adult",
        multipack: "0",
        is_bundle: "0",
        availablity_date: "2024-01-17",
        adult_content: "No",
        region_availability: "de,us,in,fr,it,gb,es",
        published: "1",
      },
      {
        id: "9",
        product_id: "",
        type: "product",
        sku: "GUCCI-GG0061S-001-BLK-58",
        gtin: "8056597877009",
        name: "Gucci GG0061S Black",
        subtitle: "Luxury Collection",
        description:
          "Designer sunglasses with iconic GG logo and acetate frame",
        stock: "25",
        weight: "31.0",
        length: "150",
        width: "58",
        height: "54",
        sale_price: "450.00",
        regular_price: "500.00",
        categories: "Sunglasses",
        tags: "gucci,luxury,designer",
        thumbnail:
          "https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//m/i/orange-black-full-rim-square-meller-mel-s18834-sunglasses_238660_1_meller_22_11_2025.jpg",
        thumbnail_alt: "Gucci GG0061S Black sunglasses thumbnail",
        images:
          "https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//m/i/orange-black-full-rim-square-meller-mel-s18834-sunglasses_238660_1_meller_22_11_2025.jpg|https://static5.lenskart.com/media/catalog/product/pro/1/thumbnail/480x480/9df78eab33525d08d6e5fb8d27136e95//m/i/orange-black-full-rim-square-meller-mel-s18834-sunglasses_238660_1_meller_22_11_2025.jpg",
        images_alt:
          "Gucci GG0061S Black front view|Gucci GG0061S Black side view",
        brand: "Gucci",
        model: "GG0061S",
        color_code: "BLK-GG001",
        gender: "Female",
        rim_style: "Full Rim",
        shape: "Square",
        frame_material: "Acetate",
        size: "58mm",
        lens_width: "58",
        lens_height: "58",
        leng_bridge: "20",
        arm_length: "150",
        department: "Women",
        condition: "New",
        days_of_delivery: "5",
        max_days_of_delivery: "7",
        days_of_delivery_out_of_stock: "10",
        max_days_of_delivery_out_of_stock: "14",
        delivery_note: "Premium packaging included",
        disabled_days: "None",
        keywords: "gucci gg0061s sunglasses black designer",
        pattern: "None",
        age_group: "Adult",
        multipack: "0",
        is_bundle: "0",
        availablity_date: "2024-01-17",
        adult_content: "No",
        region_availability: "de,us,in,fr,it,gb,es",
        published: "1",
      },
    ];

    // Helper function to escape CSV fields
    const escapeCsvField = (field: any): string => {
      if (field === null || field === undefined) {
        return "";
      }
      const str = String(field);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Build CSV rows
    const csvRows = [headers.join(",")];

    // Generate products up to requested count
    // Group products by name to understand variant structure
    const productGroups: { [key: string]: typeof sampleProducts } = {};
    sampleProducts.forEach((product) => {
      const name = product.name;
      if (!productGroups[name]) {
        productGroups[name] = [];
      }
      productGroups[name].push(product);
    });

    const productsToInclude: typeof sampleProducts = [];
    let groupCounter = 0;

    // Generate unique products by creating new product groups
    while (productsToInclude.length < count) {
      const groupNames = Object.keys(productGroups);
      const baseGroupName = groupNames[groupCounter % groupNames.length];
      const baseGroup = productGroups[baseGroupName];

      // Create a new product group with unique name
      baseGroup.forEach((baseProduct) => {
        if (productsToInclude.length >= count) return;

        const product = { ...baseProduct };
        const uniqueSuffix = groupCounter > 0 ? ` ${groupCounter + 1}` : "";

        // Make product name unique to avoid option value conflicts
        product.name = baseProduct.name + uniqueSuffix;
        product.id = (productsToInclude.length + 1).toString();

        // Update SKU to be unique
        if (product.sku) {
          const skuParts = product.sku.split("-");
          if (skuParts.length > 0) {
            skuParts[skuParts.length - 1] = String(
              productsToInclude.length + 1
            ).padStart(2, "0");
            product.sku = skuParts.join("-");
          }
        }

        // Update GTIN to be unique
        if (product.gtin) {
          product.gtin = (
            parseInt(product.gtin) + productsToInclude.length
          ).toString();
        }

        productsToInclude.push(product);
      });

      groupCounter++;
    }

    productsToInclude.forEach((product) => {
      const row = [
        product.id,
        product.product_id,
        product.type,
        product.sku,
        product.gtin,
        product.name,
        product.subtitle,
        product.description,
        product.stock,
        product.weight,
        product.length,
        product.width,
        product.height,
        product.sale_price,
        product.regular_price,
        product.categories,
        product.tags,
        product.thumbnail,
        product.thumbnail_alt || "",
        product.images,
        product.images_alt || "",
        product.brand,
        product.model,
        product.color_code,
        product.gender,
        product.rim_style,
        product.shape,
        product.frame_material,
        product.size,
        product.lens_width,
        product.lens_height,
        product.leng_bridge,
        product.arm_length,
        product.department,
        product.condition,
        product.days_of_delivery,
        product.max_days_of_delivery,
        product.days_of_delivery_out_of_stock,
        product.max_days_of_delivery_out_of_stock,
        product.delivery_note,
        product.disabled_days,
        product.keywords,
        product.pattern,
        product.age_group,
        product.multipack,
        product.is_bundle,
        product.availablity_date,
        product.adult_content,
        product.region_availability || "",
        product.published,
      ];
      csvRows.push(row.map(escapeCsvField).join(","));
    });

    return csvRows.join("\n");
  };

  const handleDownloadSample = () => {
    const csvContent = generateSampleCSV(sampleProductCount);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `product-import-sample-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success("Sample CSV downloaded!", {
      description:
        "Sample file with products ready for import. Products with the same name but different sizes will become variants.",
    });
  };

  // Generate CSV example with all fields
  const csvExample = `Title,Description,Handle,SKU,Status,Subtitle,Thumbnail,Images,Categories,sales_channel_id,location_id,stock,days_of_deliery,max_days_of_delivery,days_of_delivery_out_of_stock,max_days_of_delivery_out_of_stock,days_of_delivery_backorders,delivery_note,disebled_days,seo_title,meta_description,slug,focus_keyphrase,keyphrase_synonyms,related_keyphrases,canonical_url,robots_index,robots_follow,robots_advanced,breadcrumb_title,schema_type,schema_subtype,article_type,product_schema,faq_schema,og_title,og_description,og_image,twitter_title,twitter_description,twitter_image,cornerstone,seo_score,readability_score,item_no,condition,lens width,lens bridge,arm length,model,color_code,EAN,gender,rim style,shapes,frame_material,size,lens_weight,lens_bridge,arm_length,department,gtin,mpn,brand,condition,gender,size,size_system,size_type,color,material,pattern,age_group,multipack,is_bundle,availablity_date,adult_content,region_availability
"Product 1","This is a description","product-1","PROD-001","published","Subtitle","https://example.com/image.jpg","https://example.com/img1.jpg,https://example.com/img2.jpg","Sunglasses","","",10,5,10,7,14,3,"Delivery note","Mon,Tue",SEO Title,Meta description,product-1,keyphrase,"synonym1,synonym2","related1,related2",https://example.com/product-1,index,follow,"noindex,nofollow",Breadcrumb,Product,Subtype,Article,"{}","[]",OG Title,OG Description,https://example.com/og.jpg,Twitter Title,Twitter Description,https://example.com/twitter.jpg,true,90,85,ITEM001,New,50,18,140,Model A,BLUE,EAN123456789,Male,Full Rim,Round,Acetate,L,25,18,140,Optical,GTIN123,MPN001,Brand Name,New,Male,L,US,Regular,Blue,Plastic,Solid,adult,1,false,2024-01-01,false,"de,us,in,fr,it,gb,es"
"Product 2","Another description","product-2","PROD-002","published","Subtitle 2","https://example.com/image2.jpg","https://example.com/img3.jpg,https://example.com/img4.jpg","Eyewears","","",20,7,14,10,21,5,"Express delivery","Sat,Sun",SEO Title 2,Meta description 2,product-2,keyphrase2,"synonym3","related3",https://example.com/product-2,index,follow,"",Breadcrumb 2,Product,Subtype,Article,"{}","[]",OG Title 2,OG Description 2,https://example.com/og2.jpg,Twitter Title 2,Twitter Description 2,https://example.com/twitter2.jpg,false,85,80,ITEM002,Used,52,19,145,Model B,RED,EAN987654321,Female,Half Rim,Square,Metal,M,28,19,145,Optical,GTIN456,MPN002,Brand Name 2,Used,Female,M,EU,Regular,Red,Metal,Striped,adult,1,false,2024-02-01,false,"de,us,in,fr,it,gb,es"`;

  return (
    <Container>
      <div className="flex flex-col gap-6">
        <Heading>Product Import & Export</Heading>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "upload" | "export")}
        >
          <Tabs.List>
            <Tabs.Trigger value="upload">
              <ArrowUpTray className="w-4 h-4 mr-2" />
              Import Products
            </Tabs.Trigger>
            <Tabs.Trigger value="export">
              <ArrowDownTray className="w-4 h-4 mr-2" />
              Export Products
            </Tabs.Trigger>
          </Tabs.List>

          {/* Upload Tab */}
          <Tabs.Content value="upload" className="mt-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Heading level="h2">Import Products from CSV</Heading>
                    <Text className="text-ui-fg-subtle mt-2">
                      Upload a CSV file or paste CSV content to import products
                      into your store.
                    </Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={sampleProductCount.toString()}
                      onValueChange={(value) =>
                        setSampleProductCount(parseInt(value))
                      }
                    >
                      <Select.Trigger className="w-20">
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="1">1</Select.Item>
                        <Select.Item value="5">5</Select.Item>
                        <Select.Item value="10">10</Select.Item>
                        <Select.Item value="50">50</Select.Item>
                      </Select.Content>
                    </Select>
                    <Button
                      onClick={handleDownloadSample}
                      variant="secondary"
                      size="small"
                    >
                      <ArrowDownTray className="w-4 h-4 mr-2" />
                      Download Sample CSV
                    </Button>
                  </div>
                </div>

                {/* File Upload */}
                <div className="flex flex-col gap-2">
                  <Label>Upload CSV File</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={isImporting}
                    className="block w-full text-sm text-ui-fg-subtle file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-ui-bg-base file:text-ui-fg-base hover:file:bg-ui-bg-base-hover cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <Text className="text-ui-fg-subtle text-xs">
                    Select a CSV file to upload. The import will start
                    automatically.
                  </Text>
                </div>

                {/* Manual CSV Input */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="csv-content">Or Paste CSV Content</Label>
                  <Textarea
                    id="csv-content"
                    value={csvContent}
                    onChange={(e) => setCsvContent(e.target.value)}
                    placeholder={csvExample}
                    rows={10}
                    disabled={isImporting}
                    className="font-mono text-sm"
                  />
                  <Text className="text-ui-fg-subtle text-xs">
                    Paste your CSV content here. Make sure it includes headers.
                  </Text>
                </div>

                {/* CSV Format Info */}
                <div className="bg-ui-bg-subtle p-4 rounded-lg">
                  <Heading level="h3" className="text-sm mb-2">
                    CSV Format
                  </Heading>
                  <Text className="text-xs text-ui-fg-subtle mb-2">
                    Your CSV should include the following columns:
                  </Text>
                  <div className="bg-ui-bg-base p-3 rounded font-mono text-xs overflow-x-auto">
                    <pre>{csvExample}</pre>
                  </div>
                  <Text className="text-xs text-ui-fg-subtle mt-2">
                    Required columns: Title, Description, Handle, Status
                    <br />
                    Optional: SKU, sales_channel_id (if not provided, will use
                    first available sales channel), location_id (if not
                    provided, will use first available location), stock
                    (defaults to 0)
                    <br />
                    Note: Each row in the CSV creates a new product with a
                    single variant. The product title is used as the variant
                    title. If SKU is provided, it will be assigned to the
                    variant.
                  </Text>
                </div>

                {/* Import Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleManualImport}
                    disabled={isImporting || !csvContent.trim()}
                    isLoading={isImporting}
                  >
                    Import Products
                  </Button>
                </div>
              </div>
            </div>
          </Tabs.Content>

          {/* Export Tab */}
          <Tabs.Content value="export" className="mt-6">
            <div className="flex flex-col gap-6">
              <div>
                <Heading level="h2">Export Products to CSV</Heading>
                <Text className="text-ui-fg-subtle mt-2">
                  Export all your products to a CSV file. The export includes
                  product details and all custom metadata fields. Variant
                  information is handled automatically and not included in the
                  export.
                </Text>
              </div>

              <div className="bg-ui-bg-subtle p-6 rounded-lg">
                <Heading level="h3" className="text-sm mb-2">
                  Export Information
                </Heading>
                <ul className="list-disc list-inside text-sm text-ui-fg-subtle space-y-1">
                  <li>Exports all products (one row per product)</li>
                  <li>
                    Includes product details and sales channel information
                  </li>
                  <li>
                    Includes all custom metadata fields (estimated delivery,
                    SEO, extra fields, marketplace)
                  </li>
                  <li>
                    Variant information is handled automatically by the system
                  </li>
                  <li>CSV format compatible with spreadsheet applications</li>
                  <li>File will be downloaded automatically</li>
                </ul>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleExport} variant="primary">
                  <ArrowDownTray className="w-4 h-4 mr-2" />
                  Export Products
                </Button>
              </div>
            </div>
          </Tabs.Content>
        </Tabs>
      </div>

      <Toaster />
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Product Import/Export",
  icon: ArrowUpTray,
});

export default ProductImportExportPage;
