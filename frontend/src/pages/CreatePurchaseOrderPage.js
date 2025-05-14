import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button } from '@mui/material';
import DashboardLayout from '../components/layout/DashboardLayout';
import PurchaseOrderForm from '../components/suppliers/PurchaseOrderForm';
import { createPurchaseOrder } from '../features/suppliers/suppliersSlice';
import AlertMessage from '../components/common/AlertMessage';
import { ArrowBack } from '@mui/icons-material';

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
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
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

      <PurchaseOrderForm 
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        onCancel={() => navigate('/purchase-orders')}
        initialSupplierId={initialSupplierId}
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

export default CreatePurchaseOrderPage;