import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import PurchaseOrderForm from '../components/suppliers/PurchaseOrderForm';
import { fetchPurchaseOrderById, updatePurchaseOrder, clearCurrentPurchaseOrder } from '../features/suppliers/suppliersSlice';
import AlertMessage from '../components/common/AlertMessage';
import { ArrowBack } from '@mui/icons-material';

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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!loading && !currentPurchaseOrder && !error) {
    return (
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
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
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

      <PurchaseOrderForm 
        initialData={currentPurchaseOrder}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        onCancel={() => navigate(`/purchase-orders/${id}`)}
      />

      <AlertMessage 
        open={alert.open}
        message={alert.message}
        severity={alert.severity}
        onClose={() => setAlert({ ...alert, open: false })}
      />
    </Box>
  );
};

export default EditPurchaseOrderPage;