export type ShippingMethodQuote = {
  code: string;
  customFields?: unknown;
  description: string;
  id: number;
  /* Опциональные метаданные возвращенные ShippingCalculator или ShippingCalculationResult */
  metadata?: Record<string, unknown>;
  name: string;
  price: number;
};
