'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { CartItem } from '@/types';
import toast from 'react-hot-toast';

interface CartContextType {
  items: CartItem[];
  total: number;
  loading: boolean;
  addToCart: (productId: string, talla: string, color: string, cantidad: number) => Promise<void>;
  updateQuantity: (cartItemId: string, cantidad: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      setItems(response.data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, talla: string, color: string, cantidad: number) => {
    await api.post('/cart', { productId, talla, color, cantidad });
    await fetchCart();
    toast.success('Producto agregado al carrito');
  };

  const updateQuantity = async (cartItemId: string, cantidad: number) => {
    await api.put('/cart', { cartItemId, cantidad });
    await fetchCart();
  };

  const removeItem = async (cartItemId: string) => {
    await api.delete(`/cart/${cartItemId}`);
    await fetchCart();
    toast.success('Producto eliminado');
  };

  const clearCart = async () => {
    await api.delete('/cart');
    await fetchCart();
  };

  const getCartCount = () => {
    return items.reduce((sum, item) => sum + item.cantidad, 0);
  };

  const total = items.reduce((sum, item) => sum + item.item_total, 0);

  return (
    <CartContext.Provider value={{
      items, total, loading, addToCart, updateQuantity, removeItem, clearCart, getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};