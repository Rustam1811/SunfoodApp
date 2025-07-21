import { useState, useEffect, useCallback } from 'react';
import {
  StoryPack,
  Promotion,
  CuratedItem,
} from '../types/homePageTypes';
import {
  listenStoryPacks,
  listenPromotions,
  listenCuratedItems,
  addStoryPack,
  updateStoryPack,
  deleteStoryPack,
  addPromotion,
  updatePromotion,
  deletePromotion,
  addCuratedItem,
  updateCuratedItem,
  deleteCuratedItem,
} from '../services/homePageService';

export const useStoryPacks = () => {
  const [storyPacks, setStoryPacks] = useState<StoryPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = listenStoryPacks((packs) => {
      setStoryPacks(packs);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const create = useCallback(async (data: Omit<StoryPack, 'id'>) => {
    try {
      await addStoryPack(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<StoryPack>) => {
    try {
      await updateStoryPack(id, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await deleteStoryPack(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  return {
    storyPacks,
    loading,
    error,
    create,
    update,
    remove,
    clearError: () => setError(null),
  };
};

export const usePromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = listenPromotions((promos) => {
      setPromotions(promos);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const create = useCallback(async (data: Omit<Promotion, 'id'>) => {
    try {
      await addPromotion(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<Promotion>) => {
    try {
      await updatePromotion(id, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await deletePromotion(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  return {
    promotions,
    loading,
    error,
    create,
    update,
    remove,
    clearError: () => setError(null),
  };
};

export const useCuratedItems = () => {
  const [curatedItems, setCuratedItems] = useState<CuratedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = listenCuratedItems((items) => {
      setCuratedItems(items);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const create = useCallback(async (data: Omit<CuratedItem, 'id'>) => {
    try {
      await addCuratedItem(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<CuratedItem>) => {
    try {
      await updateCuratedItem(id, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await deleteCuratedItem(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  return {
    curatedItems,
    loading,
    error,
    create,
    update,
    remove,
    clearError: () => setError(null),
  };
};
