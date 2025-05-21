import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  Button,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  CloudOff as CloudOffIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import DashboardLayout from '../components/layout/DashboardLayout';
import PurchaseOrderList from '../components/suppliers/PurchaseOrderList';
import { fetchPurchaseOrders, deletePurchaseOrder, clearErrors, setConnectionStatus } from '../features/suppliers/suppliersSlice';
import AlertMessage from '../components/common/AlertMessage';

const PurchaseOrdersPage = () => {
  const dispatch = useDispatch();
  // Usando un enfoque más defensivo para extraer valores del estado
  const suppliersState = useSelector((state) => state.suppliers || {});
  const { 
    purchaseOrders = [], 
    totalPurchaseOrders = 0, 
    loading = false, 
    error = null, 
    usingFallbackData = false,
    connectionIssue = false
  } = suppliersState;
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [filters, setFilters] = useState({});
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [loadAttempts, setLoadAttempts] = useState(0);
  
  // Referencias para manejar timeouts y cancelación de solicitudes
  const abortControllerRef = useRef(null);
  const timeoutIdRef = useRef(null);

  // Función para cargar los datos
  const loadData = useCallback(() => {
    try {
      // Limpiar cualquier timeout previo
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      
      // Cancelar cualquier solicitud pendiente
      if (abortControllerRef.current) {
        abortControllerRef.current.abort('Nueva solicitud iniciada');
      }
      
      // Crear un nuevo controlador de cancelación
      abortControllerRef.current = new AbortController();
      
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...filters,
        signal: abortControllerRef.current.signal
      };
      
      dispatch(fetchPurchaseOrders(params));
      
      // Incrementar el contador de intentos de carga
      setLoadAttempts(prev => prev + 1);
      
      // Establecer un timeout de seguridad para evitar esperas infinitas
      timeoutIdRef.current = setTimeout(() => {
        if (loading) {
          // Cancelar la solicitud si toma demasiado tiempo
          if (abortControllerRef.current) {
            abortControllerRef.current.abort('Timeout excedido');
            console.warn('La solicitud está tomando demasiado tiempo, cancelando...');
          }
          
          // Mostrar alerta al usuario
          setAlert({
            open: true,
            message: 'La conexión está tomando demasiado tiempo. Utilizando datos de respaldo.',
            severity: 'warning'
          });
          
          // Actualizar el estado de conexión en Redux
          dispatch(setConnectionStatus(true));
        }
      }, 40000); // 40 segundos
    } catch (err) {
      console.error('Error al cargar datos de órdenes de compra:', err);
      setAlert({
        open: true,
        message: `Error al cargar datos: ${err.message || 'Error desconocido'}`,
        severity: 'error'
      });
    }
  }, [dispatch, page, rowsPerPage, filters, loading]);

  // Efecto para cargar los datos cuando cambian los parámetros
  useEffect(() => {
    try {
      loadData();
      
      // Limpiar efectos al desmontar
      return () => {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
        }
        if (abortControllerRef.current) {
          abortControllerRef.current.abort('Componente desmontado');
        }
      };
    } catch (err) {
      console.error('Error en useEffect:', err);
    }
  }, [loadData]);

  // Efecto para mostrar una alerta cuando se estén usando datos de respaldo
  useEffect(() => {
    try {
      if (usingFallbackData && !alert.open) {
        setAlert({
          open: true,
          message: 'Mostrando datos de respaldo debido a problemas de conexión con el servidor.',
          severity: 'warning'
        });
      }
    } catch (err) {
      console.error('Error en useEffect de datos de respaldo:', err);
    }
  }, [usingFallbackData, alert.open]);

  const handleFilter = (newFilters) => {
    try {
      setFilters(newFilters);
      setPage(0);
      // Restablecer contador de intentos
      setLoadAttempts(0);
    } catch (err) {
      console.error('Error al aplicar filtros:', err);
    }
  };

  const handleDeleteClick = (orderId) => {
    try {
      setOrderToDelete(orderId);
      setConfirmDelete(true);
    } catch (err) {
      console.error('Error al preparar eliminación:', err);
    }
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
        message: `Error al eliminar orden: ${err?.message || 'No se pudo completar la operación'}`,
        severity: 'error'
      });
    } finally {
      setConfirmDelete(false);
      setOrderToDelete(null);
    }
  };

  const handleRetry = () => {
    try {
      // Limpiar errores antes de reintentar
      dispatch(clearErrors());
      // Restablecer contador de intentos
      setLoadAttempts(0);
      // Indicar que estamos intentando restablecer la conexión
      dispatch(setConnectionStatus(false));
      // Cargar los datos nuevamente
      loadData();
    } catch (err) {
      console.error('Error al reintentar conexión:', err);
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  // Función para renderizar el componente PurchaseOrderList de manera segura
  const renderPurchaseOrderList = () => {
    try {
      return (
        <PurchaseOrderList 
          purchaseOrders={purchaseOrders || []}
          totalItems={totalPurchaseOrders || 0}
          loading={loading}
          onDelete={handleDeleteClick}
          onFilter={handleFilter}
          page={page}
          setPage={setPage}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          isOfflineData={usingFallbackData}
        />
      );
    } catch (err) {
      console.error('Error al renderizar lista de órdenes:', err);
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          Error al cargar la lista de órdenes. Intente recargar la página.
        </Alert>
      );
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4">
              Órdenes de Compra
            </Typography>
            {/* Chip de estado offline */}
            {connectionIssue && (
              <Chip 
                icon={<CloudOffIcon />} 
                label="Modo offline" 
                color="warning" 
                variant="outlined"
                size="small"
              />
            )}
          </Box>
          
          {/* Botón de reintento visible cuando hay error o datos de respaldo */}
          {(error || usingFallbackData) && (
            <Button 
              startIcon={<RefreshIcon />} 
              variant="outlined" 
              color="primary" 
              onClick={handleRetry}
              disabled={loading}
            >
              Reintentar conexión
            </Button>
          )}
        </Box>
        
        {/* Alerta para datos de respaldo */}
        {usingFallbackData && !error && (
          <Alert 
            severity="info" 
            sx={{ mb: 2 }}
            icon={<CloudOffIcon fontSize="inherit" />}
          >
            Mostrando datos de ejemplo debido a problemas de conexión. 
            Algunas funciones pueden estar limitadas.
          </Alert>
        )}
        
        {/* Alerta para errores */}
        {error && (
          <Alert 
            severity="warning" 
            sx={{ mb: 2 }}
            icon={<WarningIcon fontSize="inherit" />}
            action={
              <Button color="inherit" size="small" onClick={handleRetry} disabled={loading}>
                Reintentar
              </Button>
            }
          >
            {error}
          </Alert>
        )}
        
        {/* Indicador de carga para el primer intento */}
        {loading && loadAttempts <= 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {/* Lista de órdenes de compra (se muestra incluso con datos de respaldo) */}
        {(!loading || loadAttempts > 1 || usingFallbackData) && renderPurchaseOrderList()}

        {/* Diálogo de confirmación de eliminación */}
        <Dialog
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
        >
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Está seguro de que desea eliminar la orden de compra #{orderToDelete}? 
              Esta acción no se puede deshacer.
            </DialogContentText>
            {usingFallbackData && (
              <Alert severity="warning" sx={{ mt: 2 }} icon={<CloudOffIcon />}>
                Actualmente está trabajando con datos de respaldo. 
                Esta operación puede fallar cuando se restablezca la conexión.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDelete(false)} color="primary">
              Cancelar
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              color="error" 
              autoFocus
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Eliminar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Alerta de mensajes */}
        <AlertMessage
          open={alert.open}
          message={alert.message || ''}
          severity={alert.severity || 'info'}
          onClose={handleCloseAlert}
        />
      </Box>
    </DashboardLayout>
  );
};

export default PurchaseOrdersPage;