// pages/SuppliersPage.js
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Paper, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  Button,
  Fade
} from '@mui/material';
import DashboardLayout from '../components/layout/DashboardLayout';
import SupplierList from '../components/suppliers/SupplierList';
import { fetchSuppliers, deleteSupplier } from '../features/suppliers/suppliersSlice';
import AlertMessage from '../components/common/AlertMessage';


const SuppliersPage = () => {
  const dispatch = useDispatch();
  const { suppliers, totalSuppliers, loading, error } = useSelector((state) => state.suppliers);
  
  // Estados locales
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [filters, setFilters] = useState({});
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch de proveedores con useEffect optimizado
  useEffect(() => {
    const fetchData = async () => {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...filters
      };
      
      try {
        await dispatch(fetchSuppliers(params)).unwrap();
        if (error) {
          setAlert({
            open: true,
            message: `Error al cargar proveedores: ${error}`,
            severity: 'error'
          });
        }
      } catch (err) {
        setAlert({
          open: true,
          message: `Error al cargar proveedores: ${err.message || 'Error desconocido'}`,
          severity: 'error'
        });
      }
    };

    fetchData();
  }, [dispatch, page, rowsPerPage, filters, error]);

  // Callbacks memoizados para evitar re-renderizaciones innecesarias
  const handleFilter = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(0);
  }, []);

  const handleDeleteClick = useCallback((supplier) => {
    setSupplierToDelete(supplier);
    setConfirmDelete(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!supplierToDelete) return;
    
    setIsDeleting(true);
    try {
      await dispatch(deleteSupplier(supplierToDelete.id)).unwrap();
      setAlert({
        open: true,
        message: `Proveedor ${supplierToDelete.name} eliminado correctamente`,
        severity: 'success'
      });
      
      // Actualizar la lista después de eliminar
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...filters
      };
      await dispatch(fetchSuppliers(params)).unwrap();
    } catch (err) {
      setAlert({
        open: true,
        message: `Error al eliminar proveedor: ${err.message || 'Error desconocido'}`,
        severity: 'error'
      });
    } finally {
      setConfirmDelete(false);
      setSupplierToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleCloseAlert = useCallback(() => {
    setAlert((prevAlert) => ({ ...prevAlert, open: false }));
  }, []);

  const handleCloseConfirmDialog = useCallback(() => {
    if (!isDeleting) {
      setConfirmDelete(false);
      setSupplierToDelete(null);
    }
  }, [isDeleting]);

  return (
    <DashboardLayout>
      <Fade in={true} timeout={300}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Gestión de Proveedores
          </Typography>
          
          {error && !loading ? (
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
              <Typography variant="body1">
                Error al cargar los datos: {error}
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ mt: 2 }}
                onClick={() => dispatch(fetchSuppliers({ page: page + 1, limit: rowsPerPage, ...filters }))}
              >
                Reintentar
              </Button>
            </Paper>
          ) : null}
          
          <SupplierList 
            suppliers={suppliers || []}
            totalItems={totalSuppliers || 0}
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
            onClose={handleCloseConfirmDialog}
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
          >
            <DialogTitle id="delete-dialog-title">
              Confirmar eliminación
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="delete-dialog-description">
                ¿Está seguro de que desea eliminar el proveedor "{supplierToDelete?.name}"? 
                Esta acción no se puede deshacer.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={handleCloseConfirmDialog} 
                color="primary"
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleDeleteConfirm} 
                color="error" 
                autoFocus
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Alerta de mensajes */}
          <AlertMessage
            open={alert.open}
            message={alert.message}
            severity={alert.severity}
            onClose={handleCloseAlert}
            autoHideDuration={6000}
          />
        </Box>
      </Fade>
    </DashboardLayout>
  );
};

export default SuppliersPage;