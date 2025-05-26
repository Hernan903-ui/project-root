// src/pages/RegisterPage.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Link,
  Paper,
  Snackbar
} from '@mui/material';
import { registerUser, resetRegistrationState } from '../features/auth/authSlice';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, registrationSuccess, isAuthenticated } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    username: '' // Añadido campo de nombre de usuario
  });

  const [formErrors, setFormErrors] = useState({});
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const [usernameGenerated, setUsernameGenerated] = useState(false);

  // Si el usuario ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Si el registro fue exitoso, redirigir al login después de un tiempo
  useEffect(() => {
    if (registrationSuccess) {
      // Aumentado a 5 segundos para dar más tiempo al usuario
      const timer = setTimeout(() => {
        navigate('/login');
        dispatch(resetRegistrationState());
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [registrationSuccess, navigate, dispatch]);

  // Generar automáticamente username basado en el email
  useEffect(() => {
    if (formData.email && !formData.username && !usernameGenerated) {
      // Extraer la parte antes del @ del email para crear un username sugerido
      const suggestedUsername = formData.email.split('@')[0];
      setFormData(prev => ({
        ...prev,
        username: suggestedUsername
      }));
      setUsernameGenerated(true);
    }
  }, [formData.email, formData.username, usernameGenerated]);

  // Mostrar snackbar cuando hay un error
  useEffect(() => {
    if (error) {
      setShowErrorSnackbar(true);
      console.error('Error durante el registro:', error);
    }
  }, [error]);

  // Limpiar el estado al desmontar
  useEffect(() => {
    return () => {
      dispatch(resetRegistrationState());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Si el usuario edita manualmente el username, marcar como no generado automáticamente
    if (name === 'username') {
      setUsernameGenerated(false);
    }
    
    // Limpiar el error específico del campo
    if (formErrors[name]) {
      setFormErrors(prev => ({
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
    
    if (!formData.password) {
      errors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    if (!formData.full_name.trim()) {
      errors.full_name = 'El nombre completo es obligatorio';
    }
    
    // Validación para el campo de nombre de usuario
    if (!formData.username.trim()) {
      errors.username = 'El nombre de usuario es obligatorio';
    } else if (formData.username.length < 3) {
      errors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'El nombre de usuario solo puede contener letras, números y guiones bajos';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Iniciando proceso de registro...');
    
    if (!validateForm()) {
      console.log('Validación de formulario fallida');
      return;
    }
    
    // Eliminar campos que no queramos enviar al backend
    const userData = { ...formData };
    delete userData.confirmPassword;
    
    console.log('Enviando datos de registro:', userData);
    dispatch(registerUser(userData));
  };

  const handleCloseErrorSnackbar = () => {
    setShowErrorSnackbar(false);
  };

  const handleRetryRegistration = () => {
    dispatch(resetRegistrationState());
    setShowErrorSnackbar(false);
  };

  // Si el registro fue exitoso, mostrar mensaje y redireccionar
  if (registrationSuccess) {
    return (
      <Container maxWidth="sm">
        <Box py={8} display="flex" flexDirection="column" alignItems="center">
          <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              ¡Registro exitoso! Serás redirigido a la página de inicio de sesión en 5 segundos.
            </Alert>
            <Button 
              variant="contained" 
              color="primary" 
              component={RouterLink} 
              to="/login"
            >
              Ir al inicio de sesión
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box py={5} display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          Crear una nueva cuenta
        </Typography>
        
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          Completa los siguientes campos para registrarte en el sistema
        </Typography>

        {/* Error persistente en la parte superior */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, width: '100%' }}
            action={
              <Button color="inherit" size="small" onClick={handleRetryRegistration}>
                Intentar de nuevo
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ width: '100%' }}>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Nombre completo"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  error={!!formErrors.full_name}
                  helperText={formErrors.full_name}
                  variant="outlined"
                  required
                  autoFocus
                />

                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  variant="outlined"
                  required
                />
                
                {/* Nuevo campo de nombre de usuario */}
                <TextField
                  fullWidth
                  label="Nombre de usuario"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={!!formErrors.username}
                  helperText={formErrors.username || "Tu identificador único en el sistema"}
                  variant="outlined"
                  required
                  InputProps={{
                    // Para indicar visualmente si fue generado automáticamente
                    className: usernameGenerated ? 'auto-generated' : ''
                  }}
                />

                <TextField
                  fullWidth
                  label="Contraseña"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  variant="outlined"
                  required
                />

                <TextField
                  fullWidth
                  label="Confirmar contraseña"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!formErrors.confirmPassword}
                  helperText={formErrors.confirmPassword}
                  variant="outlined"
                  required
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Registrarse'}
                </Button>
              </Stack>
            </form>
            
            <Divider sx={{ my: 3 }} />
            
            <Box textAlign="center">
              <Typography variant="body2">
                ¿Ya tienes una cuenta?{' '}
                <Link component={RouterLink} to="/login" variant="body2" underline="hover">
                  Iniciar sesión
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Paper>
      </Box>

      {/* Snackbar para errores (notificación flotante) */}
      <Snackbar
        open={showErrorSnackbar}
        autoHideDuration={10000}
        onClose={handleCloseErrorSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseErrorSnackbar} 
          severity="error" 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RegisterPage;