import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/products/:id/reviews
export const getReviews = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const reviews = await Review.find({ product: product._id })
    .populate('user', 'name')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

// POST /api/products/:id/reviews (auth, delivered-order customers only)
export const createReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const rating = Number(req.body.rating);
  const comment = typeof req.body.comment === 'string' ? req.body.comment.trim() : '';

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be an integer between 1 and 5');
  }
  if (!comment) {
    res.status(400);
    throw new Error('Comment is required');
  }
  if (comment.length > 1000) {
    res.status(400);
    throw new Error('Comment must be 1000 characters or fewer');
  }

  const alreadyReviewed = await Review.findOne({ product: product._id, user: req.user._id });
  if (alreadyReviewed) {
    res.status(409);
    throw new Error('You have already reviewed this product');
  }

  // Only customers with a delivered order containing this product may review
  const hasDeliveredOrder = await Order.exists({
    user: req.user._id,
    status: 'delivered',
    'items.product': product._id,
  });
  if (!hasDeliveredOrder) {
    res.status(403);
    throw new Error('You can only review products from a delivered order');
  }

  const review = await Review.create({
    product: product._id,
    user: req.user._id,
    rating,
    comment,
  });
  await review.populate('user', 'name');

  // Keep the product's aggregate rating in sync (rounded to 1 decimal)
  const [stats] = await Review.aggregate([
    { $match: { product: product._id } },
    { $group: { _id: '$product', average: { $avg: '$rating' } } },
  ]);
  product.rating = stats ? Math.round(stats.average * 10) / 10 : 0;
  await product.save();

  res.status(201).json(review);
});
