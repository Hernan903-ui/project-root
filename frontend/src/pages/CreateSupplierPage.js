import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button } from '@mui/material';
import DashboardLayout from '../components/layout/DashboardLayout';
import SupplierForm from '../components/suppliers/SupplierForm';
import { createSupplier } from '../features/suppliers/suppliersSlice';
import AlertMessage from '../components/common/AlertMessage';
import { ArrowBack } from '@mui/icons-material';

const CreateSupplierPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.suppliers);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  const handleSubmit = async (formData) => {
    try {
      await dispatch(createSupplier(formData)).unwrap();
      setAlert({
        open: true,
        message: 'Proveedor creado correctamente',
        severity: 'success'
      });
      
      // Redirigir después de un breve retraso para que el usuario vea el mensaje
      setTimeout(() => {
        navigate('/suppliers');
      }, 1500);
    } catch (err) {
      setAlert({
        open: true,
        message: `Error al crear proveedor: ${err.message}`,
        severity: 'error'
      });
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/suppliers')}
            sx={{ mr: 2 }}
          >
            Volver
          </Button>
          <Typography variant="h4">
            Crear Nuevo Proveedor
          </Typography>
        </Box>

        <SupplierForm 
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          onCancel={() => navigate('/suppliers')}
        />

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

export default CreateSupplierPage;