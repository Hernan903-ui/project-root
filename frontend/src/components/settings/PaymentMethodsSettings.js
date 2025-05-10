import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CreditCard as CreditCardIcon,
  Money as MoneyIcon,
  AccountBalance as BankIcon,
  PaymentOutlined as PaymentIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchPaymentMethods, 
  createPaymentMethod, 
  updatePaymentMethod, 
  deletePaymentMethod,
  setSelectedPaymentMethod, 
  clearSelectedPaymentMethod
} from '../../features/settings/settingsSlice';

const PaymentMethodsSettings = () => {
  const dispatch = useDispatch();
  const { 
    paymentMethods, 
    paymentMethodsLoading, 
    selectedPaymentMethod, 
    error, 
    successMessage 
  } = useSelector(state => state.settings);
  
    const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'cash',
    description: '',
    enabled: true,
    requiresAuth: false,
    paymentInstructions: '',
    icon: 'money'
  });

  // Cargar métodos de pago al montar el componente
  useEffect(() => {
    dispatch(fetchPaymentMethods());
  }, [dispatch]);

  // Actualizar formulario cuando se selecciona un método de pago para editar
  useEffect(() => {
    if (selectedPaymentMethod) {
      setFormData({
        id: selectedPaymentMethod.id,
        name: selectedPaymentMethod.name || '',
        type: selectedPaymentMethod.type || 'cash',
        description: selectedPaymentMethod.description || '',
        enabled: selectedPaymentMethod.enabled !== false,
        requiresAuth: selectedPaymentMethod.requiresAuth || false,
        paymentInstructions: selectedPaymentMethod.paymentInstructions || '',
        icon: selectedPaymentMethod.icon || 'money'
      });
      setOpenDialog(true);
    }
  }, [selectedPaymentMethod]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleOpenAddDialog = () => {
    setFormData({
      name: '',
      type: 'cash',
      description: '',
      enabled: true,
      requiresAuth: false,
      paymentInstructions: '',
      icon: 'money'
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (method) => {
    dispatch(setSelectedPaymentMethod(method));
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    dispatch(clearSelectedPaymentMethod());
  };

  const handleOpenDeleteDialog = (method) => {
    dispatch(setSelectedPaymentMethod(method));
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    dispatch(clearSelectedPaymentMethod());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedPaymentMethod) {
      dispatch(updatePaymentMethod({ id: selectedPaymentMethod.id, paymentMethod: formData }));
    } else {
      dispatch(createPaymentMethod(formData));
    }
    setOpenDialog(false);
  };

  const handleDelete = () => {
    if (selectedPaymentMethod) {
      dispatch(deletePaymentMethod(selectedPaymentMethod.id));
      setOpenDeleteDialog(false);
    }
  };

  // Función para mostrar el icono adecuado según el tipo de pago
  const getPaymentIcon = (type) => {
    switch (type) {
      case 'cash':
        return <MoneyIcon />;
      case 'card':
        return <CreditCardIcon />;
      case 'bank':
        return <BankIcon />;
      default:
        return <PaymentIcon />;
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Métodos de Pago
        </Typography>
        
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          color="primary"
          onClick={handleOpenAddDialog}
        >
          Nuevo Método de Pago
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      
      {paymentMethodsLoading && !paymentMethods.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell align="center">Activo</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paymentMethods.length > 0 ? (
                paymentMethods.map(method => (
                  <TableRow key={method.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: method.enabled ? 'primary.main' : 'grey.400' }}>
                          {getPaymentIcon(method.type)}
                        </Avatar>
                        {method.name}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {method.type === 'cash' ? 'Efectivo' : 
                       method.type === 'card' ? 'Tarjeta' : 
                       method.type === 'bank' ? 'Transferencia' : 
                       method.type}
                    </TableCell>
                    <TableCell>{method.description}</TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={method.enabled}
                        onChange={() => {
                          const updatedMethod = { ...method, enabled: !method.enabled };
                          dispatch(updatePaymentMethod({ id: method.id, paymentMethod: updatedMethod }));
                        }}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEditDialog(method)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteDialog(method)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No hay métodos de pago configurados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Diálogo para añadir/editar método de pago */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPaymentMethod ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  name="name"
                  label="Nombre"
                  value={formData.name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  name="type"
                  label="Tipo"
                  value={formData.type}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  SelectProps={{
                    native: true
                  }}
                >
                  <option value="cash">Efectivo</option>
                  <option value="card">Tarjeta</option>
                  <option value="bank">Transferencia Bancaria</option>
                  <option value="other">Otro</option>
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Descripción"
                  value={formData.description}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.enabled}
                      onChange={handleInputChange}
                      name="enabled"
                      color="primary"
                    />
                  }
                  label="Activo"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.requiresAuth}
                      onChange={handleInputChange}
                      name="requiresAuth"
                      color="primary"
                    />
                  }
                  label="Requiere autorización"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="paymentInstructions"
                  label="Instrucciones de pago"
                  value={formData.paymentInstructions}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained"
            startIcon={paymentMethodsLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={paymentMethodsLoading || !formData.name}
          >
            {paymentMethodsLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo de confirmación para eliminar método de pago */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Eliminar Método de Pago</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro de que desea eliminar el método de pago "{selectedPaymentMethod?.name}"?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            startIcon={paymentMethodsLoading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
            disabled={paymentMethodsLoading}
          >
            {paymentMethodsLoading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PaymentMethodsSettings;