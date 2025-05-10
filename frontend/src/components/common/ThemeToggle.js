import React from 'react';
import { IconButton, Tooltip, useTheme as useMuiTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();

  return (
    <Tooltip title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        aria-label="toggle theme"
        sx={{
          ml: 1,
          '&:hover': {
            backgroundColor: 
              muiTheme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.08)' 
                : 'rgba(0, 0, 0, 0.04)',
          },
        }}
      >
        {theme === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;