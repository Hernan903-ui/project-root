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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

const PurchaseOrderFilters = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    dateFrom: null,
    dateTo: null,
    supplierId: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleDateChange = (date, name) => {
    setFilters({
      ...filters,
      [name]: date
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
      dateFrom: null,
      dateTo: null,
      supplierId: ''
    };
    setFilters(resetFilters);
    onFilter(resetFilters);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Actualizado a Grid v2 */}
          <Grid gridColumn={{ xs: "span 12", sm: "span 6", md: "span 3" }}>
            <TextField
              fullWidth
              name="search"
              label="Buscar"
              variant="outlined"
              size="small"
              value={filters.search}
              onChange={handleInputChange}
              placeholder="Número de orden, proveedor..."
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
          <Grid gridColumn={{ xs: "span 12", sm: "span 6", md: "span 2" }}>
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
                <MenuItem value="draft">Borrador</MenuItem>
                <MenuItem value="pending">Pendiente</MenuItem>
                <MenuItem value="confirmed">Confirmada</MenuItem>
                <MenuItem value="received">Recibida</MenuItem>
                <MenuItem value="cancelled">Cancelada</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {/* Actualizado a Grid v2 y DatePicker moderno */}
          <Grid gridColumn={{ xs: "span 12", sm: "span 6", md: "span 2" }}>
            <DatePicker
              label="Desde"
              value={filters.dateFrom}
              onChange={(date) => handleDateChange(date, 'dateFrom')}
              maxDate={filters.dateTo}
              slotProps={{ 
                textField: { 
                  size: "small", 
                  fullWidth: true 
                } 
              }}
            />
          </Grid>
          {/* Actualizado a Grid v2 y DatePicker moderno */}
          <Grid gridColumn={{ xs: "span 12", sm: "span 6", md: "span 2" }}>
            <DatePicker
              label="Hasta"
              value={filters.dateTo}
              onChange={(date) => handleDateChange(date, 'dateTo')}
              minDate={filters.dateFrom}
              slotProps={{ 
                textField: { 
                  size: "small", 
                  fullWidth: true 
                } 
              }}
            />
          </Grid>
          {/* Actualizado a Grid v2 */}
          <Grid gridColumn={{ xs: "span 12", sm: "span 12", md: "span 3" }}>
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
    </LocalizationProvider>
  );
};

export default PurchaseOrderFilters;