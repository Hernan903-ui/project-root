// pages/ProductDetailsPage.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Divider, 
  Chip, 
  Alert,
  AlertTitle,
  Tab,
  Tabs
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  ArrowBack as ArrowBackIcon,
  Inventory as InventoryIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { Grid } from '@mui/material';
import DashboardLayout from '../components/layout/DashboardLayout';
import LoadingOverlay from '../components/common/LoadingOverlay';
import ConfirmDialog from '../components/common/ConfirmDialog';
import StockMovementHistory from '../components/inventory/StockMovementHistory';
import { getProductById, deleteProduct } from '../api/productApi';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  // Usamos la sintaxis de objeto para React Query v5
  const { 
    data: product, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id)
  });

  const deleteMutation = useMutation({
    mutationFn: (productId) => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/products');
    }
  });


  const handleEdit = () => {
    navigate(`/products/edit/${id}`);
  };

  const handleDelete = () => {
    setConfirmDelete(true);
  };

  const confirmDeleteAction = () => {
    deleteMutation.mutate(id);
    setConfirmDelete(false);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  if (isLoading) return <DashboardLayout><LoadingOverlay /></DashboardLayout>;
  
  if (isError) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            {error?.message || 'Ha ocurrido un error al cargar los detalles del producto.'}
          </Alert>
          <Button 
            sx={{ mt: 2 }}
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/products')}
          >
            Volver a Productos
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/products')}
            sx={{ mr: 2 }}
          >
            Volver
          </Button>
          <Typography variant="h4" component="h1">
            Detalles del Producto
          </Typography>
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h5" component="h2" gutterBottom>
                {product.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Código: {product.sku}
              </Typography>
              <Chip 
                label={product.active ? "Activo" : "Inactivo"} 
                color={product.active ? "success" : "default"}
                size="small"
                sx={{ mr: 1 }}
              />
              <Chip 
                label={product.stockQuantity > 0 ? "En stock" : "Sin stock"} 
                color={product.stockQuantity > 0 ? "primary" : "error"}
                size="small"
              />
            </Box>
            <Box>
              <Button 
                startIcon={<EditIcon />} 
                variant="outlined" 
                onClick={handleEdit}
                sx={{ mr: 1 }}
              >
                Editar
              </Button>
              <Button 
                startIcon={<DeleteIcon />} 
                variant="outlined" 
                color="error" 
                onClick={handleDelete}
              >
                Eliminar
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold">Precio</Typography>
              <Typography variant="body1">${product.price.toFixed(2)}</Typography>
            </Grid>
            <Grid xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold">Categoría</Typography>
              <Typography variant="body1">{product.category}</Typography>
            </Grid>
            <Grid xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold">Stock Actual</Typography>
              <Typography variant="body1">{product.stockQuantity} unidades</Typography>
            </Grid>
            <Grid xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold">Stock Mínimo</Typography>
              <Typography variant="body1">{product.minStockLevel} unidades</Typography>
            </Grid>
            
            {product.barcode && (
              <Grid xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold">Código de Barras</Typography>
                <Typography variant="body1">{product.barcode}</Typography>
              </Grid>
            )}
            
            {product.brand && (
              <Grid xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold">Marca</Typography>
                <Typography variant="body1">{product.brand}</Typography>
              </Grid>
            )}
            
            <Grid xs={12}>
              <Typography variant="subtitle1" fontWeight="bold">Descripción</Typography>
              <Typography variant="body1">{product.description || "Sin descripción"}</Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="product tabs">
            <Tab icon={<InventoryIcon />} label="Inventario" />
            <Tab icon={<TimelineIcon />} label="Historial de Movimientos" />
          </Tabs>
          
          <Box sx={{ p: 2, pt: 3 }}>
            {currentTab === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>Información de Inventario</Typography>
                <Grid container spacing={3}>
                                    <Grid xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="bold">Ubicación</Typography>
                    <Typography variant="body1">{product.location || "No especificada"}</Typography>
                  </Grid>
                  <Grid xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="bold">Costo de Compra</Typography>
                    <Typography variant="body1">${product.costPrice?.toFixed(2) || "No especificado"}</Typography>
                  </Grid>
                  <Grid xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="bold">Fecha Última Compra</Typography>
                    <Typography variant="body1">
                      {product.lastPurchaseDate 
                        ? new Date(product.lastPurchaseDate).toLocaleDateString() 
                        : "No hay compras registradas"}
                    </Typography>
                  </Grid>
                  <Grid xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="bold">Último Proveedor</Typography>
                    <Typography variant="body1">{product.lastSupplier || "No especificado"}</Typography>
                  </Grid>
                  <Grid xs={12}>
                    <Box sx={{ mt: 2 }}>
                      <Alert severity={product.stockQuantity <= product.minStockLevel ? "warning" : "info"}>
                        {product.stockQuantity <= product.minStockLevel 
                          ? "Este producto está por debajo o en el nivel mínimo de stock recomendado."
                          : "El nivel de stock de este producto es adecuado."}
                      </Alert>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {currentTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>Historial de Movimientos</Typography>
                {product.id && (
                  <StockMovementHistory productId={product.id} />
                )}
              </Box>
            )}
          </Box>
        </Paper>

        {/* Diálogo de confirmación para eliminar */}
        <ConfirmDialog
          open={confirmDelete}
          title="Confirmar eliminación"
          message={`¿Está seguro que desea eliminar el producto "${product?.name}"? Esta acción no se puede deshacer.`}
          onConfirm={confirmDeleteAction}
          onCancel={() => setConfirmDelete(false)}
          isLoading={deleteMutation.isPending}
        />
      </Box>
    </DashboardLayout>
  );
};

export default ProductDetailsPage;