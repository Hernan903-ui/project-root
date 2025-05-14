import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Settings as SettingsIcon,
  History as HistoryIcon
} from '@mui/icons-material';

import { fetchUserProfile, setActiveTab } from '../features/user/userProfileSlice';
import PersonalInformation from '../components/profile/PersonalInformation';
import ChangePassword from '../components/profile/ChangePassword';
// Importación de SystemPreferences (eliminada)
// import SystemPreferences from '../components/profile/SystemPreferences';
import ActivityHistory from '../components/profile/ActivityHistory';

// Componente para los paneles de pestañas
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { profile, profileLoading, activeTab } = useSelector(state => state.userProfile);

  // Cargar perfil de usuario al montar el componente
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  // Manejar cambio de pestaña
  const handleTabChange = (event, newValue) => {
    dispatch(setActiveTab(newValue));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mi Perfil
      </Typography>

      {profileLoading && !profile ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab icon={<PersonIcon />} label="Información Personal" iconPosition="start" />
              <Tab icon={<LockIcon />} label="Cambiar Contraseña" iconPosition="start" />
               {/* Pestaña de Preferencias eliminada si SystemPreferences no existe */}
              {/* <Tab icon={<SettingsIcon />} label="Preferencias" iconPosition="start" /> */}
              <Tab icon={<HistoryIcon />} label="Actividad" iconPosition="start" />
            </Tabs>
          </Paper>

          <TabPanel value={activeTab} index={0}>
            <PersonalInformation />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <ChangePassword />
          </TabPanel>

          {/* TabPanel de Preferencias eliminado si SystemPreferences no existe */}
          {/* <TabPanel value={activeTab} index={2}>
            <SystemPreferences />
          </TabPanel> */}
           <TabPanel value={activeTab} index={2}> {/* Ajuste de índice si se elimina una pestaña */}
            <ActivityHistory />
          </TabPanel>


          {/* El TabPanel de Actividad ahora podría ser index 2 si solo hay 3 pestañas */}
          {/* <TabPanel value={activeTab} index={3}>
            <ActivityHistory />
          </TabPanel> */}
        </>
      )}
    </Box>
  );
};

export default ProfilePage;
