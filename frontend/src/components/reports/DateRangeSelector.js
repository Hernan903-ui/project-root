// components/reports/DateRangeSelector.js
import React from 'react';
import { Box, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

const DateRangeSelector = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <DatePicker
          label="Fecha inicio"
          value={startDate}
          onChange={onStartDateChange}
          slotProps={{
            textField: {
              fullWidth: true,
              variant: "outlined",
              error: false,
              helperText: null
            }
          }}
        />
        
        <DatePicker
          label="Fecha fin"
          value={endDate}
          onChange={onEndDateChange}
          minDate={startDate}
          slotProps={{
            textField: {
              fullWidth: true,
              variant: "outlined",
              error: false,
              helperText: null
            }
          }}
        />
      </LocalizationProvider>
    </Box>
  );
};

export default DateRangeSelector;