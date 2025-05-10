import React from 'react';
import {
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Icon
} from '@mui/material';
import {
  PointOfSale as SalesIcon,
  Inventory as InventoryIcon,
  People as CustomersIcon,
  MonetizationOn as FinancialIcon
} from '@mui/icons-material';

const reportTypes = [
  {
    id: 'sales',
    title: 'Ventas',
    description: 'Análisis detallado de ventas por período, producto, categoría y más.',
    icon: <SalesIcon fontSize="large" color="primary" />
  },
  {
    id: 'inventory',
    title: 'Inventario',
    description: 'Reporte de valor de inventario, rotación, productos con bajo stock.',
    icon: <InventoryIcon fontSize="large" color="primary" />
  },
  {
    id: 'customers',
    title: 'Clientes',
    description: 'Análisis de comportamiento de compra, segmentación y retención de clientes.',
    icon: <CustomersIcon fontSize="large" color="primary" />
  },
  {
    id: 'financial',
    title: 'Financiero',
    description: 'Reporte financiero con ingresos, costos, márgenes y análisis de tendencias.',
    icon: <FinancialIcon fontSize="large" color="primary" />
  }
];

const ReportTypeSelector = ({ onSelectReportType, selectedReportType }) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Seleccionar Tipo de Reporte
      </Typography>
      <Grid container spacing={2}>
        {reportTypes.map((report) => (
          <Grid item xs={12} sm={6} md={3} key={report.id}>
            <Card 
              variant="outlined"
              sx={{ 
                height: '100%',
                borderColor: selectedReportType === report.id ? 'primary.main' : 'divider',
                bgcolor: selectedReportType === report.id ? 'primary.lighter' : 'background.paper'
              }}
            >
              <CardActionArea 
                onClick={() => onSelectReportType(report.id)}
                sx={{ height: '100%', p: 1 }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                    {report.icon}
                  </Box>
                  <Typography variant="h6" align="center" gutterBottom>
                    {report.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {report.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default ReportTypeSelector;