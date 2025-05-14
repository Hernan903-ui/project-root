import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Divider,
  useTheme
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  ErrorOutline as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const InventoryStats = ({ inventoryData, loading }) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Datos principales
  const totalItems = inventoryData.totalItems || 0;
  const totalQuantity = inventoryData.totalQuantity || 0;
  const lowStock = inventoryData.lowStock || 0;
  const outOfStock = inventoryData.outOfStock || 0;
  const totalValue = inventoryData.totalValue || 0;

  // Datos para gráficos
  const categoriesData = inventoryData.categoriesData || [];
  const valueByCategory = inventoryData.valueByCategory || [];
  const stockLevels = inventoryData.stockLevels || [];
  const movementsTrend = inventoryData.movementsTrend || [];

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    '#8884d8',
    '#82ca9d',
    '#ffc658'
  ];

  return (
    <Box>
      {/* Resumen principal */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 115, 230, 0.1)' : 'rgba(0, 115, 230, 0.05)',
              border: `1px solid ${theme.palette.primary.light}`
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <InventoryIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" color="primary">
                Total Ítems
              </Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'medium' }}>
              {totalItems}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalQuantity} unidades en total
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.05)',
              border: `1px solid ${theme.palette.warning.light}`
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WarningIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6" color="warning.main">
                Bajo Stock
              </Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'medium' }}>
              {lowStock}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {lowStock > 0 ? 'Requieren atención' : 'Todo en orden'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(211, 47, 47, 0.1)' : 'rgba(211, 47, 47, 0.05)',
              border: `1px solid ${theme.palette.error.light}`
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ErrorIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6" color="error">
                Agotados
              </Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'medium' }}>
              {outOfStock}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {outOfStock > 0 ? 'Requieren reposición urgente' : 'Ningún producto agotado'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(46, 125, 50, 0.05)',
              border: `1px solid ${theme.palette.success.light}`
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUpIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="h6" color="success.main">
                Valor Total
              </Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'medium' }}>
              ${totalValue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Valoración del inventario
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Distribución por categoría */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" gutterBottom>
              Distribución por Categoría
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {categoriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={categoriesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill={theme.palette.primary.main} name="Cantidad" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                <Typography color="text.secondary">
                  No hay datos disponibles para mostrar el gráfico
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Valor por categoría */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" gutterBottom>
              Valor por Categoría
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {valueByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={valueByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {valueByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                <Typography color="text.secondary">
                  No hay datos disponibles para mostrar el gráfico
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Niveles de stock */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" gutterBottom>
              Niveles de Stock
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {stockLevels.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={stockLevels}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="current" fill={theme.palette.primary.main} name="Stock Actual" />
                  <Bar dataKey="minimum" fill={theme.palette.error.main} name="Stock Mínimo" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                <Typography color="text.secondary">
                  No hay datos disponibles para mostrar el gráfico
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Tendencia de movimientos */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" gutterBottom>
              Tendencia de Movimientos
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {movementsTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={movementsTrend}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="in"
                    stroke={theme.palette.success.main}
                    name="Entradas"
                  />
                  <Line
                    type="monotone"
                    dataKey="out"
                    stroke={theme.palette.error.main}
                    name="Salidas"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                <Typography color="text.secondary">
                  No hay datos disponibles para mostrar el gráfico
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InventoryStats;