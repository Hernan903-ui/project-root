import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Button,
  Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const DateRangeSelector = ({ dateRange, onDateRangeChange }) => {
  const predefinedRanges = [
    { value: 'today', label: 'Hoy' },
    { value: 'yesterday', label: 'Ayer' },
    { value: 'last7days', label: 'Últimos 7 días' },
    { value: 'last30days', label: 'Últimos 30 días' },
    { value: 'thisMonth', label: 'Este mes' },
    { value: 'lastMonth', label: 'Mes anterior' },
    { value: 'custom', label: 'Personalizado' }
  ];

  const [selectedRange, setSelectedRange] = React.useState('last30days');
  const [customStartDate, setCustomStartDate] = React.useState(dateRange.start);
  const [customEndDate, setCustomEndDate] = React.useState(dateRange.end);

  // Establecer rango de fechas según opción seleccionada
  const handleRangeChange = (event) => {
    const value = event.target.value;
    setSelectedRange(value);
    
    const today = new Date();
    let start, end;
    
    switch (value) {
      case 'today':
        start = new Date(today);
        end = new Date(today);
        break;
      case 'yesterday':
        start = subDays(today, 1);
        end = subDays(today, 1);
        break;
      case 'last7days':
        start = subDays(today, 6);
        end = today;
        break;
      case 'last30days':
        start = subDays(today, 29);
        end = today;
        break;
      case 'thisMonth':
        start = startOfMonth(today);
        end = today;
        break;
      case 'lastMonth':
        start = startOfMonth(subMonths(today, 1));
        end = endOfMonth(subMonths(today, 1));
        break;
      case 'custom':
        start = customStartDate;
        end = customEndDate;
        break;
      default:
        start = subDays(today, 29);
        end = today;
    }
    
    if (value !== 'custom') {
      setCustomStartDate(start);
      setCustomEndDate(end);
    }
    
    onDateRangeChange({ start, end });
  };

  // Manejar cambios en fechas personalizadas
  const handleCustomDateChange = (type, date) => {
    if (type === 'start') {
      setCustomStartDate(date);
      if (selectedRange === 'custom') {
        onDateRangeChange({ start: date, end: customEndDate });
      }
    } else {
      setCustomEndDate(date);
      if (selectedRange === 'custom') {
        onDateRangeChange({ start: customStartDate, end: date });
      }
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Período</InputLabel>
            <Select
              value={selectedRange}
              onChange={handleRangeChange}
              label="Período"
            >
              {predefinedRanges.map(range => (
                <MenuItem key={range.value} value={range.value}>
                  {range.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={7}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <DatePicker
                label="Fecha inicio"
                value={customStartDate}
                onChange={(date) => handleCustomDateChange('start', date)}
                disabled={selectedRange !== 'custom'}
                renderInput={(params) => 
                  <TextField 
                    {...params} 
                    fullWidth 
                    size="small" 
                  />
                }
              />
              
              <DatePicker
                label="Fecha fin"
                value={customEndDate}
                onChange={(date) => handleCustomDateChange('end', date)}
                disabled={selectedRange !== 'custom'}
                renderInput={(params) => 
                  <TextField 
                    {...params} 
                    fullWidth 
                    size="small" 
                  />
                }
              />
            </Box>
          </LocalizationProvider>
        </Grid>
        
        <Grid item xs={12} md={2}>
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth
            onClick={() => onDateRangeChange({ 
              start: selectedRange === 'custom' ? customStartDate : dateRange.start,
              end: selectedRange === 'custom' ? customEndDate : dateRange.end
            })}
          >
            Aplicar
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DateRangeSelector;