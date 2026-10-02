import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';
import { formatINR } from '../utils/format.js';

function Stars({ value }) {
  const filled = Math.round(value || 0);
  return (
    <span className="stars" aria-label={`${value ?? 0} out of 5 stars`}>
      {'★'.repeat(filled)}
      {'☆'.repeat(5 - filled)}
    </span>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');

  const [reviews, setReviews] = useState(null);
  const [reviewsError, setReviewsError] = useState('');
  const [ordersChecked, setOrdersChecked] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch((err) => setError(getErrorMessage(err)));
  }, [id]);

  useEffect(() => {
    api
      .get(`/products/${id}/reviews`)
      .then(({ data }) => setReviews(data))
      .catch((err) => setReviewsError(getErrorMessage(err)));
  }, [id]);

  // Eligibility: only customers with a delivered order for this product can review
  useEffect(() => {
    if (!user) {
      setOrdersChecked(true);
      setCanReview(false);
      return;
    }
    api
      .get('/orders/mine')
      .then(({ data }) =>
        setCanReview(
          data.some(
            (o) => o.status === 'delivered' && o.items.some((i) => String(i.product) === id)
          )
        )
      )
      .catch(() => setCanReview(false))
      .finally(() => setOrdersChecked(true));
  }, [id, user]);

  if (error) return <p className="error">{error}</p>;
  if (!product) return <Loader />;

  const handleAdd = () => {
    addToCart(product, qty);
    navigate('/cart');
  };

  const hasReviewed = !!user && reviews?.some((r) => String(r.user?._id) === String(user._id));

  const submitReview = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitted(false);
    if (!rating) {
      setFormError('Please select a rating from 1 to 5');
      return;
    }
    if (!comment.trim()) {
      setFormError('Please write a comment');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post(`/products/${id}/reviews`, {
        rating,
        comment: comment.trim(),
      });
      setReviews((prev) => [data, ...(prev || [])]);
      setRating(0);
      setComment('');
      setSubmitted(true);
      // refresh the aggregate rating shown on the page
      api
        .get(`/products/${id}`)
        .then(({ data: updated }) => setProduct(updated))
        .catch(() => {});
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="detail">
        <img src={product.image} alt={product.name} />
        <div>
          <span className="tag">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="muted">
            by {product.brand}
            {product.rating > 0 && <> · ★ {product.rating.toFixed(1)}</>}
          </p>
          <h2>{formatINR(product.price)}</h2>
          <p>{product.description}</p>
          <p className={product.stock > 0 ? 'success' : 'error'}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>
          {product.stock > 0 && (
            <div className="row">
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="qty"
              />
              <button className="btn" onClick={handleAdd}>Add to cart</button>
            </div>
          )}
        </div>
      </section>

      <section className="reviews">
        <div className="row-between">
          <h2>Customer Reviews</h2>
          {reviews && (
            <span className="muted">
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </span>
          )}
        </div>

        {product.rating > 0 ? (
          <div className="review-summary">
            <Stars value={product.rating} />
            <strong>{product.rating.toFixed(1)}</strong>
            <span className="muted">out of 5</span>
          </div>
        ) : (
          <p className="muted">No ratings yet</p>
        )}

        {reviewsError && <p className="error">{reviewsError}</p>}
        {!reviews && !reviewsError && <Loader text="Loading reviews..." />}
        {reviews?.length === 0 && (
          <p className="muted">No reviews yet. Be the first to review this product.</p>
        )}
        {reviews?.map((r) => (
          <article key={r._id} className="card review">
            <div className="row-between">
              <strong>{r.user?.name || 'Customer'}</strong>
              <span className="muted">
                {new Date(r.createdAt).toLocaleDateString('en-IN')}
              </span>
            </div>
            <Stars value={r.rating} />
            <p>{r.comment}</p>
          </article>
        ))}

        {!user ? (
          <p className="muted">
            <Link to="/login">Sign in</Link> to write a review.
          </p>
        ) : hasReviewed ? (
          <p className="success">
            {submitted
              ? 'Review submitted. Thanks for sharing!'
              : 'You have already reviewed this product.'}
          </p>
        ) : !reviews || !ordersChecked ? null : canReview ? (
          <form className="card form" onSubmit={submitReview}>
            <h3>Write a review</h3>
            <div className="row">
              <span className="muted">Your rating</span>
              <div className="star-picker">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
                    className={n <= (hover || rating) ? 'active' : ''}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(n)}
                  >
                    ★
                  </button>
                ))}
              </div>
              {rating > 0 && <span className="muted">{rating}/5</span>}
            </div>
            <textarea
              placeholder="Share your experience with this product"
              value={comment}
              maxLength={1000}
              onChange={(e) => setComment(e.target.value)}
            />
            {formError && <p className="error">{formError}</p>}
            <button className="btn full" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit review'}
            </button>
          </form>
        ) : (
          <p className="muted">
            Only customers with a delivered order for this product can write a review.
          </p>
        )}
      </section>
    </>
  );
}
