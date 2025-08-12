import React, { useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
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
  Chip,
  Paper,
  Breadcrumbs,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  CloudOff as CloudOffIcon,
  Warning as WarningIcon,
  Home as HomeIcon,
  ShoppingCart as ShoppingCartIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Add as AddIcon
} from '@mui/icons-material';
import DashboardLayout from '../components/layout/DashboardLayout';
import PurchaseOrderForm from '../components/suppliers/PurchaseOrderForm';
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
  const [filters] = useState({});
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [loadAttempts, setLoadAttempts] = useState(0);
  
  // Referencias para manejar timeouts y cancelación de solicitudes
  const abortControllerRef = useRef(null);
  const timeoutIdRef = useRef(null);

  // Función para cargar los datos
  const loadData = useCallback(() => {
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
    timeoutIdRef.current = setTimeout(() => {
      if (loading) {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort('Timeout excedido');
          console.warn('La solicitud está tomando demasiado tiempo, cancelando...');
        }
        setAlert({
          open: true,
          message: 'La conexión está tomando demasiado tiempo. Utilizando datos de respaldo.',
          severity: 'warning'
        });
        dispatch(setConnectionStatus(true));
      }
    }, 40000);
  }, [dispatch, filters, loading, page, rowsPerPage]);

  const handleDeleteConfirm = async () => {
    await dispatch(deletePurchaseOrder(orderToDelete)).unwrap();
    setAlert({
      open: true,
      message: `Orden #${orderToDelete} eliminada correctamente`,
      severity: 'success'
    });
    setConfirmDelete(false);
    setOrderToDelete(null);
  };

  const handleRetry = () => {
  // Limpiar errores antes de reintentar
  dispatch(clearErrors());
  // Restablecer contador de intentos
  setLoadAttempts(0);
  // Indicar que estamos intentando restablecer la conexión
  dispatch(setConnectionStatus(false));
  // Cargar los datos nuevamente
  loadData();
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  // Función para renderizar el componente PurchaseOrderList de manera segura
  // Definir funciones faltantes para evitar errores
  const handleDeleteClick = () => {};
  const handleFilter = () => {};
  const renderPurchaseOrderList = () => {
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
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <ShoppingCartIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Órdenes de Compra
            </Typography>
          </Breadcrumbs>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            
            <Box sx={{ display: 'flex', gap: 2 }}>
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
              <Link to="/purchase-orders/create" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                >
                  Nueva Orden
                </Button>
              </Link>
            </Box>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 2, mb: 3 }}></Paper>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <TextField
              placeholder="Buscar órdenes..."
              size="small"
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Filtrar">
                <IconButton>
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Actualizar">
                <IconButton onClick={handleRetry} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
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
        
        <Paper elevation={1} sx={{ mb: 3 }}>
          {/* Indicador de carga para el primer intento */}
          {loading && loadAttempts <= 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}
          
          {/* Lista de órdenes de compra (se muestra incluso con datos de respaldo) */}
          {(!loading || loadAttempts > 1 || usingFallbackData) ? (
            <>
              {renderPurchaseOrderList()}
              {/* Mostrar el formulario directamente si no hay órdenes y no hay filtros activos */}
              {(purchaseOrders?.length === 0 && !loading) && (
                <Box sx={{ p: 3, textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No se encontraron órdenes de compra registradas.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Crea la primera orden de compra para comenzar a gestionar tus adquisiciones.
                  </Typography>
                  {PurchaseOrderForm ? (
                    <PurchaseOrderForm onClose={() => {}} />
                  ) : (
                    <Typography>Formulario de orden no disponible</Typography>
                  )}
                </Box>
              )}
            </>
          ) : null}
        </Paper>

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