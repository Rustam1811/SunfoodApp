import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/auth/AuthContextV2';
import { CartProvider } from '@/contexts/CartContext';

type AppProvidersProps = {
  children: React.ReactNode;
};

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => (
  <AuthProvider>
    <CartProvider>
      <BrowserRouter>{children}</BrowserRouter>
    </CartProvider>
  </AuthProvider>
);

export default AppProviders;
