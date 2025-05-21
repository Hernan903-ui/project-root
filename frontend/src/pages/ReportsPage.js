import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Button,
  useTheme
} from '@mui/material';
import {
  FileDownload as DownloadIcon,
  Refresh as RefreshIcon,
  Description as ReportIcon
} from '@mui/icons-material';
import {
  fetchSalesReport,
  fetchInventoryReport,
  fetchCustomersReport,
  fetchFinancialReport,
  setCurrentReport,
  setDateRange,
  setExportFormat,
  setAdditionalFilters
} from '../features/reports/reportsSlice';

import ReportTypeSelector from '../components/reports/ReportTypeSelector';
import DateRangeSelector from '../components/reports/DateRangeSelector';
import ExportFormatSelector from '../components/reports/ExportFormatSelector';
import SalesReport from '../components/reports/SalesReport';
import InventoryReport from '../components/reports/InventoryReport';
import CustomersReport from '../components/reports/CustomersReport';
import FinancialReport from '../components/reports/FinancialReport';

const ReportsPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { 
    currentReport, 
    reportData, 
    loading, 
    error, 
    dateRange, 
    exportFormat,
    additionalFilters
  } = useSelector(state => state.reports);

  // Inicializar la fecha predeterminada si es necesario
  useEffect(() => {
    if (!dateRange.start || !dateRange.end) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      // Enviar las fechas al store de Redux
      dispatch(setDateRange({ start: startDate, end: endDate }));
    }
  }, [dispatch, dateRange]);

  // Convertir strings ISO a objetos Date si es necesario para la UI
  const getDateObject = useCallback((isoString) => {
    return isoString ? new Date(isoString) : null;
  }, []);

  // Función para generar el reporte actual (con useCallback)
  const generateReport = useCallback(() => {
    if (!currentReport) return;

    const params = {
      startDate: dateRange.start,
      endDate: dateRange.end,
      ...additionalFilters
    };

    switch(currentReport) {
      case 'sales':
        dispatch(fetchSalesReport(params));
        break;
      case 'inventory':
        dispatch(fetchInventoryReport(params));
        break;
      case 'customers':
        dispatch(fetchCustomersReport(params));
        break;
      case 'financial':
        dispatch(fetchFinancialReport(params));
        break;
      default:
        break;
    }
  }, [currentReport, dateRange, additionalFilters, dispatch]);

  // Generar el reporte cuando cambia el tipo o las fechas
  useEffect(() => {
    if (currentReport) {
      generateReport();
    }
  }, [currentReport, dateRange, additionalFilters.groupBy, generateReport]);

  // Manejar la selección del tipo de reporte
  const handleSelectReportType = useCallback((reportType) => {
    dispatch(setCurrentReport(reportType));
  }, [dispatch]);

  // Manejar cambios en el rango de fechas
  const handleDateRangeChange = useCallback((newDateRange) => {
    dispatch(setDateRange(newDateRange));
  }, [dispatch]);

  // Manejar cambio en formato de exportación
  const handleFormatChange = useCallback((format) => {
    dispatch(setExportFormat(format));
  }, [dispatch]);

  // Manejar cambios en filtros adicionales
  const handleFilterChange = useCallback((filters) => {
    dispatch(setAdditionalFilters(filters));
  }, [dispatch]);

  // Manejar la exportación del reporte
  const handleExport = useCallback((format) => {
    if (!reportData || loading) return;
    
    try {
      // Ejemplo: Crear y descargar un archivo
      // En una implementación real, esto se haría a través de una API
      const dummyData = JSON.stringify(reportData, null, 2);
      const blob = new Blob([dummyData], { 
        type: format === 'csv' ? 'text/csv' : 
              format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 
              'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      // Usar formato de fecha más simple para el nombre de archivo
      const currentDate = new Date().toISOString().split("T")[0];
      link.download = `reporte_${currentReport}_${currentDate}.${format}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Liberar memoria
    } catch (err) {
      console.error('Error al exportar reporte:', err);
    }
  }, [reportData, currentReport, loading]);
  
  // Renderizar el reporte según el tipo seleccionado
  const renderReport = useCallback(() => {
    if (loading) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          py: 8
        }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert 
          severity="error" 
          variant="filled"
          sx={{ my: 2 }}
        >
          {typeof error === 'object' ? error.message : error}
        </Alert>
      );
    }

    if (!reportData) {
      return (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <ReportIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />
          <Typography variant="body1" color="text.secondary">
            Seleccione un tipo de reporte y un rango de fechas para generar el informe.
          </Typography>
        </Box>
      );
    }

    // Componentes de visualización de reportes
    const reportProps = {
      data: reportData,
      loading,
      error,
      additionalFilters,
      onFilterChange: handleFilterChange
    };

    switch (currentReport) {
      case 'sales':
        return <SalesReport {...reportProps} />;
      case 'inventory':
        return <InventoryReport {...reportProps} />;
      case 'customers':
        return <CustomersReport {...reportProps} />;
      case 'financial':
        return <FinancialReport {...reportProps} />;
      default:
        return null;
    }
  }, [currentReport, reportData, loading, error, additionalFilters, handleFilterChange]);

  // Título del reporte según el tipo seleccionado
  const getReportTitle = useCallback(() => {
    switch (currentReport) {
      case 'sales':
        return 'Reporte de Ventas';
      case 'inventory':
        return 'Reporte de Inventario';
      case 'customers':
        return 'Reporte de Clientes';
      case 'financial':
        return 'Reporte Financiero';
      default:
        return 'Sistema de Reportes';
    }
  }, [currentReport]);

  // Convertir fechas de strings ISO a objetos Date para el selector de fechas
  const displayDateRange = {
    start: getDateObject(dateRange.start),
    end: getDateObject(dateRange.end)
  };

  return (
    <Box sx={{ width: '100%', p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        {getReportTitle()}
      </Typography>
      
      <ReportTypeSelector 
        onSelectReportType={handleSelectReportType} 
        selectedReportType={currentReport} 
      />
      
      {currentReport && (
        <Paper 
          elevation={2} 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            mb: 3,
            borderRadius: 2
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            gap: 2,
            mb: 2 
          }}>
            <Typography variant="h6">
              Configuración del Reporte
            </Typography>
            
            <Button
              startIcon={<RefreshIcon />}
              onClick={generateReport}
              variant="outlined"
              size="small"
              disabled={loading}
              sx={{ alignSelf: { xs: 'flex-end', sm: 'auto' } }}
            >
              Actualizar
            </Button>
          </Box>
          
          {/* Pasar objetos Date convertidos para la UI */}
          <DateRangeSelector 
            dateRange={displayDateRange} 
            onDateRangeChange={handleDateRangeChange} 
          />
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <ExportFormatSelector 
              format={exportFormat} 
              onFormatChange={handleFormatChange} 
              onExport={handleExport}
              disabled={!reportData || loading}
            />
          </Box>
        </Paper>
      )}
      
      {currentReport && (
        <Paper 
          elevation={2} 
          sx={{ 
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            boxShadow: theme => theme.palette.mode === 'dark' 
              ? '0 4px 20px 0 rgba(0,0,0, 0.4)' 
              : '0 4px 20px 0 rgba(0,0,0, 0.04)'
          }} 
          className="report-container"
        >
          {renderReport()}
        </Paper>
      )}
    </Box>
  );
};

export default ReportsPage;