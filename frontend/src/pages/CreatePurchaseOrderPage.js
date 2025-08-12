import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button, Paper, Breadcrumbs } from '@mui/material';
import DashboardLayout from '../components/layout/DashboardLayout';
import PurchaseOrderForm from '../components/suppliers/PurchaseOrderForm';
import { createPurchaseOrder } from '../features/suppliers/suppliersSlice';
import AlertMessage from '../components/common/AlertMessage';
import { ArrowBack, Home as HomeIcon, ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';

const CreatePurchaseOrderPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.suppliers);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  
  // Obtener el ID del proveedor si se pasó a través del estado de navegación
  const initialSupplierId = location.state?.supplierId || '';

  const handleSubmit = async (formData) => {
    try {
      await dispatch(createPurchaseOrder(formData)).unwrap();
      setAlert({
        open: true,
        message: 'Orden de compra creada correctamente',
        severity: 'success'
      });
      
      // Redirigir después de un breve retraso para que el usuario vea el mensaje
      setTimeout(() => {
        navigate('/purchase-orders');
      }, 1500);
    } catch (err) {
      setAlert({
        open: true,
        message: `Error al crear orden de compra: ${err.message}`,
        severity: 'error'
      });
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Inicio
            </Link>
            <Link to="/purchase-orders" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
              <ShoppingCartIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Órdenes de Compra
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              Crear Nueva Orden
            </Typography>
          </Breadcrumbs>

          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/purchase-orders')}
                sx={{ mr: 2 }}
              >
                Volver
              </Button>
              <Typography variant="h4">
                Crear Nueva Orden de Compra
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <PurchaseOrderForm 
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            onCancel={() => navigate('/purchase-orders')}
            initialSupplierId={initialSupplierId}
          />
        </Paper>

        <AlertMessage 
          open={alert.open}
          message={alert.message}
          severity={alert.severity}
          onClose={() => setAlert({ ...alert, open: false })}
        />
      </Box>
    </DashboardLayout>
  );
};

export default CreatePurchaseOrderPage;