import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedSale } from '../features/sales/salesSlice';
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Alert,
  Fade
} from '@mui/material';
import {
  Add as AddIcon,
  FileDownload as ExportIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  BarChart as ChartIcon
} from '@mui/icons-material';
import {
  fetchSales,
  fetchSalesStatistics,
  cancelSale,
  processReturn,
  filterSales,
  clearSalesState
} from '../features/sales/salesSlice';
import SalesFilters from '../components/sales/SalesFilters';
import SalesTable from '../components/sales/SalesTable';
import SaleDetails from '../components/sales/SaleDetails';
import ReturnForm from '../components/sales/ReturnForm';
import CancelSaleForm from '../components/sales/CancelSaleForm';
import SalesStatistics from '../components/sales/SalesStatistics';
import { generatePDF } from '../utils/reportGenerator';

const SalesPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

  const {
    sales,
    filteredSales,
    selectedSale,
    statistics,
    loading,
    statisticsLoading,
    error,
    success,
    returnSuccess,
    cancelSuccess
  } = useSelector((state) => state.sales);

  const [activeTab, setActiveTab] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Cargar ventas al inicio
  useEffect(() => {
    dispatch(fetchSales());
  }, [dispatch]);

  // Cargar estadísticas cuando cambia la pestaña
  useEffect(() => {
    if (activeTab === 1) {
      dispatch(fetchSalesStatistics());
    }
  }, [dispatch, activeTab]);

  // Limpiar mensajes de éxito después de mostrarlos
  useEffect(() => {
    if (success || returnSuccess || cancelSuccess) {
      const timer = setTimeout(() => {
        dispatch(clearSalesState());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success, returnSuccess, cancelSuccess, dispatch]);

  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  const handleViewDetails = useCallback((sale) => {
    dispatch(setSelectedSale(sale));
    setDetailsOpen(true);
  }, [dispatch]);

  const handlePrintReceipt = useCallback((sale) => {
    // Implementación de impresión de recibo
    console.log('Imprimiendo recibo para venta:', sale.id);
    // Aquí iría la lógica de impresión
  }, []);

  const handleCancelSaleClick = useCallback((sale) => {
    dispatch(setSelectedSale(sale));
    setCancelOpen(true);
  }, [dispatch]);

  const handleReturnClick = useCallback((sale) => {
    dispatch(setSelectedSale(sale));
    setReturnOpen(true);
  }, [dispatch]);

  const handleSubmitCancel = useCallback((cancelData) => {
    dispatch(cancelSale(cancelData))
      .then((result) => {
        if (!result.error) {
          setCancelOpen(false);
          dispatch(fetchSales());
        }
      });
  }, [dispatch]);

  const handleSubmitReturn = useCallback((returnData) => {
    dispatch(processReturn({ id: selectedSale.id, returnData }))
      .then((result) => {
        if (!result.error) {
          setReturnOpen(false);
          dispatch(fetchSales());
        }
      });
  }, [dispatch, selectedSale]);

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleFilterChange = useCallback((filters) => {
    dispatch(filterSales(filters));
  }, [dispatch]);

  const handleExportSales = useCallback(() => {
    const columnsToExport = [
      { header: 'Recibo #', field: 'receiptNumber' },
      { header: 'Fecha', field: 'date', formatter: (date) => new Date(date).toLocaleString() },
      { header: 'Cliente', field: 'customer.name', fallback: 'Cliente no registrado' },
      { header: 'Total', field: 'total', formatter: (value) => `$${value.toFixed(2)}` },
      { header: 'Estado', field: 'status' }
    ];

    generatePDF('Reporte de Ventas', filteredSales, columnsToExport);
  }, [filteredSales]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchSales());
    if (activeTab === 1) {
      dispatch(fetchSalesStatistics());
    }
  }, [dispatch, activeTab]);

  const handleCloseDetails = useCallback(() => {
    setDetailsOpen(false);
  }, []);

  const handleCloseReturn = useCallback(() => {
    setReturnOpen(false);
  }, []);

  const handleCloseCancel = useCallback(() => {
    setCancelOpen(false);
  }, []);

  // Obtener los datos paginados para la tabla
  const paginatedSales = filteredSales.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ width: '100%', p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Gestión de Ventas
      </Typography>

      {/* Alertas con transición */}
      <Box sx={{ mb: 2 }}>
        {error && (
          <Fade in={!!error}>
            <Alert 
              severity="error" 
              variant="filled"
              onClose={() => dispatch(clearSalesState())}
              sx={{ mb: 1 }}
            >
              {typeof error === 'object' ? error.message : error}
            </Alert>
          </Fade>
        )}

        {success && (
          <Fade in={success}>
            <Alert 
              severity="success" 
              variant="filled"
              sx={{ mb: 1 }}
            >
              Operación completada con éxito
            </Alert>
          </Fade>
        )}

        {returnSuccess && (
          <Fade in={returnSuccess}>
            <Alert 
              severity="success" 
              variant="filled"
              sx={{ mb: 1 }}
            >
              Devolución procesada correctamente
            </Alert>
          </Fade>
        )}

        {cancelSuccess && (
          <Fade in={cancelSuccess}>
            <Alert 
              severity="success" 
              variant="filled"
              sx={{ mb: 1 }}
            >
              Venta cancelada correctamente
            </Alert>
          </Fade>
        )}
      </Box>

      <Paper 
        elevation={2} 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          mb: 3,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ 
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          gap: 2,
          mb: 3
        }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant={isMediumScreen ? "fullWidth" : "standard"}
            sx={{ 
              minHeight: 48,
              '& .MuiTab-root': {
                minHeight: 48,
                py: 1
              }
            }}
          >
            <Tab label="Ventas" />
            <Tab label="Estadísticas" />
          </Tabs>

          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: 1,
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'flex-end', sm: 'flex-end' }
          }}>
            <Button
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              size="small"
              variant="outlined"
              disabled={loading || statisticsLoading}
            >
              Actualizar
            </Button>

            {activeTab === 0 && (
              <>
                <Button
                  startIcon={<ExportIcon />}
                  onClick={handleExportSales}
                  size="small"
                  variant="outlined"
                  disabled={filteredSales.length === 0 || loading}
                >
                  Exportar
                </Button>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  color="primary"
                  href="/pos"
                  size="small"
                >
                  Nueva Venta
                </Button>
              </>
            )}

            {activeTab === 1 && (
              <Button
                startIcon={<PrintIcon />}
                size="small"
                variant="outlined"
                disabled={statisticsLoading || !statistics}
              >
                Imprimir Reporte
              </Button>
            )}
          </Box>
        </Box>

        {activeTab === 0 && (
          <>
            <SalesFilters onFilterChange={handleFilterChange} />

            {loading ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                minHeight: 300,
                p: 3 
              }}>
                <CircularProgress />
              </Box>
            ) : (
              <SalesTable
                sales={paginatedSales}
                onViewDetails={handleViewDetails}
                onPrintReceipt={handlePrintReceipt}
                onCancelSale={handleCancelSaleClick}
                onReturn={handleReturnClick}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                total={filteredSales.length}
              />
            )}
          </>
        )}

        {activeTab === 1 && (
          <SalesStatistics
            statistics={statistics}
            loading={statisticsLoading}
          />
        )}
      </Paper>

      {/* Modal de detalles de venta */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        scroll="paper"
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: isMobile ? 0 : 2 }
        }}
      >
        <DialogTitle sx={{ py: 2, bgcolor: theme => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100' }}>
          Detalles de Venta
        </DialogTitle>
        <DialogContent dividers>
          <SaleDetails
            sale={selectedSale}
            onPrint={handlePrintReceipt}
            onReturn={handleReturnClick}
            onCancel={handleCancelSaleClick}
          />
        </DialogContent>
        <DialogActions sx={{ py: 1.5, px: 3 }}>
          <Button 
            onClick={handleCloseDetails}
            variant="outlined"
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de devolución */}
      <Dialog
        open={returnOpen}
        onClose={handleCloseReturn}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        scroll="paper"
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: isMobile ? 0 : 2 }
        }}
      >
        <DialogTitle sx={{ py: 2, bgcolor: theme => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100' }}>
          Procesar Devolución
        </DialogTitle>
        <DialogContent dividers>
          <ReturnForm
            sale={selectedSale}
            onSubmit={handleSubmitReturn}
            loading={loading}
            error={error}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de cancelación */}
      <Dialog
        open={cancelOpen}
        onClose={handleCloseCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ py: 2, bgcolor: theme => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100' }}>
          Cancelar Venta
        </DialogTitle>
        <DialogContent dividers>
          <CancelSaleForm
            sale={selectedSale}
            onCancel={handleSubmitCancel}
            loading={loading}
            error={error}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SalesPage;