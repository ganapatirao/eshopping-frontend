import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { taxAPI } from '../services/api';

const CartContext = createContext(null);

const STORAGE_KEY = 'guestCart';

const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(readCart);
  const [taxConfig, setTaxConfig] = useState({
    taxRate: 0.10,
    taxName: 'GST',
    freeShippingThreshold: 100,
    shippingCost: 10,
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    // Load tax configuration from backend
    taxAPI.getConfiguration()
      .then((res) => {
        setTaxConfig({
          taxRate: res.data.taxRate,
          taxName: res.data.taxName,
          freeShippingThreshold: res.data.freeShippingThreshold,
          shippingCost: res.data.shippingCost,
        });
      })
      .catch((err) => {
        console.error('Failed to load tax configuration:', err);
        // Use default values if API fails
      });
  }, []);

  const addToCart = (product, quantity = 1, selectedVariant = null) => {
    setItems((prev) => {
      // Calculate final price with discounts
      let finalPrice = product.price;
      let discountPercentage = product.discountPercentage || 0;
      let originalPrice = product.originalPrice || product.price;

      // If variant is selected, use variant pricing and discount
      if (selectedVariant) {
        finalPrice = selectedVariant.price;
        originalPrice = selectedVariant.originalPrice || selectedVariant.price;
        discountPercentage = selectedVariant.discountPercentage || product.discountPercentage || 0;
      }

      // Apply discount percentage to get final price with rounding to whole number
      if (discountPercentage > 0) {
        finalPrice = Math.round(originalPrice * (1 - discountPercentage / 100));
      }

      const idx = prev.findIndex((i) => i.productId === product.id && i.variantId === selectedVariant?.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
        return next;
      }
      return [
        ...prev,
        {
          productId: product.id,
          variantId: selectedVariant?.id || null,
          name: product.name,
          description: product.description,
          imageUrl: selectedVariant?.imageUrls?.[0] || product.imageUrl,
          price: finalPrice,
          originalPrice: originalPrice,
          discountPercentage: discountPercentage,
          selectedVariant: selectedVariant,
          quantity,
        },
      ];
    });
    // Show toast notification
    setToast({ message: 'Added to cart!', type: 'success' });
    setTimeout(() => setToast(null), 2000);
  };

  const updateQuantity = (productId, quantity) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.productId !== productId);
      return prev.map((i) => (i.productId === productId ? { ...i, quantity } : i));
    });
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => setItems([]);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const shipping = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal >= taxConfig.freeShippingThreshold ? 0 : taxConfig.shippingCost;
  }, [subtotal, taxConfig]);

  const tax = useMemo(() => subtotal * taxConfig.taxRate, [subtotal, taxConfig.taxRate]);

  const total = useMemo(() => subtotal + shipping + tax, [subtotal, shipping, tax]);

  const value = {
    items,
    count,
    subtotal,
    shipping,
    tax,
    total,
    taxConfig,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    toast,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};
