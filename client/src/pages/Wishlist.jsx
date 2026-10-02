import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import Loader from '../components/Loader.jsx';
import { formatINR } from '../utils/format.js';

export default function Wishlist() {
  const { addToCart } = useCart();
  const { items, loading, error, removeFromWishlist } = useWishlist();
  const [actionError, setActionError] = useState('');

  const moveToCart = async (product) => {
    setActionError('');
    try {
      addToCart(product);
      await removeFromWishlist(product._id);
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const handleRemove = async (productId) => {
    setActionError('');
    try {
      await removeFromWishlist(productId);
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <section className="empty">
        <h2>Could not load your wishlist</h2>
        <p className="error">{error}</p>
        <Link to="/" className="btn">Back to shop</Link>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="empty">
        <h2>Your wishlist is empty</h2>
        <p className="muted">Tap the heart on any product to save it for later.</p>
        <Link to="/" className="btn">Browse products</Link>
      </section>
    );
  }

  return (
    <section>
      <h1>My Wishlist</h1>
      {actionError && <p className="error">{actionError}</p>}
      <div className="cart-list">
        {items.map((product) => (
          <div key={product._id} className="cart-item card">
            <Link to={`/product/${product._id}`}>
              <img src={product.image} alt={product.name} />
            </Link>
            <div className="grow">
              <Link to={`/product/${product._id}`} className="product-name">{product.name}</Link>
              <p className="muted">{formatINR(product.price)}</p>
            </div>
            <button className="btn" onClick={() => moveToCart(product)}>Move to cart</button>
            <button className="btn btn-danger" onClick={() => handleRemove(product._id)}>Remove</button>
          </div>
        ))}
      </div>
    </section>
  );
}
