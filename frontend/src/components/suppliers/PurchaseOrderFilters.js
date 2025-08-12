"use client"

import { useState } from "react"
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  Paper,
  Collapse,
  IconButton,
  Typography,
} from "@mui/material"
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { es } from "date-fns/locale"

const PurchaseOrderFilters = ({ onFilter = () => {} }) => {
  const [expanded, setExpanded] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    supplier: "",
    dateFrom: null,
    dateTo: null,
    minAmount: "",
    maxAmount: "",
  })

  const statusOptions = [
    { value: "", label: "Todos los estados" },
    { value: "draft", label: "Borrador" },
    { value: "pending", label: "Pendiente" },
    { value: "confirmed", label: "Confirmada" },
    { value: "received", label: "Recibida" },
    { value: "cancelled", label: "Cancelada" },
  ]

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value }
    setFilters(newFilters)
  }

  const handleApplyFilters = () => {
    // Filtrar valores vacíos antes de enviar
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        acc[key] = value
      }
      return acc
    }, {})

    onFilter(activeFilters)
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      search: "",
      status: "",
      supplier: "",
      dateFrom: null,
      dateTo: null,
      minAmount: "",
      maxAmount: "",
    }
    setFilters(clearedFilters)
    onFilter({})
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6">Filtros</Typography>
          <IconButton onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        {/* Filtros básicos - siempre visibles */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Buscar por número de orden"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filters.status}
                label="Estado"
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="contained" onClick={handleApplyFilters} startIcon={<SearchIcon />} sx={{ flexGrow: 1 }}>
                Filtrar
              </Button>
              <Button variant="outlined" onClick={handleClearFilters} startIcon={<ClearIcon />}>
                Limpiar
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Filtros avanzados - colapsables */}
        <Collapse in={expanded}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Proveedor"
                value={filters.supplier}
                onChange={(e) => handleFilterChange("supplier", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <DatePicker
                label="Fecha desde"
                value={filters.dateFrom}
                onChange={(date) => handleFilterChange("dateFrom", date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <DatePicker
                label="Fecha hasta"
                value={filters.dateTo}
                onChange={(date) => handleFilterChange("dateTo", date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Monto mínimo"
                type="number"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange("minAmount", e.target.value)}
                InputProps={{
                  startAdornment: "$",
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Monto máximo"
                type="number"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
                InputProps={{
                  startAdornment: "$",
                }}
              />
            </Grid>
          </Grid>
        </Collapse>
      </Paper>
    </LocalizationProvider>
  )
}

export default PurchaseOrderFilters
