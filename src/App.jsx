import React from 'react';
import AppRouter from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext';
import { BrandingProvider } from './context/BrandingContext';

function App() {
  return (
    <AuthProvider>
      <BrandingProvider>
        <AppRouter />
      </BrandingProvider>
    </AuthProvider>
  );
}

export default App;
