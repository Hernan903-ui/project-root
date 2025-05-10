import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Divider,
  Box,
  CircularProgress,
  Chip,
  FormControlLabel,
  Switch,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  Alert
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Warning as WarningIcon, 
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { es } from 'date-fns/locale';
import { receiveInventory } from '../../features/suppliers/suppliersSlice';

const ReceiveInventory = ({ 
  purchaseOrder, 
  onReceive, 
  onCancel, 
  loading, 
  error 
}) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    orderId: '',
    receivedDate: new Date(),
    receivedItems: [],
    notes: '',
    allItemsReceived: false,
    documentNumber: ''
  });
  const [completeItems, setCompleteItems] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (purchaseOrder) {
      const initialItems = purchaseOrder.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        orderedQuantity: item.quantity,
        receivedQuantity: 0,
        unitPrice: item.unitPrice,
        isComplete: false,
        notes: ''
      }));

      setFormData({
        orderId: purchaseOrder.id,
        receivedDate: new Date(),
        receivedItems: initialItems,
        notes: '',
        allItemsReceived: false,
        documentNumber: ''
      });
    }
  }, [purchaseOrder]);

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      receivedDate: date
    });
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.receivedItems];
    
    if (field === 'receivedQuantity') {
      const parsedValue = parseInt(value);
      if (isNaN(parsedValue) || parsedValue < 0) return;

      updatedItems[index].receivedQuantity = parsedValue;
      updatedItems[index].isComplete = 
        parsedValue === updatedItems[index].orderedQuantity;
    } else {
      updatedItems[index][field] = value;
    }

    setFormData({
      ...formData,
      receivedItems: updatedItems
    });

    // Check if all items are complete
    const allComplete = updatedItems.every(item => 
      item.receivedQuantity === item.orderedQuantity
    );

    setFormData(prev => ({
      ...prev,
      allItemsReceived: allComplete
    }));
  };

  const markAllItemsComplete = () => {
    const updatedItems = formData.receivedItems.map(item => ({
      ...item,
      receivedQuantity: item.orderedQuantity,
      isComplete: true
    }));

    setFormData({
      ...formData,
      receivedItems: updatedItems,
      allItemsReceived: true
    });
  };

  const validateForm = () => {
    if (!formData.receivedDate) {
      setFormError('La fecha de recepción es requerida');
      return false;
    }

    if (formData.receivedItems.every(item => item.receivedQuantity === 0)) {
      setFormError('Debe recibir al menos un producto');
      return false;
    }

    setFormError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  const confirmReceive = () => {
    setShowConfirmation(false);
    
    const receivedData = {
      orderId: formData.orderId,
      receivedDate: formData.receivedDate,
      receivedItems: formData.receivedItems.filter(item => item.receivedQuantity > 0),
      notes: formData.notes,
      documentNumber: formData.documentNumber,
      allItemsReceived: formData.allItemsReceived
    };
    
    dispatch(receiveInventory({
      orderId: formData.orderId,
      receivedItems: receivedData
    }))
      .unwrap()
      .then(result => {
        onReceive(result);
      })
      .catch(error => {
        console.error('Error receiving inventory:', error);
      });
  };

  const getStatusChip = (item) => {
    if (item.receivedQuantity === 0) {
      return <Chip label="Pendiente" color="warning" size="small" />;
    } else if (item.receivedQuantity < item.orderedQuantity) {
      return <Chip label="Parcial" color="info" size="small" />;
    } else {
      return <Chip label="Completo" color="success" size="small" />;
    }
  };

  if (!purchaseOrder) return null;

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Recepción de Mercancía
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1">
            Orden de Compra: #{purchaseOrder.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Proveedor: {purchaseOrder.supplierName}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha de Recepción"
                value={formData.receivedDate}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField {...params} required fullWidth />
                )}
                format="dd/MM/yyyy"
              />
            </LocalizationProvider>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Número de Documento/Factura"
            name="documentNumber"
            value={formData.documentNumber}
            onChange={handleInputChange}
            placeholder="Ingrese número de factura o albarán"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={markAllItemsComplete}
              sx={{ mr: 2 }}
            >
              Marcar Todo como Recibido
            </Button>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.allItemsReceived}
                  onChange={handleInputChange}
                  name="allItemsReceived"
                  color="primary"
                  disabled={!formData.receivedItems.every(item => item.isComplete)}
                />
              }
              label="Orden Completa"
            />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Cantidad Ordenada</TableCell>
                  <TableCell align="right">Cantidad Recibida</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell>Notas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.receivedItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell align="right">{item.orderedQuantity}</TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        size="small"
                        value={item.receivedQuantity}
                        onChange={(e) => 
                          handleItemChange(index, 'receivedQuantity', e.target.value)
                        }
                        InputProps={{ 
                          inputProps: { 
                            min: 0, 
                            max: item.orderedQuantity 
                          } 
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {getStatusChip(item)}
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        placeholder="Observaciones"
                        value={item.notes}
                        onChange={(e) => 
                          handleItemChange(index, 'notes', e.target.value)
                        }
                        fullWidth
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Notas generales de recepción"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            multiline
            rows={2}
          />
        </Grid>

        {formError && (
          <Grid item xs={12}>
            <Alert severity="error">{formError}</Alert>
          </Grid>
        )}

        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={loading}
              startIcon={<CloseIcon />}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
            >
              Guardar Recepción
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Diálogo de confirmación */}
      <Dialog
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
      >
        <DialogTitle>Confirmar Recepción</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {formData.allItemsReceived 
              ? 'Va a confirmar la recepción completa de todos los productos de esta orden.'
              : 'Va a confirmar la recepción parcial de esta orden. Los productos no recibidos quedarán pendientes.'}
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            Esta acción afectará al inventario y no se puede deshacer. ¿Está seguro de continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmation(false)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={confirmReceive} color="primary" autoFocus>
            Confirmar Recepción
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ReceiveInventory;