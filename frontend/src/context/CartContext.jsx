import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import api from "../api/client.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [notification, setNotification] = useState("");
  const notificationTimer = useRef(null);

  const refresh = useCallback(async () => {
    if (!user) return setItems([]);
    const { data } = await api.get("/cart");
    setItems(data.items);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addItem(productId, quantity = 1) {
    await api.post("/cart", { product_id: productId, quantity });
    await refresh();
    setNotification("Your product has been successfully added to cart.");
    clearTimeout(notificationTimer.current);
    notificationTimer.current = setTimeout(() => setNotification(""), 3000);
  }

  async function updateQuantity(productId, quantity) {
    await api.put(`/cart/${productId}`, { quantity });
    refresh();
  }

  async function removeItem(productId) {
    await api.delete(`/cart/${productId}`);
    refresh();
  }

  const total = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, total, count, addItem, updateQuantity, removeItem, refresh }}>
      {children}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-[100] max-w-sm rounded-xl bg-ink px-5 py-3 text-sm font-medium text-cream shadow-xl"
        >
          {notification}
        </div>
      )}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
