//src/pages/CustomersPage.js
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
  Grid
} from '@mui/material';
import GridItem from '../components/common/GridItem'; // Importamos el componente GridItem personalizado
import {
  Add as AddIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import {
  fetchCustomers,
  deleteCustomer,
  clearCustomerState
} from '../features/customers/customerSlice';
import CustomerForm from '../components/customers/CustomerForm';
import CustomerDetails from '../components/customers/CustomerDetails';
import CustomerFilters from '../components/customers/CustomerFilters';
import CustomerCard from '../components/customers/CustomerCard';
import { generatePDF } from '../utils/reportGenerator';

const CustomersPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

  const { customers, loading, error } = useSelector((state) => state.customers);

  const [viewMode, setViewMode] = useState(isMobile ? 'list' : 'grid');
  const [openAddForm, setOpenAddForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    city: '',
    state: ''
  });

  // Filtrar clientes según los filtros aplicados - MOVIDO AQUÍ ANTES DE USAR LA VARIABLE
  const filteredCustomers = customers.filter(customer => {
    const searchTerms = filters.search.toLowerCase();
    const matchesSearch = !searchTerms ||
      customer.name?.toLowerCase().includes(searchTerms) ||
      customer.email?.toLowerCase().includes(searchTerms) ||
      customer.phone?.toLowerCase().includes(searchTerms) ||
      customer.document?.toLowerCase().includes(searchTerms) ||
      customer.companyName?.toLowerCase().includes(searchTerms);

    const matchesType = !filters.type || customer.type === filters.type;
    const matchesCity = !filters.city ||
      (customer.city && customer.city.toLowerCase().includes(filters.city.toLowerCase()));
    const matchesState = !filters.state ||
      (customer.state && customer.state.toLowerCase().includes(filters.state.toLowerCase()));

    return matchesSearch && matchesType && matchesCity && matchesState;
  });

  // Columnas para la vista de tabla
  const columns = [
    {
      field: 'name',
      headerName: 'Nombre',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'type',
      headerName: 'Tipo',
      width: 120,
      valueFormatter: (params) => params.value === 'business' ? 'Empresa' : 'Individual'
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
      field: 'state',
      headerName: 'Provincia/Estado',
      width: 150,
      hide: isMediumScreen,
    },
    {
      field: 'document',
      headerName: 'Documento',
      width: 150,
      hide: isMediumScreen,
    }
  ];

  useEffect(() => {
    dispatch(fetchCustomers());
    
    // Limpiar el estado al desmontar el componente
    return () => {
      dispatch(clearCustomerState());
    };
  }, [dispatch]);

  useEffect(() => {
    // Actualizar viewMode cuando cambie el tamaño de pantalla
    if (isMobile && viewMode === 'grid') {
      setViewMode('list');
    }
  }, [isMobile, viewMode]);

  const handleOpenAddForm = useCallback(() => {
    setSelectedCustomer(null);
    setOpenAddForm(true);
  }, []);

  const handleCloseAddForm = useCallback(() => {
    setOpenAddForm(false);
    dispatch(fetchCustomers());
  }, [dispatch]);

  const handleViewCustomer = useCallback((customer) => {
    setSelectedCustomer(customer);
    setOpenDetails(true);
  }, []);

  const handleEditCustomer = useCallback((customer) => {
    setSelectedCustomer(customer);
    setOpenDetails(false);
    setOpenAddForm(true);
  }, []);

  const handleDeleteDialogOpen = useCallback((customer) => {
    setSelectedCustomer(customer);
    setOpenDeleteConfirm(true);
    setOpenDetails(false);
  }, []);

  const handleDeleteCustomer = useCallback(() => {
    if (selectedCustomer) {
      dispatch(deleteCustomer(selectedCustomer.id || selectedCustomer._id))
        .then(() => {
          setOpenDeleteConfirm(false);
          dispatch(fetchCustomers());
        });
    }
  }, [dispatch, selectedCustomer]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleGenerateReport = useCallback(() => {
    generatePDF('Reporte de Clientes', filteredCustomers, [
      { header: 'Nombre', field: 'name' },
      { header: 'Tipo', field: 'type', formatter: (value) => value === 'business' ? 'Empresa' : 'Individual' },
      { header: 'Email', field: 'email' },
      { header: 'Teléfono', field: 'phone' },
      { header: 'Ciudad', field: 'city' },
      { header: 'Provincia/Estado', field: 'state' }
    ]);
  }, [filteredCustomers]);

  const handleViewModeChange = useCallback((event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  }, []);

  return (
    <Box sx={{ width: '100%', p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Clientes
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={() => dispatch(clearCustomerState())}
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
            Clientes ({filteredCustomers.length})
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
              disabled={filteredCustomers.length === 0}
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
              Nuevo Cliente
            </Button>
          </Box>
        </Box>

        <CustomerFilters onFilterChange={handleFilterChange} />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : filteredCustomers.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No se encontraron clientes con los filtros aplicados
            </Typography>
            {filters.search || filters.type || filters.city || filters.state ? (
              <Button
                variant="text"
                onClick={() => handleFilterChange({ search: '', type: '', city: '', state: '' })}
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
                Crear primer cliente
              </Button>
            )}
          </Box>
        ) : viewMode === 'list' || isMobile ? (
          <Box sx={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={filteredCustomers}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableSelectionOnClick
              getRowId={(row) => row.id || row._id}
              onRowClick={(params) => handleViewCustomer(params.row)}
              loading={loading}
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
            {filteredCustomers.map((customer) => (
              <GridItem xs={12} sm={6} md={4} lg={3} key={customer.id || customer._id}>
                <CustomerCard
                  customer={customer}
                  onClick={handleViewCustomer}
                />
              </GridItem>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Modal para añadir/editar cliente */}
      <Dialog
        open={openAddForm}
        onClose={handleCloseAddForm}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        scroll="paper"
      >
        <DialogTitle>
          {selectedCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
        </DialogTitle>
        <DialogContent dividers>
          <CustomerForm
            customer={selectedCustomer}
            onClose={handleCloseAddForm}
          />
        </DialogContent>
      </Dialog>

      {/* Modal para ver detalles de cliente */}
      <Dialog
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        scroll="paper"
      >
        <DialogTitle>
          Detalles del Cliente
        </DialogTitle>
        <DialogContent dividers>
          {selectedCustomer && (
            <CustomerDetails
              customer={selectedCustomer}
              onEdit={handleEditCustomer}
              onDelete={handleDeleteDialogOpen}
            />
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
            ¿Está seguro de que desea eliminar al cliente <strong>{selectedCustomer?.name}</strong>?
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
            onClick={handleDeleteCustomer}
            autoFocus
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomersPage;