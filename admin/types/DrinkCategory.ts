export interface LocalizedString {
  ru: string;
  kz: string;
  en: string;
  image: string;
}

export interface Recommendation {
  id: number;
  title: LocalizedString;
  image: string;
}

export interface Product {
  id: number;
  name: LocalizedString;
  price: number;
  description: LocalizedString;
  ingredients: LocalizedString[];
  recommendation: LocalizedString;
  recommendations?: Recommendation[];
  image: string;
}

export interface DrinkCategory {
  id: string; // ОБЯЗАТЕЛЬНО string!!!
  title: LocalizedString;
  image: string;
  products: Product[];
  order: number; // 👈 если добавил сортировку
}
