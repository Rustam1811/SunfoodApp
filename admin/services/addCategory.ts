import { db } from '../../src/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface LocalizedString {
  ru: string;
  kz: string;
  en: string;
}

interface Recommendation {
  id: number;
  title: LocalizedString;
  image: string;
}

interface Product {
  id: number;
  name: LocalizedString;
  price: number;
  description: LocalizedString;
  ingredients: LocalizedString[];
  recommendation: LocalizedString;
  recommendations?: Recommendation[];
  image: string;
}

interface DrinkCategory {
  id: number;
  title: LocalizedString;
  image: string;
  products: Product[]; // массив продуктов
}

export async function addCategory(data: Omit<DrinkCategory, 'products'>) {
  await addDoc(collection(db, 'categories'), {
    ...data,
    products: [] // явно добавляем пустой массив продуктов
  });
}
