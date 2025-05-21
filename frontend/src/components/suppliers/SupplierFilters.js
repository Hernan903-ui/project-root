import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

const SupplierFilters = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    category: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      status: 'all',
      category: ''
    };
    setFilters(resetFilters);
    onFilter(resetFilters);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Actualizado a Grid v2 */}
        <Grid gridColumn={{ xs: "span 12", sm: "span 4", md: "span 3" }}>
          <TextField
            fullWidth
            name="search"
            label="Buscar proveedor"
            variant="outlined"
            size="small"
            value={filters.search}
            onChange={handleInputChange}
            placeholder="Nombre, contacto, email..."
            InputProps={{
              endAdornment: filters.search && (
                <Tooltip title="Limpiar búsqueda">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setFilters({...filters, search: ''});
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )
            }}
          />
        </Grid>
        {/* Actualizado a Grid v2 */}
        <Grid gridColumn={{ xs: "span 12", sm: "span 4", md: "span 2" }}>
          <FormControl fullWidth size="small">
            <InputLabel id="status-select-label">Estado</InputLabel>
            <Select
              labelId="status-select-label"
              id="status-select"
              name="status"
              value={filters.status}
              label="Estado"
              onChange={handleInputChange}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="active">Activos</MenuItem>
              <MenuItem value="inactive">Inactivos</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {/* Actualizado a Grid v2 */}
        <Grid gridColumn={{ xs: "span 12", sm: "span 4", md: "span 3" }}>
          <FormControl fullWidth size="small">
            <InputLabel id="category-select-label">Categoría</InputLabel>
            <Select
              labelId="category-select-label"
              id="category-select"
              name="category"
              value={filters.category}
              label="Categoría"
              onChange={handleInputChange}
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="electronics">Electrónica</MenuItem>
              <MenuItem value="food">Alimentos</MenuItem>
              <MenuItem value="clothing">Ropa</MenuItem>
              <MenuItem value="services">Servicios</MenuItem>
              <MenuItem value="other">Otros</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {/* Actualizado a Grid v2 */}
        <Grid gridColumn={{ xs: "span 12", sm: "span 4", md: "span 4" }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SearchIcon />}
            >
              Filtrar
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              startIcon={<ClearIcon />}
            >
              Limpiar
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SupplierFilters;