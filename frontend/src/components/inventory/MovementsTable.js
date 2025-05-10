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
  TablePagination,
  CircularProgress,
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const getMovementTypeDetails = (type) => {
  switch (type) {
    case 'purchase':
      return { label: 'Compra', color: 'success' };
    case 'sale':
      return { label: 'Venta', color: 'error' };
    case 'adjustment':
      return { label: 'Ajuste', color: 'warning' };
    case 'return':
      return { label: 'Devolución', color: 'info' };
    case 'initial':
      return { label: 'Inicial', color: 'primary' };
    default:
      return { label: type, color: 'default' };
  }
};

const MovementsTable = ({ 
  movements, 
  isLoading, 
  totalCount = 0, 
  page, 
  limit, 
  onPageChange, 
  onLimitChange 
}) => {
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!movements || movements.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No se encontraron movimientos de inventario</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)' }}>
        <Table stickyHeader aria-label="sticky table" size="small">
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Producto</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell align="right">Cantidad</TableCell>
              <TableCell>Referencia</TableCell>
              <TableCell>Notas</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movements.map((movement) => {
              const typeDetails = getMovementTypeDetails(movement.movement_type);
              
              return (
                <TableRow hover key={movement.id}>
                  <TableCell>
                    {format(new Date(movement.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {movement.product.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      SKU: {movement.product.sku}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={typeDetails.label} 
                      color={typeDetails.color} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      color={movement.quantity > 0 ? 'success.main' : 'error.main'}
                    >
                      {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {movement.reference_id ? 
                      <Typography variant="body2">
                        {movement.movement_type === 'sale' ? 'Venta #' : 'Ref #'}
                        {movement.reference_id}
                      </Typography> : 
                      '-'
                    }
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {movement.notes || '-'}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 20, 50, 100]}
        component="div"
        count={totalCount}
        rowsPerPage={limit}
        page={page - 1}
        onPageChange={(_, newPage) => onPageChange(newPage + 1)}
        onRowsPerPageChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />
    </Paper>
  );
};

export default MovementsTable;