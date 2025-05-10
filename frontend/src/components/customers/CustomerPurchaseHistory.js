import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import customerApi from '../../api/customerApi';

const CustomerPurchaseHistory = ({ customerId }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomerSales = async () => {
      try {
        setLoading(true);
        const data = await customerApi.getCustomerPurchaseHistory(customerId);
        setSales(data);
        setError(null);
      } catch (err) {
        setError('Error al cargar el historial de compras');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchCustomerSales();
    }
  }, [customerId]);

  // Resto del componente igual que antes...
  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPP', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Historial de Compras
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={30} />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : sales.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Este cliente aún no ha realizado compras
        </Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Número</TableCell>
                <TableCell>Productos</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id || sale._id}>
                  <TableCell>{formatDate(sale.date)}</TableCell>
                  <TableCell>{sale.receiptNumber || 'N/A'}</TableCell>
                  <TableCell>{sale.items?.length || 0} items</TableCell>
                  <TableCell align="right">${sale.total.toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={sale.status} 
                      size="small"
                      color={
                        sale.status === 'Completada' ? 'success' : 
                        sale.status === 'Cancelada' ? 'error' : 'warning'
                      }
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver detalles">
                      <IconButton size="small">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default CustomerPurchaseHistory;