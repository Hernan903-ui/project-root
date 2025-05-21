// src/pages/EditUserPage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  VpnKey as VpnKeyIcon
} from '@mui/icons-material';

import { 
  fetchUserById, 
  updateUser, 
  clearSelectedUser,
  selectSelectedUser,
  selectSelectedUserLoading,
  selectSelectedUserError
} from '../features/users/userSlice';

// Panel para mostrar contenido según la pestaña seleccionada
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const EditUserPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const user = useSelector(selectSelectedUser);
  const loading = useSelector(selectSelectedUserLoading);
  const error = useSelector(selectSelectedUserError);

  // Puedes obtener roles disponibles del estado si los tienes
  const roles = [
    { id: 'admin', name: 'Administrador' },
    { id: 'manager', name: 'Gerente' },
    { id: 'employee', name: 'Empleado' },
    { id: 'cashier', name: 'Cajero' }
  ];

  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: '',
    is_active: true
  });
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [passwordFormErrors, setPasswordFormErrors] = useState({});
  const [updateError, setUpdateError] = useState(null);

  // Cargar el usuario cuando se monta el componente
  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(parseInt(id)));
    }
    
    // Limpiar el usuario seleccionado al desmontar
    return () => {
      dispatch(clearSelectedUser());
    };
  }, [dispatch, id]);

  // Actualizar formulario cuando se carga el usuario
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        full_name: user.full_name || '',
        role: user.role || 'employee',
        is_active: user.is_active !== undefined ? user.is_active : true
      });
    }
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // src/pages/EditUserPage.js (continuación)
  const handleFormChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = name === 'is_active' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Limpiar error
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error
    if (passwordFormErrors[name]) {
      setPasswordFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }
    
    if (!formData.full_name.trim()) {
      errors.full_name = 'El nombre es obligatorio';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.password) {
      errors.password = 'La contraseña es obligatoria';
    } else if (passwordData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    
    if (passwordData.password !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setPasswordFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setUpdateError(null);
    
    try {
      await dispatch(updateUser({ id: parseInt(id), ...formData })).unwrap();
      // Mostrar notificación de éxito
    } catch (err) {
      setUpdateError(err.message || 'Error al actualizar el usuario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    setSubmitting(true);
    setUpdateError(null);
    
    try {
      await dispatch(
        updateUser({
          id: parseInt(id),
          password: passwordData.password
        })
      ).unwrap();
      
      // Limpiar campos de contraseña
      setPasswordData({
        password: '',
        confirmPassword: ''
      });
      
      // Mostrar notificación de éxito
    } catch (err) {
      setUpdateError(err.message || 'Error al actualizar la contraseña');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !user) {
    return (
      <Container maxWidth="md">
        <Box py={3}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/users')}
          >
            Volver a usuarios
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box py={3}>
        <Stack direction="row" alignItems="center" mb={3} spacing={1}>
          <Button
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/users')}
          >
            Volver
          </Button>
          <Typography variant="h4" component="h1">
            Editar Usuario
          </Typography>
        </Stack>

        {updateError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {updateError}
          </Alert>
        )}

        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="user edit tabs"
            >
              <Tab 
                icon={<PersonIcon />} 
                label="Información General" 
                id="user-tab-0" 
                aria-controls="user-tabpanel-0" 
              />
              <Tab 
                icon={<VpnKeyIcon />} 
                label="Contraseña" 
                id="user-tab-1" 
                aria-controls="user-tabpanel-1"
              />
            </Tabs>
          </Box>

          <CardContent>
            {/* Pestaña de Información General */}
            <TabPanel value={tabValue} index={0}>
              <form onSubmit={handleUpdateProfile}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nombre completo"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleFormChange}
                      error={!!formErrors.full_name}
                      helperText={formErrors.full_name}
                      variant="outlined"
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      error={!!formErrors.email}
                      helperText={formErrors.email}
                      variant="outlined"
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      label="Rol"
                      name="role"
                      value={formData.role}
                      onChange={handleFormChange}
                      variant="outlined"
                    >
                      {roles.map((role) => (
                        <MenuItem key={role.id} value={role.id}>
                          {role.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.is_active}
                          onChange={handleFormChange}
                          name="is_active"
                          color="primary"
                        />
                      }
                      label="Usuario activo"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end">
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        disabled={submitting}
                      >
                        {submitting ? <CircularProgress size={24} /> : 'Guardar Cambios'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </TabPanel>

            {/* Pestaña de Contraseña */}
            <TabPanel value={tabValue} index={1}>
              <form onSubmit={handleUpdatePassword}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="body1" gutterBottom>
                      Establezca una nueva contraseña para este usuario
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nueva contraseña"
                      name="password"
                      type="password"
                      value={passwordData.password}
                      onChange={handlePasswordChange}
                      error={!!passwordFormErrors.password}
                      helperText={passwordFormErrors.password}
                      variant="outlined"
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Confirmar nueva contraseña"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      error={!!passwordFormErrors.confirmPassword}
                      helperText={passwordFormErrors.confirmPassword}
                      variant="outlined"
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end">
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        disabled={submitting}
                      >
                        {submitting ? <CircularProgress size={24} /> : 'Actualizar Contraseña'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </TabPanel>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default EditUserPage;