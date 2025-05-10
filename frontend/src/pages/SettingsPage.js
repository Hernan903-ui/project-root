import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  AttachMoney as TaxIcon,
  Print as PrintIcon,
  Payment as PaymentIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';

import { fetchSystemSettings, setActiveTab } from '../features/settings/settingsSlice';
import TaxSettings from '../components/settings/TaxSettings';
import PrintSettings from '../components/settings/PrintSettings';
import PaymentMethodsSettings from '../components/settings/PaymentMethodsSettings';
import UserManagement from '../components/settings/UserManagement';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { loading, activeTab } = useSelector(state => state.settings);

  // Cargar configuraciones al montar el componente
  useEffect(() => {
    dispatch(fetchSystemSettings());
  }, [dispatch]);

  // Manejar cambio de pestaña
  const handleTabChange = (event, newValue) => {
    dispatch(setActiveTab(newValue));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Configuración del Sistema
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<TaxIcon />} label="Impuestos" iconPosition="start" />
          <Tab icon={<PrintIcon />} label="Impresión" iconPosition="start" />
          <Tab icon={<PaymentIcon />} label="Métodos de Pago" iconPosition="start" />
          <Tab icon={<AdminIcon />} label="Usuarios" iconPosition="start" />
        </Tabs>
      </Paper>
      
      {loading && !activeTab ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Contenido de cada pestaña */}
          {activeTab === 0 && <TaxSettings />}
          {activeTab === 1 && <PrintSettings />}
          {activeTab === 2 && <PaymentMethodsSettings />}
          {activeTab === 3 && <UserManagement />}
        </>
      )}
    </Box>
  );
};

export default SettingsPage;