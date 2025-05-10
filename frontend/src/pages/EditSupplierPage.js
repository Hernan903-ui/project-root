import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import DashboardLayout from '../components/layout/DashboardLayout';
import SupplierForm from '../components/suppliers/SupplierForm';
import { fetchSupplierById, updateSupplier, clearCurrentSupplier } from '../features/suppliers/suppliersSlice';
import AlertMessage from '../components/common/AlertMessage';
import { ArrowBack } from '@mui/icons-material';

const EditSupplierPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentSupplier, loading, error } = useSelector((state) => state.suppliers);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    dispatch(fetchSupplierById(id));

    return () => {
      dispatch(clearCurrentSupplier());
    };
  }, [dispatch, id]);

  const handleSubmit = async (formData) => {
    try {
      await dispatch(updateSupplier({ id, supplierData: formData })).unwrap();
      setAlert({
        open: true,
        message: 'Proveedor actualizado correctamente',
        severity: 'success'
      });
      
      // Redirigir después de un breve retraso
      setTimeout(() => {
        navigate(`/suppliers/${id}`);
      }, 1500);
    } catch (err) {
      setAlert({
        open: true,
        message: `Error al actualizar proveedor: ${err.message}`,
        severity: 'error'
      });
    }
  };

  if (loading && !currentSupplier) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (!loading && !currentSupplier && !error) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" color="error">
            Proveedor no encontrado
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/suppliers')}
            sx={{ mt: 2 }}
          >
            Volver a Proveedores
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(`/suppliers/${id}`)}
            sx={{ mr: 2 }}
          >
            Volver
          </Button>
          <Typography variant="h4">
            Editar Proveedor
          </Typography>
        </Box>

        <SupplierForm 
          initialData={currentSupplier}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          onCancel={() => navigate(`/suppliers/${id}`)}
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

export default EditSupplierPage;