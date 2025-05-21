import React, { useState } from 'react';
import {
  Box,
  TextField,
  Grid,
  InputAdornment,
  IconButton,
  MenuItem,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

const CustomerFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    city: '',
    state: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = {
      ...filters,
      [name]: value
    };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleClearSearch = () => {
    const updatedFilters = {
      ...filters,
      search: ''
    };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleClearAll = () => {
    const resetFilters = {
      search: '',
      type: '',
      city: '',
      state: ''
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Contenedor principal */}
      <Grid container spacing={2} alignItems="center">
        {/* Actualizado a sintaxis Grid v2 */}
        <Grid gridColumn={{ xs: "span 12", sm: "span 6", md: "span 4" }}>
          <TextField
            fullWidth
            name="search"
            label="Buscar clientes"
            value={filters.search}
            onChange={handleChange}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: filters.search && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            placeholder="Nombre, email, documento..."
          />
        </Grid>
        
        {/* Actualizado a sintaxis Grid v2 */}
        <Grid gridColumn={{ xs: "span 12", sm: "span 6", md: "span 2" }}>
          <TextField
            fullWidth
            select
            name="type"
            label="Tipo"
            value={filters.type}
            onChange={handleChange}
            variant="outlined"
            size="small"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="individual">Individual</MenuItem>
            <MenuItem value="business">Empresa</MenuItem>
          </TextField>
        </Grid>
        
        {/* Actualizado a sintaxis Grid v2 */}
        <Grid gridColumn={{ xs: "span 12", sm: "span 6", md: "span 3" }}>
          <TextField
            fullWidth
            name="city"
            label="Ciudad"
            value={filters.city}
            onChange={handleChange}
            variant="outlined"
            size="small"
            placeholder="Filtrar por ciudad"
          />
        </Grid>
        
        {/* Actualizado a sintaxis Grid v2 */}
        <Grid gridColumn={{ xs: "span 12", sm: "span 6", md: "span 3" }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              name="state"
              label="Provincia/Estado"
              value={filters.state}
              onChange={handleChange}
              variant="outlined"
              size="small"
              placeholder="Filtrar por provincia"
            />
            
            {(filters.search || filters.type || filters.city || filters.state) && (
              <Button
                size="small"
                onClick={handleClearAll}
                variant="outlined"
              >
                Limpiar
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerFilters;