import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import store from './store';
import AppRoutes from './routes';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <NotificationProvider>
          <CssBaseline />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </NotificationProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;