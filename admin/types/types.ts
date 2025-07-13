// admin/types/types.ts

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
  ingredients?: LocalizedArray;            // <— добавили
  recommendations?: Recommendation[];      // <— добавили
}

export interface DrinkCategoryLocal {
  id: string;
  title: LocalizedString;
  image?: string;
  products: Product[];
}
