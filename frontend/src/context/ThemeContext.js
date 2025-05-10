import React, { createContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import getTheme from '../themes';

// Crear contexto
export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

// Proveedor de tema
export const ThemeProvider = ({ children }) => {
  // Verificar si hay un tema guardado en localStorage
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  // Función para cambiar entre temas
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  // Efecto para detectar preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Solo aplicar la preferencia del sistema si no hay un tema guardado
    if (!localStorage.getItem('theme')) {
      setTheme(mediaQuery.matches ? 'dark' : 'light');
    }

    // Escuchar cambios en la preferencia del sistema
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Memo para evitar re-renderizados innecesarios
  const themeContextValue = useMemo(
    () => ({
      theme,
      toggleTheme,
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <MuiThemeProvider theme={getTheme(theme)}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Hook personalizado para usar el tema
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};