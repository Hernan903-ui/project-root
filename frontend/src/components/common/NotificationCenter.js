import React, { useState } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Typography,
  Box,
  ListItemText,
  ListItemIcon,
  List,
  ListItem,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  ArrowForward as ArrowForwardIcon,
  ClearAll as ClearAllIcon,
} from '@mui/icons-material';

// Componente para una notificación individual
const NotificationItem = ({ notification, onRead, onAction }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
      default:
        return <InfoIcon color="info" />;
    }
  };

  return (
    <ListItem
      alignItems="flex-start"
      sx={{
        backgroundColor: notification.read ? 'inherit' : 'action.hover',
        '&:hover': {
          backgroundColor: 'action.selected',
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>{getIcon()}</ListItemIcon>
      <ListItemText
        primary={notification.title}
        secondary={
          <>
            <Typography
              component="span"
              variant="body2"
              color="text.primary"
              sx={{ display: 'block' }}
            >
              {notification.message}
            </Typography>
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
            >
              {new Date(notification.timestamp).toLocaleString()}
            </Typography>
          </>
        }
      />
      {notification.actionLabel && (
        <Button
          size="small"
          endIcon={<ArrowForwardIcon />}
          onClick={() => onAction(notification.id)}
          sx={{ alignSelf: 'center', ml: 1 }}
        >
          {notification.actionLabel}
        </Button>
      )}
    </ListItem>
  );
};

const NotificationCenter = ({ notifications = [], onRead, onClearAll, onAction }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (id) => {
    onRead(id);
    handleClose();
  };

  return (
    <>
      <Tooltip title="Notificaciones">
        <IconButton
          color="inherit"
          onClick={handleClick}
          aria-label="show notifications"
          aria-controls={open ? 'notification-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Menu
        id="notification-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 4,
          sx: {
            width: 360,
            maxHeight: 500,
            overflow: 'auto',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notificaciones</Typography>
          {notifications.length > 0 && (
            <Button
              size="small"
              startIcon={<ClearAllIcon />}
              onClick={() => {
                onClearAll();
                handleClose();
              }}
            >
              Limpiar todas
            </Button>
          )}
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No hay notificaciones
            </Typography>
          </Box>
        ) : (
          <List sx={{ padding: 0 }}>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <MenuItem 
                  onClick={() => handleNotificationClick(notification.id)}
                  sx={{ padding: 0 }}
                  disableRipple
                >
                  <NotificationItem
                    notification={notification}
                    onRead={onRead}
                    onAction={onAction}
                  />
                </MenuItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
};

export default NotificationCenter;