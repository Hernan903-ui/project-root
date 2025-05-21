import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';

import { getCategories, createCategory } from '../../api/productApi';

// Esquema de validación
const schema = yup.object().shape({
  name: yup.string().required('El nombre del producto es requerido'),
  sku: yup.string().required('El SKU es requerido'),
  barcode: yup.string().nullable(),
  description: yup.string().nullable(),
  category_id: yup.number().required('La categoría es requerida'),
  price: yup
    .number()
    .typeError('El precio debe ser un número')
    .positive('El precio debe ser positivo')
    .required('El precio es requerido'),
  cost_price: yup
    .number()
    .typeError('El costo debe ser un número')
    .min(0, 'El costo no puede ser negativo')
    .required('El costo es requerido'),
  tax_rate: yup
    .number()
    .typeError('La tasa de impuestos debe ser un número')
    .min(0, 'La tasa no puede ser negativa')
    .nullable(),
  stock_quantity: yup
    .number()
    .typeError('La cantidad debe ser un número')
    .min(0, 'La cantidad no puede ser negativa')
    .integer('La cantidad debe ser un número entero')
    .required('La cantidad es requerida'),
  min_stock_level: yup
    .number()
    .typeError('El nivel mínimo debe ser un número')
    .min(0, 'El nivel no puede ser negativo')
    .integer('El nivel debe ser un número entero')
    .required('El nivel mínimo es requerido'),
  is_active: yup.boolean().default(true),
});

const ProductForm = ({ initialData, onSubmit, isSubmitting, title }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialData || {
      name: '',
      sku: '',
      barcode: '',
      description: '',
      category_id: '',
      price: '',
      cost_price: '',
      tax_rate: 0,
      stock_quantity: 0,
      min_stock_level: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  // Actualizado para React Query v5
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 300000, // 5 minutos
  });

  // Actualizado para React Query v5
  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      enqueueSnackbar('Categoría creada con éxito', { variant: 'success' });
      setOpenCategoryDialog(false);
      setNewCategory({ name: '', description: '' });
    },
    onError: (error) => {
      enqueueSnackbar(
        `Error al crear la categoría: ${error.response?.data?.detail || error.message}`,
        { variant: 'error' }
      );
    },
  });

  const handleCreateCategory = () => {
    if (!newCategory.name.trim()) {
      enqueueSnackbar('El nombre de la categoría es requerido', { variant: 'error' });
      return;
    }
    createCategoryMutation.mutate(newCategory);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {title || 'Producto'}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={3}>
          {/* Información básica */}
          {/* Actualizado a Grid v2 */}
          <Grid gridColumn={{ xs: "span 12" }}>
            <Typography variant="h6" gutterBottom>
              Información Básica
            </Typography>
          </Grid>

          {/* Actualizado a Grid v2 */}
          <Grid gridColumn={{ xs: "span 12", md: "span 6" }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nombre del Producto"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  required
                />
              )}
            />
          </Grid>

          {/* Actualizado a Grid v2 */}
          <Grid gridColumn={{ xs: "span 12", md: "span 6" }}>
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.category_id} required>
                  <InputLabel id="category-label">Categoría</InputLabel>
                  <Select
                    {...field}
                    labelId="category-label"
                    label="Categoría"
                    disabled={isLoadingCategories}
                    value={field.value || ''}
                    endAdornment={
                      <InputAdornment position="end">
                        <Button
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenCategoryDialog(true);
                          }}
                          sx={{ mr: 1 }}
                        >
                          Nueva
                        </Button>
                      </InputAdornment>
                    }
                  >
                    {categories?.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category_id && (
                    <FormHelperText>{errors.category_id.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          {/* Actualizado a Grid v2 */}
          <Grid gridColumn={{ xs: "span 12", md: "span 6" }}>
            <Controller
              name="sku"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="SKU"
                  fullWidth
                  error={!!errors.sku}
                  helperText={errors.sku?.message}
                  required
                />
              )}
            />
          </Grid>

          {/* Actualizado a Grid v2 */}
          <Grid gridColumn={{ xs: "span 12", md: "span 6" }}>
            <Controller
              name="barcode"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Código de Barras"
                  fullWidth
                  error={!!errors.barcode}
                  helperText={errors.barcode?.message}
                />
              )}
            />
          </Grid>

          {/* Actualizado a Grid v2 */}
          <Grid gridColumn={{ xs: "span 12" }}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Descripción"
                  fullWidth
                  multiline
                  rows={3}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
          </Grid>

          {/* Precios e Impuestos */}
          {/* Actualizado a Grid v2 */}
          <Grid gridColumn={{ xs: "span 12" }}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Precios e Impuestos
            </Typography>
          </Grid>

          {/* Actualizado a Grid v2 */}
          <Grid gridColumn={{ xs: "span 12", md: "span 4" }}>
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Precio de Venta"
                  fullWidth
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  error={!!errors.price}
                  helperText={errors.price?.message}
                  required
                />
              )}
            />
          </Grid>

          {/* Actualizado a Grid v2 */}
          <Grid gridColumn={{ xs: "span 12", md: "span 4" }}>
            <Controller
              name="cost_price"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Costo"
                  fullWidth
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  error={!!errors.cost_price}
                  helperText={errors.cost_price?.message}
                  required
                />
              )}
            />
          </Grid>

          {/* Actualizado a Grid v2 */}
          <Grid gridColumn={{ xs: "span 12", md: "span 4" }}>
            <Controller
              name="tax_rate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Tasa de Impuesto"
                  fullWidth
                  type="number"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  error={!!errors.tax_rate}
                  helperText={errors.tax_rate?.message}
                />
              )}
            />
          </Grid>

          {/* Inventario */}
          {/* Actualizado a Grid v2 */}
          <Grid gridColumn={{ xs: "span 12" }}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Inventario
            </Typography>
          </Grid>

          {/* Actualizado a Grid v2 */}
          <Grid gridColumn={{ xs: "span 12", md: "span 4" }}>
            <Controller
              name="stock_quantity"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Cantidad en Stock"
                  fullWidth
                  type="number"
                  error={!!errors.stock_quantity}
                  helperText={errors.stock_quantity?.message}
                  required
                />
              )}
            />
          </Grid>

          {/* Actualizado a Grid v2 */}
          <Grid gridColumn={{ xs: "span 12", md: "span 4" }}>
            <Controller
              name="min_stock_level"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nivel Mínimo de Stock"
                  fullWidth
                  type="number"
                  error={!!errors.min_stock_level}
                  helperText={errors.min_stock_level?.message}
                  required
                />
              )}
            />
          </Grid>

          {/* Actualizado a Grid v2 */}
          <Grid gridColumn={{ xs: "span 12", md: "span 4" }}>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id="status-label">Estado</InputLabel>
                  <Select
                    {...field}
                    labelId="status-label"
                    label="Estado"
                  >
                    <MenuItem value={true}>Activo</MenuItem>
                    <MenuItem value={false}>Inactivo</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          {/* Botones de acción */}
          {/* Actualizado a Grid v2 */}
          <Grid gridColumn={{ xs: "span 12" }} sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => navigate('/products')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Diálogo para crear nueva categoría */}
      <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)}>
        <DialogTitle>Nueva Categoría</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre de la Categoría"
            fullWidth
            required
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Descripción"
            fullWidth
            multiline
            rows={3}
            value={newCategory.description}
            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCategoryDialog(false)}>Cancelar</Button>
          <Button onClick={handleCreateCategory} variant="contained">
            {createCategoryMutation.isPending ? 'Creando...' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ProductForm;