import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import DashboardLayout from '../components/layout/DashboardLayout';
import PurchaseOrderList from '../components/suppliers/PurchaseOrderList';
import { fetchPurchaseOrders, deletePurchaseOrder } from '../features/suppliers/suppliersSlice';
import AlertMessage from '../components/common/AlertMessage';

const PurchaseOrdersPage = () => {
  const dispatch = useDispatch();
  const { purchaseOrders, totalPurchaseOrders, loading, error } = useSelector((state) => state.suppliers);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [filters, setFilters] = useState({});
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const params = {
      page: page + 1,
      limit: rowsPerPage,
      ...filters
    };
    dispatch(fetchPurchaseOrders(params));
  }, [dispatch, page, rowsPerPage, filters]);

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    setPage(0);
  };

  const handleDeleteClick = (orderId) => {
    setOrderToDelete(orderId);
    setConfirmDelete(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deletePurchaseOrder(orderToDelete)).unwrap();
      setAlert({
        open: true,
        message: `Orden #${orderToDelete} eliminada correctamente`,
        severity: 'success'
      });
    } catch (err) {
      setAlert({
        open: true,
        message: `Error al eliminar orden: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setConfirmDelete(false);
      setOrderToDelete(null);
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Órdenes de Compra
        </Typography>
        
        <PurchaseOrderList 
          purchaseOrders={purchaseOrders}
          totalItems={totalPurchaseOrders}
          loading={loading}
          onDelete={handleDeleteClick}
          onFilter={handleFilter}
          page={page}
          setPage={setPage}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
        />

        {/* Diálogo de confirmación de eliminación */}
        <Dialog
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
        >
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Está seguro de que desea eliminar la orden de compra #{orderToDelete}? Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDelete(false)} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" autoFocus>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Alerta de mensajes */}
        <AlertMessage
          open={alert.open}
          message={alert.message}
          severity={alert.severity}
          onClose={handleCloseAlert}
        />
      </Box>
    </DashboardLayout>
  );
};

export default PurchaseOrdersPage;