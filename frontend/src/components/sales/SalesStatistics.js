import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#EC7063'];

const SalesStatistics = ({ statistics, loading }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!statistics) {
    return (
      <Typography variant="body1" color="text.secondary" align="center">
        No hay datos estadísticos disponibles
      </Typography>
    );
  }

  // Format currency
  const formatCurrency = (value) => {
    return `$${value.toFixed(2)}`;
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Tarjetas de resumen */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Ventas Totales
            </Typography>
            <Typography variant="h4" color="primary">
              {formatCurrency(statistics.totalSales)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {statistics.periodLabel || 'Período actual'}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Número de Transacciones
            </Typography>
            <Typography variant="h4" color="primary">
              {statistics.totalTransactions}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ticket promedio: {formatCurrency(statistics.averageTicket)}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Devoluciones
            </Typography>
            <Typography variant="h4" color="error">
              {formatCurrency(statistics.totalReturns)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {statistics.returnPercentage}% del total de ventas
            </Typography>
          </Paper>
        </Grid>
        
        {/* Gráfica de ventas por día/mes */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Ventas por Período
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statistics.salesByPeriod}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => [`$${value}`, 'Ventas']} />
                  <Legend />
                  <Bar dataKey="amount" name="Ventas" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Distribución de ventas por categoría */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Ventas por Categoría
            </Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statistics.salesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {statistics.salesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Ventas']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Top productos y clientes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Productos Más Vendidos
            </Typography>
            <List>
              {statistics.topProducts.map((product, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={product.name}
                      secondary={`${product.quantity} unidades - ${formatCurrency(product.amount)}`}
                    />
                  </ListItem>
                  {index < statistics.topProducts.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Mejores Clientes
            </Typography>
            <List>
              {statistics.topCustomers.map((customer, index) => (
                <React.Fragment key={index}>
                                    <ListItem>
                    <ListItemText
                      primary={customer.name}
                      secondary={`${customer.transactions} transacciones - ${formatCurrency(customer.amount)}`}
                    />
                  </ListItem>
                  {index < statistics.topCustomers.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        
        {/* Métodos de pago */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Distribución por Método de Pago
            </Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statistics.salesByPaymentMethod}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 30,
                    left: 120,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                  <YAxis type="category" dataKey="method" width={100} />
                  <Tooltip formatter={(value) => [`$${value}`, 'Ventas']} />
                  <Legend />
                  <Bar dataKey="amount" name="Ventas por método de pago" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Comparativas */}
        {statistics.comparisonWithPreviousPeriod && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Comparación con Período Anterior
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Ventas
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color={statistics.comparisonWithPreviousPeriod.salesGrowth >= 0 ? 'success.main' : 'error.main'}
                    >
                      {statistics.comparisonWithPreviousPeriod.salesGrowth >= 0 ? '+' : ''}
                      {statistics.comparisonWithPreviousPeriod.salesGrowth}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Transacciones
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color={statistics.comparisonWithPreviousPeriod.transactionsGrowth >= 0 ? 'success.main' : 'error.main'}
                    >
                      {statistics.comparisonWithPreviousPeriod.transactionsGrowth >= 0 ? '+' : ''}
                      {statistics.comparisonWithPreviousPeriod.transactionsGrowth}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Ticket Promedio
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color={statistics.comparisonWithPreviousPeriod.averageTicketGrowth >= 0 ? 'success.main' : 'error.main'}
                    >
                      {statistics.comparisonWithPreviousPeriod.averageTicketGrowth >= 0 ? '+' : ''}
                      {statistics.comparisonWithPreviousPeriod.averageTicketGrowth}%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
        
        {/* Ventas por Vendedor */}
        {statistics.salesByEmployee && statistics.salesByEmployee.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Ventas por Vendedor
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statistics.salesByEmployee}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={(value) => [`$${value}`, 'Ventas']} />
                    <Legend />
                    <Bar dataKey="amount" name="Ventas" fill="#8884d8" />
                    <Bar dataKey="transactions" name="Transacciones" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        )}
        
        {/* Estadísticas adicionales */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Estadísticas Adicionales
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Ventas Canceladas
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(statistics.cancelledSalesAmount)} ({statistics.cancelledSalesCount} ventas)
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Descuentos Aplicados
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(statistics.totalDiscounts)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Impuestos Recaudados
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(statistics.totalTaxes)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SalesStatistics;