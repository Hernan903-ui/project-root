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
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#EC7063'];

const InventoryReport = ({ data, loading, error, additionalFilters, onFilterChange }) => {
  // Opciones para agrupar por
  const groupByOptions = [
    { value: 'category', label: 'Categoría' },
    { value: 'location', label: 'Ubicación' },
    { value: 'status', label: 'Estado' }
  ];

  // Opciones para ordenar por
  const sortByOptions = [
    { value: 'quantity', label: 'Cantidad' },
    { value: 'value', label: 'Valor' },
    { value: 'rotation', label: 'Rotación' }
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

  // Obtener color para nivel de stock
  const getStockLevelColor = (level) => {
    switch (level) {
      case 'Óptimo':
        return 'success';
      case 'Bajo':
        return 'warning';
      case 'Crítico':
        return 'error';
      case 'Exceso':
        return 'info';
      default:
        return 'default';
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
          Reporte de Inventario
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Agrupar por</InputLabel>
            <Select
              value={additionalFilters.groupBy || 'category'}
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
              value={additionalFilters.sortBy || 'value'}
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
              Valor Total de Inventario
            </Typography>
            <Typography variant="h4" color="primary">
              {formatCurrency(data.summary.totalValue)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {data.summary.totalItems} productos en total
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Productos con Bajo Stock
            </Typography>
            <Typography variant="h4" color="warning.main">
              {data.summary.lowStockItems}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {((data.summary.lowStockItems / data.summary.totalItems) * 100).toFixed(1)}% del total
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Productos Agotados
            </Typography>
            <Typography variant="h4" color="error">
              {data.summary.outOfStockItems}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {((data.summary.outOfStockItems / data.summary.totalItems) * 100).toFixed(1)}% del total
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Rotación Promedio
            </Typography>
            <Typography variant="h4" color="info.main">
              {data.summary.averageRotation.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Veces que rota el inventario al año
            </Typography>
          </Paper>
        </Grid>
        
        {/* Gráfico principal */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Valor de Inventario por {
                additionalFilters.groupBy === 'category' ? 'Categoría' :
                additionalFilters.groupBy === 'location' ? 'Ubicación' : 'Estado'
              }
            </Typography>
            <Box sx={{ height: 400, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart
                  data={data.inventoryByGroup}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value, name) => [
                    name === 'value' ? `$${value}` : value,
                    name === 'value' ? 'Valor' : 'Cantidad'
                  ]} />
                  <Legend />
                  <Bar dataKey="value" name="Valor" fill="#8884d8" />
                  <Bar dataKey="quantity" name="Cantidad" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Distribución por nivel de stock */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Distribución por Nivel de Stock
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data.stockLevelDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="quantity"
                  >
                    {data.stockLevelDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                                      </Pie>
                  <Tooltip formatter={(value) => [`${value} productos`, 'Cantidad']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Productos con mayor valor */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Distribución de Valor de Inventario
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data.valueDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.valueDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Valor']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Productos de mayor valor */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Productos de Mayor Valor
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell align="right">Stock</TableCell>
                    <TableCell align="right">Precio</TableCell>
                    <TableCell align="right">Valor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.topValueProducts.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell align="right">{product.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(product.price)}</TableCell>
                      <TableCell align="right">{formatCurrency(product.value)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* Productos con mayor rotación */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Productos con Mayor Rotación
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell align="right">Stock</TableCell>
                    <TableCell align="right">Ventas Mes</TableCell>
                    <TableCell align="right">Rotación</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.topRotationProducts.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell align="right">{product.quantity}</TableCell>
                      <TableCell align="right">{product.monthlySales}</TableCell>
                      <TableCell align="right">{product.rotation.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* Tabla detallada de inventario */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Detalle de Inventario
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>SKU</TableCell>
                    <TableCell>Producto</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell>Ubicación</TableCell>
                    <TableCell align="right">Stock</TableCell>
                    <TableCell align="right">Min. Stock</TableCell>
                    <TableCell align="center">Nivel</TableCell>
                    <TableCell align="right">Costo</TableCell>
                    <TableCell align="right">Valor</TableCell>
                    <TableCell align="right">Rotación</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.inventoryDetail.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{item.minStock}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={item.stockLevel} 
                          color={getStockLevelColor(item.stockLevel)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="right">{formatCurrency(item.cost)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.value)}</TableCell>
                      <TableCell align="right">{item.rotation.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* Productos con bajo stock */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Alerta: Productos con Bajo Stock
            </Typography>
            {data.lowStockItems.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell>Categoría</TableCell>
                      <TableCell align="right">Stock Actual</TableCell>
                      <TableCell align="right">Stock Mínimo</TableCell>
                      <TableCell align="right">A Ordenar</TableCell>
                      <TableCell align="right">Ventas Mensuales</TableCell>
                      <TableCell align="right">Días de Cobertura</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.lowStockItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell align="right">
                          <Typography color={item.quantity === 0 ? 'error' : 'warning.main'}>
                            {item.quantity}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{item.minStock}</TableCell>
                        <TableCell align="right">{item.toOrder}</TableCell>
                        <TableCell align="right">{item.monthlySales}</TableCell>
                        <TableCell align="right">
                          <Typography color={item.coverageDays < 7 ? 'error' : 'warning.main'}>
                            {item.coverageDays} días
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                No hay productos con bajo stock.
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Productos sin movimiento */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Productos sin Movimiento (Últimos 90 días)
            </Typography>
            {data.noMovementItems.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell>Categoría</TableCell>
                      <TableCell align="right">Stock</TableCell>
                      <TableCell align="right">Valor</TableCell>
                      <TableCell>Última Venta</TableCell>
                      <TableCell align="right">Días sin Mov.</TableCell>
                      <TableCell align="right">Sugerencia</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.noMovementItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.value)}</TableCell>
                        <TableCell>{item.lastSaleDate ? new Date(item.lastSaleDate).toLocaleDateString() : 'Nunca'}</TableCell>
                        <TableCell align="right">{item.daysSinceLastSale}</TableCell>
                        <TableCell align="right">{item.suggestion}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                No hay productos sin movimiento.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InventoryReport;