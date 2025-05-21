import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  CircularProgress,
  IconButton,
  Divider,
  Alert,
  Paper
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile, updateProfileImage } from '../../features/user/userProfileSlice';

const DEFAULT_AVATAR = '/static/images/avatar/default.png'; // Asegúrate de que esta ruta exista

const PersonalInformation = () => {
  const dispatch = useDispatch();
  const { profile, profileLoading, profileUpdateSuccess, imageLoading, imageUpdateSuccess, error } = useSelector(state => state.userProfile);

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    bio: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Inicializar datos del formulario cuando se carga el perfil
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        position: profile.position || '',
        department: profile.department || '',
        bio: profile.bio || ''
      });
    }
  }, [profile]);

  // Actualizar previsualizaciones después de una actualización exitosa
  useEffect(() => {
    if (profileUpdateSuccess) {
      setEditing(false);
    }

    if (imageUpdateSuccess) {
      setSelectedFile(null);
      setImagePreview(null);
      setImageError(false);
    }
  }, [profileUpdateSuccess, imageUpdateSuccess]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleEditToggle = () => {
    setEditing(!editing);
    // Resetear los datos si se cancela la edición
    if (editing && profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        position: profile.position || '',
        department: profile.department || '',
        bio: profile.bio || ''
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUserProfile(formData));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImageError(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('image', selectedFile);
      dispatch(updateProfileImage(formData));
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Función para renderizar de forma segura el mensaje de error
  const renderErrorMessage = (errorObj) => {
    if (!errorObj) return null;
    
    // Si es un string, devolverlo directamente
    if (typeof errorObj === 'string') return errorObj;
    
    // Si es un objeto, intentar extraer un mensaje útil
    if (typeof errorObj === 'object') {
      return errorObj.msg || errorObj.detail || errorObj.message || 'Error desconocido';
    }
    
    return 'Error desconocido';
  };

  return (
    <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Información Personal
        </Typography>

        <Button
          startIcon={editing ? <CancelIcon /> : <EditIcon />}
          variant={editing ? "outlined" : "contained"}
          color={editing ? "error" : "primary"}
          onClick={handleEditToggle}
          disabled={profileLoading}
        >
          {editing ? 'Cancelar' : 'Editar'}
        </Button>
      </Box>

      {/* Renderizado seguro de errores */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {renderErrorMessage(error)}
        </Alert>
      )}

      {profileUpdateSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Información actualizada correctamente
        </Alert>
      )}

      {imageUpdateSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Imagen de perfil actualizada correctamente
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Actualizado a Grid v2 */}
        <Grid gridColumn={{ xs: "span 12", md: "span 3" }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar
            src={imagePreview || (profile && profile.avatarUrl) || DEFAULT_AVATAR}
            sx={{ width: 120, height: 120, mb: 2 }}
            onError={handleImageError}
          />
          {imageError && !imagePreview && (
            <Typography variant="caption" color="error" sx={{ mb: 1 }}>
              No se pudo cargar la imagen
            </Typography>
          )}

          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="profile-image-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="profile-image-upload">
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="span"
              sx={{ mb: 1 }}
            >
              <PhotoCameraIcon />
            </IconButton>
          </label>

          {selectedFile && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleUploadImage}
              disabled={imageLoading}
              startIcon={imageLoading ? <CircularProgress size={20} /> : null}
            >
              {imageLoading ? 'Subiendo...' : 'Guardar Imagen'}
            </Button>
          )}
        </Grid>

        {/* Resto del componente permanece igual */}
        <Grid gridColumn={{ xs: "span 12", md: "span 9" }}>
          {/* ... (el resto del formulario) */}
          {/* No hay cambios en esta parte */}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Actualizado a Grid v2 */}
              <Grid gridColumn={{ xs: "span 12", sm: "span 6" }}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!editing || profileLoading}
                  required
                />
              </Grid>

              {/* El resto de los campos siguen igual... */}
              {/* ... */}

              {editing && (
                <Grid gridColumn={{ xs: "span 12" }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    disabled={profileLoading}
                  >
                    {profileLoading ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </Grid>
              )}
            </Grid>
          </form>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PersonalInformation;