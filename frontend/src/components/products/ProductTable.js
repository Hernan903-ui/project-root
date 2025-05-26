import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Box,
  Tooltip,
  TablePagination,
  Checkbox,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import { useSnackbar } from 'notistack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProduct } from '../../api/productApi';

const ProductTable = ({ products, isLoading, totalCount, page, limit, onPageChange, onLimitChange, onBulkAction }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState([]);

  // Corregido: Actualizada la sintaxis de useMutation para React Query v4/v5
  const toggleStatus = useMutation({
    mutationFn: ({ id, is_active }) => updateProduct(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      enqueueSnackbar('Estado del producto actualizado correctamente', { variant: 'success' });
    },
    onError: (error) => {
      enqueueSnackbar(
        `Error al actualizar el estado: ${error.response?.data?.detail || error.message}`,
        { variant: 'error' }
      );
    }
  });

  const handleToggleActive = (id, currentStatus) => {
    toggleStatus.mutate({ id, is_active: !currentStatus });
  };

  const handleViewDetails = (id) => {
    navigate(`/products/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/products/edit/${id}`);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = products.map((product) => product.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleSelectOne = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter((itemId) => itemId !== id);
    }

    setSelected(newSelected);
  };

  const handleBulkAction = (action) => {
    if (selected.length === 0) {
      enqueueSnackbar('No hay productos seleccionados', { variant: 'warning' });
      return;
    }
    onBulkAction(action, selected);
    setSelected([]);
  };

  const getStockStatus = (product) => {
    if (!product.stock_quantity && product.stock_quantity !== 0) {
      return { label: 'No disponible', color: 'default' };
    }
    if (product.stock_quantity <= 0) {
      return { label: 'Sin Stock', color: 'error' };
    }
    if (product.stock_quantity <= (product.min_stock_level || 5)) {
      return { label: 'Bajo', color: 'warning' };
    }
    return { label: 'Disponible', color: 'success' };
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {selected.length > 0 && (
        <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1">
              {selected.length} {selected.length === 1 ? 'producto seleccionado' : 'productos seleccionados'}
            </Typography>
            <Box>
              <Button 
                color="inherit" 
                sx={{ mr: 1 }}
                onClick={() => handleBulkAction('activate')}
              >
                Activar
              </Button>
              <Button 
                color="inherit" 
                sx={{ mr: 1 }}
                onClick={() => handleBulkAction('deactivate')}
              >
                Desactivar
              </Button>
              <Button 
                color="inherit"
                onClick={() => setSelected([])}
              >
                Cancelar
              </Button>
            </Box>
          </Box>
        </Box>
      )}
      
      <TableContainer sx={{ maxHeight: 'calc(100vh - 240px)' }}>
        <Table stickyHeader aria-label="sticky table" size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < products.length}
                  checked={products.length > 0 && selected.length === products.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Producto</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell align="right">Precio</TableCell>
              <TableCell align="center">Stock</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Cargando productos...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No se encontraron productos
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const isSelected = selected.indexOf(product.id) !== -1;
                const stockStatus = getStockStatus(product);
                
                return (
                  <TableRow 
                    hover 
                    key={product.id}
                    selected={isSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={(event) => handleSelectOne(event, product.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {product.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {product.description && product.description.length > 50
                          ? `${product.description.substring(0, 50)}...`
                          : product.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>{product.sku || '-'}</TableCell>
                    <TableCell>
                      {product.category ? product.category.name : '-'}
                    </TableCell>
                    <TableCell align="right">
                      ${typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={`${product.stock_quantity || 0} unid.`} 
                        color={stockStatus.color} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={product.is_active ? 'Activo' : 'Inactivo'} 
                        color={product.is_active ? 'success' : 'default'} 
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Tooltip title="Ver detalles">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewDetails(product.id)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEdit(product.id)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={product.is_active ? 'Desactivar' : 'Activar'}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleToggleActive(product.id, product.is_active)}
                            color={product.is_active ? 'default' : 'primary'}
                          >
                            {product.is_active ? <DeleteIcon fontSize="small" /> : <RestoreIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 20, 50, 100]}
        component="div"
        count={totalCount}
        rowsPerPage={limit}
        page={page - 1}
        onPageChange={(_, newPage) => onPageChange(newPage + 1)}
        onRowsPerPageChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />
    </Paper>
  );
};

export default ProductTable;