import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Button
} from '@mui/material';
import {
  FileDownload as DownloadIcon,
  Refresh as RefreshIcon
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
      
      dispatch(setDateRange({ start: startDate, end: endDate }));
    }
  }, [dispatch, dateRange]);

  // Función para generar el reporte actual
  const generateReport = () => {
    const params = {
      startDate: dateRange.start ? dateRange.start.toISOString() : null,
      endDate: dateRange.end ? dateRange.end.toISOString() : null,
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
  };

  // Generar el reporte cuando cambia el tipo o las fechas
  useEffect(() => {
    if (currentReport) {
      generateReport();
    }
  }, [currentReport, dateRange, additionalFilters.groupBy]);

  // Manejar la selección del tipo de reporte
  const handleSelectReportType = (reportType) => {
    dispatch(setCurrentReport(reportType));
  };

  // Manejar cambios en el rango de fechas
  const handleDateRangeChange = (newDateRange) => {
    dispatch(setDateRange(newDateRange));
  };

  // Manejar cambio en formato de exportación
  const handleFormatChange = (format) => {
    dispatch(setExportFormat(format));
  };

  // Manejar cambios en filtros adicionales
  const handleFilterChange = (filters) => {
    dispatch(setAdditionalFilters(filters));
  };

  // Manejar la exportación del reporte
  const handleExport = (format) => {
    // Aquí se implementaría la lógica de exportación según el formato
    console.log(`Exportando reporte en formato ${format}`);
    
    // Ejemplo: Crear y descargar un archivo
    // En una implementación real, esto se haría a través de una API
    // que generaría el archivo en el formato adecuado
    const dummyData = "Datos del reporte";
    const blob = new Blob([dummyData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte_${currentReport}_${new Date().toISOString().split("T")[0]}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Renderizar el reporte según el tipo seleccionado
  const renderReport = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      );
    }

    if (!reportData) {
      return (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Seleccione un tipo de reporte y un rango de fechas para generar el informe.
          </Typography>
        </Box>
      );
    }

    switch (currentReport) {
      case 'sales':
        return <SalesReport data={reportData} loading={loading} error={error} additionalFilters={additionalFilters} onFilterChange={handleFilterChange} />;
      case 'inventory':
        return <InventoryReport data={reportData} loading={loading} error={error} additionalFilters={additionalFilters} onFilterChange={handleFilterChange} />;
      case 'customers':
        return <CustomersReport data={reportData} loading={loading} error={error} additionalFilters={additionalFilters} onFilterChange={handleFilterChange} />;
      case 'financial':
        return <FinancialReport data={reportData} loading={loading} error={error} additionalFilters={additionalFilters} onFilterChange={handleFilterChange} />;
      default:
        return null;
    }
  };

  // Título del reporte según el tipo seleccionado
  const getReportTitle = () => {
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
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {getReportTitle()}
      </Typography>
      
      <ReportTypeSelector 
        onSelectReportType={handleSelectReportType} 
        selectedReportType={currentReport} 
      />
      
      {currentReport && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Configuración del Reporte
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<RefreshIcon />}
                onClick={generateReport}
                variant="outlined"
                size="small"
              >
                Actualizar
              </Button>
            </Box>
          </Box>
          
          <DateRangeSelector 
            dateRange={dateRange} 
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
        <Paper sx={{ p: 2 }} className="report-container">
          {renderReport()}
        </Paper>
      )}
    </Box>
  );
};

export default ReportsPage;