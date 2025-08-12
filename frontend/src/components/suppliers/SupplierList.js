// components/suppliers/SupplierList.js
import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Skeleton,
  Grid,
  Typography,
  Alert,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Warning as WarningIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { isInOfflineMode } from '../../api/axios';

// Constantes

// Componente para mostrar los skeletons durante la carga
const TableRowSkeleton = memo(() => (
  <TableRow>
    <TableCell><Skeleton animation="wave" /></TableCell>
    <TableCell><Skeleton animation="wave" /></TableCell>
    <TableCell><Skeleton animation="wave" /></TableCell>
    <TableCell><Skeleton animation="wave" /></TableCell>
    <TableCell><Skeleton animation="wave" width={70} /></TableCell>
    <TableCell align="right">
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Skeleton animation="wave" width={72} height={32} />
      </Box>
    </TableCell>
  </TableRow>
));

// Componente para mostrar el estado del proveedor
const SupplierStatusChip = memo(({ status }) => {
  let label = "Desconocido";
  let color = "default";
  
  switch (status) {
    case "active":
      label = "Activo";
      color = "success";
      break;
    case "inactive":
      label = "Inactivo";
      color = "default";
      break;
    case "suspended":
      label = "Suspendido";
      color = "error";
      break;
    case "pending":
      label = "Pendiente";
      color = "warning";
      break;
    default:
      break;
  }
  
  return (
    <Chip 
      label={label}
      color={color}
      size="small"
      sx={{ minWidth: '80px' }}
    />
  );
});

// Componente para avatar del proveedor con manejo seguro de fallos
const SupplierAvatar = memo(({ name, imageUrl }) => {
  // Si no hay nombre, usamos un signo de interrogación
  const initial = name && typeof name === 'string' ? name.charAt(0).toUpperCase() : '?';
  
  // No usamos la propiedad src para evitar errores 404
  return (
    <Avatar sx={{ bgcolor: !imageUrl ? 'primary.main' : undefined }}>
      {!imageUrl && initial}
    </Avatar>
  );
});

// Componente de depuración con visibilidad condicional
const DebugPanel = memo(({ data, title = "Debug Info" }) => {
  const [expanded, setExpanded] = useState(false);

  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <Paper 
      sx={{ 
        p: 1, 
        bgcolor: '#f0f7ff', 
        color: '#0a326e', 
        fontSize: '0.75rem',
        borderBottom: '1px dashed #ccc',
        cursor: 'pointer',
        '&:hover': { bgcolor: '#e0efff' }
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
        {title} {expanded ? '(Clic para ocultar)' : '(Clic para mostrar)'}
      </Typography>
      {expanded && (
        <pre style={{ margin: 0, overflowX: 'auto' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </Paper>
  );
});

/**
 * Componente para mostrar la lista de proveedores
 * Con manejo mejorado de eventos y renderizado condicional
 */
const SupplierList = ({
  suppliers = [],
  totalItems = 0,
  loading = false,
  onDelete,
  onFilter,
  onRefresh,  // Nuevo prop para manejar refresco
  page = 0,
  setPage,
  rowsPerPage = 10,
  setRowsPerPage,
  error: externalError = null,
  refreshing = false
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [localError, setLocalError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const searchTimeoutRef = useRef(null);
  
  // Combinar errores externos e internos
  const error = externalError || localError;
  
  // Verificación de conexión
  const isOffline = isInOfflineMode();
  
  // Logging de depuración (sólo una vez al montar y cuando cambian dependencias clave)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('SupplierList - Props recibidas:', { 
        suppliersType: typeof suppliers,
        isArray: Array.isArray(suppliers),
        suppliersLength: Array.isArray(suppliers) ? suppliers.length : 'N/A',
        totalItems, 
        loading, 
        page, 
        rowsPerPage,
        isOffline
      });
    }
  }, [suppliers, totalItems, loading, page, rowsPerPage, isOffline]);
  
  // Limpiar recursos cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, []);

  // Handlers seguros utilizando useCallback para prevenir rerenders
  const handleChangePage = useCallback((event, newPage) => {
    try {
      // No pasamos el evento completo, solo el valor necesario
      if (setPage && typeof setPage === 'function') {
        setPage(newPage);
      }
    } catch (err) {
      console.error('Error al cambiar de página:', err);
      setLocalError('Error al cambiar de página. Por favor, intente de nuevo.');
    }
  }, [setPage]);

  const handleChangeRowsPerPage = useCallback((event) => {
    try {
      // Validar el evento y extraer solo el valor necesario
      if (!event || !event.target) return;
      
      const value = event.target.value;
      const newRowsPerPage = parseInt(value, 10);
      
      if (setRowsPerPage && typeof setRowsPerPage === 'function') {
        setRowsPerPage(newRowsPerPage);
      }
      
      if (setPage && typeof setPage === 'function') {
        setPage(0);
      }
    } catch (err) {
      console.error('Error al cambiar filas por página:', err);
      setLocalError('Error al cambiar filas por página. Por favor, intente de nuevo.');
    }
  }, [setPage, setRowsPerPage]);

  // Implementar debounce para la búsqueda con manejo seguro
  const handleSearch = useCallback((e) => {
    try {
      // Validar el evento y extraer solo el valor necesario
      if (!e || !e.target) return;
      
      const value = e.target.value;
      setSearchTerm(value);
      
      // Limpiar el timeout anterior
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Configurar un nuevo timeout para debounce
      searchTimeoutRef.current = setTimeout(() => {
        if (onFilter && typeof onFilter === 'function') {
          onFilter({ name: value });
        }
      }, 500);
    } catch (err) {
      console.error('Error en la búsqueda:', err);
      setLocalError('Error al realizar la búsqueda. Por favor, intente de nuevo.');
    }
  }, [onFilter]);

  // Limpiar búsqueda
  const handleClearSearch = useCallback(() => {
    try {
      setSearchTerm('');
      if (onFilter && typeof onFilter === 'function') {
        onFilter({ name: '' });
      }
    } catch (err) {
      console.error('Error al limpiar búsqueda:', err);
      setLocalError('Error al limpiar la búsqueda. Por favor, intente de nuevo.');
    }
  }, [onFilter]);

  // Manejo de refresco
  const handleRefresh = useCallback(() => {
    try {
      if (onRefresh && typeof onRefresh === 'function') {
        onRefresh();
      }
    } catch (err) {
      console.error('Error al refrescar datos:', err);
      setLocalError('Error al actualizar los datos. Por favor, intente de nuevo.');
    }
  }, [onRefresh]);

  // Navegación con manejo de errores
  const handleAddSupplier = useCallback(() => {
    try {
      navigate('/suppliers/new');
    } catch (err) {
      console.error('Error al navegar a nuevo proveedor:', err);
      setLocalError('Error al navegar. Por favor, intente de nuevo.');
    }
  }, [navigate]);

  const handleEditSupplier = useCallback((id) => {
    try {
      if (!id) {
        console.warn('ID de proveedor no válido:', id);
        return;
      }
      navigate(`/suppliers/edit/${id}`);
    } catch (err) {
      console.error(`Error al navegar a editar proveedor ${id}:`, err);
      setLocalError('Error al navegar. Por favor, intente de nuevo.');
    }
  }, [navigate]);

  const handleViewSupplier = useCallback((id) => {
    try {
      if (!id) {
        console.warn('ID de proveedor no válido:', id);
        return;
      }
      navigate(`/suppliers/${id}`);
    } catch (err) {
      console.error(`Error al navegar a ver proveedor ${id}:`, err);
      setLocalError('Error al navegar. Por favor, intente de nuevo.');
    }
  }, [navigate]);

  // Abrir diálogo de confirmación para eliminar
  const handleOpenDeleteDialog = useCallback((supplier) => {
    try {
      if (!supplier || !supplier.id) {
        console.warn('Proveedor no válido para eliminar:', supplier);
        return;
      }
      
      setSupplierToDelete(supplier);
      setDeleteDialogOpen(true);
    } catch (err) {
      console.error(`Error al preparar eliminación:`, err);
      setLocalError('Error al preparar eliminación. Por favor, intente de nuevo.');
    }
  }, []);

  // Confirmar eliminación
  const handleConfirmDelete = useCallback(async () => {
    if (!supplierToDelete || !supplierToDelete.id) {
      setDeleteDialogOpen(false);
      return;
    }
    
    try {
      setIsDeleting(true);
      
      if (onDelete && typeof onDelete === 'function') {
        await onDelete(supplierToDelete);
      }
      
      // Cerrar diálogo después de la eliminación
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
    } catch (err) {
      console.error(`Error al eliminar proveedor:`, err);
      setLocalError(`Error al eliminar proveedor: ${err.message || 'Error desconocido'}`);
    } finally {
      setIsDeleting(false);
    }
  }, [onDelete, supplierToDelete]);

  // Cancelar eliminación
  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setSupplierToDelete(null);
  }, []);

  // Limpiar error local
  const handleClearError = useCallback(() => {
    setLocalError(null);
  }, []);

  // Verificación segura de suppliers
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];
  const hasSuppliers = safeSuppliers.length > 0;

  // Renderizado de filas de tabla con manejo de casos especiales
  const renderTableRows = () => {
    // Mostrar skeletons durante carga inicial
    if (loading && !hasSuppliers) {
      return Array(rowsPerPage).fill(0).map((_, index) => (
        <TableRowSkeleton key={`skeleton-${index}`} />
      ));
    }
    
    // Mensaje cuando no hay proveedores
    if (!hasSuppliers) {
      return (
        <TableRow>
          <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {searchTerm ? 
                  `No se encontraron proveedores que coincidan con "${searchTerm}"` : 
                  'No se encontraron proveedores'}
              </Typography>
              
              {searchTerm && (
                <Button 
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearSearch}
                  size="small"
                  sx={{ mb: 2 }}
                >
                  Limpiar búsqueda
                </Button>
              )}
              
              <Button 
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddSupplier}
                color="primary"
              >
                Crear nuevo proveedor
              </Button>
            </Box>
          </TableCell>
        </TableRow>
      );
    }
    
    // Renderizar filas normales
    return safeSuppliers.map((supplier, index) => {
      // Validar que supplier es un objeto válido
      if (!supplier || typeof supplier !== 'object') {
        console.warn('Proveedor no válido en posición', index, ':', supplier);
        return null;
      }
      
      // Usar un identificador único o fallback a índice
      const key = supplier.id || `supplier-${index}`;
      
      return (
        <TableRow 
          hover 
          key={key}
          onClick={() => handleViewSupplier(supplier.id)}
          sx={{ cursor: 'pointer' }}
        >
          <TableCell>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SupplierAvatar name={supplier.name} />
              <Typography sx={{ ml: 2 }}>{supplier.name || 'Sin nombre'}</Typography>
            </Box>
          </TableCell>
          <TableCell>{supplier.contact_person || '-'}</TableCell>
          <TableCell>{supplier.email || '-'}</TableCell>
          <TableCell>{supplier.phone || '-'}</TableCell>
          <TableCell>
            <SupplierStatusChip status={supplier.status} />
          </TableCell>
          <TableCell align="right" onClick={(e) => e.stopPropagation()}>
            <Tooltip title="Ver detalles">
              <IconButton 
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewSupplier(supplier.id);
                }} 
                size="small" 
                color="info"
                disabled={!supplier.id}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar">
              <IconButton 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditSupplier(supplier.id);
                }} 
                size="small" 
                color="primary"
                disabled={!supplier.id}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton 
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDeleteDialog(supplier);
                }} 
                color="error" 
                size="small"
                disabled={!supplier.id}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </TableCell>
        </TableRow>
      );
    }).filter(Boolean); // Filtrar elementos nulos
  };

  // Desactivar controles durante operaciones
  const isProcessing = loading || refreshing || isDeleting;

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', mt: 2, position: 'relative' }}>
      {/* Indicador de carga */}
      {refreshing && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            zIndex: 10, 
            backgroundColor: 'rgba(255, 255, 255, 0.7)', 
            display: 'flex',
            justifyContent: 'center',
            p: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2">Actualizando...</Typography>
          </Box>
        </Box>
      )}
      
      {/* Mensaje de error */}
      {error && (
        <Alert 
          severity="error" 
          onClose={handleClearError}
          sx={{ mb: 2 }}
          variant="filled"
          action={
            <Button color="inherit" size="small" onClick={handleClearError}>
              Cerrar
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
            {/* Mensaje de modo offline */}
      {isOffline && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
          variant="outlined"
          icon={<WarningIcon />}
        >
          <Typography variant="body2">
            <strong>Modo sin conexión.</strong> Estás viendo datos almacenados localmente.
            {onRefresh && (
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleRefresh} 
                sx={{ ml: 1 }}
                disabled={refreshing}
              >
                Reintentar conexión
              </Button>
            )}
          </Typography>
        </Alert>
      )}
      
      {/* Información de depuración en desarrollo */}
      <DebugPanel 
        title="Estado del componente SupplierList"
        data={{
          suppliers: `${typeof suppliers} ${Array.isArray(suppliers) ? `(array[${suppliers.length}])` : ''}`,
          loading: loading ? 'true' : 'false',
          refreshing: refreshing ? 'true' : 'false',
          isOffline: isOffline ? 'true' : 'false',
          totalItems: totalItems || 0,
          page,
          rowsPerPage,
          searchTerm
        }} 
      />
      
      {/* Barra de búsqueda y botón de nuevo proveedor */}
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar proveedores por nombre..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm ? (
                  <InputAdornment position="end">
                    <IconButton 
                      size="small" 
                      onClick={handleClearSearch}
                      edge="end"
                      aria-label="clear search"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }}
              variant="outlined"
              size="small"
              disabled={isProcessing}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            {onRefresh && (
              <Button
                variant="outlined"
                startIcon={refreshing ? <CircularProgress size={16} /> : <FilterIcon />}
                onClick={handleRefresh}
                disabled={isProcessing}
                sx={{ mr: 1 }}
              >
                {refreshing ? 'Actualizando...' : 'Actualizar'}
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddSupplier}
              disabled={isProcessing}
            >
              Nuevo Proveedor
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Tabla de proveedores */}
      <TableContainer sx={{ maxHeight: 440, position: 'relative' }}>
        <Table stickyHeader aria-label="tabla de proveedores" size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {renderTableRows()}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Paginación */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalItems || 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
        disabled={isProcessing}
      />
      
      {/* Diálogo de confirmación para eliminación */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            ¿Está seguro de que desea eliminar al proveedor <strong>{supplierToDelete?.name || ''}</strong>?
            Esta acción no se puede deshacer y podría afectar a órdenes de compra existentes.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default React.memo(SupplierList);