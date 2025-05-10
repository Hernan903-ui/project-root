import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Divider,
  CircularProgress,
  Autocomplete,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { fetchSuppliers } from '../../features/suppliers/suppliersSlice';

const initialItem = {
  productId: '',
  productName: '',
  quantity: 1,
  unitPrice: 0,
  tax: 0,
  discount: 0,
  total: 0
};

const PurchaseOrderForm = ({ 
  initialData, 
  onSubmit, 
  loading, 
  error,
  onCancel,
  initialSupplierId 
}) => {
  const dispatch = useDispatch();
  const { suppliers } = useSelector((state) => state.suppliers);
  const { products } = useSelector((state) => state.products);

  const [formData, setFormData] = useState({
    supplierId: '',
    supplierName: '',
    orderDate: new Date(),
    expectedDeliveryDate: null,
    status: 'draft',
    notes: '',
    items: [{ ...initialItem }],
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    total: 0,
    paymentTerms: '',
    shippingCost: 0
  });

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        orderDate: initialData.orderDate ? new Date(initialData.orderDate) : new Date(),
        expectedDeliveryDate: initialData.expectedDeliveryDate ? new Date(initialData.expectedDeliveryDate) : null,
        items: initialData.items?.length > 0 ? initialData.items : [{ ...initialItem }]
      });
      
      if (initialData.supplierId) {
        const supplier = suppliers.find(s => s.id === initialData.supplierId);
        setSelectedSupplier(supplier || null);
      }
    } else if (initialSupplierId) {
      const supplier = suppliers.find(s => s.id === initialSupplierId);
      if (supplier) {
        setSelectedSupplier(supplier);
        setFormData({
          ...formData,
          supplierId: supplier.id,
          supplierName: supplier.name,
          paymentTerms: supplier.paymentTerms || ''
        });
      }
    }
  }, [initialData, suppliers, initialSupplierId]);

  useEffect(() => {
    // Recalcular totales cada vez que cambian los items
    calculateTotals();
  }, [formData.items, formData.shippingCost]);

  const calculateTotals = () => {
    const items = [...formData.items];
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    items.forEach(item => {
      const itemTotal = item.quantity * item.unitPrice;
      const itemTaxAmount = itemTotal * (item.tax / 100);
      const itemDiscountAmount = itemTotal * (item.discount / 100);

      item.total = itemTotal + itemTaxAmount - itemDiscountAmount;
      
      subtotal += itemTotal;
      taxAmount += itemTaxAmount;
      discountAmount += itemDiscountAmount;
    });

    const total = subtotal + taxAmount - discountAmount + parseFloat(formData.shippingCost || 0);

    setFormData(prev => ({
      ...prev,
      items,
      subtotal,
      taxAmount,
      discountAmount,
      total
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const handleDateChange = (date, name) => {
    setFormData({
      ...formData,
      [name]: date
    });
  };

  const handleSupplierChange = (event, newValue) => {
    setSelectedSupplier(newValue);
    if (newValue) {
      setFormData({
        ...formData,
        supplierId: newValue.id,
        supplierName: newValue.name,
        paymentTerms: newValue.paymentTerms || ''
      });
    } else {
      setFormData({
        ...formData,
        supplierId: '',
        supplierName: '',
        paymentTerms: ''
      });
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { ...initialItem }]
    });
  };

  const handleRemoveItem = (index) => {
    const items = [...formData.items];
    items.splice(index, 1);
    setFormData({
      ...formData,
      items: items.length ? items : [{ ...initialItem }]
    });
  };

  const handleItemChange = (index, field, value) => {
    const items = [...formData.items];
    items[index] = {
      ...items[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      items
    });
  };

  const openProductSelection = (index) => {
    setCurrentItemIndex(index);
    setProductSearchTerm('');
    setFilteredProducts(products || []);
    setOpenProductDialog(true);
  };

  const handleProductSearch = (e) => {
    const searchTerm = e.target.value;
    setProductSearchTerm(searchTerm);
    
    if (!searchTerm.trim()) {
      setFilteredProducts(products || []);
      return;
    }
    
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredProducts(filtered);
  };

  const selectProduct = (product) => {
    const items = [...formData.items];
    items[currentItemIndex] = {
      ...items[currentItemIndex],
      productId: product.id,
      productName: product.name,
      unitPrice: product.purchasePrice || product.price || 0,
      quantity: 1,
      tax: product.taxRate || 0,
      discount: 0,
      total: product.purchasePrice || product.price || 0
    };
    
    setFormData({
      ...formData,
      items
    });
    
    setOpenProductDialog(false);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.supplierId) {
      errors.supplierId = 'Se requiere seleccionar un proveedor';
    }
    
    if (!formData.orderDate) {
      errors.orderDate = 'La fecha de orden es requerida';
    }
    
    let hasValidItems = true;
    formData.items.forEach((item, index) => {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        hasValidItems = false;
      }
    });
    
    if (!hasValidItems) {
      errors.items = 'Todos los productos deben tener un ID, nombre y cantidad válida';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {initialData ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Autocomplete
            id="supplier-select"
            options={suppliers || []}
            getOptionLabel={(option) => option.name}
            value={selectedSupplier}
            onChange={handleSupplierChange}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Proveedor"
                required
                error={!!formErrors.supplierId}
                helperText={formErrors.supplierId}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <DatePicker
              label="Fecha de Orden"
              value={formData.orderDate}
              onChange={(date) => handleDateChange(date, 'orderDate')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  required
                  error={!!formErrors.orderDate}
                  helperText={formErrors.orderDate}
                />
              )}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} md={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <DatePicker
              label="Fecha Estimada de Entrega"
              value={formData.expectedDeliveryDate}
              onChange={(date) => handleDateChange(date, 'expectedDeliveryDate')}
              renderInput={(params) => (
                <TextField {...params} fullWidth />
              )}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="status-label">Estado</InputLabel>
            <Select
              labelId="status-label"
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Estado"
            >
              <MenuItem value="draft">Borrador</MenuItem>
              <MenuItem value="pending">Pendiente</MenuItem>
              <MenuItem value="confirmed">Confirmada</MenuItem>
              <MenuItem value="received">Recibida</MenuItem>
              <MenuItem value="cancelled">Cancelada</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Términos de Pago"
            name="paymentTerms"
            value={formData.paymentTerms}
            onChange={handleChange}
            placeholder="Ej: 30 días, Contado, etc."
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Productos
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12}>
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
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        value={item.productName}
                        onClick={() => openProductSelection(index)}
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                edge="end"
                                onClick={() => openProductSelection(index)}
                                size="small"
                              >
                                <SearchIcon />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        placeholder="Seleccionar producto"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        size="small"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', Math.max(1, parseInt(e.target.value) || 0))}
                        InputProps={{ inputProps: { min: 1 } }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        size="small"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        size="small"
                        value={item.tax}
                        onChange={(e) => handleItemChange(index, 'tax', parseFloat(e.target.value) || 0)}
                        InputProps={{ inputProps: { min: 0, max: 100, step: 0.01 } }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        size="small"
                        value={item.discount}
                        onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                        InputProps={{ inputProps: { min: 0, max: 100, step: 0.01 } }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {item.total.toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveItem(index)}
                        disabled={formData.items.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
            >
              Agregar Producto
            </Button>

            {formErrors.items && (
              <Typography color="error" variant="caption">
                {formErrors.items}
              </Typography>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Notas"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            multiline
            rows={4}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Resumen de la Orden
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2">Subtotal:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" align="right">
                  {formData.subtotal.toFixed(2)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2">Impuestos:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" align="right">
                  {formData.taxAmount.toFixed(2)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2">Descuentos:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" align="right">
                  {formData.discountAmount.toFixed(2)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2">Costo de Envío:</Typography>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  type="number"
                  size="small"
                  value={formData.shippingCost}
                  name="shippingCost"
                  onChange={handleChange}
                  InputProps={{ 
                    inputProps: { min: 0, step: 0.01 },
                    sx: { textAlign: 'right' }
                  }}
                />
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
                  {formData.total.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Typography color="error">{error}</Typography>
          </Grid>
        )}

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
              disabled={loading}
            >
              {initialData ? 'Actualizar' : 'Guardar'}
            </Button>
          </Box>
        </Grid>
      </Grid>

            {/* Diálogo para selección de productos */}
      <Dialog open={openProductDialog} onClose={() => setOpenProductDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Seleccionar Producto</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Buscar por nombre, SKU o código de barras"
            type="text"
            fullWidth
            variant="outlined"
            value={productSearchTerm}
            onChange={handleProductSearch}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell align="right">Precio de Compra</TableCell>
                  <TableCell align="right">Stock Actual</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No se encontraron productos. Intente con otra búsqueda.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.sku || 'N/A'}</TableCell>
                      <TableCell align="right">
                        {(product.purchasePrice || product.price || 0).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {product.stockQuantity || 0}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() => selectProduct(product)}
                        >
                          Seleccionar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProductDialog(false)} color="inherit">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PurchaseOrderForm;