import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import { getProductsBySearch, createInventoryMovement } from '../../api/inventoryApi';

// Esquema de validación
const schema = yup.object().shape({
  product_id: yup.number().required('El producto es requerido'),
  movement_type: yup.string().required('El tipo de movimiento es requerido'),
  quantity: yup
    .number()
    .typeError('La cantidad debe ser un número')
    .required('La cantidad es requerida'),
  notes: yup.string().nullable(),
});

const AdjustmentForm = ({ onCompleted }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      product_id: '',
      movement_type: 'adjustment',
      quantity: '',
      notes: '',
    },
  });

  // Buscar productos
  const { 
    data: products, 
    isLoading: isLoadingProducts,
    refetch,
  } = useQuery(
    ['products', productSearch],
    () => getProductsBySearch(productSearch),
    {
      enabled: productSearch.length > 2,
      staleTime: 60000,
    }
  );

  // Mutación para crear ajuste
  const createAdjustment = useMutation(createInventoryMovement, {
    onSuccess: () => {
      queryClient.invalidateQueries('inventory-movements');
      enqueueSnackbar('Ajuste de inventario creado con éxito', { variant: 'success' });
      reset();
      setSelectedProduct(null);
      if (onCompleted) {
        onCompleted();
      }
    },
    onError: (error) => {
      enqueueSnackbar(
        `Error al crear el ajuste: ${error.response?.data?.detail || error.message}`,
        { variant: 'error' }
      );
    },
  });

  const handleProductChange = (event, newValue) => {
    setSelectedProduct(newValue);
    if (newValue) {
      setValue('product_id', newValue.id);
    } else {
      setValue('product_id', '');
    }
  };

  const onSubmit = (data) => {
    // Convertir la cantidad según el tipo de movimiento
    let finalQuantity = parseInt(data.quantity, 10);
    
    // Para tipos que reducen el inventario, convertir a número negativo si es positivo
    if (data.movement_type === 'adjustment' && finalQuantity > 0) {
      // Para ajustes, mantener el signo tal como se ingresó
    } else if (['sale', 'adjustment'].includes(data.movement_type) && finalQuantity > 0) {
      finalQuantity = -finalQuantity;
    }
    
    // Para tipos que aumentan el inventario, asegurar que sea positivo
    if (['purchase', 'return', 'initial'].includes(data.movement_type) && finalQuantity < 0) {
      finalQuantity = Math.abs(finalQuantity);
    }
    
    const adjustmentData = {
      ...data,
      quantity: finalQuantity,
    };
    
    createAdjustment.mutate(adjustmentData);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Ajuste de Inventario
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name="product_id"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.product_id}>
                  <Autocomplete
                    id="product-select"
                    options={products || []}
                    getOptionLabel={(option) => `${option.name} (${option.sku})`}
                    value={selectedProduct}
                    onChange={handleProductChange}
                    onInputChange={(_, newInputValue) => {
                      setProductSearch(newInputValue);
                      if (newInputValue.length > 2) {
                        refetch();
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Producto"
                        error={!!errors.product_id}
                        helperText={errors.product_id?.message}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {isLoadingProducts ? <CircularProgress size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box>
                          <Typography variant="body1">{option.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            SKU: {option.sku} | Stock: {option.stock_quantity}
                          </Typography>
                        </Box>
                      </li>
                    )}
                    loading={isLoadingProducts}
                    loadingText="Buscando productos..."
                    noOptionsText="No se encontraron productos"
                  />
                  {errors.product_id && (
                    <FormHelperText>{errors.product_id.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="movement_type"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.movement_type} required>
                  <InputLabel id="movement-type-label">Tipo de Movimiento</InputLabel>
                  <Select
                    {...field}
                    labelId="movement-type-label"
                    label="Tipo de Movimiento"
                  >
                    <MenuItem value="purchase">Compra</MenuItem>
                    <MenuItem value="sale">Venta</MenuItem>
                    <MenuItem value="adjustment">Ajuste</MenuItem>
                    <MenuItem value="return">Devolución</MenuItem>
                    <MenuItem value="initial">Stock Inicial</MenuItem>
                  </Select>
                  {errors.movement_type && (
                    <FormHelperText>{errors.movement_type.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="quantity"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Cantidad"
                  type="number"
                  fullWidth
                  required
                  error={!!errors.quantity}
                  helperText={errors.quantity?.message || "Positivo agrega, negativo resta (para ajustes)"}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Notas"
                  fullWidth
                  multiline
                  rows={3}
                  error={!!errors.notes}
                  helperText={errors.notes?.message}
                />
              )}
            />
          </Grid>

          {/* Información del producto seleccionado */}
          {selectedProduct && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Información del Producto Seleccionado:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      Nombre: <strong>{selectedProduct.name}</strong>
                    </Typography>
                    <Typography variant="body2">
                      SKU: {selectedProduct.sku}
                    </Typography>
                    {selectedProduct.barcode && (
                      <Typography variant="body2">
                        Código de barras: {selectedProduct.barcode}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      Stock actual: <strong>{selectedProduct.stock_quantity} unidades</strong>
                    </Typography>
                    <Typography variant="body2">
                      Nivel mínimo: {selectedProduct.min_stock_level} unidades
                    </Typography>
                    <Typography variant="body2">
                      Categoría: {selectedProduct.category?.name || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}

          {/* Botones */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => {
                  reset();
                  setSelectedProduct(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={createAdjustment.isLoading}
              >
                {createAdjustment.isLoading ? 'Guardando...' : 'Guardar Ajuste'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default AdjustmentForm;