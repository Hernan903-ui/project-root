import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Grid, Box, Typography, CircularProgress, Alert } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';

import StatCard from '../components/dashboard/StatCard';
import SalesChart from '../components/dashboard/SalesChart';
import LowStockTable from '../components/dashboard/LowStockTable';
import TopProductsTable from '../components/dashboard/TopProductsTable';
import QuickAccess from '../components/dashboard/QuickAccess';

import { 
  getDashboardStats, 
  getTopSellingProducts, 
  getLowStockProducts, 
  getInventoryValue 
} from '../api/dashboardApi';

const DashboardPage = () => {
  // Cargar datos de ventas
  const { 
    data: salesData, 
    isLoading: isLoadingSales, 
    error: salesError 
  } = useQuery('dashboardStats', getDashboardStats);

  // Cargar productos más vendidos
  const { 
    data: topProducts, 
    isLoading: isLoadingTopProducts, 
    error: topProductsError 
  } = useQuery('topProducts', () => getTopSellingProducts(10));

  // Cargar productos con bajo stock
  const { 
    data: lowStockProducts, 
    isLoading: isLoadingLowStock, 
    error: lowStockError 
  } = useQuery('lowStockProducts', getLowStockProducts);

  // Cargar valor del inventario
  const { 
    data: inventoryValue, 
    isLoading: isLoadingInventory, 
    error: inventoryError 
  } = useQuery('inventoryValue', getInventoryValue);

  // Calcular estadísticas
  const calculateTotalSales = () => {
    if (!salesData || salesData.length === 0) return 0;
    return salesData.reduce((sum, day) => sum + day.revenue, 0).toFixed(2);
  };

  const calculateTotalOrders = () => {
    if (!salesData || salesData.length === 0) return 0;
    return salesData.reduce((sum, day) => sum + day.total_sales, 0);
  };

  const calculateInventoryStats = () => {
    if (!inventoryValue) return { value: 0, products: 0 };
    
    return {
      value: inventoryValue.summary?.total_retail_value.toFixed(2) || 0,
      products: inventoryValue.summary?.total_products || 0
    };
  };

  const calculateLowStockCount = () => {
    if (!lowStockProducts) return 0;
    return lowStockProducts.length;
  };

  // Renderizar loading spinner si aún están cargando los datos principales
  if (isLoadingSales && isLoadingInventory) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Mostrar errores si hay alguno
  const hasErrors = salesError || topProductsError || lowStockError || inventoryError;
  if (hasErrors) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error cargando datos del dashboard. Por favor, intente de nuevo más tarde.
      </Alert>
    );
  }

  const inventoryStats = calculateInventoryStats();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Cards de estadísticas */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Ventas Totales" 
            value={`$${calculateTotalSales()}`} 
            description="Últimos 30 días" 
            icon={<AttachMoneyIcon />} 
            color="primary" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Órdenes" 
            value={calculateTotalOrders()} 
            description="Últimos 30 días" 
            icon={<ShoppingCartIcon />} 
            color="secondary" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Valor Inventario" 
            value={`$${inventoryStats.value}`} 
            description={`${inventoryStats.products} productos`} 
            icon={<InventoryIcon />} 
            color="success" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Bajo Stock" 
            value={calculateLowStockCount()} 
            description="Productos para reabastecer" 
            icon={<PeopleIcon />} 
            color="error" 
          />
        </Grid>
      </Grid>

      {/* Gráfico y accesos rápidos */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={8}>
          {isLoadingSales ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <SalesChart 
              salesData={salesData || []} 
              title="Tendencia de Ventas" 
              period="últimos 30 días" 
            />
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          <QuickAccess />
        </Grid>
      </Grid>

      {/* Productos con bajo stock y más vendidos */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {isLoadingLowStock ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <LowStockTable products={lowStockProducts || []} />
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {isLoadingTopProducts ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TopProductsTable products={topProducts || []} />
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;