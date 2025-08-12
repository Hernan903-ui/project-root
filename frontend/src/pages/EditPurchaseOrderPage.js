import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button, CircularProgress, Paper, Breadcrumbs } from '@mui/material';
import DashboardLayout from '../components/layout/DashboardLayout';
import PurchaseOrderForm from '../components/suppliers/PurchaseOrderForm';
import { fetchPurchaseOrderById, updatePurchaseOrder, clearCurrentPurchaseOrder } from '../features/suppliers/suppliersSlice';
import AlertMessage from '../components/common/AlertMessage';
import { ArrowBack, Home as HomeIcon, ShoppingCart as ShoppingCartIcon, Edit as EditIcon } from '@mui/icons-material';

const EditPurchaseOrderPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentPurchaseOrder, loading, error } = useSelector((state) => state.suppliers);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    dispatch(fetchPurchaseOrderById(id));

    return () => {
      dispatch(clearCurrentPurchaseOrder());
    };
  }, [dispatch, id]);

  const handleSubmit = async (formData) => {
    try {
      await dispatch(updatePurchaseOrder({ id, orderData: formData })).unwrap();
      setAlert({
        open: true,
        message: 'Orden de compra actualizada correctamente',
        severity: 'success'
      });
      
      // Redirigir después de un breve retraso
      setTimeout(() => {
        navigate(`/purchase-orders/${id}`);
      }, 1500);
    } catch (err) {
      setAlert({
        open: true,
        message: `Error al actualizar orden de compra: ${err.message}`,
        severity: 'error'
      });
    }
  };

  if (loading && !currentPurchaseOrder) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (!loading && !currentPurchaseOrder && !error) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" color="error">
            Orden de compra no encontrada
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/purchase-orders')}
            sx={{ mt: 2 }}
          >
            Volver a Órdenes de Compra
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

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
            <Link to={`/purchase-orders/${id}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
              Orden #{id}
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <EditIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Editar
            </Typography>
          </Breadcrumbs>

          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(`/purchase-orders/${id}`)}
                sx={{ mr: 2 }}
              >
                Volver
              </Button>
              <Typography variant="h4">
                Editar Orden de Compra #{id}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <PurchaseOrderForm 
            initialData={currentPurchaseOrder}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            onCancel={() => navigate(`/purchase-orders/${id}`)}
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

export default EditPurchaseOrderPage;