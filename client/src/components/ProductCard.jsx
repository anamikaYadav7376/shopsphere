import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { formatINR } from '../utils/format.js';
import { Heart } from 'lucide-react';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [wishError, setWishError] = useState('');
  const outOfStock = product.stock === 0;
  const wishlisted = isWishlisted(product._id);

  const handleWishlist = async () => {
    // Guests are sent to login, same as ProtectedRoute does.
    if (!user) return navigate('/login', { state: { from: location.pathname } });
    setBusy(true);
    setWishError('');
    try {
      await toggleWishlist(product);
    } catch (err) {
      setWishError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="card product-card">
      <button
        type="button"
        className={`wishlist-btn${wishlisted ? ' active' : ''}`}
        onClick={handleWishlist}
        disabled={busy}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {/* {wishlisted ? '♥' : '♡'} */}
        {/* <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={wishlisted ? "#ff3f6c" : "none"}
          stroke={wishlisted ? "#ff3f6c" : "#7e818c"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg> */}

        <Heart
          size={18}
          color={wishlisted ? "#e63946" : "#6c757d"}
          fill={wishlisted ? "#e63946" : "transparent"}
        />
      </button>
      <Link to={`/product/${product._id}`}>
        <img src={product.image} alt={product.name} />
      </Link>
      <div className="card-body">
        <span className="tag">{product.category}</span>
        <Link to={`/product/${product._id}`} className="product-name">{product.name}</Link>
        <div className="row-between">
          <strong>{formatINR(product.price)}</strong>
          <span className="muted">★ {product.rating.toFixed(1)}</span>
        </div>
        {wishError && <p className="error">{wishError}</p>}
        <button className="btn full" disabled={outOfStock} onClick={() => addToCart(product)}>
          {outOfStock ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}
