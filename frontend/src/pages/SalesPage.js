import React, { useState, useEffect } from 'react';
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
  Alert
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
import { generatePDF } from '../utils/reportGenerator'; // **Corregido**

const SalesPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  useEffect(() => {
    dispatch(fetchSales());

    // Solo cargar estadísticas si estamos en la pestaña de estadísticas
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewDetails = (sale) => {
    dispatch(setSelectedSale(sale));
    setDetailsOpen(true);
  };

  const handlePrintReceipt = (sale) => {
    // Implementación de impresión de recibo
    console.log('Imprimiendo recibo para venta:', sale.id);
    // Aquí iría la lógica de impresión
  };

  const handleCancelSaleClick = (sale) => {
    dispatch(setSelectedSale(sale));
    setCancelOpen(true);
  };

  const handleReturnClick = (sale) => {
    dispatch(setSelectedSale(sale));
    setReturnOpen(true);
  };

  const handleSubmitCancel = (cancelData) => {
    dispatch(cancelSale(cancelData))
      .then((result) => {
        if (!result.error) {
          setCancelOpen(false);
          dispatch(fetchSales());
        }
      });
  };

  const handleSubmitReturn = (returnData) => {
    dispatch(processReturn({ id: selectedSale.id, returnData }))
      .then((result) => {
        if (!result.error) {
          setReturnOpen(false);
          dispatch(fetchSales());
        }
      });
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (filters) => {
    dispatch(filterSales(filters));
  };

  const handleExportSales = () => {
    const columnsToExport = [
      { header: 'Recibo #', field: 'receiptNumber' },
      { header: 'Fecha', field: 'date', formatter: (date) => new Date(date).toLocaleString() },
      { header: 'Cliente', field: 'customer.name', fallback: 'Cliente no registrado' },
      { header: 'Total', field: 'total', formatter: (value) => `$${value.toFixed(2)}` },
      { header: 'Estado', field: 'status' }
    ];

    generatePDF('Reporte de Ventas', filteredSales, columnsToExport);
  };

  const handleRefresh = () => {
    dispatch(fetchSales());
    if (activeTab === 1) {
      dispatch(fetchSalesStatistics());
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestión de Ventas
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Operación completada con éxito
        </Alert>
      )}

      {returnSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Devolución procesada correctamente
        </Alert>
      )}

      {cancelSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Venta cancelada correctamente
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Ventas" />
            <Tab label="Estadísticas" />
          </Tabs>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              size="small"
            >
              Actualizar
            </Button>

            {activeTab === 0 && (
              <>
                <Button
                  startIcon={<ExportIcon />}
                  onClick={handleExportSales}
                  size="small"
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
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <SalesTable
                sales={filteredSales.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
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
        onClose={() => setDetailsOpen(false)}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          Detalles de Venta
        </DialogTitle>
        <DialogContent>
          <SaleDetails
            sale={selectedSale}
            onPrint={handlePrintReceipt}
            onReturn={handleReturnClick}
            onCancel={handleCancelSaleClick}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de devolución */}
      <Dialog
        open={returnOpen}
        onClose={() => setReturnOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          Procesar Devolución
        </DialogTitle>
        <DialogContent>
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
        onClose={() => setCancelOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Cancelar Venta
        </DialogTitle>
        <DialogContent>
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
