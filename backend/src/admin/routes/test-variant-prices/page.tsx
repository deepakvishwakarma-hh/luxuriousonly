import { defineRouteConfig } from "@medusajs/admin-sdk";
import { CurrencyDollar } from "@medusajs/icons";
import {
  Container,
  Heading,
  Button,
  Text,
  Toaster,
  toast,
  Label,
  Input,
  Textarea,
} from "@medusajs/ui";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

type PriceInput = {
  amount: string;
  currency_code: string;
};

const TestVariantPricesPage = () => {
  const [variantId, setVariantId] = useState("");
  const [prices, setPrices] = useState<PriceInput[]>([
    { amount: "", currency_code: "usd" },
    { amount: "", currency_code: "eur" },
    { amount: "", currency_code: "gbp" },
  ]);
  const [currentPrices, setCurrentPrices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch current prices
  const fetchCurrentPrices = async () => {
    if (!variantId) {
      toast.error("Please enter Variant ID");
      return;
    }

    setIsLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || "/";
      const response = await fetch(
        `${baseUrl}/admin/variants/${variantId}/prices`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      setCurrentPrices(data.variant?.prices || []);
      toast.success("Current prices fetched successfully");
    } catch (error: any) {
      console.error("Error fetching prices:", error);
      toast.error(error.message || "Failed to fetch current prices");
      setCurrentPrices([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update prices mutation
  const updatePricesMutation = useMutation({
    mutationFn: async (pricesData: PriceInput[]) => {
      if (!variantId) {
        throw new Error("Variant ID is required");
      }

      // Validate prices
      const validPrices = pricesData
        .filter((p) => p.amount && p.currency_code)
        .map((p) => ({
          amount: Math.round(parseFloat(p.amount) * 100), // Convert to cents
          currency_code: p.currency_code.toLowerCase(),
        }));

      if (validPrices.length === 0) {
        throw new Error("At least one valid price is required");
      }

      const baseUrl = import.meta.env.VITE_BACKEND_URL || "/";
      const response = await fetch(
        `${baseUrl}/admin/variants/${variantId}/prices`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            prices: validPrices,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast.success("Prices updated successfully!");
      setCurrentPrices(data.variant?.prices || []);
      // Reset form
      setPrices([
        { amount: "", currency_code: "usd" },
        { amount: "", currency_code: "eur" },
        { amount: "", currency_code: "gbp" },
      ]);
    },
    onError: (error: any) => {
      console.error("Error updating prices:", error);
      toast.error(error.message || "Failed to update prices");
    },
  });

  const handleAddPrice = () => {
    setPrices([...prices, { amount: "", currency_code: "usd" }]);
  };

  const handleRemovePrice = (index: number) => {
    setPrices(prices.filter((_, i) => i !== index));
  };

  const handlePriceChange = (index: number, field: keyof PriceInput, value: string) => {
    const newPrices = [...prices];
    newPrices[index] = { ...newPrices[index], [field]: value };
    setPrices(newPrices);
  };

  const handleUpdatePrices = () => {
    updatePricesMutation.mutate(prices);
  };

  return (
    <Container>
      <Toaster />
      <div className="flex items-center gap-3 mb-6">
        <CurrencyDollar className="text-ui-fg-subtle" />
        <Heading>Test Variant Price Updates</Heading>
      </div>

      <div className="flex flex-col gap-6">
        {/* Variant ID Input */}
        <div className="flex flex-col gap-4 p-6 border border-ui-border-base rounded-lg">
          <Heading level="h2">Variant Information</Heading>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="variantId">Variant ID</Label>
            <Input
              id="variantId"
              value={variantId}
              onChange={(e) => setVariantId(e.target.value)}
              placeholder="e.g., variant_01KEPEP70EPMVTSBRX1BH8K4D8"
            />
            <Text className="text-ui-fg-subtle text-sm">
              Only variant ID is required. Product ID will be automatically retrieved.
            </Text>
          </div>

          <Button
            onClick={fetchCurrentPrices}
            disabled={isLoading || !variantId}
            variant="secondary"
          >
            {isLoading ? "Loading..." : "Fetch Current Prices"}
          </Button>
        </div>

        {/* Current Prices Display */}
        {currentPrices.length > 0 && (
          <div className="flex flex-col gap-4 p-6 border border-ui-border-base rounded-lg bg-ui-bg-subtle">
            <Heading level="h2">Current Prices</Heading>
            <div className="flex flex-col gap-2">
              {currentPrices.map((price: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-ui-bg-base rounded border border-ui-border-base"
                >
                  <Text className="font-medium">
                    {price.currency_code.toUpperCase()}
                  </Text>
                  <Text className="font-semibold">{price.formatted}</Text>
                  <Text className="text-ui-fg-subtle text-sm">
                    ({price.amount} cents)
                  </Text>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price Update Form */}
        <div className="flex flex-col gap-4 p-6 border border-ui-border-base rounded-lg">
          <Heading level="h2">Update Prices</Heading>
          <Text className="text-ui-fg-subtle text-sm">
            Enter prices in base currency units (e.g., 100.00 for $100.00). 
            Amounts will be converted to cents automatically.
          </Text>

          <div className="flex flex-col gap-4">
            {prices.map((price, index) => (
              <div
                key={index}
                className="flex items-end gap-2 p-4 border border-ui-border-base rounded-lg"
              >
                <div className="flex-1 flex flex-col gap-2">
                  <Label htmlFor={`currency-${index}`}>Currency Code</Label>
                  <Input
                    id={`currency-${index}`}
                    value={price.currency_code}
                    onChange={(e) =>
                      handlePriceChange(index, "currency_code", e.target.value)
                    }
                    placeholder="usd, eur, gbp, inr"
                    className="uppercase"
                  />
                </div>

                <div className="flex-1 flex flex-col gap-2">
                  <Label htmlFor={`amount-${index}`}>Amount</Label>
                  <Input
                    id={`amount-${index}`}
                    type="number"
                    step="0.01"
                    value={price.amount}
                    onChange={(e) =>
                      handlePriceChange(index, "amount", e.target.value)
                    }
                    placeholder="100.00"
                  />
                </div>

                {prices.length > 1 && (
                  <Button
                    variant="danger"
                    onClick={() => handleRemovePrice(index)}
                    className="mb-0"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAddPrice} variant="secondary">
              Add Another Currency
            </Button>
            <Button
              onClick={handleUpdatePrices}
              disabled={updatePricesMutation.isPending || !variantId}
              isLoading={updatePricesMutation.isPending}
            >
              Update Prices
            </Button>
          </div>
        </div>

        {/* Example Section */}
        <div className="flex flex-col gap-4 p-6 border border-ui-border-base rounded-lg bg-ui-bg-subtle">
          <Heading level="h2">Example</Heading>
          <Text className="text-ui-fg-subtle text-sm">
            Example: To set $100.00 USD, €92.00 EUR, and £79.00 GBP:
          </Text>
          <div className="bg-ui-bg-base p-4 rounded border border-ui-border-base">
            <Text className="font-mono text-sm">
              {`USD: 100.00`}
              <br />
              {`EUR: 92.00`}
              <br />
              {`GBP: 79.00`}
            </Text>
          </div>
        </div>
      </div>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Test Variant Prices",
  icon: CurrencyDollar,
});

export default TestVariantPricesPage;
