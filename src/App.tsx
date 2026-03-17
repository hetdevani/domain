import React, { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes';
import { Toaster } from 'react-hot-toast';
import { TourProvider } from '@reactour/tour';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              fontWeight: 500,
              padding: '12px 24px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
        <AuthProvider>
          <TourProvider
            steps={[]}
            showBadge={false}
            showCloseButton
            disableDotsNavigation={false}
            padding={12}
            styles={{
              popover: (base) => ({
                ...base,
                borderRadius: 14,
                boxShadow: '0 20px 45px rgba(15,23,42,0.2)',
                maxWidth: 360,
              }),
              maskArea: (base) => ({
                ...base,
                rx: 10,
              }),
            }}
          >
            <AppRoutes />
          </TourProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
