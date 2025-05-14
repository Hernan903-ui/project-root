import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip
} from '@mui/material';
import { fetchStockMovements } from '../../features/inventory/inventorySlice';

const StockMovementHistory = ({ itemId }) => {
  const dispatch = useDispatch();
  const { movements, loading, error } = useSelector((state) => state.inventory);
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    if (itemId) {
      setLocalLoading(true);
      dispatch(fetchStockMovements(itemId))
        .finally(() => {
          setLocalLoading(false);
        });
    }
  }, [dispatch, itemId]);

  const getMovementTypeChip = (type) => {
    switch (type) {
      case 'add':
        return <Chip label="Añadido" color="success" size="small" />;
      case 'remove':
        return <Chip label="Removido" color="error" size="small" />;
      case 'adjust':
        return <Chip label="Ajustado" color="warning" size="small" />;
      case 'sale':
        return <Chip label="Venta" color="primary" size="small" />;
      case 'receive':
        return <Chip label="Recepción" color="info" size="small" />;
      case 'return':
        return <Chip label="Devolución" color="secondary" size="small" />;
      default:
        return <Chip label={type} size="small" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading || localLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!movements || movements.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography>No hay movimientos registrados para este producto.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell align="right">Cantidad Anterior</TableCell>
              <TableCell align="right">Cambio</TableCell>
              <TableCell align="right">Cantidad Final</TableCell>
              <TableCell>Referencia</TableCell>
              <TableCell>Usuario</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movements.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell>{formatDate(movement.date)}</TableCell>
                <TableCell>{getMovementTypeChip(movement.type)}</TableCell>
                <TableCell align="right">{movement.previousQuantity}</TableCell>
                <TableCell 
                  align="right" 
                  sx={{ 
                    color: movement.quantityChange > 0 ? 'success.main' : 
                           movement.quantityChange < 0 ? 'error.main' : 'inherit'
                  }}
                >
                  {movement.quantityChange > 0 ? '+' : ''}
                  {movement.quantityChange}
                </TableCell>
                <TableCell align="right">{movement.newQuantity}</TableCell>
                <TableCell>{movement.reference || 'N/A'}</TableCell>
                <TableCell>{movement.user || 'Sistema'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Resumen de Movimientos
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total de Movimientos
            </Typography>
            <Typography variant="h6">{movements.length}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Primer Movimiento
            </Typography>
            <Typography variant="body1">
              {formatDate(movements[movements.length - 1]?.date)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Último Movimiento
            </Typography>
            <Typography variant="body1">
              {formatDate(movements[0]?.date)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default StockMovementHistory;