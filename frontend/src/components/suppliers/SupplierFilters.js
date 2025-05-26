import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button,
  Grid
} from '@mui/material';

const SupplierFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    city: '',
    country: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleClear = () => {
    const clearedFilters = {
      search: '',
      status: '',
      city: '',
      country: ''
    };
    setFilters(clearedFilters);
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            name="search"
            label="Buscar"
            variant="outlined"
            size="small"
            fullWidth
            value={filters.search}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Estado</InputLabel>
            <Select
              name="status"
              value={filters.status}
              onChange={handleChange}
              label="Estado"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="active">Activo</MenuItem>
              <MenuItem value="inactive">Inactivo</MenuItem>
              <MenuItem value="suspended">Suspendido</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            name="city"
            label="Ciudad"
            variant="outlined"
            size="small"
            fullWidth
            value={filters.city}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            name="country"
            label="País"
            variant="outlined"
            size="small"
            fullWidth
            value={filters.country}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
      {(filters.search || filters.status || filters.city || filters.country) && (
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            size="small" 
            onClick={handleClear}
            variant="text"
          >
            Limpiar filtros
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default SupplierFilters;