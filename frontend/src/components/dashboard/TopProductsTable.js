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
  Box,
} from '@mui/material';

const TopProductsTable = ({ products = [] }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Productos Más Vendidos
        </Typography>
        <TableContainer sx={{ maxHeight: 350 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell align="right">Ventas</TableCell>
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
                        {product.category}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{product.quantity_sold}</TableCell>
                    <TableCell align="right">
                      ${product.total_revenue.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No hay datos disponibles
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

export default TopProductsTable;