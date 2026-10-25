import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('fog_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('fog_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, quantity = null) => {
    const minQty = Number(product.min_order_quantity) || 1;
    const initialQty = quantity !== null ? Number(quantity) : minQty;
    const maxQty = Number(product.available_quantity) || 99999;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((it) => it.product.id === product.id);

      if (existingIndex > -1) {
        const currentQty = prevItems[existingIndex].quantity;
        const newQty = Math.min(maxQty, currentQty + initialQty);
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty
        };
        return updated;
      } else {
        const validatedQty = Math.max(minQty, Math.min(maxQty, initialQty));
        return [...prevItems, { product, quantity: validatedQty }];
      }
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    setItems((prevItems) => {
      return prevItems
        .map((it) => {
          if (it.product.id === productId) {
            const minQty = Number(it.product.min_order_quantity) || 1;
            const maxQty = Number(it.product.available_quantity) || 99999;
            const target = Number(newQuantity);

            if (target < minQty) {
              return { ...it, quantity: minQty };
            }
            if (target > maxQty) {
              return { ...it, quantity: maxQty };
            }
            return { ...it, quantity: target };
          }
          return it;
        })
        .filter((it) => it.quantity > 0);
    });
  };

  const removeFromCart = (productId) => {
    setItems((prevItems) => prevItems.filter((it) => it.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((acc, it) => acc + 1, 0);

  const cartTotal = items.reduce((acc, it) => {
    const price = Number(it.product.price_per_unit) || 0;
    return acc + price * it.quantity;
  }, 0);

  // Group items by farmer for transparent farm-to-table shipping
  const cartByFarmer = items.reduce((acc, it) => {
    const farmerId = it.product.farmer_id;
    if (!acc[farmerId]) {
      acc[farmerId] = {
        farmerId,
        farmerName: it.product.farmer_name,
        farmName: it.product.farm_name,
        district: it.product.location_district,
        items: []
      };
    }
    acc[farmerId].items.push(it);
    return acc;
  }, {});

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        itemCount,
        cartTotal,
        cartByFarmer: Object.values(cartByFarmer)
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
