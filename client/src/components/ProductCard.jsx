import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatINR } from '../utils/format.js';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const outOfStock = product.stock === 0;

  return (
    <article className="card product-card">
      <Link to={`/product/${product._id}`}>
        <img src={product.image} alt={product.name} />
      </Link>
      <div className="card-body">
        <span className="tag">{product.category}</span>
        <Link to={`/product/${product._id}`} className="product-name">{product.name}</Link>
        <div className="row-between">
          <strong>{formatINR(product.price)}</strong>
          <span className="muted">
            {product.rating > 0 ? `★ ${product.rating.toFixed(1)}` : 'No rating yet'}
          </span>
        </div>
        <button className="btn full" disabled={outOfStock} onClick={() => addToCart(product)}>
          {outOfStock ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}
