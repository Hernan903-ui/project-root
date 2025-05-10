import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Paper,
  Typography,
  Divider,
  List,
  Box,
  Button,
  TextField,
  MenuItem,
  Grid,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import CartItem from './CartItem';
import { 
  selectCartItems, 
  selectCartTotal, 
  selectCartSubtotal,
  selectCartTaxTotal,
  selectCartDiscount,
  selectCartPaymentMethod,
  setDiscount,
  setPaymentMethod,
  clearCart
} from '../../features/pos/cartSlice';
import CustomerSelect from './CustomerSelect';
import PaymentModal from './PaymentModal';

const paymentMethods = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'credit_card', label: 'Tarjeta de Crédito' },
  { value: 'debit_card', label: 'Tarjeta de Débito' },
  { value: 'bank_transfer', label: 'Transferencia Bancaria' },
];

const Cart = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const subtotal = useSelector(selectCartSubtotal);
  const taxTotal = useSelector(selectCartTaxTotal);
  const discount = useSelector(selectCartDiscount);
  const paymentMethod = useSelector(selectCartPaymentMethod);
  
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isCustomerSelectOpen, setCustomerSelectOpen] = useState(false);

  const handleDiscountChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    dispatch(setDiscount(Math.min(100, Math.max(0, value))));
  };

  const handlePaymentMethodChange = (e) => {
    dispatch(setPaymentMethod(e.target.value));
  };

  const handleClearCart = () => {
    if (window.confirm('¿Está seguro de que desea vaciar el carrito?')) {
      dispatch(clearCart());
    }
  };

  const discountAmount = (subtotal * discount / 100).toFixed(2);

  return (
    <Paper 
      sx={{ 
        p: 2, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: 3
      }}
    >
      <Typography variant="h5" gutterBottom display="flex" alignItems="center">
        <ShoppingCartIcon sx={{ mr: 1 }} />
        Carrito de Venta
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      {items.length === 0 ? (
        <Box 
          sx={{ 
            py: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            flexGrow: 1,
            color: 'text.secondary'
          }}
        >
          <ShoppingCartIcon sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
          <Typography variant="h6">El carrito está vacío</Typography>
          <Typography variant="body2">
            Agregue productos para iniciar una venta
          </Typography>
        </Box>
      ) : (
        <>
          <List sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 400px)' }}>
            {items.map((item) => (
              <CartItem key={item.product_id} item={item} />
            ))}
          </List>
          
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Descuento (%)"
                  type="number"
                  value={discount}
                  onChange={handleDiscountChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Método de Pago"
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                >
                  {paymentMethods.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Box sx={{ mt: 2 }}>
              <Grid container>
                <Grid item xs={6}>
                  <Typography variant="body2">Subtotal:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" align="right">${subtotal}</Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2">Impuestos:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" align="right">${taxTotal}</Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2">Descuento ({discount}%):</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" align="right">-${discountAmount}</Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="h6">Total:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" align="right">${total}</Typography>
                </Grid>
              </Grid>
            </Box>
            
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexDirection: 'column' }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<PaymentIcon />}
                onClick={() => setPaymentModalOpen(true)}
                disabled={items.length === 0}
              >
                Procesar Pago
              </Button>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<PersonAddIcon />}
                  sx={{ flex: 1 }}
                  onClick={() => setCustomerSelectOpen(true)}
                >
                  Cliente
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  sx={{ flex: 1 }}
                  onClick={handleClearCart}
                  disabled={items.length === 0}
                >
                  Vaciar
                </Button>
              </Box>
            </Box>
          </Box>
        </>
      )}
      
      {/* Modales */}
      <PaymentModal 
        open={isPaymentModalOpen} 
        onClose={() => setPaymentModalOpen(false)} 
      />
      
      <CustomerSelect
        open={isCustomerSelectOpen}
        onClose={() => setCustomerSelectOpen(false)}
      />
    </Paper>
  );
};

export default Cart;