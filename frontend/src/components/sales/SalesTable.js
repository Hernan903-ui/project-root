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
  IconButton,
  Tooltip,
  Typography,
  Box,
  TablePagination
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  ReceiptLong as ReceiptIcon,
  Cancel as CancelIcon,
  AssignmentReturn as ReturnIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const SalesTable = ({ 
  sales, 
  onViewDetails, 
  onPrintReceipt, 
  onCancelSale, 
  onReturn,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  total
}) => {
  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'Pp', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Función para obtener color según estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completada':
        return 'success';
      case 'Pendiente':
        return 'warning';
      case 'Cancelada':
        return 'error';
      case 'Devuelta':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Recibo</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Productos</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.length > 0 ? (
              sales.              sales.map((sale) => (
                <TableRow key={sale.id || sale._id} hover>
                  <TableCell>
                    <Typography variant="body2">
                      {sale.receiptNumber || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(sale.date)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {sale.customer?.name || 'Cliente no registrado'}
                    </Typography>
                    {sale.customer?.id && (
                      <Typography variant="caption" color="text.secondary">
                        ID: {sale.customer.id}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {sale.items?.length || 0} items
                    </Typography>
                    {sale.items && sale.items.length > 0 && (
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                        {sale.items.slice(0, 2).map(item => item.name).join(', ')}
                        {sale.items.length > 2 && '...'}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium">
                      ${sale.total.toFixed(2)}
                    </Typography>
                    {sale.discount > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        Dcto: ${sale.discount.toFixed(2)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={sale.status}
                      color={getStatusColor(sale.status)}
                      size="small"
                      variant={sale.status === 'Devuelta' ? 'outlined' : 'filled'}
                    />
                    {sale.returnInfo && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Devolución parcial
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Tooltip title="Ver detalles">
                        <IconButton
                          size="small"
                          onClick={() => onViewDetails(sale)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Imprimir recibo">
                        <IconButton
                          size="small"
                          onClick={() => onPrintReceipt(sale)}
                        >
                          <ReceiptIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {sale.status !== 'Cancelada' && (
                        <Tooltip title="Cancelar venta">
                          <IconButton
                            size="small"
                            onClick={() => onCancelSale(sale)}
                            disabled={sale.status === 'Cancelada'}
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {sale.status === 'Completada' && (
                        <Tooltip title="Procesar devolución">
                          <IconButton
                            size="small"
                            onClick={() => onReturn(sale)}
                          >
                            <ReturnIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No se encontraron ventas con los filtros aplicados
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />
    </Box>
  );
};

export default SalesTable;