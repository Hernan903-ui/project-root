// src/App.js
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ThemeProvider } from '@mui/material/styles';
import withOfflineMode from './hoc/withOfflineMode';
import router from './routes';
import theme from './themes';
import { checkAuthStatus } from './features/auth/authSlice';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { checkAuthStatus } from './features/auth/authSlice';

function App({ isOffline }) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(checkAuthStatus());
    const handleForceLogout = () => {
      window.location.href = '/login';
    };
    window.addEventListener('forceLogout', handleForceLogout);
    return () => {
      window.removeEventListener('forceLogout', handleForceLogout);
    };
  }, [dispatch]);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default withOfflineMode(App);