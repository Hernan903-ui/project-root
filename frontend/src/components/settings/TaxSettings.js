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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { updateTaxSettings } from '../../features/settings/settingsSlice';

const TaxSettings = () => {
  const dispatch = useDispatch();
  const { taxSettings, taxSettingsLoading, error, successMessage } = useSelector(state => state.settings);
  
  const [openTaxDialog, setOpenTaxDialog] = useState(false);
  const [formData, setFormData] = useState({
    taxEnabled: false,
    defaultTaxRate: 0,
    taxIncludedInPrice: false,
    taxRates: []
  });
  const [newTaxRate, setNewTaxRate] = useState({
    name: '',
    rate: 0,
    isDefault: false
  });
  
    // Inicializar datos cuando se cargan las configuraciones
  useEffect(() => {
    if (taxSettings) {
      setFormData({
        taxEnabled: taxSettings.taxEnabled || false,
        defaultTaxRate: taxSettings.defaultTaxRate || 0,
        taxIncludedInPrice: taxSettings.taxIncludedInPrice || false,
        taxRates: taxSettings.taxRates || []
      });
    }
  }, [taxSettings]);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleTaxRateChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewTaxRate({
      ...newTaxRate,
      [name]: type === 'checkbox' ? checked : name === 'rate' ? parseFloat(value) : value
    });
  };
  
  const handleOpenTaxDialog = () => {
    setNewTaxRate({
      name: '',
      rate: 0,
      isDefault: false
    });
    setOpenTaxDialog(true);
  };
  
  const handleCloseTaxDialog = () => {
    setOpenTaxDialog(false);
  };
  
  const handleAddTaxRate = () => {
    if (!newTaxRate.name || newTaxRate.rate < 0) {
      return;
    }
    
    // Si el nuevo impuesto es por defecto, actualizar los existentes
    const updatedTaxRates = formData.taxRates.map(tax => ({
      ...tax,
      isDefault: newTaxRate.isDefault ? false : tax.isDefault
    }));
    
    const newTaxRateWithId = {
      ...newTaxRate,
      id: Date.now().toString() // Generar ID temporal
    };
    
    setFormData({
      ...formData,
      taxRates: [...updatedTaxRates, newTaxRateWithId],
      defaultTaxRate: newTaxRate.isDefault ? newTaxRate.rate : formData.defaultTaxRate
    });
    
    setOpenTaxDialog(false);
  };
  
  const handleDeleteTaxRate = (id) => {
    const taxRateToDelete = formData.taxRates.find(rate => rate.id === id);
    const updatedTaxRates = formData.taxRates.filter(rate => rate.id !== id);
    
    // Si el impuesto eliminado era el predeterminado, actualizar el valor predeterminado
    let newDefaultTaxRate = formData.defaultTaxRate;
    if (taxRateToDelete && taxRateToDelete.isDefault) {
      const newDefault = updatedTaxRates.find(rate => rate.isDefault);
      newDefaultTaxRate = newDefault ? newDefault.rate : 0;
    }
    
    setFormData({
      ...formData,
      taxRates: updatedTaxRates,
      defaultTaxRate: newDefaultTaxRate
    });
  };
  
  const handleSetDefaultTaxRate = (id) => {
    const updatedTaxRates = formData.taxRates.map(tax => {
      const isDefault = tax.id === id;
      return {
        ...tax,
        isDefault
      };
    });
    
    const defaultTax = updatedTaxRates.find(tax => tax.isDefault);
    
    setFormData({
      ...formData,
      taxRates: updatedTaxRates,
      defaultTaxRate: defaultTax ? defaultTax.rate : 0
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateTaxSettings(formData));
  };
  
  return (
    <Paper elevation={0} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Configuración de Impuestos
        </Typography>
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
            <FormControlLabel
              control={
                <Switch
                  checked={formData.taxEnabled}
                  onChange={handleInputChange}
                  name="taxEnabled"
                  color="primary"
                />
              }
              label="Habilitar impuestos"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.taxIncludedInPrice}
                  onChange={handleInputChange}
                  name="taxIncludedInPrice"
                  color="primary"
                  disabled={!formData.taxEnabled}
                />
              }
              label="Los precios incluyen impuestos"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">
                Tasas de Impuestos
              </Typography>
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                onClick={handleOpenTaxDialog}
                disabled={!formData.taxEnabled}
              >
                Añadir Impuesto
              </Button>
            </Box>
            
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell align="right">Tasa (%)</TableCell>
                    <TableCell align="center">Por Defecto</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.taxRates.length > 0 ? (
                    formData.taxRates.map(tax => (
                      <TableRow key={tax.id}>
                        <TableCell>{tax.name}</TableCell>
                        <TableCell align="right">{tax.rate}%</TableCell>
                        <TableCell align="center">
                          <FormControlLabel
                            control={
                              <Switch
                                checked={tax.isDefault}
                                onChange={() => handleSetDefaultTaxRate(tax.id)}
                                color="primary"
                                disabled={!formData.taxEnabled}
                                size="small"
                              />
                            }
                            label=""
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteTaxRate(tax.id)}
                            disabled={!formData.taxEnabled}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No hay tasas de impuestos configuradas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={taxSettingsLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={taxSettingsLoading || !formData.taxEnabled}
              >
                {taxSettingsLoading ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
      
      {/* Diálogo para añadir nueva tasa de impuesto */}
      <Dialog open={openTaxDialog} onClose={handleCloseTaxDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Añadir Tasa de Impuesto</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Nombre del Impuesto"
                fullWidth
                required
                value={newTaxRate.name}
                onChange={handleTaxRateChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="rate"
                label="Tasa (%)"
                type="number"
                fullWidth
                required
                value={newTaxRate.rate}
                onChange={handleTaxRateChange}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newTaxRate.isDefault}
                    onChange={handleTaxRateChange}
                    name="isDefault"
                    color="primary"
                  />
                }
                label="Establecer como tasa por defecto"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTaxDialog}>Cancelar</Button>
          <Button 
            onClick={handleAddTaxRate} 
            color="primary" 
            variant="contained"
            disabled={!newTaxRate.name || newTaxRate.rate < 0}
          >
            Añadir
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TaxSettings;