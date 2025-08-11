export interface DrinkItem {
  id: string | number;
  name: string;
  price: number;
  image: string;
  category: string; // category key
}

export interface DrinkCategoryTab {
  key: string;
  label: string;
}
