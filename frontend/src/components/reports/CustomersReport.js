import React from 'react';
import {
  Box,
  Typography,
  Paper,
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
  MenuItem,
  Chip
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
  Cell,
  LineChart,
  Line
} from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#EC7063'];

const CustomersReport = ({ data, loading, error, additionalFilters, onFilterChange }) => {
  // Opciones para agrupar por
  const groupByOptions = [
    { value: 'type', label: 'Tipo' },
    { value: 'city', label: 'Ciudad' },
    { value: 'state', label: 'Provincia/Estado' },
    { value: 'activity', label: 'Actividad' }
  ];

  // Opciones para ordenar por
  const sortByOptions = [
    { value: 'purchases', label: 'Compras' },
    { value: 'frequency', label: 'Frecuencia' },
    { value: 'lastPurchase', label: 'Última compra' }
  ];

  const handleGroupByChange = (e) => {
    onFilterChange({ groupBy: e.target.value });
  };

  const handleSortByChange = (e) => {
    onFilterChange({ sortBy: e.target.value });
  };

  // Formateo de valores
  const formatCurrency = (value) => {
    return `$${value.toFixed(2)}`;
  };

  // Formateo de fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PP', { locale: es });
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
          Reporte de Clientes
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Agrupar por</InputLabel>
            <Select
              value={additionalFilters.groupBy || 'type'}
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
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Ordenar por</InputLabel>
            <Select
              value={additionalFilters.sortBy || 'purchases'}
              onChange={handleSortByChange}
              label="Ordenar por"
            >
              {sortByOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Tarjetas de resumen */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Total de Clientes
            </Typography>
            <Typography variant="h4" color="primary">
              {data.summary.totalCustomers}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {data.summary.newCustomers} nuevos en el período
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Clientes Activos
            </Typography>
            <Typography variant="h4" color="success.main">
              {data.summary.activeCustomers}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {((data.summary.activeCustomers / data.summary.totalCustomers) * 100).toFixed(1)}% del total
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Valor de Compra Promedio
            </Typography>
            <Typography variant="h4" color="info.main">
              {formatCurrency(data.summary.averagePurchaseValue)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Por cliente activo
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Frecuencia de Compra
            </Typography>
            <Typography variant="h4" color="secondary.main">
              {data.summary.purchaseFrequency.toFixed(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Días entre compras
            </Typography>
          </Paper>
        </Grid>
        
        {/* Gráfico de nuevos clientes */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Nuevos Clientes por Período
            </Typography>
            <Box sx={{ height: 300, width: '100%' }}>
              <ResponsiveContainer>
                <LineChart
                  data={data.newCustomersByPeriod}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="period" 
                    tickFormatter={(value) => {
                      try {
                        return format(new Date(value), 'MMM yyyy', { locale: es });
                      } catch (e) {
                        return value;
                      }
                    }}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => {
                      try {
                        return format(new Date(value), 'MMMM yyyy', { locale: es });
                      } catch (e) {
                        return value;
                      }
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="count" name="Nuevos Clientes" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="active" name="Clientes Activos" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Distribución por tipo */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Distribución por Tipo de Cliente
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data.customersByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.customersByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} clientes`, 'Cantidad']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Distribución por ubicación */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Distribución por Ubicación
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer>
                <BarChart
                  data={data.customersByLocation}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="location" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Clientes" fill="#8884d8" />
                  <Bar dataKey="sales" name="Ventas ($)" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Mejores clientes */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Mejores Clientes
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Ubicación</TableCell>
                    <TableCell align="right">Compras Totales</TableCell>
                    <TableCell align="right">Última Compra</TableCell>
                    <TableCell align="right">Frecuencia</TableCell>
                    <TableCell align="right">Valor Promedio</TableCell>
                    <TableCell align="right">Valor Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.topCustomers.map((customer, index) => (
                    <TableRow key={index}>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.type}</TableCell>
                      <TableCell>{customer.location}</TableCell>
                                            <TableCell align="right">{customer.purchaseCount}</TableCell>
                      <TableCell align="right">{formatDate(customer.lastPurchaseDate)}</TableCell>
                      <TableCell align="right">{customer.purchaseFrequency.toFixed(1)} días</TableCell>
                      <TableCell align="right">{formatCurrency(customer.averagePurchaseValue)}</TableCell>
                      <TableCell align="right">{formatCurrency(customer.totalPurchaseValue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* Clientes inactivos */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Clientes Inactivos
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell align="right">Última Compra</TableCell>
                    <TableCell align="right">Días Inactivo</TableCell>
                    <TableCell align="right">Compras Históricas</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.inactiveCustomers.map((customer, index) => (
                    <TableRow key={index}>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.type}</TableCell>
                      <TableCell align="right">{formatDate(customer.lastPurchaseDate)}</TableCell>
                      <TableCell align="right">{customer.inactiveDays}</TableCell>
                      <TableCell align="right">{formatCurrency(customer.historicalPurchases)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* Clientes nuevos */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Nuevos Clientes en el Período
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell align="right">Fecha Registro</TableCell>
                    <TableCell align="right">Primera Compra</TableCell>
                    <TableCell align="right">Compras Realizadas</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.newCustomers.map((customer, index) => (
                    <TableRow key={index}>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.type}</TableCell>
                      <TableCell align="right">{formatDate(customer.registrationDate)}</TableCell>
                      <TableCell align="right">{formatDate(customer.firstPurchaseDate)}</TableCell>
                      <TableCell align="right">{formatCurrency(customer.totalPurchases)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* Análisis de retención */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Análisis de Retención de Clientes
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box textAlign="center" sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Tasa de Retención
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {data.retentionAnalysis.retentionRate}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Clientes que volvieron a comprar
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box textAlign="center" sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Tasa de Abandono
                  </Typography>
                  <Typography variant="h4" color="error">
                    {data.retentionAnalysis.churnRate}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Clientes que no regresaron
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box textAlign="center" sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    LTV Promedio
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {formatCurrency(data.retentionAnalysis.averageLTV)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Valor del ciclo de vida del cliente
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, height: 250 }}>
              <ResponsiveContainer>
                <BarChart
                  data={data.retentionAnalysis.cohortRetention}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Tasa de Retención']} />
                  <Legend />
                  <Bar dataKey="rate" name="Tasa de Retención" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Tabla detallada de clientes */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Segmentación de Clientes
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Segmento</TableCell>
                    <TableCell align="right">Clientes</TableCell>
                    <TableCell align="right">% del Total</TableCell>
                    <TableCell align="right">Ventas</TableCell>
                    <TableCell align="right">% de Ventas</TableCell>
                    <TableCell align="right">Frecuencia</TableCell>
                    <TableCell align="right">Ticket Promedio</TableCell>
                    <TableCell>Estrategia Recomendada</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.customerSegments.map((segment, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Chip 
                          label={segment.name} 
                          color={
                            segment.name === 'VIP' ? 'success' :
                            segment.name === 'Frecuentes' ? 'primary' :
                            segment.name === 'Ocasionales' ? 'info' :
                            segment.name === 'Inactivos' ? 'warning' : 'default'
                          } 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="right">{segment.customerCount}</TableCell>
                      <TableCell align="right">{segment.percentageOfTotal}%</TableCell>
                      <TableCell align="right">{formatCurrency(segment.totalSales)}</TableCell>
                      <TableCell align="right">{segment.percentageOfSales}%</TableCell>
                      <TableCell align="right">{segment.frequency} días</TableCell>
                      <TableCell align="right">{formatCurrency(segment.averageTicket)}</TableCell>
                      <TableCell>{segment.recommendedStrategy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* Comparativa con período anterior */}
        {data.comparisonWithPreviousPeriod && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Comparación con período anterior
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Clientes Activos
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color={data.comparisonWithPreviousPeriod.activeCustomersGrowth >= 0 ? 'success.main' : 'error.main'}
                    >
                      {data.comparisonWithPreviousPeriod.activeCustomersGrowth >= 0 ? '+' : ''}
                      {data.comparisonWithPreviousPeriod.activeCustomersGrowth}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Nuevos Clientes
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color={data.comparisonWithPreviousPeriod.newCustomersGrowth >= 0 ? 'success.main' : 'error.main'}
                    >
                      {data.comparisonWithPreviousPeriod.newCustomersGrowth >= 0 ? '+' : ''}
                      {data.comparisonWithPreviousPeriod.newCustomersGrowth}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Valor de Compra Promedio
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color={data.comparisonWithPreviousPeriod.avgPurchaseGrowth >= 0 ? 'success.main' : 'error.main'}
                    >
                      {data.comparisonWithPreviousPeriod.avgPurchaseGrowth >= 0 ? '+' : ''}
                      {data.comparisonWithPreviousPeriod.avgPurchaseGrowth}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Tasa de Retención
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color={data.comparisonWithPreviousPeriod.retentionRateChange >= 0 ? 'success.main' : 'error.main'}
                    >
                      {data.comparisonWithPreviousPeriod.retentionRateChange >= 0 ? '+' : ''}
                      {data.comparisonWithPreviousPeriod.retentionRateChange}%
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

export default CustomersReport;