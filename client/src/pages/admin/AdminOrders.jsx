import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../../api/client.js';
import Loader from '../../components/Loader.jsx';
import { formatINR } from '../../utils/format.js';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  const load = () => api.get('/orders').then(({ data }) => setOrders(data));
  const loadStats = () => {
    setStatsLoading(true);
    setStatsError('');
    api
      .get('/admin/stats')
      .then(({ data }) => setStats(data))
      .catch((err) => setStatsError(getErrorMessage(err)))
      .finally(() => setStatsLoading(false));
  };
  useEffect(() => {
    load();
    loadStats();
  }, []);

  const changeStatus = async (id, status) => {
    await api.patch(`/orders/${id}/status`, { status });
    load();
  };

  return (
    <section>
      <div className="row-between">
        <h1>Admin · Orders</h1>
        <Link to="/admin/products" className="btn btn-ghost">← Products</Link>
      </div>
      {statsLoading ? (
        <Loader text="Loading stats..." />
      ) : statsError ? (
        <p className="error">
          {statsError}{' '}
          <button className="btn btn-ghost" onClick={loadStats}>Retry</button>
        </p>
      ) : (
        <div className="stats">
          <div className="card stat-card">
            <p className="stat-label">Total revenue</p>
            <p className="stat-value">{formatINR(stats.totalRevenue)}</p>
            <p className="muted">From delivered orders</p>
          </div>
          <div className="card stat-card">
            <p className="stat-label">Orders today</p>
            <p className="stat-value">{stats.ordersToday}</p>
            <p className="muted">Created since midnight</p>
          </div>
          <div className="card stat-card">
            <p className="stat-label">Pending orders</p>
            <p className="stat-value">{stats.pendingOrders}</p>
            <p className="muted">Awaiting fulfillment</p>
          </div>
          <div className="card stat-card">
            <p className="stat-label">Low stock</p>
            <p className="stat-value">{stats.lowStockProducts}</p>
            <p className="muted">Products with stock under 5</p>
          </div>
        </div>
      )}
      <table className="table">
        <thead>
          <tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>#{o._id.slice(-6).toUpperCase()}</td>
              <td>{o.user?.name}<br /><span className="muted">{o.user?.email}</span></td>
              <td>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
              <td>{formatINR(o.totalAmount)}</td>
              <td>
                <select value={o.status} onChange={(e) => changeStatus(o._id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
