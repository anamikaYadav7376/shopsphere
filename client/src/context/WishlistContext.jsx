import { createContext, useContext, useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client.js';
import { useAuth } from './AuthContext.jsx';

const WishlistContext = createContext(null);

// Holds the logged-in user's wishlist so ProductCard hearts and the
// /wishlist page always agree on what is wishlisted.
export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  // Logged-in users start in loading state so /wishlist shows the loader
  // instead of flashing the empty state before the fetch settles.
  const [loading, setLoading] = useState(() => Boolean(user));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setItems([]);
      setError('');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    api
      .get('/wishlist')
      .then(({ data }) => setItems(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [user]);

  const isWishlisted = (productId) => items.some((p) => p._id === productId);

  const addToWishlist = async (product) => {
    const { data } = await api.post(`/wishlist/${product._id}`);
    setItems(data);
  };

  const removeFromWishlist = async (productId) => {
    const { data } = await api.delete(`/wishlist/${productId}`);
    setItems(data);
  };

  const toggleWishlist = (product) =>
    isWishlisted(product._id) ? removeFromWishlist(product._id) : addToWishlist(product);

  return (
    <WishlistContext.Provider
      value={{ items, loading, error, isWishlisted, addToWishlist, removeFromWishlist, toggleWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
