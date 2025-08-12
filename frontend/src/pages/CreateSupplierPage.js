import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button, Paper, Breadcrumbs } from '@mui/material';
import DashboardLayout from '../components/layout/DashboardLayout';
import SupplierForm from '../components/suppliers/SupplierForm';
import { createSupplier } from '../features/suppliers/suppliersSlice';
import AlertMessage from '../components/common/AlertMessage';
import { ArrowBack, Home as HomeIcon, Business as BusinessIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

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
        <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Inicio
            </Link>
            <Link to="/suppliers" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
              <BusinessIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Proveedores
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              Crear Nuevo Proveedor
            </Typography>
          </Breadcrumbs>

          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
          </Box>
        </Paper>

        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <SupplierForm 
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            onCancel={() => navigate('/suppliers')}
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

export default CreateSupplierPage;