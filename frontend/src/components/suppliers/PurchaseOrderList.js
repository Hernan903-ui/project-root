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
  Divider,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  LocalShipping as ShippingIcon,
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PurchaseOrderFilters from './PurchaseOrderFilters';

const getStatusChip = (status) => {
  switch (status) {
    case 'draft':
      return <Chip label="Borrador" color="default" size="small" />;
    case 'pending':
      return <Chip label="Pendiente" color="warning" size="small" />;
    case 'confirmed':
      return <Chip label="Confirmada" color="info" size="small" />;
    case 'received':
      return <Chip label="Recibida" color="success" size="small" />;
    case 'cancelled':
      return <Chip label="Cancelada" color="error" size="small" />;
    default:
      return <Chip label="Desconocido" size="small" />;
  }
};

const PurchaseOrderList = ({
  purchaseOrders,
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
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenMenu = (event, orderId) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedOrderId(orderId);
  };

  const handleCloseMenu = () => {
    setActionMenuAnchor(null);
    setSelectedOrderId(null);
  };

  const goToOrderDetails = (id) => {
    navigate(`/purchase-orders/${id}`);
  };

  const goToReceiveOrder = (id) => {
    navigate(`/purchase-orders/${id}/receive`);
    handleCloseMenu();
  };

  const goToEditOrder = (id) => {
    navigate(`/purchase-orders/edit/${id}`);
    handleCloseMenu();
  };

  const handleDeleteOrder = (id) => {
    onDelete(id);
    handleCloseMenu();
  };

  const handlePrintOrder = (id) => {
    // Implementar funcionalidad de impresión
    console.log('Printing order:', id);
    handleCloseMenu();
  };

  const handleSendOrder = (id) => {
    // Implementar funcionalidad de envío
    console.log('Sending order:', id);
    handleCloseMenu();
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Órdenes de Compra</Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={() => setShowFilters(!showFilters)}
            sx={{ mr: 1 }}
          >
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/purchase-orders/create')}
          >
            Nueva Orden
          </Button>
        </Box>
      </Box>

      {showFilters && (
        <>
          <Divider />
          <PurchaseOrderFilters onFilter={onFilter} />
        </>
      )}

      <TableContainer sx={{ maxHeight: 'calc(100vh - 240px)' }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell>Orden #</TableCell>
              <TableCell>Proveedor</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Entrega Estimada</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Cargando órdenes de compra...
                </TableCell>
              </TableRow>
            ) : purchaseOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No se encontraron órdenes de compra
                </TableCell>
              </TableRow>
            ) : (
              purchaseOrders.map((order) => (
                <TableRow hover key={order.id}>
                  <TableCell>
                    <Box sx={{ fontWeight: 'medium' }}>
                      #{order.id}
                    </Box>
                  </TableCell>
                  <TableCell>{order.supplierName}</TableCell>
                  <TableCell>
                    {order.orderDate 
                      ? format(new Date(order.orderDate), 'dd/MM/yyyy', { locale: es }) 
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    {order.expectedDeliveryDate 
                      ? format(new Date(order.expectedDeliveryDate), 'dd/MM/yyyy', { locale: es }) 
                      : 'No especificada'
                    }
                  </TableCell>
                  <TableCell align="right">
                    ${order.total.toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    {getStatusChip(order.status)}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Tooltip title="Ver detalles">
                        <IconButton size="small" onClick={() => goToOrderDetails(order.id)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {order.status !== 'cancelled' && order.status !== 'received' && (
                        <Tooltip title="Recibir mercancía">
                          <IconButton 
                            size="small" 
                            color="success" 
                            onClick={() => goToReceiveOrder(order.id)}
                          >
                            <ShippingIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      <IconButton 
                        size="small"
                        onClick={(e) => handleOpenMenu(e, order.id)}
                        aria-label="más opciones"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
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
        labelRowsPerPage="Filas por página"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />

      {/* Menú de acciones */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => goToOrderDetails(selectedOrderId)}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          Ver detalles
        </MenuItem>
        
        {purchaseOrders.find(o => o.id === selectedOrderId)?.status !== 'cancelled' && 
        purchaseOrders.find(o => o.id === selectedOrderId)?.status !== 'received' && (
          <>
            <MenuItem onClick={() => goToEditOrder(selectedOrderId)}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Editar
            </MenuItem>
            
            <MenuItem onClick={() => goToReceiveOrder(selectedOrderId)}>
              <ShippingIcon fontSize="small" sx={{ mr: 1 }} />
              Recibir mercancía
            </MenuItem>
          </>
        )}
        
        <MenuItem onClick={() => handlePrintOrder(selectedOrderId)}>
          <PrintIcon fontSize="small" sx={{ mr: 1 }} />
          Imprimir
        </MenuItem>
        
        <MenuItem onClick={() => handleSendOrder(selectedOrderId)}>
          <SendIcon fontSize="small" sx={{ mr: 1 }} />
          Enviar al proveedor
        </MenuItem>
        
        <Divider />
        
        {purchaseOrders.find(o => o.id === selectedOrderId)?.status === 'draft' && (
          <MenuItem 
            onClick={() => handleDeleteOrder(selectedOrderId)}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Eliminar
          </MenuItem>
        )}
      </Menu>
    </Paper>
  );
};

export default PurchaseOrderList;