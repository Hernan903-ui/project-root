import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  customer: null,
  discount: 0,
  notes: '',
  paymentMethod: 'cash',
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.product_id === product.id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.total = +(existingItem.unit_price * existingItem.quantity * (1 + existingItem.tax_rate / 100)).toFixed(2);
      } else {
        state.items.push({
          product_id: product.id,
          name: product.name,
          sku: product.sku,
          quantity,
          unit_price: product.price,
          discount: 0,
          tax_rate: product.tax_rate || 0,
          total: +(product.price * quantity * (1 + (product.tax_rate || 0) / 100)).toFixed(2)
        });
      }
    },
    updateItemQuantity: (state, action) => {
      const { product_id, quantity } = action.payload;
      const item = state.items.find(item => item.product_id === product_id);
      
      if (item) {
        item.quantity = quantity;
        item.total = +(item.unit_price * item.quantity * (1 + item.tax_rate / 100)).toFixed(2);
      }
    },
    removeItem: (state, action) => {
      const product_id = action.payload;
      state.items = state.items.filter(item => item.product_id !== product_id);
    },
    setCustomer: (state, action) => {
      state.customer = action.payload;
    },
    setDiscount: (state, action) => {
      state.discount = action.payload;
    },
    setNotes: (state, action) => {
      state.notes = action.payload;
    },
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    clearCart: (state) => {
      return initialState;
    }
  }
});

export const {
  addItem,
  updateItemQuantity,
  removeItem,
  setCustomer,
  setDiscount,
  setNotes,
  setPaymentMethod,
  clearCart
} = cartSlice.actions;

// Selectores
export const selectCartItems = state => state.cart.items;
export const selectCartTotal = state => {
  const subtotal = state.cart.items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = subtotal * (state.cart.discount / 100);
  return +(subtotal - discountAmount).toFixed(2);
};
export const selectCartSubtotal = state => {
  return state.cart.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0).toFixed(2);
};
export const selectCartTaxTotal = state => {
  return state.cart.items.reduce((sum, item) => {
    const itemSubtotal = item.unit_price * item.quantity;
    const tax = itemSubtotal * (item.tax_rate / 100);
    return sum + tax;
  }, 0).toFixed(2);
};
export const selectCartItemsCount = state => {
  return state.cart.items.reduce((count, item) => count + item.quantity, 0);
};
export const selectCartDiscount = state => state.cart.discount;
export const selectCartCustomer = state => state.cart.customer;
export const selectCartNotes = state => state.cart.notes;
export const selectCartPaymentMethod = state => state.cart.paymentMethod;

export default cartSlice.reducer;