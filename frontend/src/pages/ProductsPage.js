import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

import ProductTable from '../components/products/ProductTable';
import ProductFilters from '../components/products/ProductFilters';
import { getProducts, updateProduct } from '../api/productApi';

const ProductsPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // Inicializar filtros con valores correctos (null en lugar de cadenas vacías)
  const [filters, setFilters] = useState({
    search: '',
    category_id: null, // Cambiado de '' a null
    is_active: null,   // Cambiado de '' a null
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
  });

  // Preparar los parámetros de consulta, limpiando valores vacíos
  const prepareQueryParams = useCallback(() => {
    // Crear una copia del objeto de filtros
    const cleanFilters = { ...filters };
    
    // Limpiar valores vacíos o no válidos
    Object.keys(cleanFilters).forEach(key => {
      if (cleanFilters[key] === '' || cleanFilters[key] === undefined) {
        cleanFilters[key] = null;
      }
      
      // Convertir is_active a booleano si es necesario
      if (key === 'is_active' && cleanFilters[key] !== null) {
        if (cleanFilters[key] === 'true') cleanFilters[key] = true;
        else if (cleanFilters[key] === 'false') cleanFilters[key] = false;
      }
    });
    
    return { ...cleanFilters, ...pagination };
  }, [filters, pagination]);

  // Optimizado con useQuery v5
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['products', pagination.page, pagination.limit, filters],
    queryFn: () => getProducts(prepareQueryParams()),
    staleTime: 60000, // 1 minuto antes de considerar los datos obsoletos
    retry: (failureCount, error) => {
      // No reintentar en errores de validación (422)
      if (error?.response?.status === 422) return false;
      return failureCount < 3; // Reintentar hasta 3 veces para otros errores
    },
    // Manejar mejor el error 422
    onError: (error) => {
      if (error?.response?.status === 422) {
        console.error('Error de validación en la consulta:', error.response?.data);
      }
    },
  });

  // Efecto para gestionar errores persistentes
  useEffect(() => {
    if (error?.response?.status === 422) {
      // Si hay error 422, intentar corregir los filtros y volver a consultar
      const newFilters = { ...filters };
      
      // Si is_active está causando problemas, establecerlo a null
      if (newFilters.is_active === '') {
        newFilters.is_active = null;
        setFilters(newFilters);
      }
    }
  }, [error, filters]);

  // Mutación para realizar operaciones masivas
  const bulkMutation = useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      enqueueSnackbar('Operación realizada con éxito', { variant: 'success' });
    },
    onError: (error) => {
      enqueueSnackbar(
        `Error al realizar la operación: ${error.response?.data?.detail || error.message}`,
        { variant: 'error' }
      );
    },
  });

  // Manejar el filtrado de productos - mejorado para validar valores
  const handleFilter = useCallback((newFilters) => {
    // Validar y transformar valores antes de aplicar los filtros
    const validatedFilters = { ...newFilters };
    
    // Convertir valores vacíos a null
    Object.keys(validatedFilters).forEach(key => {
      if (validatedFilters[key] === '') {
        validatedFilters[key] = null;
      }
      
      // Asegurar que is_active sea un booleano o null
      if (key === 'is_active') {
        if (validatedFilters[key] === 'true') validatedFilters[key] = true;
        else if (validatedFilters[key] === 'false') validatedFilters[key] = false;
        else if (validatedFilters[key] === '') validatedFilters[key] = null;
      }
    });
    
    setFilters(validatedFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Volver a la primera página al filtrar
  }, []);

  // Manejar cambio de página
  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  // Manejar cambio de límite por página
  const handleLimitChange = useCallback((newLimit) => {
    setPagination({ page: 1, limit: newLimit });
  }, []);

  // Manejar operaciones masivas
  const handleBulkAction = useCallback(async (action, selectedIds) => {
    if (!selectedIds.length) {
      enqueueSnackbar('Seleccione al menos un producto', { variant: 'warning' });
      return;
    }

    const isActive = action === 'activate';

    try {
      // Realizar operaciones en paralelo
      await Promise.all(
        selectedIds.map(id =>
          bulkMutation.mutateAsync({ id, data: { is_active: isActive } })
        )
      );
    } catch (error) {
      console.error('Error en operación masiva:', error);
      enqueueSnackbar('Hubo un error al procesar la operación', { variant: 'error' });
    }
  }, [bulkMutation, enqueueSnackbar]);

  // Función para crear un nuevo producto
  const handleCreateProduct = useCallback(() => {
    navigate('/products/new');
  }, [navigate]);

  // Mostrar mensaje de error si la consulta falla
  if (error && !isLoading) {
    // Personalizar el mensaje de error según el tipo
    let errorMessage = 'Error al cargar productos';
    
    if (error.response?.status === 422) {
      errorMessage = 'Error de validación en los parámetros de búsqueda';
      // Intentar mostrar detalles más específicos si están disponibles
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage += ': ' + error.response.data.detail[0].msg;
        } else {
          errorMessage += ': ' + error.response.data.detail;
        }
      }
    } else {
      errorMessage += ': ' + (typeof error === 'object' ? error.message : error);
    }
    
    return (
      <Box sx={{ width: '100%' }}>
        <Alert 
          severity="error" 
          sx={{ mt: 2 }}
          variant="filled"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Reintentar
            </Button>
          }
        >
          {errorMessage}
        </Alert>
        
        {/* Mantener la cabecera y los controles incluso con error */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          gap: 2,
          mb: 3,
          mt: 2
        }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Productos
            </Typography>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
              <Link color="inherit" href="/dashboard">
                Dashboard
              </Link>
              <Typography color="text.primary">Productos</Typography>
            </Breadcrumbs>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateProduct}
            sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' } }}
          >
            Nuevo Producto
          </Button>
        </Box>
        
        {/* Mantener los filtros para poder corregirlos */}
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2, 
            mb: 3, 
            borderRadius: 2,
            bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
          }}
        >
          <ProductFilters onFilter={handleFilter} initialValues={filters} />
        </Paper>
      </Box>
    );
  }

  // Calcular el total de productos
  const products = data?.items || data || [];
  const totalProducts = data?.total || products.length || 0;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Encabezado y breadcrumbs */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        gap: 2,
        mb: 3 
      }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Productos
          </Typography>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            <Link color="inherit" href="/dashboard">
              Dashboard
            </Link>
            <Typography color="text.primary">Productos</Typography>
          </Breadcrumbs>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateProduct}
          sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' } }}
        >
          Nuevo Producto
        </Button>
      </Box>

      {/* Filtros */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 2,
          bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
        }}
      >
        <ProductFilters onFilter={handleFilter} initialValues={filters} />
      </Paper>

      {/* Tabla de productos */}
      {isLoading && !data ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper 
          elevation={1} 
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <ProductTable
            products={products}
            isLoading={isLoading}
            totalCount={totalProducts}
            page={pagination.page}
            limit={pagination.limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            onBulkAction={handleBulkAction}
            error={error}
          />
        </Paper>
      )}
    </Box>
  );
};

export default ProductsPage;