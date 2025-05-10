import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
  Alert,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
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
  
  const { customers, loading, error } = useSelector((state) => state.customers);
  
  const [viewMode, setViewMode] = useState('grid');
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

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const handleOpenAddForm = () => {
    setSelectedCustomer(null);
    setOpenAddForm(true);
  };

  const handleCloseAddForm = () => {
    setOpenAddForm(false);
    dispatch(fetchCustomers());
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setOpenDetails(true);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setOpenDetails(false);
    setOpenAddForm(true);
  };

  const handleDeleteDialogOpen = (customer) => {
    setSelectedCustomer(customer);
    setOpenDeleteConfirm(true);
    setOpenDetails(false);
  };

  const handleDeleteCustomer = () => {
    if (selectedCustomer) {
      dispatch(deleteCustomer(selectedCustomer.id || selectedCustomer._id))
        .then(() => {
          setOpenDeleteConfirm(false);
          dispatch(fetchCustomers());
        });
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleGenerateReport = () => {
    generatePDF('Reporte de Clientes', filteredCustomers, [
      { header: 'Nombre', field: 'name' },
      { header: 'Tipo', field: 'type', formatter: (value) => value === 'business' ? 'Empresa' : 'Individual' },
      { header: 'Email', field: 'email' },
            { header: 'Teléfono', field: 'phone' },
      { header: 'Ciudad', field: 'city' },
      { header: 'Provincia/Estado', field: 'state' }
    ]);
  };

  // Filtrar clientes según los filtros aplicados
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
    },
    { 
      field: 'state',
      headerName: 'Provincia/Estado',
      width: 150,
    },
    { 
      field: 'document',
      headerName: 'Documento',
      width: 150,
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Clientes
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Clientes ({filteredCustomers.length})
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!isMobile && (
              <Box sx={{ display: 'flex', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Button
                  startIcon={<ViewListIcon />}
                  onClick={() => setViewMode('list')}
                  color={viewMode === 'list' ? 'primary' : 'inherit'}
                  sx={{ borderRadius: '4px 0 0 4px' }}
                >
                  Lista
                </Button>
                <Divider orientation="vertical" flexItem />
                <Button
                  startIcon={<ViewModuleIcon />}
                  onClick={() => setViewMode('grid')}
                  color={viewMode === 'grid' ? 'primary' : 'inherit'}
                  sx={{ borderRadius: '0 4px 4px 0' }}
                >
                  Tarjetas
                </Button>
              </Box>
            )}
            
            <Button
              variant="outlined"
              onClick={handleGenerateReport}
            >
              Exportar
            </Button>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              color="primary"
              onClick={handleOpenAddForm}
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
            <Typography variant="body1" color="textSecondary">
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
            />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredCustomers.map((customer) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={customer.id || customer._id}>
                <CustomerCard
                  customer={customer}
                  onClick={handleViewCustomer}
                />
              </Grid>
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
      >
        <DialogTitle>
          {selectedCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
        </DialogTitle>
        <DialogContent>
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
      >
        <DialogTitle>
          Detalles del Cliente
        </DialogTitle>
        <DialogContent>
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
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
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
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomersPage;