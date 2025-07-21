import { useState, useEffect, useCallback } from 'react';
import { getOrders, aggregateOrders, Order } from '../services/analyticsService';

export function useAnalytics(period: 'day' | 'week' | 'month') {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aggregated, setAggregated] = useState<any>(null);

  const getPeriodRange = useCallback(() => {
    const now = new Date();
    let from: Date;
    switch (period) {
      case 'day':
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        break;
      case 'month':
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    return { from, to: now };
  }, [period]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const { from, to } = getPeriodRange();
        const orders = await getOrders(from, to);
        setOrders(orders);
        setAggregated(aggregateOrders(orders));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [period, getPeriodRange]);

  return {
    orders,
    loading,
    error,
    aggregated,
    refresh: () => {
      const { from, to } = getPeriodRange();
      getOrders(from, to).then(orders => {
        setOrders(orders);
        setAggregated(aggregateOrders(orders));
      });
    }
  };
}
