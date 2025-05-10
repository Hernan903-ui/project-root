import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  LocalShipping as ShippingIcon,
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const getStatusChip = (status) => {
  switch (status) {
    case 'draft':
      return <Chip label="Borrador" color="default" />;
    case 'pending':
      return <Chip label="Pendiente" color="warning" />;
    case 'confirmed':
      return <Chip label="Confirmada" color="info" />;
    case 'received':
      return <Chip label="Recibida" color="success" />;
    case 'cancelled':
      return <Chip label="Cancelada" color="error" />;
    default:
      return <Chip label="Desconocido" />;
  }
};

const PurchaseOrderDetails = ({
  purchaseOrder,
  onEdit,
  onReceive,
  onCancel,
  onPrint,
  onSend,
  onBack
}) => {
  const navigate = useNavigate();

  if (!purchaseOrder) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>No se encontró información de la orden de compra</Typography>
      </Paper>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: es });
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack || (() => navigate('/purchase-orders'))}
          sx={{ mr: 2 }}
        >
          Volver a órdenes
        </Button>
        <Typography variant="h5" component="h1">
          Orden de Compra #{purchaseOrder.id}
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {getStatusChip(purchaseOrder.status)}
            <Typography variant="subtitle1" sx={{ ml: 2 }}>
              Proveedor: {purchaseOrder.supplierName}
            </Typography>
          </Box>
          <Box>
            {purchaseOrder.status !== 'cancelled' && purchaseOrder.status !== 'received' && (
              <>
                <Tooltip title="Editar orden">
                  <IconButton
                    color="primary"
                    onClick={onEdit || (() => navigate(`/purchase-orders/edit/${purchaseOrder.id}`))}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Recibir mercancía">
                  <IconButton
                    color="success"
                    onClick={onReceive || (() => navigate(`/purchase-orders/${purchaseOrder.id}/receive`))}
                    sx={{ mr: 1 }}
                  >
                    <ShippingIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}

            <Tooltip title="Imprimir orden">
              <IconButton
                onClick={onPrint || (() => console.log('Print order'))}
                sx={{ mr: 1 }}
              >
                <PrintIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Enviar al proveedor">
              <IconButton
                onClick={onSend || (() => console.log('Send order'))}
                sx={{ mr: 1 }}
              >
                <SendIcon />
              </IconButton>
            </Tooltip>

            {purchaseOrder.status !== 'cancelled' && purchaseOrder.status !== 'received' && (
              <Tooltip title="Cancelar orden">
                <IconButton
                  color="error"
                  onClick={onCancel}
                >
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader title="Información de la Orden" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Fecha de Orden
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(purchaseOrder.orderDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Entrega Estimada
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(purchaseOrder.expectedDeliveryDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Términos de Pago
                    </Typography>
                    <Typography variant="body1">
                      {purchaseOrder.paymentTerms || 'No especificados'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Costo de Envío
                    </Typography>
                    <Typography variant="body1">
                      ${purchaseOrder.shippingCost?.toFixed(2) || '0.00'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader title="Información del Proveedor" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Nombre
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {purchaseOrder.supplierName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Contacto
                    </Typography>
                    <Typography variant="body1">
                      {purchaseOrder.supplierContact || 'No especificado'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {purchaseOrder.supplierEmail || 'No especificado'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Teléfono
                    </Typography>
                    <Typography variant="body1">
                      {purchaseOrder.supplierPhone || 'No especificado'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined">
              <CardHeader title="Productos" />
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Producto</TableCell>
                        <TableCell align="right">Cantidad</TableCell>
                        <TableCell align="right">Precio Unitario</TableCell>
                        <TableCell align="right">Impuesto (%)</TableCell>
                        <TableCell align="right">Descuento (%)</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {purchaseOrder.items?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">${item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell align="right">{item.tax}%</TableCell>
                          <TableCell align="right">{item.discount}%</TableCell>
                          <TableCell align="right">${item.total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            {purchaseOrder.notes && (
              <Card variant="outlined">
                <CardHeader title="Notas" />
                <CardContent>
                  <Typography variant="body1">
                    {purchaseOrder.notes}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader title="Resumen" />
              <CardContent>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2">Subtotal:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" align="right">
                      ${purchaseOrder.subtotal?.toFixed(2) || '0.00'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2">Impuestos:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" align="right">
                      ${purchaseOrder.taxAmount?.toFixed(2) || '0.00'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2">Descuentos:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" align="right">
                      -${purchaseOrder.discountAmount?.toFixed(2) || '0.00'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2">Costo de Envío:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" align="right">
                      ${purchaseOrder.shippingCost?.toFixed(2) || '0.00'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Total:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1" fontWeight="bold" align="right">
                      ${purchaseOrder.total.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {purchaseOrder.receivingHistory && purchaseOrder.receivingHistory.length > 0 && (
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardHeader title="Historial de Recepción" />
                <CardContent>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Fecha</TableCell>
                          <TableCell>Documento</TableCell>
                          <TableCell>Productos Recibidos</TableCell>
                          <TableCell>Notas</TableCell>
                          <TableCell align="center">Estado</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {purchaseOrder.receivingHistory.map((record, index) => (
                          <TableRow key={index}>
                            <TableCell>{formatDate(record.receivedDate)}</TableCell>
                            <TableCell>{record.documentNumber || 'N/A'}</TableCell>
                            <TableCell>
                              {record.receivedItems.length} ítem(s)
                            </TableCell>
                            <TableCell>{record.notes || 'Sin notas'}</TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={record.allItemsReceived ? "Completo" : "Parcial"}
                                color={record.allItemsReceived ? "success" : "info"}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default PurchaseOrderDetails;