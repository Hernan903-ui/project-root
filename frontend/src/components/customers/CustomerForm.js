import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  MenuItem,
  Typography,
  Divider
} from '@mui/material';
import { createCustomer, updateCustomer, clearCustomerState } from '../../redux/slices/customerSlice';

// Opciones para el tipo de cliente
const customerTypes = [
  { value: 'individual', label: 'Individual' },
  { value: 'business', label: 'Empresa' }
];

const CustomerForm = ({ customer, onClose }) => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.customers);

  // Estado local del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'individual',
    document: '',
    documentType: 'dni',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
    birthdate: '',
    companyName: '',
    companyTaxId: ''
  });

  // Errores de validación
  const [validationErrors, setValidationErrors] = useState({});

  // Si se pasa un cliente como prop, inicializa el formulario con sus datos
  useEffect(() => {
    if (customer) {
      setFormData({
        id: customer.id,
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        type: customer.type || 'individual',
        document: customer.document || '',
        documentType: customer.documentType || 'dni',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zipCode: customer.zipCode || '',
        notes: customer.notes || '',
        birthdate: customer.birthdate ? customer.birthdate.substr(0, 10) : '',
        companyName: customer.companyName || '',
        companyTaxId: customer.companyTaxId || ''
      });
    }
  }, [customer]);

  // Cuando se completa con éxito, cierra el formulario
  useEffect(() => {
    if (success) {
      setTimeout(() => {
        dispatch(clearCustomerState());
        onClose();
      }, 1000);
    }
  }, [success, dispatch, onClose]);

  // Maneja cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpia el error de ese campo si existe
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validación del formulario
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'El nombre es obligatorio';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }
    
    if (formData.phone && !/^[0-9+\s()-]{7,15}$/.test(formData.phone)) {
      errors.phone = 'Número de teléfono inválido';
    }
    
    if (formData.type === 'business' && !formData.companyName) {
      errors.companyName = 'Nombre de empresa obligatorio para clientes tipo empresa';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (customer) {
      dispatch(updateCustomer(formData));
    } else {
      dispatch(createCustomer(formData));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Cliente {customer ? 'actualizado' : 'creado'} correctamente
        </Alert>
      )}
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            name="name"
            label="Nombre completo"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            error={!!validationErrors.name}
            helperText={validationErrors.name}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            select
            name="type"
            label="Tipo de cliente"
            value={formData.type}
            onChange={handleChange}
            fullWidth
          >
            {customerTypes.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            error={!!validationErrors.email}
            helperText={validationErrors.email}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            name="phone"
            label="Teléfono"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
            error={!!validationErrors.phone}
            helperText={validationErrors.phone}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            select
            name="documentType"
            label="Tipo de documento"
            value={formData.documentType}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="dni">DNI</MenuItem>
            <MenuItem value="passport">Pasaporte</MenuItem>
            <MenuItem value="ruc">RUC</MenuItem>
            <MenuItem value="other">Otro</MenuItem>
          </TextField>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            name="document"
            label="Número de documento"
            value={formData.document}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        
        {formData.type === 'business' && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" gutterBottom>
                Información de empresa
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="companyName"
                label="Nombre de empresa"
                value={formData.companyName}
                onChange={handleChange}
                fullWidth
                error={!!validationErrors.companyName}
                helperText={validationErrors.companyName}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="companyTaxId"
                label="RUC / ID Fiscal"
                value={formData.companyTaxId}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
          </>
        )}
        
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle1" gutterBottom>
            Dirección
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            name="address"
            label="Dirección"
            value={formData.address}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            name="city"
            label="Ciudad"
            value={formData.city}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            name="state"
            label="Provincia/Estado"
            value={formData.state}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            name="zipCode"
            label="Código Postal"
            value={formData.zipCode}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle1" gutterBottom>
            Información adicional
          </Typography>
        </Grid>
        
        {formData.type === 'individual' && (
          <Grid item xs={12} sm={6}>
            <TextField
              name="birthdate"
              label="Fecha de nacimiento"
              type="date"
              value={formData.birthdate}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        )}
        
        <Grid item xs={12}>
          <TextField
            name="notes"
            label="Notas"
            value={formData.notes}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="button"
          onClick={onClose}
          sx={{ mr: 1 }}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {customer ? 'Actualizar' : 'Crear'} Cliente
        </Button>
      </Box>
    </Box>
  );
};

export default CustomerForm;