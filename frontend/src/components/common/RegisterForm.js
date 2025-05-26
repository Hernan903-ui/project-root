// components/common/RegisterForm.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Link,
  Grid,
  FormControlLabel,
  Checkbox,
  Typography
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { registerUser } from '../../features/auth/authSlice';

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = name === 'acceptTerms' ? checked : value;
    
    setFormData({
      ...formData,
      [name]: newValue
    });
    
    // Clear error when field is changed
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.full_name.trim()) {
      errors.full_name = 'El nombre es obligatorio';
    }
    
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
    
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'Debes aceptar los términos y condiciones';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitError('');
    
    try {
      // Omit confirmPassword and acceptTerms when sending to API
      const { confirmPassword, acceptTerms, ...apiData } = formData;
      
      await dispatch(registerUser(apiData)).unwrap();
      setSuccess(true);
      
      // Opcional: redirigir después de un tiempo
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setSubmitError(err.message || 'Error al registrar. Inténtalo de nuevo.');
    }
  };
  
  if (success) {
    return (
      <Box sx={{ textAlign: 'center', my: 3 }}>
        <Alert severity="success" sx={{ mb: 2 }}>
          ¡Registro exitoso! Ahora puedes iniciar sesión con tus credenciales.
        </Alert>
        <Button 
          component={RouterLink} 
          to="/login" 
          variant="contained" 
          color="primary"
        >
          Ir a Login
        </Button>
      </Box>
    );
  }
  
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      {(error || submitError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || submitError}
        </Alert>
      )}
      
      <TextField
        margin="normal"
        required
        fullWidth
        id="full_name"
        label="Nombre completo"
        name="full_name"
        autoComplete="name"
        autoFocus
        value={formData.full_name}
        onChange={handleChange}
        error={!!formErrors.full_name}
        helperText={formErrors.full_name}
      />
      
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Correo electrónico"
        name="email"
        autoComplete="email"
        value={formData.email}
        onChange={handleChange}
        error={!!formErrors.email}
        helperText={formErrors.email}
      />
      
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Contraseña"
        type="password"
        id="password"
        autoComplete="new-password"
        value={formData.password}
        onChange={handleChange}
        error={!!formErrors.password}
        helperText={formErrors.password}
      />
      
      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Confirmar contraseña"
        type="password"
        id="confirmPassword"
        autoComplete="new-password"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={!!formErrors.confirmPassword}
        helperText={formErrors.confirmPassword}
      />
      
      <FormControlLabel
        control={
          <Checkbox 
            name="acceptTerms" 
            color="primary" 
            checked={formData.acceptTerms}
            onChange={handleChange}
          />
        }
        label="Acepto los términos y condiciones"
      />
      {formErrors.acceptTerms && (
        <Typography color="error" variant="caption" display="block">
          {formErrors.acceptTerms}
        </Typography>
      )}
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Registrarse'}
      </Button>
      
      <Grid container justifyContent="center">
        <Grid item>
          <Link component={RouterLink} to="/login" variant="body2">
            ¿Ya tienes una cuenta? Iniciar sesión
          </Link>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RegisterForm;