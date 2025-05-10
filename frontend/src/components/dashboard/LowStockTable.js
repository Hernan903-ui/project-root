import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LowStockTable = ({ products = [] }) => {
  const navigate = useNavigate();

  const getStockStatusColor = (status) => {
    return status === 'Critical' ? 'error' : 'warning';
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Productos con Bajo Stock</Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/inventory')}
          >
            Ver Inventario
          </Button>
        </Box>
        <TableContainer sx={{ maxHeight: 350 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell align="center">Stock</TableCell>
                <TableCell align="center">Mínimo</TableCell>
                <TableCell align="center">Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.product_id} hover>
                    <TableCell>
                      <Typography variant="body2" noWrap>
                        {product.product_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        SKU: {product.sku}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{product.current_stock}</TableCell>
                    <TableCell align="center">{product.min_stock_level}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={product.status}
                        color={getStockStatusColor(product.status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No hay productos con bajo stock
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default LowStockTable;