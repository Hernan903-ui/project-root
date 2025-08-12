"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
} from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { es } from "date-fns/locale"
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material"
import { fetchSuppliers } from "../../features/suppliers/suppliersSlice"

const PurchaseOrderForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  initialSupplierId = "",
}) => {
  const dispatch = useDispatch()
  const { suppliers } = useSelector((state) => state.suppliers)

  const [formData, setFormData] = useState({
    supplier_id: initialSupplierId || "",
    order_date: new Date(),
    expected_delivery_date: null,
    status: "pending",
    payment_terms: "",
    shipping_method: "",
    notes: "",
    items: [],
  })

  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    // Cargar proveedores si no están cargados
    if (!suppliers || suppliers.length === 0) {
      dispatch(fetchSuppliers())
    }
  }, [dispatch, suppliers])

  useEffect(() => {
    if (initialData) {
      setFormData({
        supplier_id: initialData.supplier_id || "",
        order_date: initialData.order_date ? new Date(initialData.order_date) : new Date(),
        expected_delivery_date: initialData.expected_delivery_date
          ? new Date(initialData.expected_delivery_date)
          : null,
        status: initialData.status || "pending",
        payment_terms: initialData.payment_terms || "",
        shipping_method: initialData.shipping_method || "",
        notes: initialData.notes || "",
        items: initialData.items || [],
      })
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleDateChange = (name, date) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date,
    }))
  }

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_name: "",
          quantity: 1,
          unit_price: 0,
          subtotal: 0,
        },
      ],
    }))
  }

  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const updateItem = (index, field, value) => {
    setFormData((prev) => {
      const newItems = [...prev.items]
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      }

      // Calcular subtotal automáticamente
      if (field === "quantity" || field === "unit_price") {
        const quantity =
          field === "quantity" ? Number.parseFloat(value) || 0 : Number.parseFloat(newItems[index].quantity) || 0
        const unitPrice =
          field === "unit_price" ? Number.parseFloat(value) || 0 : Number.parseFloat(newItems[index].unit_price) || 0
        newItems[index].subtotal = quantity * unitPrice
      }

      return {
        ...prev,
        items: newItems,
      }
    })
  }

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => total + (item.subtotal || 0), 0)
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.supplier_id) {
      errors.supplier_id = "Debe seleccionar un proveedor"
    }

    if (formData.items.length === 0) {
      errors.items = "Debe agregar al menos un item"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const submitData = {
      ...formData,
      total_amount: calculateTotal(),
      order_date: formData.order_date.toISOString(),
      expected_delivery_date: formData.expected_delivery_date ? formData.expected_delivery_date.toISOString() : null,
    }

    onSubmit(submitData)
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Paper elevation={0} sx={{ p: 0 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Información de la Orden
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.supplier_id}>
                <InputLabel htmlFor="purchase-supplier">Proveedor</InputLabel>
                <Select
                  name="supplier_id"
                  id="purchase-supplier"
                  value={formData.supplier_id}
                  onChange={handleChange}
                  label="Proveedor"
                  required
                >
                  {suppliers?.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.supplier_id && (
                  <Typography variant="caption" color="error">
                    {formErrors.supplier_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel htmlFor="purchase-status">Estado</InputLabel>
                <Select name="status" id="purchase-status" value={formData.status} onChange={handleChange} label="Estado">
                  <MenuItem value="pending">Pendiente</MenuItem>
                  <MenuItem value="approved">Aprobada</MenuItem>
                  <MenuItem value="sent">Enviada</MenuItem>
                  <MenuItem value="received">Recibida</MenuItem>
                  <MenuItem value="cancelled">Cancelada</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <label htmlFor="purchase-order-date">Fecha de Orden</label>
              <DatePicker
                value={formData.order_date}
                onChange={(date) => handleDateChange("order_date", date)}
                renderInput={(params) => <TextField {...params} fullWidth id="purchase-order-date" />}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <label htmlFor="purchase-delivery-date">Fecha de Entrega Esperada</label>
              <DatePicker
                value={formData.expected_delivery_date}
                onChange={(date) => handleDateChange("expected_delivery_date", date)}
                renderInput={(params) => <TextField {...params} fullWidth id="purchase-delivery-date" />}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <label htmlFor="purchase-payment-terms">Términos de Pago</label>
              <TextField
                fullWidth
                name="payment_terms"
                id="purchase-payment-terms"
                value={formData.payment_terms}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <label htmlFor="purchase-shipping-method">Método de Envío</label>
              <TextField
                fullWidth
                name="shipping_method"
                id="purchase-shipping-method"
                value={formData.shipping_method}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <label htmlFor="purchase-notes">Notas</label>
              <TextField
                fullWidth
                name="notes"
                id="purchase-notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Items de la Orden
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {formErrors.items && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {formErrors.items}
                </Alert>
              )}

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell>Cantidad</TableCell>
                      <TableCell>Precio Unitario</TableCell>
                      <TableCell>Subtotal</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <label htmlFor={`purchase-item-product-name-${index}`}>Producto</label>
                          <TextField
                            fullWidth
                            size="small"
                            id={`purchase-item-product-name-${index}`}
                            value={item.product_name}
                            onChange={(e) => updateItem(index, "product_name", e.target.value)}
                            placeholder="Nombre del producto"
                          />
                        </TableCell>
                        <TableCell>
                          <label htmlFor={`purchase-item-quantity-${index}`}>Cantidad</label>
                          <TextField
                            type="number"
                            size="small"
                            id={`purchase-item-quantity-${index}`}
                            value={item.quantity}
                            onChange={(e) => updateItem(index, "quantity", e.target.value)}
                            inputProps={{ min: 1 }}
                          />
                        </TableCell>
                        <TableCell>
                          <label htmlFor={`purchase-item-unit-price-${index}`}>Precio Unitario</label>
                          <TextField
                            type="number"
                            size="small"
                            id={`purchase-item-unit-price-${index}`}
                            value={item.unit_price}
                            onChange={(e) => updateItem(index, "unit_price", e.target.value)}
                            inputProps={{ min: 0, step: 0.01 }}
                          />
                        </TableCell>
                        <TableCell>${item.subtotal?.toFixed(2) || "0.00"}</TableCell>
                        <TableCell>
                          <IconButton color="error" onClick={() => removeItem(index)} size="small">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Button startIcon={<AddIcon />} onClick={addItem} variant="outlined">
                  Agregar Item
                </Button>
                <Typography variant="h6">Total: ${calculateTotal().toFixed(2)}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
                <Button variant="outlined" onClick={onCancel} disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? "Guardando..." : initialData ? "Actualizar" : "Crear Orden"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </LocalizationProvider>
  )
}

export default PurchaseOrderForm
