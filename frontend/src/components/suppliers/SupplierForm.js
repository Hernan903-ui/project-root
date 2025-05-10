import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Divider,
  FormControlLabel,
  Switch,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

const SupplierForm = ({ 
  initialData, 
  onSubmit, 
  loading, 
  error, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'general',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    taxId: '',
    notes: '',
    paymentTerms: '',
    active: true,
    website: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'El nombre es requerido';
    if (!formData.contactName.trim()) errors.contactName = 'El contacto es requerido';
    if (!formData.email.trim()) errors.email = 'El email es requerido';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }
    if (!formData.phone.trim()) errors.phone = 'El teléfono es requerido';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {initialData ? 'Editar Proveedor' : 'Nuevo Proveedor'}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Nombre de la Empresa"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="category-label">Categoría</InputLabel>
            <Select
              labelId="category-label"
              name="category"
              value={formData.category}
              onChange={handleChange}
              label="Categoría"
            >
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="electronics">Electrónica</MenuItem>
              <MenuItem value="food">Alimentos</MenuItem>
              <MenuItem value="clothing">Ropa</MenuItem>
              <MenuItem value="services">Servicios</MenuItem>
              <MenuItem value="other">Otros</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Nombre de Contacto"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            error={!!formErrors.contactName}
            helperText={formErrors.contactName}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Teléfono"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={!!formErrors.phone}
            helperText={formErrors.phone}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Sitio Web"
            name="website"
            value={formData.website}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Dirección
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Dirección"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Ciudad"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Estado/Provincia"
            name="state"
            value={formData.state}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Código Postal"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="País"
            name="country"
            value={formData.country}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Información Adicional
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Identificación Fiscal"
            name="taxId"
            value={formData.taxId}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Términos de Pago"
            name="paymentTerms"
            value={formData.paymentTerms}
            onChange={handleChange}
            placeholder="Ej: 30 días, Contado, etc."
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Notas"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            multiline
            rows={3}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.active}
                onChange={handleChange}
                name="active"
                color="primary"
              />
            }
            label="Proveedor Activo"
          />
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Typography color="error">{error}</Typography>
          </Grid>
        )}

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
              disabled={loading}
            >
              {initialData ? 'Actualizar' : 'Guardar'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SupplierForm;