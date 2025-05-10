import React, { useState, useEffect } from 'react';
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  Typography, 
  Slider,
  Box,
  Divider,
  Tooltip
} from '@mui/material';
import { 
  TextFields as TextFieldsIcon, 
  FormatSize as FormatSizeIcon 
} from '@mui/icons-material';

const TextSizeAdjuster = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [textSize, setTextSize] = useState(() => {
    const savedSize = localStorage.getItem('textSize');
    return savedSize ? parseInt(savedSize, 10) : 100;
  });

  useEffect(() => {
    // Aplicar el tamaño de texto a la raíz del documento
    document.documentElement.style.fontSize = `${textSize}%`;
    localStorage.setItem('textSize', textSize.toString());
  }, [textSize]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSizeChange = (event, newValue) => {
    setTextSize(newValue);
  };

  const handleReset = () => {
    setTextSize(100);
  };

  return (
    <>
      <Tooltip title="Ajustar tamaño de texto">
        <IconButton
          color="inherit"
          onClick={handleClick}
          aria-label="ajustar tamaño de texto"
          aria-controls="text-size-menu"
          aria-haspopup="true"
          aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
        >
          <FormatSizeIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id="text-size-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box sx={{ p: 2, width: 250 }}>
          <Typography variant="subtitle1" gutterBottom>
            Tamaño de texto
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <TextFieldsIcon fontSize="small" />
            <Slider
              value={textSize}
              onChange={handleSizeChange}
              aria-labelledby="text-size-slider"
              min={75}
              max={150}
              step={5}
              marks={[
                { value: 75, label: '75%' },
                { value: 100, label: '100%' },
                { value: 125, label: '125%' },
                { value: 150, label: '150%' },
              ]}
              sx={{ mx: 2 }}
            />
            <TextFieldsIcon />
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <MenuItem onClick={handleReset}>
              Restaurar tamaño predeterminado
            </MenuItem>
          </Box>
        </Box>
      </Menu>
    </>
  );
};

export default TextSizeAdjuster;