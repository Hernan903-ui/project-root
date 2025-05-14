import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Tema claro
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

// Tema oscuro
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
  },
});

// Hacer las fuentes responsivas
const responsiveLight = responsiveFontSizes(lightTheme);
const responsiveDark = responsiveFontSizes(darkTheme);

const getTheme = (mode) => {
  return mode === 'dark' ? responsiveDark : responsiveLight;
};

export default getTheme;