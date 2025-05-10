import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Grid,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Payment as PaymentIcon,
  LocalShipping as ShippingIcon,
  AssignmentReturn as ReturnIcon,
  Cancel as CancelIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const SaleDetails = ({ sale, onPrint, onReturn, onCancel }) => {
  if (!sale) return null;
  
  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPP, p', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Función para obtener color según estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completada':
        return 'success';
      case 'Pendiente':
        return 'warning';
      case 'Cancelada':
        return 'error';
      case 'Devuelta':
        return 'secondary';
      default:
        return 'default';
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Venta #{sale.receiptNumber || sale.id}
          </Typography>
          <Chip
            label={sale.status}
            color={getStatusColor(sale.status)}
            sx={{ mr: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            {formatDate(sale.date)}
          </Typography>
        </Box>
        
        <Box>
          <Button
            startIcon={<PrintIcon />}
            variant="outlined"
            onClick={() => onPrint(sale)}
            sx={{ mr: 1 }}
          >
            Imprimir
          </Button>
          
          {sale.status === 'Completada' && (
            <Button
              startIcon={<ReturnIcon />}
              variant="outlined"
              color="secondary"
              onClick={() => onReturn(sale)}
              sx={{ mr: 1 }}
            >
              Devolución
            </Button>
          )}
          
          {sale.status !== 'Cancelada' && (
            <Button
              startIcon={<CancelIcon />}
              variant="outlined"
              color="error"
              onClick={() => onCancel(sale)}
            >
              Cancelar
            </Button>
          )}
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Información de venta
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <ReceiptIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Número de recibo"
                  secondary={sale.receiptNumber || 'No asignado'}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CalendarIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Fecha"
                  secondary={formatDate(sale.date)}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Cliente"
                  secondary={sale.customer ? sale.customer.name : 'Cliente no registrado'}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Vendedor"
                  secondary={sale.seller ? sale.seller.name : 'No especificado'}
                />
              </ListItem>
              
              {sale.shippingInfo && (
                <ListItem>
                  <ListItemIcon>
                    <ShippingIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Método de envío"
                    secondary={sale.shippingInfo.method}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Información de pago
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <PaymentIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Método de pago"
                  secondary={sale.paymentMethod || 'No especificado'}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <PaymentIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Estado de pago"
                  secondary={
                    <Chip
                      label={sale.paymentStatus || 'No especificado'}
                      size="small"
                      color={sale.paymentStatus === 'Pagado' ? 'success' : 'warning'}
                    />
                  }
                />
              </ListItem>
              
              {sale.reference && (
                <ListItem>
                  <ListItemIcon>
                    <ReceiptIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Referencia de pago"
                    secondary={sale.reference}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Resumen de venta
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Subtotal:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" align="right">
                    ${sale.subtotal ? sale.subtotal.toFixed(2) : (sale.total - (sale.tax || 0)).toFixed(2)}
                  </Typography>
                </Grid>
                
                {sale.discount > 0 && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Descuento:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" align="right" color="error">
                        -${sale.discount.toFixed(2)}
                      </Typography>
                    </Grid>
                  </>
                )}
                
                {sale.tax > 0 && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Impuestos:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" align="right">
                        ${sale.tax.toFixed(2)}
                      </Typography>
                    </Grid>
                  </>
                )}
                
                {sale.shipping > 0 && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Envío:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" align="right">
                        ${sale.shipping.toFixed(2)}
                      </Typography>
                    </Grid>
                  </>
                )}
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2">
                    Total:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" align="right">
                    ${sale.total.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Productos
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell align="right">Precio</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Descuento</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sale.items && sale.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.sku || 'N/A'}</TableCell>
                      <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">
                        {item.discount ? `$${item.discount.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell align="right">
                        ${((item.price * item.quantity) - (item.discount || 0)).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {sale.returnInfo && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, borderLeft: '4px solid', borderColor: 'warning.main' }}>
              <Typography variant="subtitle1" gutterBottom>
                Información de devolución
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Fecha:</strong> {formatDate(sale.returnInfo.date)}
                </Typography>
                <Typography variant="body2">
                  <strong>Motivo:</strong> {sale.returnInfo.reason}
                </Typography>
                <Typography variant="body2">
                  <strong>Procesado por:</strong> {sale.returnInfo.processedBy || 'No especificado'}
                </Typography>
              </Box>
              
              <Typography variant="subtitle2" gutterBottom>
                Productos devueltos
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Monto</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sale.returnInfo.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">${item.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} align="right">
                        <Typography variant="subtitle2">Total devuelto:</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2">${sale.returnInfo.totalAmount.toFixed(2)}</Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}
        
        {sale.notes && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Notas
              </Typography>
              <Typography variant="body2">
                {sale.notes}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default SaleDetails;