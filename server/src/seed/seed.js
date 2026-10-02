import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';

const products = [
  { name: 'Wireless Earbuds Pro', description: 'Bluetooth 5.3 earbuds with noise cancellation and 30h battery.', price: 2499, category: 'electronics', brand: 'SoundWave', stock: 40 },
  { name: 'Smart Fitness Band', description: 'Heart-rate, SpO2 and sleep tracking with a 1.1" AMOLED display.', price: 1799, category: 'electronics', brand: 'FitPulse', stock: 25 },
  { name: 'Mechanical Keyboard', description: 'Hot-swappable 75% keyboard with RGB backlight.', price: 3999, category: 'electronics', brand: 'KeyCraft', stock: 15 },
  { name: 'Cotton Kurta', description: 'Hand-block printed pure cotton kurta from Jaipur.', price: 899, category: 'fashion', brand: 'Rang', stock: 60 },
  { name: 'Running Shoes', description: 'Lightweight mesh running shoes with cushioned sole.', price: 2299, category: 'sports', brand: 'Stride', stock: 30 },
  { name: 'Yoga Mat', description: '6mm anti-slip TPE yoga mat with carry strap.', price: 699, category: 'sports', brand: 'Asana', stock: 50 },
  { name: 'Ceramic Dinner Set', description: '18-piece microwave-safe ceramic dinner set.', price: 3499, category: 'home', brand: 'Mitti', stock: 10 },
  { name: 'Table Lamp', description: 'Wooden base lamp with warm LED bulb.', price: 1199, category: 'home', brand: 'Roshni', stock: 20 },
  { name: 'JavaScript: The Good Parts', description: 'Classic book on writing better JavaScript.', price: 599, category: 'books', brand: 'O\'Reilly', stock: 35 },
  { name: 'Clean Code', description: 'A handbook of agile software craftsmanship.', price: 749, category: 'books', brand: 'Pearson', stock: 22 },
  { name: 'Aloe Vera Gel', description: '99% pure aloe vera gel for skin and hair.', price: 249, category: 'beauty', brand: 'Prakriti', stock: 80 },
  { name: 'Sunscreen SPF 50', description: 'Lightweight, non-greasy sunscreen for daily use.', price: 449, category: 'beauty', brand: 'SunSafe', stock: 0 },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([
    User.deleteMany(),
    Product.deleteMany(),
    Order.deleteMany(),
    Review.deleteMany(),
  ]);

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@shopsphere.dev',
    password: 'admin123',
    role: 'admin',
  });
  await User.create({ name: 'Test Customer', email: 'customer@shopsphere.dev', password: 'customer123' });

  await Product.insertMany(products.map((p) => ({ ...p, createdBy: admin._id })));

  console.log('Seed complete: 2 users, %d products', products.length);
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
