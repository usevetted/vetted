import { createContext, useContext, useState } from 'react';

const NavigationContext = createContext();

export function NavigationProvider({ children }) {
  const [tabHistory, setTabHistory] = useState({
    '/discover': '/discover',
    '/matches': '/matches',
    '/messages': '/messages',
    '/profile': '/profile',
  });

  const updateTabHistory = (rootPath, pathname) => {
    setTabHistory(prev => ({ ...prev, [rootPath]: pathname }));
  };

  const resetTabStack = (rootPath) => {
    setTabHistory(prev => ({ ...prev, [rootPath]: rootPath }));
  };

  return (
    <NavigationContext.Provider value={{ tabHistory, updateTabHistory, resetTabStack }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}