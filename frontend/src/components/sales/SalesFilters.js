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
  InputAdornment,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';

const SalesFilters = ({ onFilterChange }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: '',
    dateRange: {
      start: null,
      end: null
    },
    status: '',
    customer: ''
  });

  // Opciones para estado de ventas
  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'Completada', label: 'Completada' },
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'Cancelada', label: 'Cancelada' },
    { value: 'Devuelta', label: 'Con devolución' }
  ];

  const handleSearchChange = (e) => {
    const updatedFilters = {
      ...filters,
      searchTerm: e.target.value
    };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleDateChange = (field, value) => {
    const updatedFilters = {
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value
      }
    };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleClearSearch = () => {
    const updatedFilters = {
      ...filters,
      searchTerm: ''
    };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleStatusChange = (e) => {
    const updatedFilters = {
      ...filters,
      status: e.target.value
    };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleCustomerChange = (e) => {
    const updatedFilters = {
      ...filters,
      customer: e.target.value
    };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleClearFilters = () => {
    const resetFilters = {
      searchTerm: '',
      dateRange: {
        start: null,
        end: null
      },
      status: '',
      customer: ''
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const handleToggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar por número de factura o cliente"
            value={filters.searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: filters.searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            size="small"
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Estado</InputLabel>
            <Select
              value={filters.status}
              onChange={handleStatusChange}
              label="Estado"
            >
              {statusOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={showAdvanced ? "contained" : "outlined"}
              onClick={handleToggleAdvanced}
              startIcon={<FilterListIcon />}
              size="small"
            >
              Filtros
            </Button>
            
            {(filters.searchTerm || filters.status || filters.dateRange.start || filters.dateRange.end || filters.customer) && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleClearFilters}
                size="small"
              >
                Limpiar
              </Button>
            )}
          </Box>
        </Grid>
        
        {showAdvanced && (
          <>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Filtros avanzados
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Cliente"
                value={filters.customer}
                onChange={handleCustomerChange}
                placeholder="Nombre del cliente"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DatePicker
                  label="Fecha inicio"
                  value={filters.dateRange.start}
                  onChange={(newValue) => handleDateChange('start', newValue)}
                  renderInput={(params) => 
                    <TextField 
                      {...params} 
                      fullWidth 
                      size="small"
                    />
                  }
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DatePicker
                  label="Fecha fin"
                  value={filters.dateRange.end}
                  onChange={(newValue) => handleDateChange('end', newValue)}
                  renderInput={(params) => 
                    <TextField 
                      {...params} 
                      fullWidth 
                      size="small"
                    />
                  }
                />
              </LocalizationProvider>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default SalesFilters;