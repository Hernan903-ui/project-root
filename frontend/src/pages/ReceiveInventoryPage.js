import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import ReceiveInventory from '../components/suppliers/ReceiveInventory';
import { 
  fetchPurchaseOrderById, 
  receiveInventory, 
  clearCurrentPurchaseOrder 
} from '../features/suppliers/suppliersSlice';
import AlertMessage from '../components/common/AlertMessage';
import { ArrowBack } from '@mui/icons-material';

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

  if (currentPurchaseOrder && (currentPurchaseOrder.status === 'cancelled' || currentPurchaseOrder.status === 'received')) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(`/purchase-orders/${id}`)}
          >
            Volver
          </Button>
        </Box>
        <AlertMessage 
          open={true}
          message={`No se puede recibir mercancía para una orden ${currentPurchaseOrder.status === 'cancelled' ? 'cancelada' : 'completada'}`}
          severity="warning"
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/purchase-orders/${id}`)}
        >
          Volver
        </Button>
      </Box>
      
      <Typography variant="h4" gutterBottom>
        Recibir Mercancía - Orden #{id}
      </Typography>
      
      <ReceiveInventory 
        purchaseOrder={currentPurchaseOrder}
        onReceive={handleReceive}
        onCancel={() => navigate(`/purchase-orders/${id}`)}
        loading={loading}
        error={error}
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

export default ReceiveInventoryPage;