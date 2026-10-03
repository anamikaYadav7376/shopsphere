import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client.js';
import Loader from '../components/Loader.jsx';
import { formatINR } from '../utils/format.js';

const CANCELLABLE_STATUSES = ['pending', 'confirmed'];

export default function Orders() {
  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const [showPlacedMessage, setShowPlacedMessage] = useState(!!location.state?.placed);

  useEffect(() => {
    if (location.state?.placed) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    api
      .get('/orders/mine')
      .then(({ data }) => setOrders(data))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const cancelOrder = async (order) => {
    setCancellingId(order._id);
    setCancelError('');
    setNotice('');
    setShowPlacedMessage(false); // Instantly hide "Order placed successfully!" when cancelling
    try {
      const { data } = await api.patch(`/orders/${order._id}/cancel`);
      setOrders((prev) => prev.map((o) => (o._id === data._id ? data : o)));
      setNotice(`Order #${data._id.slice(-6).toUpperCase()} cancelled.`);
    } catch (err) {
      setCancelError(getErrorMessage(err));
    } finally {
      setCancellingId(null);
    }
  };

  if (error) return <p className="error">{error}</p>;
  if (!orders) return <Loader />;

  return (
    <section>
      <h1>My Orders</h1>
      {/* Show cancellation notice if present; otherwise show placed message */}
      {notice ? (
        <p className="success">{notice}</p>
      ) : showPlacedMessage ? (
        <p className="success">Order placed successfully!</p>
      ) : null}

      {cancelError && <p className="error">{cancelError}</p>}
      {orders.length === 0 && <p className="muted">You have not placed any orders yet.</p>}
      {orders.map((o) => (
        <div key={o._id} className="card order">
          <div className="row-between">
            <span className="muted">#{o._id.slice(-6).toUpperCase()}</span>
            <span className={`status status-${o.status}`}>{o.status}</span>
          </div>
          <ul>
            {o.items.map((i) => (
              <li key={i.product}>{i.name} × {i.quantity}</li>
            ))}
          </ul>
          <div className="row-between">
            <span className="muted">{new Date(o.createdAt).toLocaleDateString('en-IN')}</span>
            <strong>{formatINR(o.totalAmount)}</strong>
          </div>
          {CANCELLABLE_STATUSES.includes(o.status) && (
            <div className="row" style={{ marginTop: 10 }}>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={cancellingId === o._id}
                onClick={() => cancelOrder(o)}
              >
                {cancellingId === o._id ? 'Cancelling...' : 'Cancel order'}
              </button>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
