import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, CircularProgress, Alert, Grid } from '@mui/material';
import GridItem from '../components/common/GridItem'; // Importamos el componente GridItem personalizado
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
  } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Cargar productos más vendidos
  const {
    data: topProducts,
    isLoading: isLoadingTopProducts,
    error: topProductsError
  } = useQuery({
    queryKey: ['topProducts'],
    queryFn: () => getTopSellingProducts(10),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  // Cargar productos con bajo stock
  const {
    data: lowStockProducts,
    isLoading: isLoadingLowStock,
    error: lowStockError
  } = useQuery({
    queryKey: ['lowStockProducts'],
    queryFn: getLowStockProducts,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Cargar valor del inventario
  const {
    data: inventoryValue,
    isLoading: isLoadingInventory,
    error: inventoryError
  } = useQuery({
    queryKey: ['inventoryValue'],
    queryFn: getInventoryValue,
    staleTime: 15 * 60 * 1000, // 15 minutos
  });

  // Calcular estadísticas con useMemo para evitar cálculos innecesarios
  const totalSales = useMemo(() => {
    if (!salesData || salesData.length === 0) return '0.00';
    return salesData.reduce((sum, day) => sum + day.revenue, 0).toFixed(2);
  }, [salesData]);

  const totalOrders = useMemo(() => {
    if (!salesData || salesData.length === 0) return 0;
    return salesData.reduce((sum, day) => sum + day.total_sales, 0);
  }, [salesData]);

  const inventoryStats = useMemo(() => {
    if (!inventoryValue) return { value: '0.00', products: 0 };

    return {
      value: inventoryValue.summary?.total_retail_value.toFixed(2) || '0.00',
      products: inventoryValue.summary?.total_products || 0
    };
  }, [inventoryValue]);

  const lowStockCount = useMemo(() => {
    if (!lowStockProducts) return 0;
    return lowStockProducts.length;
  }, [lowStockProducts]);

  // Renderizar loading spinner si aún están cargando los datos principales
  if (isLoadingSales && isLoadingInventory) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Mostrar errores si hay alguno
  const hasErrors = salesError || topProductsError || lowStockError || inventoryError;
  if (hasErrors) {
    const error = salesError || topProductsError || lowStockError || inventoryError;
    let errorMessage;

    if (typeof error === 'object') {
      // Prioritize detail or message, otherwise stringify the whole object
      errorMessage = error?.detail || error?.message || JSON.stringify(error);
    } else {
      // If it's not an object, use the error directly or a default message
      errorMessage = error || 'Error cargando datos del dashboard.';
    }


    return (
      <Alert severity="error" variant="filled" sx={{ mt: 2, mb: 2 }}>
        {errorMessage}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      {/* Cards de estadísticas - Asegúrate de que este Grid tiene la prop columns */}
      {/* También remueve la prop 'item' de GridItem si aún la tiene */}
      <Grid container spacing={3} sx={{ mb: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
        <GridItem xs={12} sm={6} md={3}>
          <StatCard
            title="Ventas Totales"
            value={`$${totalSales}`}
            description="Últimos 30 días"
            icon={<AttachMoneyIcon />}
            color="primary"
          />
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <StatCard
            title="Órdenes"
            value={totalOrders}
            description="Últimos 30 días"
            icon={<ShoppingCartIcon />}
            color="secondary"
          />
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <StatCard
            title="Valor Inventario"
            value={`$${inventoryStats.value}`}
            description={`${inventoryStats.products} productos`}
            icon={<InventoryIcon />}
            color="success"
          />
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <StatCard
            title="Bajo Stock"
            value={lowStockCount}
            description="Productos para reabastecer"
            icon={<PeopleIcon />}
            color="error"
          />
        </GridItem>
      </Grid>

      {/* Gráfico y accesos rápidos - Asegúrate de que este Grid tiene la prop columns */}
      {/* También remueve la prop 'item' de GridItem si aún la tiene */}
      <Grid container spacing={3} sx={{ mb: 3 }} columns={{ xs: 4, md: 12 }}>
        <GridItem xs={12} md={8}>
          {isLoadingSales ? (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              p: 5,
              height: '100%',
              minHeight: 300,
              alignItems: 'center',
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 1
            }}>
              <CircularProgress />
            </Box>
          ) : (
            <SalesChart
              salesData={salesData || []}
              title="Tendencia de Ventas"
              period="últimos 30 días"
            />
          )}
        </GridItem>
        <GridItem xs={12} md={4}>
          <QuickAccess />
        </GridItem>
      </Grid>

      {/* Productos con bajo stock y más vendidos - Asegúrate de que este Grid tiene la prop columns */}
      {/* También remueve la prop 'item' de GridItem si aún la tiene */}
      <Grid container spacing={3} columns={{ xs: 4, md: 12 }}>
        <GridItem xs={12} md={6}>
          {isLoadingLowStock ? (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              p: 5,
              minHeight: 300,
              alignItems: 'center',
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 1
            }}>
              <CircularProgress />
            </Box>
          ) : (
            <LowStockTable products={lowStockProducts || []} />
          )}
        </GridItem>
        <GridItem xs={12} md={6}>
          {isLoadingTopProducts ? (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              p: 5,
              minHeight: 300,
              alignItems: 'center',
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 1
            }}>
              <CircularProgress />
            </Box>
          ) : (
            <TopProductsTable products={topProducts || []} />
          )}
        </GridItem>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
