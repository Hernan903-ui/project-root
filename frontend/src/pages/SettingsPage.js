import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Fade
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  const { loading, activeTab, error } = useSelector(state => state.settings);

  // Cargar configuraciones al montar el componente
  useEffect(() => {
    dispatch(fetchSystemSettings());
  }, [dispatch]);

  // Manejar cambio de pestaña con useCallback
  const handleTabChange = useCallback((event, newValue) => {
    dispatch(setActiveTab(newValue));
  }, [dispatch]);

  // Array de tabs para facilitar la configuración
  const tabs = [
    { icon: <TaxIcon />, label: "Impuestos", component: TaxSettings },
    { icon: <PrintIcon />, label: "Impresión", component: PrintSettings },
    { icon: <PaymentIcon />, label: "Métodos de Pago", component: PaymentMethodsSettings },
    { icon: <AdminIcon />, label: "Usuarios", component: UserManagement }
  ];

  // Componente activo
  const ActiveComponent = tabs[activeTab]?.component || null;

  return (
    <Box sx={{ width: '100%', p: { xs: 2, sm: 3 } }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          mb: 3,
          fontSize: { xs: '1.5rem', sm: '2rem' }
        }}
      >
        Configuración del Sistema
      </Typography>
      
      <Paper 
        elevation={2} 
        sx={{ 
          mb: 3, 
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMediumScreen ? "fullWidth" : "scrollable"}
          scrollButtons={isMobile ? "auto" : false}
          allowScrollButtonsMobile
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            minHeight: { xs: 56, sm: 64 },
            '& .MuiTab-root': {
              minHeight: { xs: 56, sm: 64 },
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              py: 1,
              px: { xs: 1, sm: 2 }
            }
          }}
          aria-label="configuración del sistema"
        >
          {tabs.map((tab, index) => (
            <Tab 
              key={index}
              icon={tab.icon} 
              label={isMobile ? undefined : tab.label} 
              iconPosition={isMobile ? "top" : "start"}
              aria-label={tab.label}
              sx={{
                opacity: activeTab === index ? 1 : 0.7,
                transition: theme.transitions.create(['opacity', 'color'], {
                  duration: theme.transitions.duration.shorter,
                }),
              }}
            />
          ))}
        </Tabs>
      </Paper>
      
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: 300,
          p: 4 
        }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper 
          elevation={2} 
          sx={{ 
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            minHeight: 300
          }}
        >
          <Fade in={!loading} timeout={500}>
            <Box>
              {ActiveComponent && <ActiveComponent />}
              {!ActiveComponent && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                  <Typography color="text.secondary">
                    Seleccione una pestaña para ver la configuración
                  </Typography>
                </Box>
              )}
            </Box>
          </Fade>
        </Paper>
      )}
    </Box>
  );
};

export default SettingsPage;