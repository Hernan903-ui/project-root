import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LowStockTable = ({ products, isLoading, error }) => {
  const navigate = useNavigate();

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
        Error al cargar productos con bajo stock: {error.message}
      </Alert>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No hay productos con bajo stock</Typography>
      </Paper>
    );
  }

  const handleAdjustStock = (productId) => {
    navigate(`/inventory/adjust/${productId}`);
  };

  const handleViewProduct = (productId) => {
    navigate(`/products/${productId}`);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)' }}>
        <Table stickyHeader aria-label="sticky table" size="small">
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell align="center">Stock Actual</TableCell>
              <TableCell align="center">Nivel Mínimo</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow hover key={product.product_id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {product.product_name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    SKU: {product.sku}
                  </Typography>
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell align="center">
                  <Typography
                    variant="body2"
                    fontWeight="medium"
                    color={product.current_stock <= 0 ? 'error.main' : 'inherit'}
                  >
                    {product.current_stock}
                  </Typography>
                </TableCell>
                <TableCell align="center">{product.min_stock_level}</TableCell>
                <TableCell align="center">
                  <Chip 
                    label={product.status} 
                    color={product.status === 'Critical' ? 'error' : 'warning'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => handleViewProduct(product.product_id)}
                    >
                      Ver
                    </Button>
                    <Button 
                      size="small" 
                      variant="contained"
                      onClick={() => handleAdjustStock(product.product_id)}
                    >
                      Ajustar
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default LowStockTable;