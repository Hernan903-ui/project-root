import React from 'react';
import { useDispatch } from 'react-redux';
import {
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  TextField,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { updateItemQuantity, removeItem } from '../../features/pos/cartSlice';

const CartItem = ({ item }) => {
  const dispatch = useDispatch();

  const handleQuantityChange = (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    dispatch(updateItemQuantity({ product_id: item.product_id, quantity: value }));
  };

  const handleRemoveItem = () => {
    dispatch(removeItem(item.product_id));
  };

  return (
    <ListItem 
      divider 
      secondaryAction={
        <IconButton edge="end" aria-label="delete" onClick={handleRemoveItem}>
          <DeleteIcon />
        </IconButton>
      }
    >
      <ListItemText
        primary={
          <Typography variant="body1" noWrap>
            {item.name}
          </Typography>
        }
        secondary={
          <Box>
            <Typography variant="caption" display="block" color="text.secondary">
              SKU: {item.sku}
            </Typography>
            <Typography variant="body2" component="span">
              ${item.unit_price.toFixed(2)}
            </Typography>
            {item.tax_rate > 0 && (
              <Typography variant="caption" component="span" color="text.secondary" sx={{ ml: 1 }}>
                +{item.tax_rate}% impuesto
              </Typography>
            )}
          </Box>
        }
      />
      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 130 }}>
        <TextField
          type="number"
          size="small"
          value={item.quantity}
          onChange={handleQuantityChange}
          InputProps={{ inputProps: { min: 1 } }}
          sx={{ width: 60, mr: 1 }}
        />
        <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 70 }} align="right">
          ${item.total.toFixed(2)}
        </Typography>
      </Box>
    </ListItem>
  );
};

export default CartItem;