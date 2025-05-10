import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from '@mui/material';

const InventoryValueReport = ({ data, isLoading, error }) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Error al cargar el valor del inventario: {error.message}
      </Alert>
    );
  }

  if (!data) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No hay datos de inventario disponibles</Typography>
      </Paper>
    );
  }

  const { summary, by_category } = data;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Resumen de Valor de Inventario
      </Typography>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Valor de Costo Total
            </Typography>
            <Typography variant="h5" fontWeight="medium" color="primary.main">
              ${summary.total_cost_value.toFixed(2)}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Valor de Venta Total
            </Typography>
            <Typography variant="h5" fontWeight="medium" color="primary.main">
              ${summary.total_retail_value.toFixed(2)}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Ganancia Potencial
            </Typography>
            <Typography variant="h5" fontWeight="medium" color="success.main">
              ${summary.potential_profit.toFixed(2)}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Total de Productos
            </Typography>
            <Typography variant="h5" fontWeight="medium">
              {summary.total_products}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Valor de Inventario por Categoría
      </Typography>
      <TableContainer>
        <Table sx={{ minWidth: 650 }} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Categoría</TableCell>
              <TableCell align="right">Valor de Costo</TableCell>
              <TableCell align="right">Valor de Venta</TableCell>
              <TableCell align="right">Margen</TableCell>
              <TableCell align="center">Productos</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {by_category.map((category) => {
              const margin = category.retail_value - category.cost_value;
              const marginPercent = category.cost_value > 0 
                ? ((margin / category.cost_value) * 100).toFixed(1) 
                : 0;
              
              return (
                <TableRow key={category.category_id} hover>
                  <TableCell component="th" scope="row">
                    {category.category_name}
                  </TableCell>
                  <TableCell align="right">${category.cost_value.toFixed(2)}</TableCell>
                  <TableCell align="right">${category.retail_value.toFixed(2)}</TableCell>
                  <TableCell align="right">
                    ${margin.toFixed(2)} ({marginPercent}%)
                  </TableCell>
                  <TableCell align="center">{category.product_count}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default InventoryValueReport;