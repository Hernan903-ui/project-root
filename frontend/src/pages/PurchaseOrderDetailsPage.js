import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Button, 
  CircularProgress, 
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import PurchaseOrderDetails from '../components/suppliers/PurchaseOrderDetails';
import { 
  fetchPurchaseOrderById, 
  updatePurchaseOrder, 
  clearCurrentPurchaseOrder 
} from '../features/suppliers/suppliersSlice';
import AlertMessage from '../components/common/AlertMessage';

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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!loading && !currentPurchaseOrder && !error) {
    return (
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
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <PurchaseOrderDetails 
        purchaseOrder={currentPurchaseOrder}
        onEdit={handleEditOrder}
        onReceive={handleReceiveOrder}
        onCancel={() => setConfirmCancel(true)}
        onPrint={handlePrintOrder}
        onSend={handleSendOrder}
        onBack={() => navigate('/purchase-orders')}
      />

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
  );
};

export default PurchaseOrderDetailsPage;