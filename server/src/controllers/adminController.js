import Order from '../models/Order.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/admin/stats (admin)
// All numbers come from MongoDB aggregations - nothing is computed client-side.
export const getStats = asyncHandler(async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [orderStats] = await Order.aggregate([
    {
      $facet: {
        revenue: [
          { $match: { status: 'delivered' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ],
        ordersToday: [
          { $match: { createdAt: { $gte: startOfToday } } },
          { $count: 'count' },
        ],
        pending: [
          { $match: { status: 'pending' } },
          { $count: 'count' },
        ],
      },
    },
  ]);

  const [lowStock] = await Product.aggregate([
    { $match: { stock: { $lt: 5 } } },
    { $count: 'count' },
  ]);

  res.json({
    totalRevenue: orderStats.revenue[0]?.total || 0,
    ordersToday: orderStats.ordersToday[0]?.count || 0,
    pendingOrders: orderStats.pending[0]?.count || 0,
    lowStockProducts: lowStock?.count || 0,
  });
});
