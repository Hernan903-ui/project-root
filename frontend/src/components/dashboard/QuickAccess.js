import React from 'react';
import { Card, CardContent, Typography, Grid, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CategoryIcon from '@mui/icons-material/Category';
import AssessmentIcon from '@mui/icons-material/Assessment';

const QuickAccess = () => {
  const navigate = useNavigate();

  const shortcuts = [
    { title: 'Punto de Venta', icon: <ShoppingCartIcon />, path: '/pos', color: '#2196f3' },
    { title: 'Inventario', icon: <InventoryIcon />, path: '/inventory', color: '#ff9800' },
    { title: 'Productos', icon: <CategoryIcon />, path: '/products', color: '#4caf50' },
    { title: 'Clientes', icon: <PeopleIcon />, path: '/customers', color: '#9c27b0' },
    { title: 'Ventas', icon: <ReceiptIcon />, path: '/sales', color: '#f44336' },
    { title: 'Reportes', icon: <AssessmentIcon />, path: '/reports', color: '#607d8b' },
  ];

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Accesos Rápidos
        </Typography>
        <Grid container spacing={2} mt={1}>
          {shortcuts.map((shortcut) => (
            <Grid item xs={6} sm={4} key={shortcut.path}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate(shortcut.path)}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  borderColor: shortcut.color,
                  color: shortcut.color,
                  '&:hover': {
                    backgroundColor: `${shortcut.color}10`,
                    borderColor: shortcut.color,
                  },
                }}
              >
                <Box sx={{ fontSize: '2rem', mb: 1 }}>
                  {shortcut.icon}
                </Box>
                <Typography variant="body2">{shortcut.title}</Typography>
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default QuickAccess;