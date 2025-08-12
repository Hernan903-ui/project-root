"use client"

import { useState } from "react"
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Paper,
  Collapse,
  IconButton,
  Typography,
} from "@mui/material"
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material"

const SupplierFilters = ({ onFilterChange, initialFilters = {} }) => {
  const [expanded, setExpanded] = useState(false)
  const [filters, setFilters] = useState({
    name: "",
    status: "",
    city: "",
    country: "",
    ...initialFilters,
  })

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      name: "",
      status: "",
      city: "",
      country: "",
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== "")

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <FilterIcon sx={{ mr: 1 }} />
          <Typography variant="subtitle1">Filtros</Typography>
          {hasActiveFilters && (
            <Typography variant="caption" color="primary" sx={{ ml: 1 }}>
              (Activos)
            </Typography>
          )}
        </Box>
        <Box>
          {hasActiveFilters && (
            <Button size="small" startIcon={<ClearIcon />} onClick={handleClearFilters} sx={{ mr: 1 }}>
              Limpiar
            </Button>
          )}
          <IconButton onClick={() => setExpanded(!expanded)} size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Buscar por nombre"
                variant="outlined"
                size="small"
                value={filters.name}
                onChange={(e) => handleFilterChange("name", e.target.value)}
                placeholder="Nombre del proveedor..."
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="active">Activo</MenuItem>
                  <MenuItem value="inactive">Inactivo</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Ciudad"
                variant="outlined"
                size="small"
                value={filters.city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
                placeholder="Ciudad..."
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="País"
                variant="outlined"
                size="small"
                value={filters.country}
                onChange={(e) => handleFilterChange("country", e.target.value)}
                placeholder="País..."
              />
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  )
}

export default SupplierFilters
