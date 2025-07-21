import { db } from '../../src/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';

export interface OrderItem {
  productId: string;
  category: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  createdAt: Date;
  items: OrderItem[];
  totalPrice: number;
}

export async function getOrders(from: Date, to: Date): Promise<Order[]> {
  const q = query(
    collection(db, 'orders'),
    where('createdAt', '>=', Timestamp.fromDate(from)),
    where('createdAt', '<=', Timestamp.fromDate(to))
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({
    id: doc.id,
    createdAt: doc.data().createdAt.toDate(),
    items: doc.data().items,
    totalPrice: doc.data().totalPrice
  }));
}

export function aggregateOrders(orders: Order[]) {
  // Суммарные показатели
  const byProduct: Record<string, { name: string; category: string; qty: number; revenue: number }> = {};
  const byCategory: Record<string, { qty: number; revenue: number }> = {};
  const byHour: Record<string, number> = {};
  const byDay: Record<string, number> = {};
  let totalRevenue = 0;
  let totalOrders = orders.length;
  let totalItems = 0;

  for (const order of orders) {
    const hour = order.createdAt.getHours();
    const day = order.createdAt.toISOString().slice(0, 10);
    byHour[hour] = (byHour[hour] || 0) + 1;
    byDay[day] = (byDay[day] || 0) + 1;
    totalRevenue += order.totalPrice;
    for (const item of order.items) {
      totalItems += item.qty;
      // По товарам
      if (!byProduct[item.productId]) {
        byProduct[item.productId] = {
          name: item.name,
          category: item.category,
          qty: 0,
          revenue: 0
        };
      }
      byProduct[item.productId].qty += item.qty;
      byProduct[item.productId].revenue += item.price * item.qty;
      // По категориям
      if (!byCategory[item.category]) {
        byCategory[item.category] = { qty: 0, revenue: 0 };
      }
      byCategory[item.category].qty += item.qty;
      byCategory[item.category].revenue += item.price * item.qty;
    }
  }

  // Топ товаров
  const topProducts = Object.values(byProduct).sort((a, b) => b.qty - a.qty);
  // Топ категорий
  const topCategories = Object.entries(byCategory).map(([category, data]) => ({ category, ...data })).sort((a, b) => b.qty - a.qty);

  return {
    totalRevenue,
    totalOrders,
    totalItems,
    byProduct,
    byCategory,
    byHour,
    byDay,
    topProducts,
    topCategories
  };
}
