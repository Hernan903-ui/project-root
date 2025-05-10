import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  FormHelperText
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword, clearProfileState } from '../../features/user/userProfileSlice';

const ChangePassword = () => {
  const dispatch = useDispatch();
  const { passwordLoading, passwordChangeSuccess, error } = useSelector(state => state.userProfile);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Limpiar el formulario después de un cambio exitoso
  useEffect(() => {
    if (passwordChangeSuccess) {
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Limpiar el estado de éxito después de 3 segundos
      const timer = setTimeout(() => {
        dispatch(clearProfileState());
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [passwordChangeSuccess, dispatch]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar errores al escribir
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const togglePasswordVisibility = (field) => {
    if (field === 'current') {
      setShowCurrentPassword(!showCurrentPassword);
    } else if (field === 'new') {
      setShowNewPassword(!showNewPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.currentPassword) {
      errors.currentPassword = 'La contraseña actual es requerida';
    }
    
    if (!formData.newPassword) {
      errors.newPassword = 'La nueva contraseña es requerida';
    } else if (formData.newPassword.length < 8) {
      errors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'La confirmación de contraseña es requerida';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      dispatch(changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }));
    }
  };
  
    return (
    <Paper elevation={0} sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Cambiar Contraseña
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {passwordChangeSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Contraseña cambiada con éxito
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Contraseña Actual"
              name="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={handleInputChange}
              disabled={passwordLoading}
              error={!!formErrors.currentPassword}
              helperText={formErrors.currentPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('current')}
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nueva Contraseña"
              name="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleInputChange}
              disabled={passwordLoading}
              error={!!formErrors.newPassword}
              helperText={formErrors.newPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('new')}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            {!formErrors.newPassword && (
              <FormHelperText>
                La contraseña debe tener al menos 8 caracteres
              </FormHelperText>
            )}
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Confirmar Nueva Contraseña"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={passwordLoading}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('confirm')}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={passwordLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disabled={passwordLoading}
            >
              {passwordLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default ChangePassword;
      