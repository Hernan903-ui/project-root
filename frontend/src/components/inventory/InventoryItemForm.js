import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress
} from '@mui/material';
import { addInventoryItem, updateInventoryItem } from '../../features/inventory/inventorySlice';

const InventoryItemForm = ({ item, products, onClose }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    sku: '',
    quantity: 0,
    minStockLevel: 0,
    location: '',
    category: '',
    status: 'En Stock',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        productId: item.productId || '',
        productName: item.productName || '',
        sku: item.sku || '',
        quantity: item.quantity || 0,
        minStockLevel: item.minStockLevel || 0,
        location: item.location || '',
        category: item.category || '',
        status: item.status || 'En Stock',
        notes: item.notes || ''
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error del campo si existe
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const handleProductChange = (e) => {
    const productId = e.target.value;
    const selectedProduct = products.find(p => p.id === productId);
    
    if (selectedProduct) {
      setFormData({
        ...formData,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        sku: selectedProduct.sku || '',
        category: selectedProduct.category || '',
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.productName) errors.productName = 'El nombre del producto es requerido';
    if (!formData.sku) errors.sku = 'El SKU es requerido';
    if (formData.quantity < 0) errors.quantity = 'La cantidad no puede ser negativa';
    if (formData.minStockLevel < 0) errors.minStockLevel = 'El stock mínimo no puede ser negativo';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (item && item.id) {
        await dispatch(updateInventoryItem({ ...formData, id: item.id })).unwrap();
      } else {
        await dispatch(addInventoryItem(formData)).unwrap();
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar el ítem de inventario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {products && products.length > 0 && (
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="product-select-label">Seleccionar Producto</InputLabel>
              <Select
                labelId="product-select-label"
                id="product-select"
                value={formData.productId}
                onChange={handleProductChange}
                label="Seleccionar Producto"
              >
                {products.map(product => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Seleccionar un producto rellenará automáticamente algunos campos</FormHelperText>
            </FormControl>
          </Grid>
        )}
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Nombre del Producto"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            error={!!formErrors.productName}
            helperText={formErrors.productName}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="SKU"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            error={!!formErrors.sku}
            helperText={formErrors.sku}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Categoría"
            name="category"
            value={formData.category}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Ubicación"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Cantidad"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            error={!!formErrors.quantity}
            helperText={formErrors.quantity}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Stock Mínimo"
            name="minStockLevel"
            type="number"
            value={formData.minStockLevel}
            onChange={handleChange}
            error={!!formErrors.minStockLevel}
            helperText={formErrors.minStockLevel}
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="status-select-label">Estado</InputLabel>
            <Select
              labelId="status-select-label"
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Estado"
            >
              <MenuItem value="En Stock">En Stock</MenuItem>
              <MenuItem value="Bajo Stock">Bajo Stock</MenuItem>
              <MenuItem value="Agotado">Agotado</MenuItem>
              <MenuItem value="Discontinuado">Discontinuado</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Notas"
            name="notes"
            multiline
            rows={3}
            value={formData.notes}
            onChange={handleChange}
          />
        </Grid>
        
        {error && (
          <Grid item xs={12}>
            <FormHelperText error>{error}</FormHelperText>
          </Grid>
        )}
        
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={24} /> : null}
          >
            {item ? 'Actualizar' : 'Guardar'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InventoryItemForm;