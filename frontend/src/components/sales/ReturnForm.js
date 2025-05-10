import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Divider,
  TextField,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ReturnForm = ({ sale, onSubmit, loading, error }) => {
  const [returnItems, setReturnItems] = useState([]);
  const [reason, setReason] = useState('');
  const [totalReturn, setTotalReturn] = useState(0);

  useEffect(() => {
    if (sale && sale.items) {
      // Inicializar items para devolución
      const initialItems = sale.items.map(item => ({
        ...item,
        returnQuantity: 0,
        maxQuantity: item.quantity,
        returnAmount: 0
      }));
      setReturnItems(initialItems);
    }
  }, [sale]);

  // Calcular el total de devolución cuando cambian los items
  useEffect(() => {
    const total = returnItems.reduce((sum, item) => sum + item.returnAmount, 0);
    setTotalReturn(total);
  }, [returnItems]);

  const handleReturnQuantityChange = (index, value) => {
    const newQuantity = Math.min(Math.max(0, parseInt(value) || 0), returnItems[index].maxQuantity);
    
    const updatedItems = [...returnItems];
    updatedItems[index] = {
      ...updatedItems[index],
      returnQuantity: newQuantity,
      returnAmount: newQuantity * updatedItems[index].price
    };
    
    setReturnItems(updatedItems);
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    
    const updatedItems = returnItems.map(item => ({
      ...item,
      returnQuantity: isChecked ? item.maxQuantity : 0,
      returnAmount: isChecked ? item.maxQuantity * item.price : 0
    }));
    
    setReturnItems(updatedItems);
  };

  const handleReasonChange = (e) => {
    setReason(e.target.value);
  };

  const handleSubmit = () => {
    // Filtrar solo items con cantidad > 0
    const itemsToReturn = returnItems
      .filter(item => item.returnQuantity > 0)
      .map(item => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        quantity: item.returnQuantity,
        amount: item.returnAmount
      }));
    
    if (itemsToReturn.length === 0) {
      return;
    }
    
    const returnData = {
      saleId: sale.id,
      items: itemsToReturn,
      reason,
      totalAmount: totalReturn,
      date: new Date().toISOString()
    };
    
    onSubmit(returnData);
  };

  const isSubmitDisabled = totalReturn === 0 || !reason.trim() || loading;

    // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPP', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  if (!sale) return null;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Procesar Devolución - Venta #{sale.receiptNumber || sale.id}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Fecha de venta: {formatDate(sale.date)}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Checkbox 
              onChange={handleSelectAll}
              checked={returnItems.every(item => item.returnQuantity === item.maxQuantity)}
              indeterminate={
                returnItems.some(item => item.returnQuantity > 0) && 
                !returnItems.every(item => item.returnQuantity === item.maxQuantity)
              }
            />
          }
          label="Seleccionar todos los productos"
        />
        
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell align="right">Cantidad Original</TableCell>
                <TableCell align="right">Cantidad a Devolver</TableCell>
                <TableCell align="right">Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {returnItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                  <TableCell align="right">{item.maxQuantity}</TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      inputProps={{ 
                        min: 0, 
                        max: item.maxQuantity,
                        style: { textAlign: 'right' }
                      }}
                      value={item.returnQuantity}
                      onChange={(e) => handleReturnQuantityChange(index, e.target.value)}
                      sx={{ width: 80 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    ${item.returnAmount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <TextField
            label="Motivo de la devolución"
            multiline
            rows={3}
            fullWidth
            value={reason}
            onChange={handleReasonChange}
            placeholder="Indique el motivo de la devolución"
            required
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Resumen de devolución
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Productos seleccionados:</Typography>
              <Typography variant="body2">
                {returnItems.filter(item => item.returnQuantity > 0).length}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Cantidad total:</Typography>
              <Typography variant="body2">
                {returnItems.reduce((sum, item) => sum + item.returnQuantity, 0)}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2">Total a devolver:</Typography>
              <Typography variant="subtitle2" color="primary">
                ${totalReturn.toFixed(2)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          disabled={isSubmitDisabled}
          onClick={handleSubmit}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Procesando...' : 'Procesar Devolución'}
        </Button>
      </Box>
    </Box>
  );
};

export default ReturnForm;