import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import DashboardLayout from '../components/layout/DashboardLayout';
import SupplierList from '../components/suppliers/SupplierList';
import { fetchSuppliers, deleteSupplier } from '../features/suppliers/suppliersSlice';
import AlertMessage from '../components/common/AlertMessage';

const SuppliersPage = () => {
  const dispatch = useDispatch();
  const { suppliers, totalSuppliers, loading, error } = useSelector((state) => state.suppliers);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [filters, setFilters] = useState({});
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const params = {
      page: page + 1,
      limit: rowsPerPage,
      ...filters
    };
    dispatch(fetchSuppliers(params));
  }, [dispatch, page, rowsPerPage, filters]);

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    setPage(0);
  };

  const handleDeleteClick = (supplier) => {
    setSupplierToDelete(supplier);
    setConfirmDelete(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteSupplier(supplierToDelete.id)).unwrap();
      setAlert({
        open: true,
        message: `Proveedor ${supplierToDelete.name} eliminado correctamente`,
        severity: 'success'
      });
    } catch (err) {
      setAlert({
        open: true,
        message: `Error al eliminar proveedor: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setConfirmDelete(false);
      setSupplierToDelete(null);
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestión de Proveedores
        </Typography>
        
        <SupplierList 
          suppliers={suppliers}
          totalItems={totalSuppliers}
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
              ¿Está seguro de que desea eliminar el proveedor "{supplierToDelete?.name}"? Esta acción no se puede deshacer.
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

export default SuppliersPage;