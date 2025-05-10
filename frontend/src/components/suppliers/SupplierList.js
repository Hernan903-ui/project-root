import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Tooltip,
  Typography,
  Box,
  Chip,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ShoppingCart as OrderIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import SupplierFilters from './SupplierFilters';

const SupplierList = ({ 
  suppliers, 
  totalItems, 
  loading, 
  onDelete, 
  onFilter,
  page, 
  setPage, 
  rowsPerPage, 
  setRowsPerPage 
}) => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const goToSupplierDetails = (id) => {
    navigate(`/suppliers/${id}`);
  };

  const goToCreateOrder = (supplierId) => {
    navigate(`/purchase-orders/create`, { state: { supplierId } });
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Proveedores</Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<SearchIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ mr: 1 }}
          >
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/suppliers/create')}
          >
            Nuevo Proveedor
          </Button>
        </Box>
      </Box>

      {showFilters && (
        <>
          <Divider />
          <SupplierFilters onFilter={onFilter} />
        </>
      )}

      <TableContainer sx={{ maxHeight: 'calc(100vh - 240px)' }}>
        <Table stickyHeader aria-label="sticky table">
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Cargando proveedores...
                </TableCell>
              </TableRow>
            ) : suppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No se encontraron proveedores
                </TableCell>
              </TableRow>
            ) : (
              suppliers.map((supplier) => (
                <TableRow hover key={supplier.id}>
                  <TableCell>{supplier.name}</TableCell>
                  <TableCell>{supplier.contactName}</TableCell>
                  <TableCell>{supplier.email}</TableCell>
                  <TableCell>{supplier.phone}</TableCell>
                  <TableCell>
                    <Chip 
                      label={supplier.active ? 'Activo' : 'Inactivo'} 
                      color={supplier.active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Ver detalles">
                      <IconButton size="small" onClick={() => goToSupplierDetails(supplier.id)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Crear orden">
                      <IconButton size="small" onClick={() => goToCreateOrder(supplier.id)}>
                        <OrderIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => navigate(`/suppliers/edit/${supplier.id}`)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" onClick={() => onDelete(supplier)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={totalItems}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default SupplierList;