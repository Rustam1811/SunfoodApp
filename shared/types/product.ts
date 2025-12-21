/**
 * Shared Product Types
 * Used by both client and admin apps
 */

export interface LocalizedString {
  ru: string;
  kz: string;
  en: string;
}

export interface LocalizedArray {
  ru: string[];
  kz: string[];
  en: string[];
}

export interface Recommendation {
  id: string;
  name: LocalizedString;
  image?: string;
}

export interface Product {
  id: string;
  name: LocalizedString;
  description?: LocalizedString;
  price: number;
  image?: string;
  paymentLink?: string;
  ingredients?: LocalizedArray;
  recommendations?: Recommendation[];
}

export interface DrinkCategory {
  id: string;
  title: LocalizedString;
  image?: string;
  products: Product[];
}
