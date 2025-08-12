import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  CircularProgress,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import DashboardLayout from '../components/layout/DashboardLayout';
// Remove unused import
import { fetchSuppliers, selectAllSuppliers, deleteSupplier } from '../features/suppliers/suppliersSlice';

const SupplierList = ({ suppliers, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>Listado de Proveedores</Typography>
      {suppliers.length === 0 ? (
        <Typography color="text.secondary">No hay proveedores registrados.</Typography>
      ) : (
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          {suppliers.map(s => (
            <Box key={s.id} sx={{ p: 2, mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle1">{s.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{s.email}</Typography>
                </Box>
                <Box>
                  <Button size="small" variant="outlined" onClick={() => onEdit(s)} sx={{ mr: 1 }}>Editar</Button>
                  <Button size="small" color="error" variant="outlined" onClick={() => onDelete(s.id)}>Eliminar</Button>
                </Box>
              </Stack>
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
};


const SuppliersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const suppliers = useSelector(selectAllSuppliers);
  const { loading, error } = useSelector((state) => state.suppliers);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleRefresh = () => {
    dispatch(fetchSuppliers());
  };

  const handleEdit = (supplier) => {
    navigate(`/suppliers/edit/${supplier.id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este proveedor?')) {
      await dispatch(deleteSupplier(id));
      dispatch(fetchSuppliers());
    }
  };

  const handleCreateNew = () => {
    navigate('/suppliers/create');
  };

  // Filtrar proveedores según la búsqueda
  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>Proveedores</Typography>
        
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Buscar proveedor..."
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{ mr: 2, width: 250 }}
                InputProps={{
                  startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              <Tooltip title="Filtros">
                <IconButton onClick={() => setShowFilters(!showFilters)}>
                  <FilterIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Actualizar">
                <IconButton onClick={handleRefresh}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateNew}
            >
              Nuevo Proveedor
            </Button>
          </Box>
          
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              Error al cargar proveedores: {error}
            </Typography>
          )}
        </Paper>
        
        <SupplierList 
          suppliers={filteredSuppliers} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
          loading={loading}
        />
      </Box>
    </DashboardLayout>
  );
}

export default SuppliersPage;