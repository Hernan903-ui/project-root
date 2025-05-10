import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Colores base de la aplicación
const primaryColor = {
  main: '#1976d2',
  light: '#42a5f5',
  dark: '#1565c0',
  contrastText: '#fff'
};

const secondaryColor = {
  main: '#f50057',
  light: '#ff4081',
  dark: '#c51162',
  contrastText: '#fff'
};

// Tema claro
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: primaryColor,
    secondary: secondaryColor,
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)'
    },
    divider: 'rgba(0, 0, 0, 0.12)'
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500
    },
    h2: {
      fontWeight: 500
    },
    h3: {
      fontWeight: 500
    },
    h4: {
      fontWeight: 500
    },
    h5: {
      fontWeight: 500
    },
    h6: {
      fontWeight: 500
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12)',
          backgroundImage: 'none'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)'
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: '#f5f5f5'
        }
      }
    }
  }
});

// Tema oscuro
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      light: '#e3f2fd',
      dark: '#42a5f5',
      contrastText: 'rgba(0, 0, 0, 0.87)'
    },
    secondary: {
      main: '#f48fb1',
      light: '#fce4ec',
      dark: '#f06292',
      contrastText: 'rgba(0, 0, 0, 0.87)'
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e'
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)'
    },
    divider: 'rgba(255, 255, 255, 0.12)'
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
          backgroundImage: 'none'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          backgroundColor: '#1e1e1e'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)'
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: '#333333'
        }
      }
    }
  }
});

// Hacer las fuentes responsivas
const responsiveLight = responsiveFontSizes(lightTheme);
const responsiveDark = responsiveFontSizes(darkTheme);

const getTheme = (mode) => {
  return mode === 'dark' ? responsiveDark : responsiveLight;
};

export default getTheme;