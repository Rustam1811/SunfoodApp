// components/NavigationProvider.tsx
import React, { createContext, useContext, useState } from 'react';

type Screen = 'home' | 'menu' | 'customizer' | 'profile' | 'cart';

interface NavigationContextType {
  currentScreen: Screen;
  navigateTo: (screen: Screen) => void;
  screens: Screen[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: React.ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const screens: Screen[] = ['home', 'menu', 'customizer', 'profile', 'cart'];

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  return (
    <NavigationContext.Provider value={{ currentScreen, navigateTo, screens }}>
      {children}
    </NavigationContext.Provider>
  );
};