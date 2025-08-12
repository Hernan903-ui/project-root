import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Paper, 
  Breadcrumbs 
} from '@mui/material';
import DashboardLayout from '../components/layout/DashboardLayout';
import ReceiveInventory from '../components/suppliers/ReceiveInventory';
import { 
  fetchPurchaseOrderById, 
  receiveInventory, 
  clearCurrentPurchaseOrder 
} from '../features/suppliers/suppliersSlice';
import AlertMessage from '../components/common/AlertMessage';
import { 
  ArrowBack, 
  Home as HomeIcon, 
  ShoppingCart as ShoppingCartIcon, 
  Inventory as InventoryIcon 
} from '@mui/icons-material';

const ReceiveInventoryPage = () => {
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

  const handleReceive = async (receivedData) => {
    try {
      await dispatch(receiveInventory({ 
        orderId: id, 
        receivedItems: receivedData 
      })).unwrap();
      
      setAlert({
        open: true,
        message: 'Mercancía recibida correctamente',
        severity: 'success'
      });
      
      setTimeout(() => {
        navigate(`/purchase-orders/${id}`);
      }, 1500);
    } catch (err) {
      setAlert({
        open: true,
        message: `Error al procesar recepción: ${err.message}`,
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
            </Breadcrumbs>
          </Paper>
          
          <Paper elevation={1} sx={{ p: 3 }}>
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
          </Paper>
        </Box>
      </DashboardLayout>
    );
  }

  if (currentPurchaseOrder && (currentPurchaseOrder.status === 'cancelled' || currentPurchaseOrder.status === 'received')) {
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
                <ShoppingCartIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                Orden #{id}
              </Link>
              <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                <InventoryIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                Recibir Mercancía
              </Typography>
            </Breadcrumbs>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(`/purchase-orders/${id}`)}
                sx={{ mr: 2 }}
              >
                Volver
              </Button>
              <Typography variant="h4">
                Recibir Mercancía - Orden #{id}
              </Typography>
            </Box>
          </Paper>
          
          <Paper elevation={1} sx={{ p: 3 }}>
            <AlertMessage 
              open={true}
              message={`No se puede recibir mercancía para una orden ${currentPurchaseOrder.status === 'cancelled' ? 'cancelada' : 'completada'}`}
              severity="warning"
            />
          </Paper>
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
              <ShoppingCartIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Orden #{id}
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <InventoryIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Recibir Mercancía
            </Typography>
          </Breadcrumbs>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate(`/purchase-orders/${id}`)}
              sx={{ mr: 2 }}
            >
              Volver
            </Button>
            <Typography variant="h4">
              Recibir Mercancía - Orden #{id}
            </Typography>
          </Box>
        </Paper>
        
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <ReceiveInventory 
            purchaseOrder={currentPurchaseOrder}
            onReceive={handleReceive}
            onCancel={() => navigate(`/purchase-orders/${id}`)}
            loading={loading}
            error={error}
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

export default ReceiveInventoryPage;