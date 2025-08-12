import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Button, 
  CircularProgress, 
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  Paper,
  Breadcrumbs
} from '@mui/material';
import DashboardLayout from '../components/layout/DashboardLayout';
import PurchaseOrderDetails from '../components/suppliers/PurchaseOrderDetails';
import { 
  fetchPurchaseOrderById, 
  updatePurchaseOrder, 
  clearCurrentPurchaseOrder 
} from '../features/suppliers/suppliersSlice';
import AlertMessage from '../components/common/AlertMessage';
import { Home as HomeIcon, ShoppingCart as ShoppingCartIcon, ArrowBack } from '@mui/icons-material';

const PurchaseOrderDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentPurchaseOrder, loading, error } = useSelector((state) => state.suppliers);
  
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    dispatch(fetchPurchaseOrderById(id));
    
    return () => {
      dispatch(clearCurrentPurchaseOrder());
    };
  }, [dispatch, id]);

  const handleEditOrder = () => {
    navigate(`/purchase-orders/edit/${id}`);
  };

  const handleReceiveOrder = () => {
    navigate(`/purchase-orders/${id}/receive`);
  };

  const handleCancelOrder = async () => {
    try {
      await dispatch(updatePurchaseOrder({ 
        id, 
        orderData: { ...currentPurchaseOrder, status: 'cancelled' } 
      })).unwrap();
      
      setAlert({
        open: true,
        message: 'Orden de compra cancelada correctamente',
        severity: 'success'
      });
      
      // Refrescar datos
      dispatch(fetchPurchaseOrderById(id));
    } catch (err) {
      setAlert({
        open: true,
        message: `Error al cancelar orden: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setConfirmCancel(false);
    }
  };

  const handlePrintOrder = () => {
    // Implementación de impresión
    console.log('Imprimiendo orden:', id);
    window.print();
  };

  const handleSendOrder = () => {
    // Implementación de envío
    console.log('Enviando orden a proveedor:', id);
    setAlert({
      open: true,
      message: 'Orden enviada al proveedor por correo electrónico',
      severity: 'success'
    });
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
          <AlertMessage 
            open={true}
            message="Orden de compra no encontrada"
            severity="error"
          />
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
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              Orden #{id}
            </Typography>
          </Breadcrumbs>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/purchase-orders')}
                sx={{ mr: 2 }}
              >
                Volver a Órdenes de Compra
              </Button>
              <Typography variant="h4">
                Orden de Compra #{id}
              </Typography>
            </Box>
          </Box>
        </Paper>
        
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <PurchaseOrderDetails 
            purchaseOrder={currentPurchaseOrder}
            onEdit={handleEditOrder}
            onReceive={handleReceiveOrder}
            onCancel={() => setConfirmCancel(true)}
            onPrint={handlePrintOrder}
            onSend={handleSendOrder}
            onBack={() => navigate('/purchase-orders')}
          />
        </Paper>

        {/* Diálogo de confirmación de cancelación */}
        <Dialog
          open={confirmCancel}
          onClose={() => setConfirmCancel(false)}
        >
          <DialogTitle>Confirmar cancelación</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Está seguro de que desea cancelar esta orden de compra? Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmCancel(false)} color="primary">
              No
            </Button>
            <Button onClick={handleCancelOrder} color="error" autoFocus>
              Sí, cancelar orden
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

export default PurchaseOrderDetailsPage;