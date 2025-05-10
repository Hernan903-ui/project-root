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
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
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
        <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar
            src={imagePreview || (profile && profile.avatarUrl) || ''}
            sx={{ width: 120, height: 120, mb: 2 }}
          />
          
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
        
        <Grid item xs={12} md={9}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
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
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!editing || profileLoading}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!editing || profileLoading}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!editing || profileLoading}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cargo"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  disabled={!editing || profileLoading}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Departamento"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  disabled={!editing || profileLoading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Biografía"
                  name="bio"
                  multiline
                  rows={4}
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!editing || profileLoading}
                />
              </Grid>
              
              {editing && (
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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