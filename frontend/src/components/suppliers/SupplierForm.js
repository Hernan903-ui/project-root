import React, { useState, useEffect } from 'react';
import {
  Box,
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
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import GridItem from '../common/GridItem'; // Importamos el componente GridItem personalizado
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
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(prevData => ({ ...prevData, ...initialData }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Marcar campo como tocado
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Marcar todos los campos como tocados
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
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

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true
    }));
    
    // Validación en tiempo real para algunos campos
    const errors = { ...formErrors };
    
    if (name === 'name' && !formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    }
    
    if (name === 'email') {
      if (!formData.email.trim()) {
        errors.email = 'El email es requerido';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Email inválido';
      }
    }
    
    setFormErrors(errors);
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {initialData ? 'Editar Proveedor' : 'Nuevo Proveedor'}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {typeof error === 'object' ? (error?.detail || error?.message || 'Ha ocurrido un error') : error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <GridItem xs={12} md={6}>
          <TextField
            fullWidth
            label="Nombre de la Empresa"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name && !!formErrors.name}
            helperText={touched.name && formErrors.name}
            required
            autoFocus
          />
        </GridItem>
        <GridItem xs={12} md={6}>
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
        </GridItem>

        <GridItem xs={12} md={6}>
          <TextField
            fullWidth
            label="Nombre de Contacto"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.contactName && !!formErrors.contactName}
            helperText={touched.contactName && formErrors.contactName}
            required
          />
        </GridItem>
        <GridItem xs={12} md={6}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email && !!formErrors.email}
            helperText={touched.email && formErrors.email}
            required
          />
        </GridItem>

        <GridItem xs={12} md={6}>
          <TextField
            fullWidth
            label="Teléfono"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.phone && !!formErrors.phone}
            helperText={touched.phone && formErrors.phone}
            required
          />
        </GridItem>
        <GridItem xs={12} md={6}>
          <TextField
            fullWidth
            label="Sitio Web"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </GridItem>

        <GridItem xs={12} sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Dirección
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </GridItem>

        <GridItem xs={12}>
          <TextField
            fullWidth
            label="Dirección"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </GridItem>

        <GridItem xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Ciudad"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Estado/Provincia"
            name="state"
            value={formData.state}
            onChange={handleChange}
          />
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Código Postal"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
          />
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="País"
            name="country"
            value={formData.country}
            onChange={handleChange}
          />
        </GridItem>

        <GridItem xs={12} sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Información Adicional
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </GridItem>

        <GridItem xs={12} md={6}>
          <TextField
            fullWidth
            label="Identificación Fiscal"
            name="taxId"
            value={formData.taxId}
            onChange={handleChange}
          />
        </GridItem>
        <GridItem xs={12} md={6}>
          <TextField
            fullWidth
            label="Términos de Pago"
            name="paymentTerms"
            value={formData.paymentTerms}
            onChange={handleChange}
            placeholder="Ej: 30 días, Contado, etc."
          />
        </GridItem>

        <GridItem xs={12}>
          <TextField
            fullWidth
            label="Notas"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            multiline
            rows={3}
          />
        </GridItem>

        <GridItem xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.active}
                onChange={handleChange}
                name="active"
                color="primary"
              />
            }
            label={formData.active ? "Proveedor Activo" : "Proveedor Inactivo"}
          />
        </GridItem>

        <GridItem xs={12} sx={{ mt: 2 }}>
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
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disabled={loading}
            >
              {loading ? (initialData ? 'Actualizando...' : 'Guardando...') : (initialData ? 'Actualizar' : 'Guardar')}
            </Button>
          </Box>
        </GridItem>
      </Grid>
    </Paper>
  );
};

export default SupplierForm;