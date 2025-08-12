"use client"

import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
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
} from "@mui/material"
import { createSupplier, updateSupplier } from "../../features/suppliers/suppliersSlice"

const SupplierForm = ({ supplier = null, onClose, loading = false, error = null }) => {
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    status: "active",
  })

  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || "",
        contact_person: supplier.contact_person || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        city: supplier.city || "",
        country: supplier.country || "",
        status: supplier.status || "active",
      })
    }
  }, [supplier])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = "El nombre es requerido"
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "El email no es válido"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      if (supplier) {
        await dispatch(updateSupplier({ id: supplier.id, supplierData: formData })).unwrap()
      } else {
        await dispatch(createSupplier(formData)).unwrap()
      }
      onClose()
    } catch (err) {
      console.error("Error al guardar proveedor:", err)
    }
  }

  return (
    <Paper elevation={0} sx={{ p: 0 }}>
      <form onSubmit={handleSubmit}>
  <Grid container spacing={3}>
          <Grid sx={{ gridColumn: { xs: 'span 12' } }}>
            <Typography variant="h6" gutterBottom>
              Información Básica
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <label htmlFor="supplier-name">Nombre del Proveedor</label>
            <TextField
              fullWidth
              name="name"
              id="supplier-name"
              value={formData.name}
              onChange={handleChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              required
            />
          </Grid>

          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <label htmlFor="supplier-contact-person">Persona de Contacto</label>
            <TextField
              fullWidth
              name="contact_person"
              id="supplier-contact-person"
              value={formData.contact_person}
              onChange={handleChange}
            />
          </Grid>

          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <label htmlFor="supplier-email">Email</label>
            <TextField
              fullWidth
              name="email"
              id="supplier-email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
          </Grid>

          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <label htmlFor="supplier-phone">Teléfono</label>
            <TextField fullWidth name="phone" id="supplier-phone" value={formData.phone} onChange={handleChange} />
          </Grid>

          <Grid sx={{ gridColumn: { xs: 'span 12' } }}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Dirección
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid sx={{ gridColumn: { xs: 'span 12' } }}>
            <label htmlFor="supplier-address">Dirección</label>
            <TextField
              fullWidth
              name="address"
              id="supplier-address"
              multiline
              rows={3}
              value={formData.address}
              onChange={handleChange}
            />
          </Grid>

          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <label htmlFor="supplier-city">Ciudad</label>
            <TextField fullWidth name="city" id="supplier-city" value={formData.city} onChange={handleChange} />
          </Grid>

          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <label htmlFor="supplier-country">País</label>
            <TextField fullWidth name="country" id="supplier-country" value={formData.country} onChange={handleChange} />
          </Grid>

          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <FormControl fullWidth>
              <InputLabel htmlFor="supplier-status">Estado</InputLabel>
              <Select name="status" id="supplier-status" value={formData.status} onChange={handleChange} label="Estado">
                <MenuItem value="active">Activo</MenuItem>
                <MenuItem value="inactive">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid sx={{ gridColumn: { xs: 'span 12' } }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
              <Button variant="outlined" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "Guardando..." : supplier ? "Actualizar" : "Crear"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  )
}

export default SupplierForm
