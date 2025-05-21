import React, { useCallback } from 'react';
import { Card, CardContent, Typography, Button, Box, Grid } from '@mui/material';
import GridItem from '../common/GridItem'; // Importamos GridItem personalizado
import { useNavigate } from 'react-router-dom';
import { alpha, useTheme } from '@mui/material/styles';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CategoryIcon from '@mui/icons-material/Category';
import AssessmentIcon from '@mui/icons-material/Assessment';

const QuickAccess = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Definimos los shortcuts con colores del tema para mejor consistencia
  const shortcuts = [
    { 
      title: 'Punto de Venta', 
      icon: <ShoppingCartIcon fontSize="large" />, 
      path: '/pos', 
      color: theme.palette.primary.main 
    },
    { 
      title: 'Inventario', 
      icon: <InventoryIcon fontSize="large" />, 
      path: '/inventory', 
      color: theme.palette.warning.main 
    },
    { 
      title: 'Productos', 
      icon: <CategoryIcon fontSize="large" />, 
      path: '/products', 
      color: theme.palette.success.main 
    },
    { 
      title: 'Clientes', 
      icon: <PeopleIcon fontSize="large" />, 
      path: '/customers', 
      color: theme.palette.secondary.main 
    },
    { 
      title: 'Ventas', 
      icon: <ReceiptIcon fontSize="large" />, 
      path: '/sales', 
      color: theme.palette.error.main 
    },
    { 
      title: 'Reportes', 
      icon: <AssessmentIcon fontSize="large" />, 
      path: '/reports', 
      color: theme.palette.info.main 
    },
  ];

  // Memoizamos la función de navegación para evitar recreaciones innecesarias
  const handleNavigate = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  return (
    <Card 
      elevation={2}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ 
            fontWeight: 'medium',
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: 1
          }}
        >
          Accesos Rápidos
        </Typography>
        
        {/* Usamos Grid regular como contenedor con propiedades de spacing */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {shortcuts.map((shortcut) => (
            /* Y GridItem para cada elemento hijo */
            <GridItem xs={6} sm={4} key={shortcut.path}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => handleNavigate(shortcut.path)}
                aria-label={`Ir a ${shortcut.title}`}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  borderColor: shortcut.color,
                  color: shortcut.color,
                  borderRadius: 1.5,
                  transition: theme.transitions.create([
                    'background-color', 
                    'box-shadow', 
                    'transform'
                  ], {
                    duration: theme.transitions.duration.standard,
                  }),
                  '&:hover': {
                    backgroundColor: alpha(shortcut.color, 0.08),
                    borderColor: shortcut.color,
                    transform: 'translateY(-3px)',
                    boxShadow: `0 4px 8px ${alpha(shortcut.color, 0.25)}`,
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                    boxShadow: `0 2px 4px ${alpha(shortcut.color, 0.25)}`,
                  }
                }}
              >
                <Box 
                  sx={{ 
                    color: shortcut.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {shortcut.icon}
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 'medium',
                    textAlign: 'center',
                    lineHeight: 1.2
                  }}
                >
                  {shortcut.title}
                </Typography>
              </Button>
            </GridItem>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default QuickAccess;