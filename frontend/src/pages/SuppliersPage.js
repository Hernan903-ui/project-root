// src/pages/SuppliersPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
  Alert,
  useMediaQuery,
  useTheme,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import GridItem from '../components/common/GridItem';
import {
  Add as AddIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import {
  fetchSuppliers,
  deleteSupplier,
  clearErrors,
  selectAllSuppliers,
  selectTotalSuppliers,
  selectSuppliersLoading,
  selectSuppliersError,
  selectConnectionStatus
} from '../features/suppliers/suppliersSlice';
import DashboardLayout from '../components/layout/DashboardLayout';
import { generatePDF } from '../utils/reportGenerator';

// Intentar importar componentes opcionales
let SupplierForm, SupplierDetails, SupplierFilters, SupplierCard;

// Importar dinámicamente si el componente existe
try {
  SupplierForm = require('../components/suppliers/SupplierForm').default;
} catch (e) {
  console.warn('SupplierForm component not found');
}

try {
  SupplierDetails = require('../components/suppliers/SupplierDetails').default;
} catch (e) {
  console.warn('SupplierDetails component not found');
}

try {
  SupplierFilters = require('../components/suppliers/SupplierFilters').default;
} catch (e) {
  console.warn('SupplierFilters component not found');
}

try {
  SupplierCard = require('../components/suppliers/SupplierCard').default;
} catch (e) {
  console.warn('SupplierCard component not found');
}

// Componente para mostrar proveedores como tarjetas si no existe el componente
const SupplierCardPlaceholder = ({ supplier, onClick }) => (
  <Paper 
    elevation={2}
    sx={{ 
      p: 2, 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      cursor: 'pointer',
      transition: 'all 0.3s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4
      }
    }}
    onClick={() => onClick(supplier)}
  >
    <Typography variant="h6" noWrap>{supplier.name}</Typography>
    <Typography variant="body2" color="text.secondary" gutterBottom>
      {supplier.contact_person || 'Sin contacto'}
    </Typography>
    <Divider sx={{ my: 1 }} />
    <Box sx={{ mt: 'auto' }}>
      <Typography variant="body2" noWrap>
        {supplier.email || 'Sin email'}
      </Typography>
      <Typography variant="body2" noWrap>
        {supplier.phone || 'Sin teléfono'}
      </Typography>
      <Chip 
        label={supplier.status === 'active' ? 'Activo' : 'Inactivo'} 
        size="small"
        color={supplier.status === 'active' ? 'success' : 'default'} 
        sx={{ mt: 1 }}
      />
    </Box>
  </Paper>
);

// Si no existe el componente SupplierCard, usamos el placeholder
if (!SupplierCard) {
  SupplierCard = SupplierCardPlaceholder;
}

const SuppliersPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

  // Obtener estado desde Redux
  const suppliers = useSelector(selectAllSuppliers);
  const totalSuppliers = useSelector(selectTotalSuppliers);
  const loading = useSelector(selectSuppliersLoading);
  const error = useSelector(selectSuppliersError);
  const connectionIssue = useSelector(selectConnectionStatus);

  const [viewMode, setViewMode] = useState(isMobile ? 'list' : 'grid');
  const [openAddForm, setOpenAddForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    city: '',
    country: ''
  });

  // Filtrar proveedores según los filtros aplicados
  const filteredSuppliers = Array.isArray(suppliers) ? suppliers.filter(supplier => {
    if (!supplier) return false;
    
    const searchTerms = filters.search.toLowerCase();
    const matchesSearch = !searchTerms ||
      supplier.name?.toLowerCase().includes(searchTerms) ||
      supplier.email?.toLowerCase().includes(searchTerms) ||
      supplier.phone?.toLowerCase().includes(searchTerms) ||
      supplier.contact_person?.toLowerCase().includes(searchTerms);

    const matchesStatus = !filters.status || supplier.status === filters.status;
    const matchesCity = !filters.city ||
      (supplier.city && supplier.city.toLowerCase().includes(filters.city.toLowerCase()));
    const matchesCountry = !filters.country ||
      (supplier.country && supplier.country.toLowerCase().includes(filters.country.toLowerCase()));

    return matchesSearch && matchesStatus && matchesCity && matchesCountry;
  }) : [];

  // Columnas para la vista de tabla
  const columns = [
    {
      field: 'name',
      headerName: 'Nombre',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'contact_person',
      headerName: 'Contacto',
      width: 150,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'phone',
      headerName: 'Teléfono',
      width: 150,
    },
    {
      field: 'city',
      headerName: 'Ciudad',
      width: 150,
      hide: isMediumScreen,
    },
    {
      field: 'country',
      headerName: 'País',
      width: 150,
      hide: isMediumScreen,
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 120,
      valueFormatter: (params) => 
        params.value === 'active' ? 'Activo' : 
        params.value === 'inactive' ? 'Inactivo' : 
        params.value || 'Desconocido'
    }
  ];

  useEffect(() => {
    // Cargar proveedores
    dispatch(fetchSuppliers());
    
    // Limpieza al desmontar
    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch]);

  useEffect(() => {
    // Actualizar viewMode cuando cambie el tamaño de pantalla
    if (isMobile && viewMode === 'grid') {
      setViewMode('list');
    }
  }, [isMobile, viewMode]);

  const handleOpenAddForm = useCallback(() => {
    setSelectedSupplier(null);
    setOpenAddForm(true);
  }, []);

  const handleCloseAddForm = useCallback(() => {
    setOpenAddForm(false);
    dispatch(fetchSuppliers());
  }, [dispatch]);

  const handleViewSupplier = useCallback((supplier) => {
    setSelectedSupplier(supplier);
    setOpenDetails(true);
  }, []);

  const handleEditSupplier = useCallback((supplier) => {
    setSelectedSupplier(supplier);
    setOpenDetails(false);
    setOpenAddForm(true);
  }, []);

  const handleDeleteDialogOpen = useCallback((supplier) => {
    setSelectedSupplier(supplier);
    setOpenDeleteConfirm(true);
    setOpenDetails(false);
  }, []);

  const handleDeleteSupplier = useCallback(() => {
    if (selectedSupplier) {
      dispatch(deleteSupplier(selectedSupplier.id))
        .then(() => {
          setOpenDeleteConfirm(false);
          dispatch(fetchSuppliers());
        });
    }
  }, [dispatch, selectedSupplier]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  }, []);

  const handleGenerateReport = useCallback(() => {
    generatePDF('Reporte de Proveedores', filteredSuppliers, [
      { header: 'Nombre', field: 'name' },
      { header: 'Contacto', field: 'contact_person' },
      { header: 'Email', field: 'email' },
      { header: 'Teléfono', field: 'phone' },
      { header: 'Ciudad', field: 'city' },
      { header: 'País', field: 'country' },
      { header: 'Estado', field: 'status', formatter: (value) => value === 'active' ? 'Activo' : 'Inactivo' }
    ]);
  }, [filteredSuppliers]);

  const handleViewModeChange = useCallback((event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  }, []);

  // Implementación provisional de SupplierFilters si no existe
  const SimpleSupplierFilters = ({ onFilterChange }) => (
    <Box sx={{ mb: 2 }}>
      <TextField
        label="Buscar"
        variant="outlined"
        size="small"
        fullWidth
        value={filters.search}
        onChange={(e) => onFilterChange({ search: e.target.value })}
        sx={{ mb: 1 }}
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <FormControl size="small" fullWidth>
          <InputLabel>Estado</InputLabel>
          <Select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            label="Estado"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="active">Activo</MenuItem>
            <MenuItem value="inactive">Inactivo</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Ciudad"
          variant="outlined"
          size="small"
          fullWidth
          value={filters.city}
          onChange={(e) => onFilterChange({ city: e.target.value })}
        />
        <TextField
          label="País"
          variant="outlined"
          size="small"
          fullWidth
          value={filters.country}
          onChange={(e) => onFilterChange({ country: e.target.value })}
        />
      </Box>
    </Box>
  );

  return (
    <DashboardLayout>
      <Box sx={{ width: '100%', p: { xs: 2, sm: 3 } }}>
        <Typography variant="h4" gutterBottom>
          Gestión de Proveedores
        </Typography>

        {connectionIssue && (
          <Alert 
            severity="warning" 
            sx={{ mb: 2 }}
          >
            Hay problemas de conexión con el servidor. Los datos pueden no estar actualizados.
          </Alert>
        )}

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            onClose={() => dispatch(clearErrors())}
          >
            {typeof error === 'object' ? error.message : error}
          </Alert>
        )}

        <Paper 
          elevation={2}
          sx={{ 
            p: { xs: 1.5, sm: 2 }, 
            mb: 3, 
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'stretch', sm: 'center' }, 
            gap: 2,
            mb: 3 
          }}>
            <Typography variant="h6">
              Proveedores ({filteredSuppliers.length})
            </Typography>

            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1,
              width: { xs: '100%', sm: 'auto' }
            }}>
              {!isMobile && (
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={handleViewModeChange}
                  aria-label="modo de visualización"
                  size="small"
                >
                  <ToggleButton value="list" aria-label="vista de lista">
                    <ViewListIcon />
                    <Typography sx={{ ml: 1, display: { xs: 'none', md: 'block' } }}>
                      Lista
                    </Typography>
                  </ToggleButton>
                  <ToggleButton value="grid" aria-label="vista de tarjetas">
                    <ViewModuleIcon />
                    <Typography sx={{ ml: 1, display: { xs: 'none', md: 'block' } }}>
                      Tarjetas
                    </Typography>
                  </ToggleButton>
                </ToggleButtonGroup>
              )}

              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                onClick={handleGenerateReport}
                disabled={filteredSuppliers.length === 0}
                sx={{ 
                  display: { xs: 'none', sm: 'flex' },
                  minHeight: '36.5px'
                }}
              >
                Exportar
              </Button>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                color="primary"
                onClick={handleOpenAddForm}
                fullWidth={isMobile}
                sx={{ minHeight: '36.5px' }}
              >
                Nuevo Proveedor
              </Button>
            </Box>
          </Box>

          {/* Usar el componente de filtros si existe, o el provisional si no */}
          {SupplierFilters ? (
            <SupplierFilters onFilterChange={handleFilterChange} />
          ) : (
            <SimpleSupplierFilters onFilterChange={handleFilterChange} />
          )}

          {loading && filteredSuppliers.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : filteredSuppliers.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No se encontraron proveedores con los filtros aplicados
              </Typography>
              {filters.search || filters.status || filters.city || filters.country ? (
                <Button
                  variant="text"
                  onClick={() => handleFilterChange({ search: '', status: '', city: '', country: '' })}
                  sx={{ mt: 1 }}
                >
                  Limpiar filtros
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleOpenAddForm}
                  startIcon={<AddIcon />}
                  sx={{ mt: 1 }}
                >
                  Crear primer proveedor
                </Button>
              )}
            </Box>
          ) : viewMode === 'list' || isMobile ? (
            <Box sx={{ height: 500, width: '100%' }}>
              <DataGrid
                rows={filteredSuppliers}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableSelectionOnClick
                getRowId={(row) => row.id || row._id}
                onRowClick={(params) => handleViewSupplier(params.row)}
                loading={loading && filteredSuppliers.length > 0}
                sx={{
                  '& .MuiDataGrid-cell': {
                    cursor: 'pointer'
                  },
                  borderColor: 'divider',
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  },
                }}
              />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredSuppliers.map((supplier) => (
                <GridItem xs={12} sm={6} md={4} lg={3} key={supplier.id || supplier._id}>
                  <SupplierCard
                    supplier={supplier}
                    onClick={handleViewSupplier}
                  />
                </GridItem>
              ))}
            </Grid>
          )}
        </Paper>

        {/* Modal para añadir/editar proveedor */}
        <Dialog
          open={openAddForm}
          onClose={handleCloseAddForm}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
          scroll="paper"
        >
          <DialogTitle>
            {selectedSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </DialogTitle>
          <DialogContent dividers>
            {SupplierForm ? (
              <SupplierForm
                supplier={selectedSupplier}
                onClose={handleCloseAddForm}
              />
            ) : (
              <Typography>
                Formulario de proveedor no disponible
              </Typography>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal para ver detalles de proveedor */}
        <Dialog
          open={openDetails}
          onClose={() => setOpenDetails(false)}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
          scroll="paper"
        >
          <DialogTitle>
            Detalles del Proveedor
          </DialogTitle>
          <DialogContent dividers>
            {selectedSupplier && (
              SupplierDetails ? (
                <SupplierDetails
                  supplier={selectedSupplier}
                  onEdit={handleEditSupplier}
                  onDelete={handleDeleteDialogOpen}
                />
              ) : (
                <Box>
                  <Typography variant="h6">{selectedSupplier.name}</Typography>
                  <Typography>Contacto: {selectedSupplier.contact_person}</Typography>
                  <Typography>Email: {selectedSupplier.email}</Typography>
                  <Typography>Teléfono: {selectedSupplier.phone}</Typography>
                  <Box sx={{ mt: 2 }}>
                                        <Button
                      variant="outlined"
                      onClick={() => handleEditSupplier(selectedSupplier)}
                      sx={{ mr: 1 }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteDialogOpen(selectedSupplier)}
                    >
                      Eliminar
                    </Button>
                  </Box>
                </Box>
              )
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDetails(false)}>
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal de confirmación para eliminar */}
        <Dialog
          open={openDeleteConfirm}
          onClose={() => setOpenDeleteConfirm(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Confirmar eliminación</DialogTitle>
          <DialogContent>
            <Typography id="alert-dialog-description">
              ¿Está seguro de que desea eliminar al proveedor <strong>{selectedSupplier?.name}</strong>?
              Esta acción no se puede deshacer.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteConfirm(false)}>
              Cancelar
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={handleDeleteSupplier}
              autoFocus
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default SuppliersPage;