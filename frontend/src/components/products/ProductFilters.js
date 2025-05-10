import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  InputAdornment,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Collapse,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { useQuery } from 'react-query';
import { getCategories } from '../../api/productApi';

const ProductFilters = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    is_active: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: categories } = useQuery('categories', getCategories, {
    staleTime: 300000, // 5 minutos
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleClear = () => {
    const resetFilters = {
      search: '',
      category_id: '',
      is_active: '',
    };
    setFilters(resetFilters);
    onFilter(resetFilters);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            name="search"
            placeholder="Buscar productos..."
            value={filters.search}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={8}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              size="small"
            >
              Filtros
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="small"
            >
              Buscar
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClear}
              size="small"
            >
              Limpiar
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Collapse in={showFilters}>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="category-label">Categoría</InputLabel>
                <Select
                  labelId="category-label"
                  id="category_id"
                  name="category_id"
                  value={filters.category_id}
                  onChange={handleChange}
                  label="Categoría"
                >
                  <MenuItem value="">Todas</MenuItem>
                  {categories?.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-label">Estado</InputLabel>
                <Select
                  labelId="status-label"
                  id="is_active"
                  name="is_active"
                  value={filters.is_active}
                  onChange={handleChange}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="true">Activos</MenuItem>
                  <MenuItem value="false">Inactivos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Box>
  );
};

export default ProductFilters;