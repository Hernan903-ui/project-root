import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Box,
  Grid,
  CircularProgress,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  selectCartItems,
  selectCartTotal,
  selectCartDiscount,
  selectCartCustomer,
  selectCartPaymentMethod,
  selectCartNotes,
  clearCart,
} from '../../features/pos/cartSlice';
import { createSale } from '../../api/posApi';

const PaymentModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const discount = useSelector(selectCartDiscount);
  const customer = useSelector(selectCartCustomer);
  const paymentMethod = useSelector(selectCartPaymentMethod);
  const notes = useSelector(selectCartNotes);
  
  const [amountReceived, setAmountReceived] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now()}`);

  const handleAmountReceivedChange = (e) => {
    setAmountReceived(e.target.value);
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      enqueueSnackbar('El carrito está vacío', { variant: 'error' });
      return;
    }

    // Preparar datos de la venta
    const saleData = {
      invoice_number: invoiceNumber,
      customer_id: customer?.id || null,
      total_amount: total,
      tax_amount: items.reduce((sum, item) => {
        const taxAmount = (item.unit_price * item.quantity * item.tax_rate) / 100;
        return sum + taxAmount;
      }, 0),
      discount_amount: discount,
      payment_method: paymentMethod,
      payment_status: 'paid',
      notes: notes || '',
      items: items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount,
        tax_rate: item.tax_rate,
        total: item.total
      }))
    };

    try {
      setIsSubmitting(true);
      const response = await createSale(saleData);
      
      enqueueSnackbar('¡Venta procesada con éxito!', { variant: 'success' });
      
      // Limpiar el carrito
      dispatch(clearCart());
      
      // Cerrar el modal
      onClose();
      
      // Redirigir a la página de detalles de la venta
      navigate(`/sales/${response.id}`);
    } catch (error) {
      console.error('Error al procesar la venta:', error);
      enqueueSnackbar(
        `Error al procesar la venta: ${error.response?.data?.detail || error.message}`, 
        { variant: 'error' }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const change = amountReceived ? (parseFloat(amountReceived) - total).toFixed(2) : '0.00';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Finalizar Venta</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Typography variant="h6" gutterBottom>
              Resumen de la Venta
            </Typography>
            <Box sx={{ mb: 2 }}>
              <TextField
                label="Número de Factura"
                fullWidth
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                margin="normal"
                variant="outlined"
              />
            </Box>
            
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Cliente:
              </Typography>
              <Typography variant="body1">
                {customer ? customer.name : 'Cliente General'}
              </Typography>
              {customer && customer.email && (
                <Typography variant="body2" color="text.secondary">
                  Email: {customer.email}
                </Typography>
              )}
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Productos:
              </Typography>
              {items.length > 0 ? (
                <List disablePadding>
                  {items.map((item) => (
                    <ListItem key={item.product_id} disablePadding sx={{ py: 1 }}>
                      <ListItemText
                        primary={item.name}
                        secondary={`${item.quantity} x $${item.unit_price.toFixed(2)}`}
                      />
                      <Typography variant="body2">
                        ${item.total.toFixed(2)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">No hay productos en el carrito</Typography>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2">Subtotal:</Typography>
                </Grid>
                <Grid item xs={6} align="right">
                  <Typography variant="body2">
                    ${items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0).toFixed(2)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2">Impuestos:</Typography>
                </Grid>
                <Grid item xs={6} align="right">
                  <Typography variant="body2">
                    ${items.reduce((sum, item) => {
                      const taxAmount = (item.unit_price * item.quantity * item.tax_rate) / 100;
                      return sum + taxAmount;
                    }, 0).toFixed(2)}
                  </Typography>
                </Grid>
                
                {discount > 0 && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="body2">Descuento ({discount}%):</Typography>
                    </Grid>
                    <Grid item xs={6} align="right">
                      <Typography variant="body2" color="error">
                        -${(total * discount / 100).toFixed(2)}
                      </Typography>
                    </Grid>
                  </>
                )}
                
                <Grid item xs={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Total:
                  </Typography>
                </Grid>
                <Grid item xs={6} align="right">
                  <Typography variant="subtitle1" fontWeight="bold">
                    ${total.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            
            <TextField
              label="Notas"
              multiline
              rows={2}
              fullWidth
              value={notes || ''}
              onChange={(e) => dispatch({ type: 'cart/setNotes', payload: e.target.value })}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Typography variant="h6" gutterBottom>
              Pago
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Método de Pago:
              </Typography>
              <Typography variant="body1">
                {paymentMethod === 'cash' && 'Efectivo'}
                {paymentMethod === 'credit_card' && 'Tarjeta de Crédito'}
                {paymentMethod === 'debit_card' && 'Tarjeta de Débito'}
                {paymentMethod === 'bank_transfer' && 'Transferencia Bancaria'}
              </Typography>
              
              {paymentMethod === 'cash' && (
                <Box sx={{ mt: 2 }}>
                  <TextField
                    label="Monto Recibido"
                    type="number"
                    fullWidth
                    value={amountReceived}
                    onChange={handleAmountReceivedChange}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                    }}
                    sx={{ mb: 2 }}
                  />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Total a pagar:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      ${total.toFixed(2)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">Cambio:</Typography>
                    <Typography 
                      variant="body1" 
                      fontWeight="bold"
                      color={parseFloat(change) < 0 ? 'error.main' : 'inherit'}
                    >
                      ${change}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>
            
            <Box sx={{ mt: 3 }}>
              <Button 
                variant="contained" 
                fullWidth 
                size="large"
                onClick={handleSubmit}
                disabled={
                  isSubmitting || 
                  items.length === 0 || 
                  (paymentMethod === 'cash' && (
                    !amountReceived || 
                    parseFloat(amountReceived) < total
                  ))
                }
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Completar Venta'
                )}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentModal;