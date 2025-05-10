import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Tooltip
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  ViewColumn as ExcelIcon,
  Print as PrintIcon,
  FileDownload as DownloadIcon
} from '@mui/icons-material';

const ExportFormatSelector = ({ format, onFormatChange, onExport, disabled }) => {
  const formats = [
    { value: 'pdf', label: 'PDF', icon: <PdfIcon /> },
    { value: 'excel', label: 'Excel', icon: <ExcelIcon /> },
    { value: 'csv', label: 'CSV', icon: null }
  ];

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Formato</InputLabel>
        <Select
          value={format}
          onChange={(e) => onFormatChange(e.target.value)}
          label="Formato"
        >
          {formats.map(f => (
            <MenuItem key={f.value} value={f.value}>
              {f.icon && <Box component="span" sx={{ mr: 1, display: 'inline-flex', verticalAlign: 'middle' }}>{f.icon}</Box>}
              {f.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <Button
        variant="contained"
        startIcon={<DownloadIcon />}
        onClick={() => onExport(format)}
        disabled={disabled}
      >
        Exportar
      </Button>
      
      <Tooltip title="Imprimir reporte">
        <span>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            disabled={disabled}
          >
            Imprimir
          </Button>
        </span>
      </Tooltip>
    </Box>
  );
};

export default ExportFormatSelector;