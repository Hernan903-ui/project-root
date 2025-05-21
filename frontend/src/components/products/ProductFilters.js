// components/products/ProductFilters.js
import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Select, 
  MenuItem, 
  InputLabel, 
  FormControl, 
  Button,
  Paper
} from '@mui/material';
import { Grid } from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';

const ProductFilters = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    priceMin: '',
    priceMax: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleReset = () => {
    setFilters({
      search: '',
      category: '',
      status: '',
      priceMin: '',
      priceMax: ''
    });
    onFilter({});
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2, mb: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          {/* Al usar gridColumn podemos definir explícitamente el ancho para Grid v2 */}
          <Grid gridColumn={{ xs: 'span 12', md: 'span 6' }}>
            <TextField
              fullWidth
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Buscar productos..."
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              }}
            />
          </Grid>
          
          <Grid gridColumn={{ xs: 'span 12', md: 'span 6' }}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                startIcon={<FilterIcon />}
                type="submit"
              >
                Filtrar
              </Button>
              <Button 
                variant="text" 
                onClick={handleReset}
              >
                Limpiar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={2}>
        <Grid gridColumn={{ xs: 'span 12', sm: 'span 6', md: 'span 3' }}>
          <FormControl fullWidth>
            <InputLabel id="category-label">Categoría</InputLabel>
            <Select
              labelId="category-label"
              name="category"
              value={filters.category}
              onChange={handleChange}
              label="Categoría"
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="electronics">Electrónica</MenuItem>
              <MenuItem value="clothing">Ropa</MenuItem>
              <MenuItem value="groceries">Alimentos</MenuItem>
              <MenuItem value="home">Hogar</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid gridColumn={{ xs: 'span 12', sm: 'span 6', md: 'span 3' }}>
          <FormControl fullWidth>
            <InputLabel id="status-label">Estado</InputLabel>
            <Select
              labelId="status-label"
              name="status"
              value={filters.status}
              onChange={handleChange}
              label="Estado"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="active">Activo</MenuItem>
              <MenuItem value="inactive">Inactivo</MenuItem>
              <MenuItem value="out_of_stock">Sin Stock</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid gridColumn={{ xs: 'span 12', sm: 'span 6', md: 'span 3' }}>
          <TextField
            fullWidth
            name="priceMin"
            label="Precio Min"
            type="number"
            value={filters.priceMin}
            onChange={handleChange}
            inputProps={{ min: 0 }}
          />
        </Grid>
        
        <Grid gridColumn={{ xs: 'span 12', sm: 'span 6', md: 'span 3' }}>
          <TextField
            fullWidth
            name="priceMax"
            label="Precio Max"
            type="number"
            value={filters.priceMax}
            onChange={handleChange}
            inputProps={{ min: 0 }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ProductFilters;