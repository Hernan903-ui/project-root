// components/sales/SalesFilters.js
import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Paper
} from '@mui/material';
import { Grid } from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';
import DateRangeSelector from '../reports/DateRangeSelector';

const SalesFilters = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateFrom: null,
    dateTo: null,
    paymentMethod: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleReset = () => {
    setFilters({
      search: '',
      status: '',
      dateFrom: null,
      dateTo: null,
      paymentMethod: ''
    });
    onFilter({});
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2, mb: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          <Grid gridColumn={{ xs: 'span 12', md: 'span 6' }}>
            <TextField
              fullWidth
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Buscar por número de orden o cliente"
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
            <InputLabel id="status-label">Estado</InputLabel>
            <Select
              labelId="status-label"
              name="status"
              value={filters.status}
              onChange={handleChange}
              label="Estado"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="completed">Completado</MenuItem>
              <MenuItem value="pending">Pendiente</MenuItem>
              <MenuItem value="cancelled">Cancelado</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid gridColumn={{ xs: 'span 12', sm: 'span 6', md: 'span 3' }}>
          <FormControl fullWidth>
            <InputLabel id="payment-method-label">Método de Pago</InputLabel>
            <Select
              labelId="payment-method-label"
              name="paymentMethod"
              value={filters.paymentMethod}
              onChange={handleChange}
              label="Método de Pago"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="cash">Efectivo</MenuItem>
              <MenuItem value="credit_card">Tarjeta de Crédito</MenuItem>
              <MenuItem value="debit_card">Tarjeta de Débito</MenuItem>
              <MenuItem value="transfer">Transferencia</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid gridColumn={{ xs: 'span 12', sm: 'span 12', md: 'span 6' }}>
          <DateRangeSelector 
            startDate={filters.dateFrom}
            endDate={filters.dateTo}
            onStartDateChange={(date) => handleDateChange('dateFrom', date)}
            onEndDateChange={(date) => handleDateChange('dateTo', date)}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SalesFilters;