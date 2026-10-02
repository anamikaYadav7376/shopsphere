import User from '../models/User.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';

// Populate and drop orphaned refs (deleted products).
const wishlistOf = async (userId) => {
  const user = await User.findById(userId).populate('wishlist');
  return user.wishlist.filter(Boolean);
};

// GET /api/wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  res.json(await wishlistOf(req.user._id));
});

// POST /api/wishlist/:productId
export const addToWishlist = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // $addToSet keeps duplicates out of the wishlist.
  const alreadyWishlisted = req.user.wishlist.some((id) => id.equals(product._id));
  if (!alreadyWishlisted) {
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { wishlist: product._id } });
  }

  res.status(alreadyWishlisted ? 200 : 201).json(await wishlistOf(req.user._id));
});

// DELETE /api/wishlist/:productId
export const removeFromWishlist = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $pull: { wishlist: req.params.productId } });
  res.json(await wishlistOf(req.user._id));
});
