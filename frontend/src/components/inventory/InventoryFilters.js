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
  Typography
} from '@mui/material';
import { FilterAlt as FilterIcon, Clear as ClearIcon } from '@mui/icons-material';

const InventoryFilters = ({ filters, onFilterChange, categories = [] }) => {
  const [localFilters, setLocalFilters] = useState({
    category: filters.category || '',
    minStock: filters.minStock || '',
    maxStock: filters.maxStock || '',
    status: filters.status || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters({
      ...localFilters,
      [name]: value
    });
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      category: '',
      minStock: '',
      maxStock: '',
      status: ''
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <Box sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
      <Typography variant="subtitle1" gutterBottom>
        Filtros Avanzados
      </Typography>
      <Grid container spacing={2} alignItems="center">
        {/* Actualizado a Grid v2 */}
        <Grid gridColumn={{ xs: "span 12", sm: "span 3" }}>
          <FormControl fullWidth size="small">
            <InputLabel id="category-filter-label">Categoría</InputLabel>
            <Select
              labelId="category-filter-label"
              id="category-filter"
              name="category"
              value={localFilters.category}
              onChange={handleChange}
              label="Categoría"
            >
              <MenuItem value="">Todas</MenuItem>
              {categories.map((category, index) => (
                <MenuItem key={index} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        {/* Actualizado a Grid v2 */}
        <Grid gridColumn={{ xs: "span 12", sm: "span 2" }}>
          <TextField
            fullWidth
            label="Stock Mínimo"
            name="minStock"
            value={localFilters.minStock}
            onChange={handleChange}
            type="number"
            size="small"
          />
        </Grid>
        
        {/* Actualizado a Grid v2 */}
        <Grid gridColumn={{ xs: "span 12", sm: "span 2" }}>
          <TextField
            fullWidth
            label="Stock Máximo"
            name="maxStock"
            value={localFilters.maxStock}
            onChange={handleChange}
            type="number"
            size="small"
          />
        </Grid>
        
        {/* Actualizado a Grid v2 */}
        <Grid gridColumn={{ xs: "span 12", sm: "span 3" }}>
          <FormControl fullWidth size="small">
            <InputLabel id="status-filter-label">Estado</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              name="status"
              value={localFilters.status}
              onChange={handleChange}
              label="Estado"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="En Stock">En Stock</MenuItem>
              <MenuItem value="Bajo Stock">Bajo Stock</MenuItem>
              <MenuItem value="Agotado">Agotado</MenuItem>
              <MenuItem value="Discontinuado">Discontinuado</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        {/* Actualizado a Grid v2 */}
        <Grid gridColumn={{ xs: "span 12", sm: "span 2" }} sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleApplyFilters}
            startIcon={<FilterIcon />}
            size="small"
          >
            Aplicar
          </Button>
          <Button
            variant="outlined"
            onClick={handleResetFilters}
            startIcon={<ClearIcon />}
            size="small"
          >
            Limpiar
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InventoryFilters;