import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Breadcrumbs
} from '@mui/material';
import DashboardLayout from '../components/layout/DashboardLayout';
import SupplierDetails from '../components/suppliers/SupplierDetails';
import { 
  fetchSupplierById, 
  deleteSupplier, 
  clearCurrentSupplier 
} from '../features/suppliers/suppliersSlice';
import AlertMessage from '../components/common/AlertMessage';
import { ArrowBack, Home as HomeIcon, Business as BusinessIcon } from '@mui/icons-material';

const SupplierDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentSupplier, loading, error } = useSelector((state) => state.suppliers);
  
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    dispatch(fetchSupplierById(id));
    
    return () => {
      dispatch(clearCurrentSupplier());
    };
  }, [dispatch, id]);

  const handleCreateOrder = (supplierId) => {
    navigate('/purchase-orders/create', { state: { supplierId } });
  };

  const handleDeleteSupplier = async () => {
    try {
      await dispatch(deleteSupplier(id)).unwrap();
      setAlert({
        open: true,
        message: 'Proveedor eliminado correctamente',
        severity: 'success'
      });
      
      setTimeout(() => {
        navigate('/suppliers');
      }, 1500);
    } catch (err) {
      setAlert({
        open: true,
        message: `Error al eliminar proveedor: ${err.message}`,
        severity: 'error'
      });
      setConfirmDelete(false);
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
              {currentSupplier?.name || 'Detalles del Proveedor'}
            </Typography>
          </Breadcrumbs>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/suppliers')}
                sx={{ mr: 2 }}
              >
                Volver a Proveedores
              </Button>
              <Typography variant="h4">
                {currentSupplier?.name || 'Detalles del Proveedor'}
              </Typography>
            </Box>
          </Box>
        </Paper>
        
        </Box>
        <Paper elevation={0} sx={{ p: 2, mb: 3 }}></Paper>
        <Box sx={{ p: 2 }}>
          <Box>

          <SupplierDetails 
            supplier={currentSupplier} 
            onCreateOrder={handleCreateOrder}
          />
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => navigate(`/suppliers/edit/${id}`)}
              sx={{ mr: 2 }}
            >
              Editar Proveedor
            </Button>
            <Button 
              variant="outlined" 
              color="error"
              onClick={() => setConfirmDelete(true)}
            >
              Eliminar Proveedor
            </Button>
          </Box>
        </Box>

        {/* Diálogo de confirmación de eliminación */}
        <Dialog
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
        >
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Está seguro de que desea eliminar el proveedor "{currentSupplier?.name}"? Esta acción no se puede deshacer y eliminará todos los datos asociados.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDelete(false)} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleDeleteSupplier} color="error" autoFocus>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Alerta de mensajes */}
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

export default SupplierDetailsPage;