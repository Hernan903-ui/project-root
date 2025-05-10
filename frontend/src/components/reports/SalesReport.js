import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#EC7063'];

const SalesReport = ({ data, loading, error, additionalFilters, onFilterChange }) => {
  // Agrupar por opciones
  const groupByOptions = [
    { value: 'day', label: 'Día' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mes' },
    { value: 'seller', label: 'Vendedor' },
    { value: 'category', label: 'Categoría' },
    { value: 'paymentMethod', label: 'Método de pago' }
  ];

  const handleGroupByChange = (e) => {
    onFilterChange({ groupBy: e.target.value });
  };

  // Formateo de valores
  const formatCurrency = (value) => {
    return `$${value.toFixed(2)}`;
  };

  // Formateo de fecha según el tipo de agrupación
  const formatDate = (dateString, groupBy) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (groupBy === 'day') {
        return format(date, 'PPP', { locale: es });
      } else if (groupBy === 'week') {
        return `Semana ${format(date, 'w')} - ${format(date, 'yyyy')}`;
      } else if (groupBy === 'month') {
        return format(date, 'MMMM yyyy', { locale: es });
      }
      return format(date, 'PPP', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center">
        {error}
      </Typography>
    );
  }

  if (!data) {
    return (
      <Typography variant="body1" color="text.secondary" align="center">
        No hay datos disponibles. Ajuste los filtros y genere el reporte.
      </Typography>
    );
  }

  return (
    <Box className="report-content">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Reporte de Ventas
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Agrupar por</InputLabel>
          <Select
            value={additionalFilters.groupBy || 'day'}
            onChange={handleGroupByChange}
            label="Agrupar por"
          >
            {groupByOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <Grid container spacing={3}>
        {/* Tarjetas de resumen */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Ventas Totales
            </Typography>
            <Typography variant="h4" color="primary">
              {formatCurrency(data.summary.totalSales)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {data.summary.periodLabel}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Transacciones
            </Typography>
            <Typography variant="h4" color="primary">
              {data.summary.totalTransactions}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ticket promedio: {formatCurrency(data.summary.averageTicket)}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Devoluciones
            </Typography>
            <Typography variant="h4" color="error">
              {formatCurrency(data.summary.totalReturns)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {data.summary.returnRate}% del total
            </Typography>
          </Paper>
        </Grid>
        
        {/* Gráfico principal */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Ventas por {additionalFilters.groupBy === 'day' ? 'Día' :
                          additionalFilters.groupBy === 'week' ? 'Semana' :
                          additionalFilters.groupBy === 'month' ? 'Mes' :
                          additionalFilters.groupBy === 'seller' ? 'Vendedor' :
                          additionalFilters.groupBy === 'category' ? 'Categoría' : 'Método de Pago'}
            </Typography>
            <Box sx={{ height: 400, width: '100%' }}>
              <ResponsiveContainer>
                {additionalFilters.groupBy === 'category' || 
                 additionalFilters.groupBy === 'paymentMethod' || 
                 additionalFilters.groupBy === 'seller' ? (
                  <BarChart
                    data={data.salesByGroup}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                                        <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={(value) => [`$${value}`, 'Ventas']} />
                    <Legend />
                    <Bar dataKey="amount" name="Ventas" fill="#8884d8" />
                    <Bar dataKey="transactions" name="Transacciones" fill="#82ca9d" />
                  </BarChart>
                ) : (
                  <LineChart
                    data={data.salesByGroup}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => formatDate(value, additionalFilters.groupBy || 'day')}
                    />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'amount' ? `$${value}` : value,
                        name === 'amount' ? 'Ventas' : 'Transacciones'
                      ]}
                      labelFormatter={(value) => formatDate(value, additionalFilters.groupBy || 'day')}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="amount" name="Ventas" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="transactions" name="Transacciones" stroke="#82ca9d" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Distribución de ventas por categoría */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Ventas por Categoría
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data.salesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {data.salesByCategory.map((entry, index) => (
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
        
        {/* Distribución por método de pago */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Ventas por Método de Pago
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data.salesByPaymentMethod}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {data.salesByPaymentMethod.map((entry, index) => (
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
        
        {/* Productos más vendidos */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Productos Más Vendidos
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Ventas</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.topProducts.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell align="right">{product.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(product.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* Mejores clientes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Mejores Clientes
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Cliente</TableCell>
                    <TableCell align="right">Compras</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.topCustomers.map((customer, index) => (
                    <TableRow key={index}>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell align="right">{customer.transactions}</TableCell>
                      <TableCell align="right">{formatCurrency(customer.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* Tabla de resumen por día */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Detalle de Ventas
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell align="right">Ventas Brutas</TableCell>
                    <TableCell align="right">Devoluciones</TableCell>
                    <TableCell align="right">Ventas Netas</TableCell>
                    <TableCell align="right">Transacciones</TableCell>
                    <TableCell align="right">Ticket Promedio</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.salesDetail.map((detail, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {additionalFilters.groupBy === 'day' || !additionalFilters.groupBy
                          ? formatDate(detail.date, 'day')
                          : additionalFilters.groupBy === 'week'
                          ? `Semana ${detail.week}`
                          : additionalFilters.groupBy === 'month'
                          ? formatDate(detail.date, 'month')
                          : detail.name}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(detail.grossSales)}</TableCell>
                      <TableCell align="right">{formatCurrency(detail.returns)}</TableCell>
                      <TableCell align="right">{formatCurrency(detail.netSales)}</TableCell>
                      <TableCell align="right">{detail.transactions}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(detail.transactions ? detail.netSales / detail.transactions : 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(data.summary.grossSales)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(data.summary.totalReturns)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(data.summary.totalSales)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {data.summary.totalTransactions}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(data.summary.averageTicket)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* Comparativa con periodo anterior */}
        {data.comparisonWithPreviousPeriod && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Comparación con período anterior
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Ventas
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color={data.comparisonWithPreviousPeriod.salesGrowth >= 0 ? 'success.main' : 'error.main'}
                    >
                      {data.comparisonWithPreviousPeriod.salesGrowth >= 0 ? '+' : ''}
                      {data.comparisonWithPreviousPeriod.salesGrowth}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Actual: {formatCurrency(data.summary.totalSales)}
                      <br />
                      Anterior: {formatCurrency(data.comparisonWithPreviousPeriod.previousSales)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Transacciones
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color={data.comparisonWithPreviousPeriod.transactionsGrowth >= 0 ? 'success.main' : 'error.main'}
                    >
                      {data.comparisonWithPreviousPeriod.transactionsGrowth >= 0 ? '+' : ''}
                      {data.comparisonWithPreviousPeriod.transactionsGrowth}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Actual: {data.summary.totalTransactions}
                      <br />
                      Anterior: {data.comparisonWithPreviousPeriod.previousTransactions}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Ticket Promedio
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color={data.comparisonWithPreviousPeriod.ticketGrowth >= 0 ? 'success.main' : 'error.main'}
                    >
                      {data.comparisonWithPreviousPeriod.ticketGrowth >= 0 ? '+' : ''}
                      {data.comparisonWithPreviousPeriod.ticketGrowth}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Actual: {formatCurrency(data.summary.averageTicket)}
                      <br />
                      Anterior: {formatCurrency(data.comparisonWithPreviousPeriod.previousAverageTicket)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default SalesReport;