import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Collapse,
  IconButton,
  InputAdornment,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';

const MovementsFilters = ({ onFilter }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    product_search: '',
    movement_type: '',
    start_date: null,
    end_date: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleDateChange = (name, date) => {
    setFilters({ ...filters, [name]: date });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Formatear fechas para la API si están presentes
    const formattedFilters = {
      ...filters,
      start_date: filters.start_date ? format(filters.start_date, 'yyyy-MM-dd') : null,
      end_date: filters.end_date ? format(filters.end_date, 'yyyy-MM-dd') : null,
    };
    
    onFilter(formattedFilters);
  };

  const handleClear = () => {
    const resetFilters = {
      product_search: '',
      movement_type: '',
      start_date: null,
      end_date: null,
    };
    setFilters(resetFilters);
    onFilter(resetFilters);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              name="product_search"
              placeholder="Buscar por producto..."
              value={filters.product_search}
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
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="movement-type-label">Tipo de Movimiento</InputLabel>
                  <Select
                    labelId="movement-type-label"
                    id="movement_type"
                    name="movement_type"
                    value={filters.movement_type}
                    onChange={handleChange}
                    label="Tipo de Movimiento"
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="purchase">Compra</MenuItem>
                    <MenuItem value="sale">Venta</MenuItem>
                    <MenuItem value="adjustment">Ajuste</MenuItem>
                    <MenuItem value="return">Devolución</MenuItem>
                    <MenuItem value="initial">Inicial</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Fecha Inicio"
                  value={filters.start_date}
                  onChange={(date) => handleDateChange('start_date', date)}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth size="small" />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Fecha Fin"
                  value={filters.end_date}
                  onChange={(date) => handleDateChange('end_date', date)}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth size="small" />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Box>
    </LocalizationProvider>
  );
};

export default MovementsFilters;