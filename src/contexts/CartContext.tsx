import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { LocalizedString } from '../../admin/types/types';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  paymentLink?: string;
}

type Action =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { id: number } }
  | { type: 'CLEAR_CART' };

const initial: CartItem[] = [];

function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.find(i => i.id === action.payload.id);
      if (existing) {
        return state.map(i =>
          i.id === existing.id
            ? { ...i, quantity: i.quantity + action.payload.quantity }
            : i
        );
      }
      return [...state, action.payload];
    }
    case 'REMOVE_ITEM':
      return state.filter(i => i.id !== action.payload.id);
    case 'CLEAR_CART':
      return [];
    default:
      return state;
  }
}

const StateCtx = createContext<CartItem[] | null>(null);
const DispatchCtx = createContext<React.Dispatch<Action> | null>(null);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initial);
  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>
        {children}
      </DispatchCtx.Provider>
    </StateCtx.Provider>
  );
};

export function useCart() {
  const state = useContext(StateCtx);
  const dispatch = useContext(DispatchCtx);
  if (!state || !dispatch) {
    throw new Error('useCart must be used within CartProvider');
  }
  return { items: state, dispatch };
}
