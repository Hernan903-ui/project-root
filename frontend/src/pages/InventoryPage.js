import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Print as PrintIcon,
  History as HistoryIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
// Importación de inventorySlice (esta sí existe)
import { fetchInventory, updateInventoryItem } from '../features/inventory/inventorySlice';
import { fetchProducts } from '../features/products/productSlice';
import { generatePDF } from '../utils/reportGenerator'; // Esta ya la creamos

const InventoryPage = () => {
  const dispatch = useDispatch();
  // Obtener el estado del inventario del Redux store, con valor por defecto para items
  const { items = [], loading, error } = useSelector((state) => state.inventory || { items: [] });
  // Placeholder vacío si no hay slice de productos
  const products = [];

  const [tabValue, setTabValue] = useState(0);
  const [openAddForm, setOpenAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    minStock: '',
    maxStock: '',
    status: ''
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [stockAdjustmentOpen, setStockAdjustmentOpen] = useState(false);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');

  useEffect(() => {
    dispatch(fetchInventory());
    // dispatch(fetchProducts()); // Eliminada
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenAddForm = () => {
    setSelectedItem(null);
    setOpenAddForm(true);
  };

  const handleCloseAddForm = () => {
    setOpenAddForm(false);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleRowClick = (params) => {
    setSelectedItem(params.row);
    setOpenAddForm(true);
  };

  const handleGenerateReport = () => {
    generatePDF('Reporte de Inventario', filteredItems, [
      { header: 'Producto', field: 'productName' },
      { header: 'Cantidad', field: 'quantity' },
      { header: 'Ubicación', field: 'location' },
      { header: 'Estado', field: 'status' }
    ]);
  };

  const handleOpenStockAdjustment = (item) => {
    setSelectedItem(item);
    setAdjustmentQuantity(0);
    setAdjustmentReason('');
    setStockAdjustmentOpen(true);
  };

  const handleApplyStockAdjustment = () => {
    if (selectedItem && adjustmentReason) {
      const updatedItem = {
        ...selectedItem,
        quantity: selectedItem.quantity + Number(adjustmentQuantity),
        lastUpdated: new Date().toISOString(),
        movementReason: adjustmentReason
      };

      dispatch(updateInventoryItem(updatedItem))
        .then(() => {
          setStockAdjustmentOpen(false);
          dispatch(fetchInventory());
        });
    }
  };

  const handleViewHistory = (item) => {
    setSelectedItem(item);
    setShowHistory(true);
  };

  // CORRECCIÓN: Asegurarse de que items sea un array antes de usar filter
  // Filtrar items basado en búsqueda y filtros
  const filteredItems = Array.isArray(items) ? items.filter(item => {
    const matchesSearch =
      (item.productName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (item.sku?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      ((item.location || '').toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilters =
      (!filters.category || item.category === filters.category) &&
      (!filters.minStock || item.quantity >= parseInt(filters.minStock)) &&
      (!filters.maxStock || item.quantity <= parseInt(filters.maxStock)) &&
      (!filters.status || item.status === filters.status);

    return matchesSearch && matchesFilters;
  }) : [];

  // CORRECCIÓN: Asegurarse de que items sea un array antes de calcular estadísticas
  // Obtener estadísticas de inventario (ajustado si no hay slice de productos)
  const inventoryStats = {
    totalItems: Array.isArray(items) ? items.length : 0,
    totalQuantity: Array.isArray(items) ? items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0,
    lowStock: Array.isArray(items) ? items.filter(item => item.quantity <= (item.minStockLevel || 0)).length : 0,
    outOfStock: Array.isArray(items) ? items.filter(item => (item.quantity || 0) === 0).length : 0
  };

  const columns = [
    { field: 'sku', headerName: 'SKU', width: 120 },
    { field: 'productName', headerName: 'Producto', width: 200 },
    { field: 'category', headerName: 'Categoría', width: 150 },
    { field: 'quantity', headerName: 'Cantidad', width: 120, type: 'number' },
    { field: 'minStockLevel', headerName: 'Stock Mínimo', width: 150, type: 'number' },
    { field: 'location', headerName: 'Ubicación', width: 150 },
    {
      field: 'status',
      headerName: 'Estado',
      width: 150,
      renderCell: (params) => {
        let color = 'default';
        // Asegurarse de que params.value no sea undefined antes de comparar
        if (params.value === 'En Stock') color = 'success';
        if (params.value === 'Bajo Stock') color = 'warning';
        if (params.value === 'Agotado') color = 'error';

        return <Chip label={params.value || 'No definido'} color={color} size="small" />;
      }
    },
    {
      field: 'lastUpdated',
      headerName: 'Última Actualización',
      width: 180,
      valueFormatter: (params) => {
        if (!params.value) return '';
        // Asegurarse de que params.value sea una fecha válida
        const date = new Date(params.value);
        return isNaN(date.getTime()) ? '' : date.toLocaleString();
      }
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Ajustar Stock">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenStockAdjustment(params.row);
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Historial">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleViewHistory(params.row);
              }}
            >
              <HistoryIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  // CORRECCIÓN: Asegurarse de que items sea un array antes de usar filter
  const lowStockItems = Array.isArray(items) 
    ? items.filter(item => item.quantity <= (item.minStockLevel || 0))
    : [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Inventario
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2}}>
          <Tab label="Inventario" />
          <Tab label="Estadísticas" />
        </Tabs>

        {tabValue === 0 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="Buscar"
                  variant="outlined"
                  size="small"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <Button
                  startIcon={<FilterIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  variant={showFilters ? "contained" : "outlined"}
                  color="primary"
                  size="small"
                >
                  Filtros
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  startIcon={<PrintIcon />}
                  variant="outlined"
                  onClick={handleGenerateReport}
                  size="small"
                >
                  Generar Reporte
                </Button>
              </Box>
            </Box>

            {showFilters && (
              <Box sx={{ mb: 2, p: 2, border: '1px dashed grey', borderRadius: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Filtros de inventario (componente InventoryFilters no encontrado)
                </Typography>
                {/* Aquí podrías poner inputs básicos si deseas alguna funcionalidad de filtrado simple */}
              </Box>
            )}

            {lowStockItems.length > 0 && (
              <Box sx={{ mb: 2, p: 1, bgcolor: 'warning.light', borderRadius: 1, display: 'flex', alignItems: 'center' }}>
                <WarningIcon color="warning" sx={{ mr: 1 }} />
                <Typography>
                  {lowStockItems.length} productos con bajo stock o agotados
                </Typography>
              </Box>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <DataGrid
                rows={filteredItems}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                autoHeight
                disableSelectionOnClick
                getRowId={(row) => row.id || row._id || Math.random().toString(36).substring(2, 11)} // Fallback seguro
                sx={{ minHeight: 400 }}
              />
            )}
          </>
        )}

        {tabValue === 1 && (
          <Box sx={{ p: 2, border: '1px dashed grey', borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary">
              Estadísticas de inventario (componente InventoryStats no encontrado)
            </Typography>
            <Typography variant="h6">Resumen Rápido:</Typography>
            <ul>
              <li>Total Items: {inventoryStats.totalItems}</li>
              <li>Cantidad Total: {inventoryStats.totalQuantity}</li>
              <li>Bajo Stock: {inventoryStats.lowStock}</li>
              <li>Agotado: {inventoryStats.outOfStock}</li>
            </ul>
          </Box>
        )}
      </Paper>

      {/* Modal para ajuste de stock */}
      <Dialog open={stockAdjustmentOpen} onClose={() => setStockAdjustmentOpen(false)}>
        <DialogTitle>Ajuste de Stock</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="subtitle1">
              Producto: {selectedItem?.productName || 'No seleccionado'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Stock actual: {selectedItem?.quantity || 0} unidades
            </Typography>

            <TextField
              label="Cantidad a ajustar"
              type="number"
              fullWidth
              margin="normal"
              value={adjustmentQuantity}
              onChange={(e) => setAdjustmentQuantity(e.target.value)}
              helperText="Use números negativos para disminuir el stock"
            />

            <TextField
              label="Motivo del ajuste"
              fullWidth
              margin="normal"
              value={adjustmentReason}
              onChange={(e) => setAdjustmentReason(e.target.value)}
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockAdjustmentOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleApplyStockAdjustment}
            variant="contained"
            color="primary"
            disabled={!adjustmentReason}
          >
            Aplicar Ajuste
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para historial de movimientos */}
      <Dialog open={showHistory} onClose={() => setShowHistory(false)} maxWidth="md" fullWidth>
        <DialogTitle>Historial de Movimientos</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, border: '1px dashed grey', borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary">
              Historial de movimientos (componente StockMovementHistory no encontrado)
            </Typography>
            {/* Aquí podrías mostrar la información de historial si está disponible en los datos del item */}
            <Typography variant="subtitle1">Item seleccionado:</Typography>
            <pre>{JSON.stringify(selectedItem, null, 2)}</pre>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistory(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryPage;