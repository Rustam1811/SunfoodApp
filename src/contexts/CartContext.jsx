import React, { createContext, useReducer, useContext, useEffect } from 'react';
function reducer(state, action) {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existing = state.find(i => i.id === action.payload.id);
            if (existing) {
                return state.map(i => i.id === existing.id
                    ? { ...i, quantity: i.quantity + action.payload.quantity }
                    : i);
            }
            return [...state, action.payload];
        }
        // ✨ ИСПРАВЛЕНО: Добавлен кейс для увеличения количества
        case 'INCREASE_QUANTITY': {
            return state.map(item => item.id === action.payload
                ? { ...item, quantity: item.quantity + 1 }
                : item);
        }
        // ✨ ИСПРАВЛЕНО: Добавлен кейс для уменьшения количества
        case 'DECREASE_QUANTITY': {
            const itemToDecrease = state.find(item => item.id === action.payload);
            // Если количество товара 1, то уменьшение его удаляет
            if (itemToDecrease && itemToDecrease.quantity === 1) {
                return state.filter(item => item.id !== action.payload);
            }
            return state.map(item => item.id === action.payload
                ? { ...item, quantity: item.quantity - 1 }
                : item);
        }
        case 'REMOVE_ITEM':
            return state.filter(i => i.id !== action.payload.id);
        case 'CLEAR_CART':
            return [];
        default:
            return state;
    }
}
const StateCtx = createContext(null);
const DispatchCtx = createContext(null);
export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, [], () => {
        try {
            const ls = localStorage.getItem('cart');
            return ls ? JSON.parse(ls) : [];
        }
        catch {
            return [];
        }
    });
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(state));
    }, [state]);
    return (<StateCtx.Provider value={state}>
            <DispatchCtx.Provider value={dispatch}>
                {children}
            </DispatchCtx.Provider>
        </StateCtx.Provider>);
};
export function useCart() {
    const state = useContext(StateCtx);
    const dispatch = useContext(DispatchCtx);
    if (state === null || dispatch === null) {
        throw new Error('useCart must be used within CartProvider');
    }
    return { items: state, dispatch };
}
