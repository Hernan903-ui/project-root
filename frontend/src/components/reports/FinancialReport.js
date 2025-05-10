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

const FinancialReport = ({ data, loading, error, additionalFilters, onFilterChange }) => {
  // Opciones para agrupar por
  const viewOptions = [
    { value: 'summary', label: 'Resumen' },
    { value: 'detailed', label: 'Detallado' }
  ];

  // Formateo de valores
  const formatCurrency = (value) => {
    return `$${value.toFixed(2)}`;
  };

  // Formateo de porcentaje
  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
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

  const handleViewChange = (e) => {
    onFilterChange({ view: e.target.value });
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
        No hay datos financieros disponibles. Ajuste los filtros y genere el reporte.
      </Typography>
    );
  }

  return (
    <Box className="report-content">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Reporte Financiero
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Vista</InputLabel>
          <Select
            value={additionalFilters.view || 'summary'}
            onChange={handleViewChange}
            label="Vista"
          >
            {viewOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <Grid container spacing={3}>
        {/* Tarjetas de resumen */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Ingresos Totales
            </Typography>
            <Typography variant="h4" color="primary">
              {formatCurrency(data.summary.totalRevenue)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {data.summary.periodLabel}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Beneficio Bruto
            </Typography>
            <Typography variant="h4" color="success.main">
              {formatCurrency(data.summary.grossProfit)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Margen: {formatPercentage(data.summary.grossMargin)}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Beneficio Neto
            </Typography>
            <Typography variant="h4" color={data.summary.netProfit >= 0 ? 'success.main' : 'error.main'}>
              {formatCurrency(data.summary.netProfit)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Margen: {formatPercentage(data.summary.netMargin)}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Gastos Operativos
            </Typography>
            <Typography variant="h4" color="error">
              {formatCurrency(data.summary.operatingExpenses)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatPercentage(data.summary.expenseRatio)} de ingresos
            </Typography>
          </Paper>
        </Grid>
        
        {/* Gráfico de ingresos y beneficios */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Ingresos y Beneficios por Período
            </Typography>
            <Box sx={{ height: 400, width: '100%' }}>
              <ResponsiveContainer>
                <LineChart
                  data={data.financialsByPeriod}
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
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, '']}
                    labelFormatter={(value) => {
                      try {
                        return format(new Date(value), 'MMMM yyyy', { locale: es });
                      } catch (e) {
                        return value;
                      }
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="Ingresos" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="grossProfit" name="Beneficio Bruto" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="netProfit" name="Beneficio Neto" stroke="#ffc658" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Distribución de ingresos */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Ingresos por Categoría de Producto
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data.revenueByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {data.revenueByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Ingresos']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Distribución de gastos */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Distribución de Gastos
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data.expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {data.expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Gastos']} />
                  <Legend />
                </PieChart>
                            </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Productos más rentables */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Productos Más Rentables
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Ingresos</TableCell>
                    <TableCell align="right">Costo</TableCell>
                    <TableCell align="right">Beneficio</TableCell>
                    <TableCell align="right">Margen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.mostProfitableProducts.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell align="right">{formatCurrency(product.revenue)}</TableCell>
                      <TableCell align="right">{formatCurrency(product.cost)}</TableCell>
                      <TableCell align="right">{formatCurrency(product.profit)}</TableCell>
                      <TableCell align="right">{formatPercentage(product.margin)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* Categorías más rentables */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Categorías Más Rentables
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Categoría</TableCell>
                    <TableCell align="right">Ingresos</TableCell>
                    <TableCell align="right">Costo</TableCell>
                    <TableCell align="right">Beneficio</TableCell>
                    <TableCell align="right">Margen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.profitByCategory.map((category, index) => (
                    <TableRow key={index}>
                      <TableCell>{category.name}</TableCell>
                      <TableCell align="right">{formatCurrency(category.revenue)}</TableCell>
                      <TableCell align="right">{formatCurrency(category.cost)}</TableCell>
                      <TableCell align="right">{formatCurrency(category.profit)}</TableCell>
                      <TableCell align="right">{formatPercentage(category.margin)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* Estado de resultados */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Estado de Resultados
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Concepto</TableCell>
                    <TableCell align="right">Monto</TableCell>
                    <TableCell align="right">% de Ingresos</TableCell>
                    {data.comparisonWithPreviousPeriod && (
                      <>
                        <TableCell align="right">Período Anterior</TableCell>
                        <TableCell align="right">Variación</TableCell>
                      </>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell><strong>Ingresos por Ventas</strong></TableCell>
                    <TableCell align="right"><strong>{formatCurrency(data.incomeStatement.totalRevenue)}</strong></TableCell>
                    <TableCell align="right">100.00%</TableCell>
                    {data.comparisonWithPreviousPeriod && (
                      <>
                        <TableCell align="right">{formatCurrency(data.comparisonWithPreviousPeriod.previousRevenue)}</TableCell>
                        <TableCell align="right" sx={{ 
                          color: data.comparisonWithPreviousPeriod.revenueGrowth >= 0 ? 'success.main' : 'error.main' 
                        }}>
                          {data.comparisonWithPreviousPeriod.revenueGrowth >= 0 ? '+' : ''}
                          {formatPercentage(data.comparisonWithPreviousPeriod.revenueGrowth)}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                  <TableRow>
                    <TableCell>Costo de Ventas</TableCell>
                    <TableCell align="right">{formatCurrency(data.incomeStatement.costOfSales)}</TableCell>
                    <TableCell align="right">{formatPercentage(data.incomeStatement.costOfSalesPercentage)}</TableCell>
                    {data.comparisonWithPreviousPeriod && (
                      <>
                        <TableCell align="right">{formatCurrency(data.comparisonWithPreviousPeriod.previousCostOfSales)}</TableCell>
                        <TableCell align="right" sx={{ 
                          color: data.comparisonWithPreviousPeriod.costGrowth <= 0 ? 'success.main' : 'error.main' 
                        }}>
                          {data.comparisonWithPreviousPeriod.costGrowth >= 0 ? '+' : ''}
                          {formatPercentage(data.comparisonWithPreviousPeriod.costGrowth)}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Beneficio Bruto</strong></TableCell>
                    <TableCell align="right"><strong>{formatCurrency(data.incomeStatement.grossProfit)}</strong></TableCell>
                    <TableCell align="right">{formatPercentage(data.incomeStatement.grossMargin)}</TableCell>
                    {data.comparisonWithPreviousPeriod && (
                      <>
                        <TableCell align="right">{formatCurrency(data.comparisonWithPreviousPeriod.previousGrossProfit)}</TableCell>
                        <TableCell align="right" sx={{ 
                          color: data.comparisonWithPreviousPeriod.grossProfitGrowth >= 0 ? 'success.main' : 'error.main' 
                        }}>
                          {data.comparisonWithPreviousPeriod.grossProfitGrowth >= 0 ? '+' : ''}
                          {formatPercentage(data.comparisonWithPreviousPeriod.grossProfitGrowth)}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                  
                  {/* Gastos operativos */}
                  {data.incomeStatement.operatingExpenses.map((expense, index) => (
                    <TableRow key={index}>
                      <TableCell>{expense.name}</TableCell>
                      <TableCell align="right">{formatCurrency(expense.amount)}</TableCell>
                      <TableCell align="right">{formatPercentage(expense.percentage)}</TableCell>
                      {data.comparisonWithPreviousPeriod && expense.previousAmount !== undefined && (
                        <>
                          <TableCell align="right">{formatCurrency(expense.previousAmount)}</TableCell>
                          <TableCell align="right" sx={{ 
                            color: expense.growth <= 0 ? 'success.main' : 'error.main' 
                          }}>
                            {expense.growth >= 0 ? '+' : ''}
                            {formatPercentage(expense.growth)}
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                  
                  <TableRow>
                    <TableCell><strong>Total Gastos Operativos</strong></TableCell>
                    <TableCell align="right"><strong>{formatCurrency(data.incomeStatement.totalOperatingExpenses)}</strong></TableCell>
                    <TableCell align="right">{formatPercentage(data.incomeStatement.operatingExpensesPercentage)}</TableCell>
                    {data.comparisonWithPreviousPeriod && (
                      <>
                        <TableCell align="right">{formatCurrency(data.comparisonWithPreviousPeriod.previousOperatingExpenses)}</TableCell>
                        <TableCell align="right" sx={{ 
                          color: data.comparisonWithPreviousPeriod.expensesGrowth <= 0 ? 'success.main' : 'error.main' 
                        }}>
                          {data.comparisonWithPreviousPeriod.expensesGrowth >= 0 ? '+' : ''}
                          {formatPercentage(data.comparisonWithPreviousPeriod.expensesGrowth)}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                  
                  <TableRow>
                    <TableCell><strong>Beneficio Operativo</strong></TableCell>
                    <TableCell align="right"><strong>{formatCurrency(data.incomeStatement.operatingProfit)}</strong></TableCell>
                    <TableCell align="right">{formatPercentage(data.incomeStatement.operatingMargin)}</TableCell>
                    {data.comparisonWithPreviousPeriod && (
                      <>
                        <TableCell align="right">{formatCurrency(data.comparisonWithPreviousPeriod.previousOperatingProfit)}</TableCell>
                        <TableCell align="right" sx={{ 
                          color: data.comparisonWithPreviousPeriod.operatingProfitGrowth >= 0 ? 'success.main' : 'error.main' 
                        }}>
                          {data.comparisonWithPreviousPeriod.operatingProfitGrowth >= 0 ? '+' : ''}
                          {formatPercentage(data.comparisonWithPreviousPeriod.operatingProfitGrowth)}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                  
                  {/* Otros ingresos y gastos */}
                  {data.incomeStatement.otherItems && data.incomeStatement.otherItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                      <TableCell align="right">{formatPercentage(item.percentage)}</TableCell>
                      {data.comparisonWithPreviousPeriod && item.previousAmount !== undefined && (
                        <>
                          <TableCell align="right">{formatCurrency(item.previousAmount)}</TableCell>
                          <TableCell align="right" sx={{ 
                            color: (item.isExpense ? item.growth <= 0 : item.growth >= 0) ? 'success.main' : 'error.main' 
                          }}>
                            {item.growth >= 0 ? '+' : ''}
                            {formatPercentage(item.growth)}
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                  
                  <TableRow>
                    <TableCell><strong>Beneficio Antes de Impuestos</strong></TableCell>
                    <TableCell align="right"><strong>{formatCurrency(data.incomeStatement.profitBeforeTax)}</strong></TableCell>
                    <TableCell align="right">{formatPercentage(data.incomeStatement.profitBeforeTaxMargin)}</TableCell>
                    {data.comparisonWithPreviousPeriod && (
                      <>
                        <TableCell align="right">{formatCurrency(data.comparisonWithPreviousPeriod.previousProfitBeforeTax)}</TableCell>
                        <TableCell align="right" sx={{ 
                          color: data.comparisonWithPreviousPeriod.profitBeforeTaxGrowth >= 0 ? 'success.main' : 'error.main' 
                        }}>
                          {data.comparisonWithPreviousPeriod.profitBeforeTaxGrowth >= 0 ? '+' : ''}
                          {formatPercentage(data.comparisonWithPreviousPeriod.profitBeforeTaxGrowth)}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                  
                  <TableRow>
                    <TableCell>Impuestos</TableCell>
                    <TableCell align="right">{formatCurrency(data.incomeStatement.taxes)}</TableCell>
                    <TableCell align="right">{formatPercentage(data.incomeStatement.taxRate)}</TableCell>
                    {data.comparisonWithPreviousPeriod && (
                      <>
                        <TableCell align="right">{formatCurrency(data.comparisonWithPreviousPeriod.previousTaxes)}</TableCell>
                        <TableCell align="right" sx={{ 
                          color: data.comparisonWithPreviousPeriod.taxesGrowth <= 0 ? 'success.main' : 'error.main' 
                        }}>
                          {data.comparisonWithPreviousPeriod.taxesGrowth >= 0 ? '+' : ''}
                          {formatPercentage(data.comparisonWithPreviousPeriod.taxesGrowth)}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                  
                  <TableRow sx={{ '& > td': { fontWeight: 'bold' } }}>
                    <TableCell><strong>Beneficio Neto</strong></TableCell>
                    <TableCell align="right"><strong>{formatCurrency(data.incomeStatement.netProfit)}</strong></TableCell>
                    <TableCell align="right">{formatPercentage(data.incomeStatement.netMargin)}</TableCell>
                    {data.comparisonWithPreviousPeriod && (
                      <>
                        <TableCell align="right">{formatCurrency(data.comparisonWithPreviousPeriod.previousNetProfit)}</TableCell>
                        <TableCell align="right" sx={{ 
                          color: data.comparisonWithPreviousPeriod.netProfitGrowth >= 0 ? 'success.main' : 'error.main' 
                        }}>
                          {data.comparisonWithPreviousPeriod.netProfitGrowth >= 0 ? '+' : ''}
                          {formatPercentage(data.comparisonWithPreviousPeriod.netProfitGrowth)}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* Análisis de tendencias */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Análisis de Tendencias
            </Typography>
            <Box sx={{ height: 350, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart
                  data={data.trendAnalysis}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" tickFormatter={(value) => `$${value}`} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'netMargin' || name === 'grossMargin') {
                      return [`${value}%`, name === 'netMargin' ? 'Margen Neto' : 'Margen Bruto'];
                    }
                    return [`$${value}`, name === 'revenue' ? 'Ingresos' : 'Beneficio Neto'];
                  }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" name="Ingresos" fill="#8884d8" />
                  <Bar yAxisId="left" dataKey="netProfit" name="Beneficio Neto" fill="#82ca9d" />
                  <Line yAxisId="right" type="monotone" dataKey="grossMargin" name="Margen Bruto" stroke="#ff7300" />
                  <Line yAxisId="right" type="monotone" dataKey="netMargin" name="Margen Neto" stroke="#387908" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Indicadores clave */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Indicadores Financieros Clave
            </Typography>
            <Grid container spacing={2}>
              {data.keyFinancialIndicators.map((indicator, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box textAlign="center" sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {indicator.name}
                    </Typography>
                    <Typography 
                      variant="h5" 
                      color={indicator.status === 'good' ? 'success.main' : 
                            indicator.status === 'warning' ? 'warning.main' : 
                            indicator.status === 'bad' ? 'error.main' : 'text.primary'}
                    >
                      {indicator.isPercentage ? `${indicator.value}%` : formatCurrency(indicator.value)}
                    </Typography>
                    {indicator.previousValue !== undefined && (
                      <Typography variant="caption" color="text.secondary">
                        vs {indicator.isPercentage ? `${indicator.previousValue}%` : formatCurrency(indicator.previousValue)} (
                        <Typography 
                          component="span" 
                          variant="caption" 
                          color={indicator.change >= 0 ? 'success.main' : 'error.main'}
                        >
                          {indicator.change >= 0 ? '+' : ''}{indicator.change}%
                        </Typography>
                        )
                      </Typography>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinancialReport;