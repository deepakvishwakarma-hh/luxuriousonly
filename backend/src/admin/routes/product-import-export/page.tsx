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
} from "@medusajs/ui";
import { sdk } from "../../lib/config";
import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";

const ProductImportExportPage = () => {
  const [activeTab, setActiveTab] = useState<"upload" | "export">("upload");
  const [csvContent, setCsvContent] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (csv: string) => {
      return sdk.client.fetch("/admin/products/import", {
        method: "POST",
        body: {
          csv,
          filename: "products-import.csv",
        },
      });
    },
    onSuccess: (data: any) => {
      toast.success("Products imported successfully!", {
        description: `Imported ${
          data.summary?.stats?.created || 0
        } products. Transaction ID: ${data.transaction_id}`,
      });
      setCsvContent("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (error: any) => {
      toast.error("Failed to import products", {
        description: error.message || "An error occurred during import",
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
        description: "Please upload a CSV file",
      });
      return;
    }

    setIsImporting(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvContent(content);
        // Auto-submit after reading
        importMutation.mutate(content);
      };
      reader.onerror = () => {
        toast.error("Failed to read file", {
          description: "Could not read the CSV file",
        });
        setIsImporting(false);
      };
      reader.readAsText(file);
    } catch (error: any) {
      toast.error("Failed to process file", {
        description:
          error.message || "An error occurred while processing the file",
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

  // Generate sample CSV data with 10 products
  const generateSampleCSV = (): string => {
    const headers = [
      "Title",
      "Description",
      "Handle",
      "SKU",
      "Status",
      "Subtitle",
      "Thumbnail",
      "Images",
      "sales_channel_id",
      "location_id",
      "stock",
      "days_of_deliery",
      "max_days_of_delivery",
      "days_of_delivery_out_of_stock",
      "max_days_of_delivery_out_of_stock",
      "days_of_delivery_backorders",
      "delivery_note",
      "disebled_days",
      "seo_title",
      "meta_description",
      "slug",
      "focus_keyphrase",
      "keyphrase_synonyms",
      "related_keyphrases",
      "canonical_url",
      "robots_index",
      "robots_follow",
      "robots_advanced",
      "breadcrumb_title",
      "schema_type",
      "schema_subtype",
      "article_type",
      "product_schema",
      "faq_schema",
      "og_title",
      "og_description",
      "og_image",
      "twitter_title",
      "twitter_description",
      "twitter_image",
      "cornerstone",
      "seo_score",
      "readability_score",
      "item_no",
      "condition",
      "lens width",
      "lens bridge",
      "arm length",
      "model",
      "color_code",
      "EAN",
      "gender",
      "rim style",
      "shapes",
      "frame_material",
      "size",
      "lens_weight",
      "lens_bridge",
      "arm_length",
      "department",
      "gtin",
      "mpn",
      "brand",
      "condition",
      "gender",
      "size",
      "size_system",
      "size_type",
      "color",
      "material",
      "pattern",
      "age_group",
      "multipack",
      "is_bundle",
      "availablity_date",
      "adult_content",
    ];

    const sampleProducts = [
      {
        title: "Classic Aviator Sunglasses",
        description: "Timeless aviator design with UV protection lenses",
        handle: "classic-aviator-sunglasses",
        status: "published",
        subtitle: "Premium Quality",
        thumbnail:
          "http://localhost:9000/static/1765534185300-prada-pr-65zs-zvn09t-pale-gold-8056597877329-1000x1000w.jpg",
        sku: "AVI-001",
        images: [
          "http://localhost:9000/static/1765534185300-prada-pr-65zs-zvn09t-pale-gold-8056597877329-1000x1000w.jpg",
          "http://localhost:9000/static/1765534185300-prada-pr-65zs-zvn09t-pale-gold-8056597877329-1000x1000w.jpg",
          "http://localhost:9000/static/1765534185300-prada-pr-65zs-zvn09t-pale-gold-8056597877329-1000x1000w.jpg",
        ],
        variantTitle: "Black / 58mm",
        priceAmount: "12999",
        currencyCode: "USD",
        inventoryQuantity: "50",
        daysOfDelivery: "3",
        maxDaysOfDelivery: "7",
        daysOfDeliveryOutOfStock: "10",
        maxDaysOfDeliveryOutOfStock: "14",
        daysOfDeliveryBackorders: "5",
        deliveryNote: "Express shipping available",
        disabledDays: "Sunday",
        seoTitle: "Classic Aviator Sunglasses - Premium Eyewear",
        metaDescription: "Shop classic aviator sunglasses with UV protection",
        slug: "classic-aviator-sunglasses",
        focusKeyphrase: "aviator sunglasses",
        keyphraseSynonyms: "pilot sunglasses,aviator glasses",
        relatedKeyphrases: "sunglasses,eyewear,aviator style",
        canonicalUrl: "https://example.com/classic-aviator-sunglasses",
        robotsIndex: "index",
        robotsFollow: "follow",
        robotsAdvanced: "",
        breadcrumbTitle: "Sunglasses > Aviator",
        schemaType: "Product",
        schemaSubtype: "Eyewear",
        articleType: "Product",
        productSchema: "{}",
        faqSchema: "[]",
        ogTitle: "Classic Aviator Sunglasses",
        ogDescription: "Premium aviator sunglasses",
        ogImage: "https://example.com/og-aviator.jpg",
        twitterTitle: "Classic Aviator Sunglasses",
        twitterDescription: "Premium aviator sunglasses",
        twitterImage: "https://example.com/twitter-aviator.jpg",
        cornerstone: "true",
        seoScore: "95",
        readabilityScore: "88",
        itemNo: "ITEM-001",
        condition: "New",
        lensWidth: "58",
        lensBridge: "18",
        armLength: "140",
        model: "AVI-2024",
        colorCode: "BLK",
        ean: "1234567890123",
        gender: "Unisex",
        rimStyle: "Full Rim",
        shapes: "Aviator",
        frameMaterial: "Acetate",
        size: "58-18-140",
        lensWeight: "25",
        lensBridge2: "18",
        armLength2: "140",
        department: "Optical",
        gtin: "01234567890123",
        mpn: "AVI-2024-BLK",
        brand: "LuxuryOptics",
        condition2: "New",
        gender2: "Unisex",
        size2: "58-18-140",
        sizeSystem: "US",
        sizeType: "Regular",
        color: "Black",
        material: "Acetate",
        pattern: "Solid",
        ageGroup: "adult",
        multipack: "1",
        isBundle: "false",
        availabilityDate: "2024-01-15",
        adultContent: "false",
      },
      {
        title: "Round Retro Glasses",
        description: "Vintage-inspired round frames for a classic look",
        handle: "round-retro-glasses",
        status: "published",
        subtitle: "Vintage Style",
        thumbnail:
          "http://localhost:9000/static/1765534185300-prada-pr-65zs-zvn09t-pale-gold-8056597877329-1000x1000w.jpg",
        sku: "RND-002",
        images: [
          "http://localhost:9000/static/1765534185300-prada-pr-65zs-zvn09t-pale-gold-8056597877329-1000x1000w.jpg",
          "http://localhost:9000/static/1765534185300-prada-pr-65zs-zvn09t-pale-gold-8056597877329-1000x1000w.jpg",
        ],
        variantTitle: "Tortoise / 52mm",
        priceAmount: "8999",
        currencyCode: "USD",
        inventoryQuantity: "30",
        daysOfDelivery: "5",
        maxDaysOfDelivery: "10",
        daysOfDeliveryOutOfStock: "12",
        maxDaysOfDeliveryOutOfStock: "18",
        daysOfDeliveryBackorders: "7",
        deliveryNote: "Standard shipping",
        disabledDays: "Saturday,Sunday",
        seoTitle: "Round Retro Glasses - Vintage Eyewear",
        metaDescription: "Vintage-inspired round glasses frames",
        slug: "round-retro-glasses",
        focusKeyphrase: "round glasses",
        keyphraseSynonyms: "circular glasses,round frames",
        relatedKeyphrases: "vintage glasses,retro eyewear",
        canonicalUrl: "https://example.com/round-retro-glasses",
        robotsIndex: "index",
        robotsFollow: "follow",
        robotsAdvanced: "",
        breadcrumbTitle: "Glasses > Round",
        schemaType: "Product",
        schemaSubtype: "Eyewear",
        articleType: "Product",
        productSchema: "{}",
        faqSchema: "[]",
        ogTitle: "Round Retro Glasses",
        ogDescription: "Vintage-inspired round frames",
        ogImage: "https://example.com/og-round.jpg",
        twitterTitle: "Round Retro Glasses",
        twitterDescription: "Vintage-inspired round frames",
        twitterImage: "https://example.com/twitter-round.jpg",
        cornerstone: "false",
        seoScore: "88",
        readabilityScore: "85",
        itemNo: "ITEM-002",
        condition: "New",
        lensWidth: "52",
        lensBridge: "19",
        armLength: "145",
        model: "RND-2024",
        colorCode: "TRT",
        ean: "2345678901234",
        gender: "Unisex",
        rimStyle: "Full Rim",
        shapes: "Round",
        frameMaterial: "Acetate",
        size: "52-19-145",
        lensWeight: "22",
        lensBridge2: "19",
        armLength2: "145",
        department: "Optical",
        gtin: "02345678901234",
        mpn: "RND-2024-TRT",
        brand: "LuxuryOptics",
        condition2: "New",
        gender2: "Unisex",
        size2: "52-19-145",
        sizeSystem: "US",
        sizeType: "Regular",
        color: "Tortoise",
        material: "Acetate",
        pattern: "Tortoise",
        ageGroup: "adult",
        multipack: "1",
        isBundle: "false",
        availabilityDate: "2024-01-20",
        adultContent: "false",
      },
      {
        title: "Cat Eye Sunglasses",
        description: "Elegant cat eye design with polarized lenses",
        handle: "cat-eye-sunglasses",
        status: "published",
        subtitle: "Fashion Forward",
        thumbnail:
          "http://localhost:9000/static/1765534185300-prada-pr-65zs-zvn09t-pale-gold-8056597877329-1000x1000w.jpg",
        sku: "CAT-003",
        images: [
          "http://localhost:9000/static/1765534185300-prada-pr-65zs-zvn09t-pale-gold-8056597877329-1000x1000w.jpg",
          "http://localhost:9000/static/1765534185300-prada-pr-65zs-zvn09t-pale-gold-8056597877329-1000x1000w.jpg",
          "http://localhost:9000/static/1765534185300-prada-pr-65zs-zvn09t-pale-gold-8056597877329-1000x1000w.jpg",
        ],
        variantTitle: "Gold / 54mm",
        priceAmount: "14999",
        currencyCode: "USD",
        inventoryQuantity: "25",
        daysOfDelivery: "4",
        maxDaysOfDelivery: "8",
        daysOfDeliveryOutOfStock: "11",
        maxDaysOfDeliveryOutOfStock: "16",
        daysOfDeliveryBackorders: "6",
        deliveryNote: "Premium packaging included",
        disabledDays: "",
        seoTitle: "Cat Eye Sunglasses - Fashion Eyewear",
        metaDescription: "Elegant cat eye sunglasses with polarized lenses",
        slug: "cat-eye-sunglasses",
        focusKeyphrase: "cat eye sunglasses",
        keyphraseSynonyms: "cat eye glasses,feline sunglasses",
        relatedKeyphrases: "fashion sunglasses,designer eyewear",
        canonicalUrl: "https://example.com/cat-eye-sunglasses",
        robotsIndex: "index",
        robotsFollow: "follow",
        robotsAdvanced: "",
        breadcrumbTitle: "Sunglasses > Cat Eye",
        schemaType: "Product",
        schemaSubtype: "Eyewear",
        articleType: "Product",
        productSchema: "{}",
        faqSchema: "[]",
        ogTitle: "Cat Eye Sunglasses",
        ogDescription: "Elegant cat eye design",
        ogImage: "https://example.com/og-cateye.jpg",
        twitterTitle: "Cat Eye Sunglasses",
        twitterDescription: "Elegant cat eye design",
        twitterImage: "https://example.com/twitter-cateye.jpg",
        cornerstone: "true",
        seoScore: "92",
        readabilityScore: "90",
        itemNo: "ITEM-003",
        condition: "New",
        lensWidth: "54",
        lensBridge: "17",
        armLength: "135",
        model: "CAT-2024",
        colorCode: "GLD",
        ean: "3456789012345",
        gender: "Female",
        rimStyle: "Full Rim",
        shapes: "Cat Eye",
        frameMaterial: "Metal",
        size: "54-17-135",
        lensWeight: "28",
        lensBridge2: "17",
        armLength2: "135",
        department: "Optical",
        gtin: "03456789012345",
        mpn: "CAT-2024-GLD",
        brand: "LuxuryOptics",
        condition2: "New",
        gender2: "Female",
        size2: "54-17-135",
        sizeSystem: "US",
        sizeType: "Regular",
        color: "Gold",
        material: "Metal",
        pattern: "Solid",
        ageGroup: "adult",
        multipack: "1",
        isBundle: "false",
        availabilityDate: "2024-02-01",
        adultContent: "false",
      },
      {
        title: "Square Frame Glasses",
        description: "Modern square frames with blue light filtering",
        handle: "square-frame-glasses",
        status: "published",
        subtitle: "Blue Light Protection",
        thumbnail:
          "http://localhost:9000/static/1765534185300-prada-pr-65zs-zvn09t-pale-gold-8056597877329-1000x1000w.jpg",
        sku: "SQR-004",
        images: [
          "https://example.com/square-front.jpg",
          "https://example.com/square-side.jpg",
        ],
        variantTitle: "Black / 56mm",
        priceAmount: "7999",
        currencyCode: "USD",
        inventoryQuantity: "40",
        daysOfDelivery: "3",
        maxDaysOfDelivery: "7",
        daysOfDeliveryOutOfStock: "9",
        maxDaysOfDeliveryOutOfStock: "14",
        daysOfDeliveryBackorders: "4",
        deliveryNote: "Free lens cleaning kit",
        disabledDays: "Sunday",
        seoTitle: "Square Frame Glasses - Blue Light Protection",
        metaDescription:
          "Modern square frames with blue light filtering technology",
        slug: "square-frame-glasses",
        focusKeyphrase: "square glasses",
        keyphraseSynonyms: "square frames,rectangular glasses",
        relatedKeyphrases: "blue light glasses,computer glasses",
        canonicalUrl: "https://example.com/square-frame-glasses",
        robotsIndex: "index",
        robotsFollow: "follow",
        robotsAdvanced: "",
        breadcrumbTitle: "Glasses > Square",
        schemaType: "Product",
        schemaSubtype: "Eyewear",
        articleType: "Product",
        productSchema: "{}",
        faqSchema: "[]",
        ogTitle: "Square Frame Glasses",
        ogDescription: "Modern square frames",
        ogImage: "https://example.com/og-square.jpg",
        twitterTitle: "Square Frame Glasses",
        twitterDescription: "Modern square frames",
        twitterImage: "https://example.com/twitter-square.jpg",
        cornerstone: "false",
        seoScore: "85",
        readabilityScore: "82",
        itemNo: "ITEM-004",
        condition: "New",
        lensWidth: "56",
        lensBridge: "20",
        armLength: "150",
        model: "SQR-2024",
        colorCode: "BLK",
        ean: "4567890123456",
        gender: "Unisex",
        rimStyle: "Half Rim",
        shapes: "Square",
        frameMaterial: "Metal",
        size: "56-20-150",
        lensWeight: "30",
        lensBridge2: "20",
        armLength2: "150",
        department: "Optical",
        gtin: "04567890123456",
        mpn: "SQR-2024-BLK",
        brand: "LuxuryOptics",
        condition2: "New",
        gender2: "Unisex",
        size2: "56-20-150",
        sizeSystem: "US",
        sizeType: "Regular",
        color: "Black",
        material: "Metal",
        pattern: "Solid",
        ageGroup: "adult",
        multipack: "1",
        isBundle: "false",
        availabilityDate: "2024-02-10",
        adultContent: "false",
      },
      {
        title: "Oversized Sunglasses",
        description: "Large oversized frames for maximum sun protection",
        handle: "oversized-sunglasses",
        status: "published",
        subtitle: "Maximum Coverage",
        thumbnail:
          "http://localhost:9000/static/1765534185300-prada-pr-65zs-zvn09t-pale-gold-8056597877329-1000x1000w.jpg",
        sku: "OVR-005",
        images: [
          "https://example.com/oversized-front.jpg",
          "https://example.com/oversized-side.jpg",
          "https://example.com/oversized-back.jpg",
        ],
        variantTitle: "Brown / 62mm",
        priceAmount: "16999",
        currencyCode: "USD",
        inventoryQuantity: "20",
        daysOfDelivery: "5",
        maxDaysOfDelivery: "10",
        daysOfDeliveryOutOfStock: "14",
        maxDaysOfDeliveryOutOfStock: "21",
        daysOfDeliveryBackorders: "8",
        deliveryNote: "Signature required",
        disabledDays: "Saturday,Sunday",
        seoTitle: "Oversized Sunglasses - Maximum Protection",
        metaDescription: "Large oversized frames for maximum sun protection",
        slug: "oversized-sunglasses",
        focusKeyphrase: "oversized sunglasses",
        keyphraseSynonyms: "large sunglasses,big frames",
        relatedKeyphrases: "sun protection,UV blocking",
        canonicalUrl: "https://example.com/oversized-sunglasses",
        robotsIndex: "index",
        robotsFollow: "follow",
        robotsAdvanced: "",
        breadcrumbTitle: "Sunglasses > Oversized",
        schemaType: "Product",
        schemaSubtype: "Eyewear",
        articleType: "Product",
        productSchema: "{}",
        faqSchema: "[]",
        ogTitle: "Oversized Sunglasses",
        ogDescription: "Maximum sun protection",
        ogImage: "https://example.com/og-oversized.jpg",
        twitterTitle: "Oversized Sunglasses",
        twitterDescription: "Maximum sun protection",
        twitterImage: "https://example.com/twitter-oversized.jpg",
        cornerstone: "true",
        seoScore: "90",
        readabilityScore: "87",
        itemNo: "ITEM-005",
        condition: "New",
        lensWidth: "62",
        lensBridge: "16",
        armLength: "145",
        model: "OVR-2024",
        colorCode: "BRN",
        ean: "5678901234567",
        gender: "Unisex",
        rimStyle: "Full Rim",
        shapes: "Oversized",
        frameMaterial: "Acetate",
        size: "62-16-145",
        lensWeight: "35",
        lensBridge2: "16",
        armLength2: "145",
        department: "Optical",
        gtin: "05678901234567",
        mpn: "OVR-2024-BRN",
        brand: "LuxuryOptics",
        condition2: "New",
        gender2: "Unisex",
        size2: "62-16-145",
        sizeSystem: "US",
        sizeType: "Regular",
        color: "Brown",
        material: "Acetate",
        pattern: "Gradient",
        ageGroup: "adult",
        multipack: "1",
        isBundle: "false",
        availabilityDate: "2024-02-15",
        adultContent: "false",
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

    sampleProducts.forEach((product) => {
      // Format images as comma-separated URLs
      const imagesValue =
        product.images && Array.isArray(product.images)
          ? product.images.join(",")
          : "";

      const row = [
        product.title,
        product.description,
        product.handle,
        product.sku || "", // SKU
        product.status,
        product.subtitle,
        product.thumbnail,
        imagesValue, // Images - comma-separated URLs
        "", // sales_channel_id - leave empty to use first available
        "", // location_id - leave empty to use first available
        "0", // stock - default to 0
        product.daysOfDelivery,
        product.maxDaysOfDelivery,
        product.daysOfDeliveryOutOfStock,
        product.maxDaysOfDeliveryOutOfStock,
        product.daysOfDeliveryBackorders,
        product.deliveryNote,
        product.disabledDays,
        product.seoTitle,
        product.metaDescription,
        product.slug,
        product.focusKeyphrase,
        product.keyphraseSynonyms,
        product.relatedKeyphrases,
        product.canonicalUrl,
        product.robotsIndex,
        product.robotsFollow,
        product.robotsAdvanced,
        product.breadcrumbTitle,
        product.schemaType,
        product.schemaSubtype,
        product.articleType,
        product.productSchema,
        product.faqSchema,
        product.ogTitle,
        product.ogDescription,
        product.ogImage,
        product.twitterTitle,
        product.twitterDescription,
        product.twitterImage,
        product.cornerstone,
        product.seoScore,
        product.readabilityScore,
        product.itemNo,
        product.condition,
        product.lensWidth,
        product.lensBridge,
        product.armLength,
        product.model,
        product.colorCode,
        product.ean,
        product.gender,
        product.rimStyle,
        product.shapes,
        product.frameMaterial,
        product.size,
        product.lensWeight,
        product.lensBridge2,
        product.armLength2,
        product.department,
        product.gtin,
        product.mpn,
        product.brand,
        product.condition2,
        product.gender2,
        product.size2,
        product.sizeSystem,
        product.sizeType,
        product.color,
        product.material,
        product.pattern,
        product.ageGroup,
        product.multipack,
        product.isBundle,
        product.availabilityDate,
        product.adultContent,
      ];
      csvRows.push(row.map(escapeCsvField).join(","));
    });

    return csvRows.join("\n");
  };

  const handleDownloadSample = () => {
    const csvContent = generateSampleCSV();
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
      description: "Sample file with 5 products ready for import",
    });
  };

  // Generate CSV example with all fields
  const csvExample = `Title,Description,Handle,SKU,Status,Subtitle,Thumbnail,Images,sales_channel_id,location_id,stock,days_of_deliery,max_days_of_delivery,days_of_delivery_out_of_stock,max_days_of_delivery_out_of_stock,days_of_delivery_backorders,delivery_note,disebled_days,seo_title,meta_description,slug,focus_keyphrase,keyphrase_synonyms,related_keyphrases,canonical_url,robots_index,robots_follow,robots_advanced,breadcrumb_title,schema_type,schema_subtype,article_type,product_schema,faq_schema,og_title,og_description,og_image,twitter_title,twitter_description,twitter_image,cornerstone,seo_score,readability_score,item_no,condition,lens width,lens bridge,arm length,model,color_code,EAN,gender,rim style,shapes,frame_material,size,lens_weight,lens_bridge,arm_length,department,gtin,mpn,brand,condition,gender,size,size_system,size_type,color,material,pattern,age_group,multipack,is_bundle,availablity_date,adult_content
"Product 1","This is a description","product-1","PROD-001","published","Subtitle","https://example.com/image.jpg","https://example.com/img1.jpg,https://example.com/img2.jpg","","",10,5,10,7,14,3,"Delivery note","Mon,Tue",SEO Title,Meta description,product-1,keyphrase,"synonym1,synonym2","related1,related2",https://example.com/product-1,index,follow,"noindex,nofollow",Breadcrumb,Product,Subtype,Article,"{}","[]",OG Title,OG Description,https://example.com/og.jpg,Twitter Title,Twitter Description,https://example.com/twitter.jpg,true,90,85,ITEM001,New,50,18,140,Model A,BLUE,EAN123456789,Male,Full Rim,Round,Acetate,L,25,18,140,Optical,GTIN123,MPN001,Brand Name,New,Male,L,US,Regular,Blue,Plastic,Solid,adult,1,false,2024-01-01,false
"Product 2","Another description","product-2","PROD-002","published","Subtitle 2","https://example.com/image2.jpg","https://example.com/img3.jpg,https://example.com/img4.jpg","","",20,7,14,10,21,5,"Express delivery","Sat,Sun",SEO Title 2,Meta description 2,product-2,keyphrase2,"synonym3","related3",https://example.com/product-2,index,follow,"",Breadcrumb 2,Product,Subtype,Article,"{}","[]",OG Title 2,OG Description 2,https://example.com/og2.jpg,Twitter Title 2,Twitter Description 2,https://example.com/twitter2.jpg,false,85,80,ITEM002,Used,52,19,145,Model B,RED,EAN987654321,Female,Half Rim,Square,Metal,M,28,19,145,Optical,GTIN456,MPN002,Brand Name 2,Used,Female,M,EU,Regular,Red,Metal,Striped,adult,1,false,2024-02-01,false`;

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
                  <Button
                    onClick={handleDownloadSample}
                    variant="secondary"
                    size="small"
                  >
                    <ArrowDownTray className="w-4 h-4 mr-2" />
                    Download Sample CSV
                  </Button>
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
                    Optional: SKU (if provided and product exists with same SKU,
                    it will be updated instead of created), sales_channel_id (if
                    not provided, will use first available sales channel),
                    location_id (if not provided, will use first available
                    location), stock (defaults to 0)
                    <br />
                    Note: Variants are automatically created with product title
                    as variant title. If SKU is provided, it will be assigned to
                    the variant. Products with matching SKU will be updated
                    instead of creating duplicates.
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
