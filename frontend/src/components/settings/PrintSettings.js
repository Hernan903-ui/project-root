import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Save as SaveIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { updatePrintSettings } from '../../features/settings/settingsSlice';

const PrintSettings = () => {
  const dispatch = useDispatch();
  const { printSettings, printSettingsLoading, error, successMessage } = useSelector(state => state.settings);
  
  const [formData, setFormData] = useState({
    printerType: 'thermal',
    paperSize: '80mm',
    autoprint: false,
    printCopies: 1,
    showLogo: true,
    logoUrl: '',
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyWebsite: '',
    companyTaxId: '',
    showItemDiscount: true,
    showBarcode: true,
    footerText: 'Gracias por su compra',
    additionalInfo: ''
  });
  
  // Inicializar datos cuando se cargan las configuraciones
  useEffect(() => {
    if (printSettings) {
      setFormData({
        ...formData,
        ...printSettings
      });
    }
  }, [printSettings]);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updatePrintSettings(formData));
  };
  
  const handlePrintTest = () => {
    // Implementar la lógica para imprimir una factura de prueba
    window.print();
  };
  
  return (
    <Paper elevation={0} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Configuración de Impresión
        </Typography>
        
        <Button
          startIcon={<PrintIcon />}
          variant="outlined"
          color="primary"
          onClick={handlePrintTest}
        >
          Imprimir Prueba
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Configuración General de Impresora
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Impresora</InputLabel>
              <Select
                name="printerType"
                value={formData.printerType}
                onChange={handleInputChange}
                label="Tipo de Impresora"
              >
                <MenuItem value="thermal">Térmica</MenuItem>
                <MenuItem value="laser">Láser</MenuItem>
                <MenuItem value="inkjet">Inyección de Tinta</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Tamaño de Papel</InputLabel>
              <Select
                name="paperSize"
                value={formData.paperSize}
                onChange={handleInputChange}
                label="Tamaño de Papel"
              >
                <MenuItem value="80mm">80mm (Térmica Estándar)</MenuItem>
                <MenuItem value="58mm">58mm (Térmica Pequeña)</MenuItem>
                <MenuItem value="a4">A4</MenuItem>
                <MenuItem value="letter">Carta</MenuItem>
                <MenuItem value="custom">Personalizado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.autoprint}
                  onChange={handleInputChange}
                  name="autoprint"
                  color="primary"
                />
              }
              label="Imprimir automáticamente al completar venta"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="printCopies"
              label="Número de Copias"
              type="number"
              value={formData.printCopies}
              onChange={handleInputChange}
              fullWidth
              inputProps={{ min: 1, max: 5 }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Información de la Empresa
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.showLogo}
                  onChange={handleInputChange}
                  name="showLogo"
                  color="primary"
                />
              }
              label="Mostrar Logo"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="logoUrl"
              label="URL del Logo"
              value={formData.logoUrl}
              onChange={handleInputChange}
              fullWidth
              disabled={!formData.showLogo}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="companyName"
              label="Nombre de la Empresa"
              value={formData.companyName}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="companyTaxId"
              label="NIF/CIF/RUC"
              value={formData.companyTaxId}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="companyAddress"
              label="Dirección"
              value={formData.companyAddress}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="companyPhone"
              label="Teléfono"
              value={formData.companyPhone}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="companyWebsite"
              label="Sitio Web"
              value={formData.companyWebsite}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Opciones de Visualización del Recibo
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.showItemDiscount}
                  onChange={handleInputChange}
                  name="showItemDiscount"
                  color="primary"
                />
              }
              label="Mostrar descuentos por producto"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.showBarcode}
                  onChange={handleInputChange}
                  name="showBarcode"
                  color="primary"
                />
              }
              label="Mostrar código de barras/QR"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="footerText"
              label="Texto del Pie de Página"
              value={formData.footerText}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="additionalInfo"
              label="Información Adicional"
              value={formData.additionalInfo}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={printSettingsLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={printSettingsLoading}
              >
                {printSettingsLoading ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default PrintSettings;