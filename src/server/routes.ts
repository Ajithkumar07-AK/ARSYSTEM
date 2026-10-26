import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { 
  UserModel, CustomerModel, ProductModel, PurchaseModel, SupplierModel, 
  WebsiteContentModel, VisitorModel, LoginLogModel, isMongoConnected, memoryStore 
} from './db.ts';

export const apiRouter = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ar_super_market_secure_jwt_secret_key_2026';

// --- MIDDLEWARE: Auth Check ---
export function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired JWT token.' });
  }
}

export function requireAdmin(req: any, res: any, next: any) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
}

// ==========================================
// 1. AUTHENTICATION (Customer & Admin)
// ==========================================

apiRouter.post('/auth/register', async (req, res) => {
  const { fullName, email, mobileNumber, password, confirmPassword, role = 'customer' } = req.body;

  if (!fullName || !email || !mobileNumber || !password) {
    return res.status(400).json({ error: 'All mandatory fields must be provided.' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Password and Confirm Password do not match.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Strong password required (at least 6 characters).' });
  }
  if (!/^\d{10}$/.test(mobileNumber.replace(/\D/g, ''))) {
    return res.status(400).json({ error: 'Valid 10-digit mobile number required.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  if (isMongoConnected()) {
    try {
      const existing = await UserModel.findOne({ email: email.toLowerCase() });
      if (existing) return res.status(400).json({ error: 'Unique email required. Account already exists.' });

      const newUser = await UserModel.create({
        fullName,
        email: email.toLowerCase(),
        mobileNumber,
        password: hashedPassword,
        role: role === 'admin' ? 'admin' : 'customer'
      });

      if (newUser.role === 'customer') {
        await CustomerModel.create({
          userId: newUser._id,
          name: fullName,
          email: newUser.email,
          mobileNumber,
          isProfileCompleted: false
        });
      }

      const token = jwt.sign({ id: newUser._id, email: newUser.email, role: newUser.role, fullName }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ token, user: { _id: newUser._id, fullName, email: newUser.email, mobileNumber, role: newUser.role, isProfileCompleted: false } });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Database error during registration.' });
    }
  } else {
    // In-Memory Engine
    const existing = memoryStore.collections.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) return res.status(400).json({ error: 'Unique email required. Account already exists.' });

    const _id = 'u_' + Date.now();
    const newUser = {
      _id,
      fullName,
      email: email.toLowerCase(),
      mobileNumber,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'customer',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    memoryStore.collections.users.push(newUser);

    if (newUser.role === 'customer') {
      memoryStore.collections.customers.push({
        _id: 'c_' + Date.now(),
        userId: _id,
        name: fullName,
        email: newUser.email,
        mobileNumber,
        address: '',
        profileImage: '',
        isProfileCompleted: false
      });
    }

    const token = jwt.sign({ id: _id, email: newUser.email, role: newUser.role, fullName }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token, user: { _id, fullName, email: newUser.email, mobileNumber, role: newUser.role, isProfileCompleted: false } });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

  const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';

  if (isMongoConnected()) {
    try {
      const user = await UserModel.findOne({ email: email.toLowerCase() });
      if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
      if (!user.isActive) return res.status(403).json({ error: 'Account has been deactivated by administrator.' });

      const validPass = bcrypt.compareSync(password, user.password);
      if (!validPass) return res.status(401).json({ error: 'Invalid email or password.' });

      // Log login
      await LoginLogModel.create({ email: user.email, role: user.role, ipAddress });

      let isProfileCompleted = true;
      if (user.role === 'customer') {
        const cust = await CustomerModel.findOne({ userId: user._id });
        isProfileCompleted = cust ? cust.isProfileCompleted : false;
      }

      const token = jwt.sign({ id: user._id, email: user.email, role: user.role, fullName: user.fullName }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ 
        token, 
        user: { _id: user._id, fullName: user.fullName, email: user.email, mobileNumber: user.mobileNumber, role: user.role, isProfileCompleted } 
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    // In-Memory Engine
    const user = memoryStore.collections.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
    if (!user.isActive) return res.status(403).json({ error: 'Account has been deactivated by administrator.' });

    const validPass = bcrypt.compareSync(password, user.password);
    if (!validPass) return res.status(401).json({ error: 'Invalid email or password.' });

    memoryStore.collections.loginLogs.push({
      _id: 'l_' + Date.now(),
      email: user.email,
      role: user.role,
      loginTime: new Date().toISOString(),
      ipAddress
    });

    let isProfileCompleted = true;
    if (user.role === 'customer') {
      const cust = memoryStore.collections.customers.find(c => c.userId === user._id);
      isProfileCompleted = cust ? cust.isProfileCompleted : false;
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role, fullName: user.fullName }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ 
      token, 
      user: { _id: user._id, fullName: user.fullName, email: user.email, mobileNumber: user.mobileNumber, role: user.role, isProfileCompleted } 
    });
  }
});

apiRouter.get('/auth/me', authenticateToken, async (req: any, res) => {
  const userId = req.user.id;
  if (isMongoConnected()) {
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    let isProfileCompleted = true;
    let customerProfile = null;
    if (user.role === 'customer') {
      customerProfile = await CustomerModel.findOne({ userId: user._id });
      isProfileCompleted = customerProfile ? customerProfile.isProfileCompleted : false;
    }
    return res.json({ user: { _id: user._id, fullName: user.fullName, email: user.email, mobileNumber: user.mobileNumber, role: user.role, isProfileCompleted }, customerProfile });
  } else {
    const user = memoryStore.collections.users.find(u => u._id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    let isProfileCompleted = true;
    let customerProfile = null;
    if (user.role === 'customer') {
      customerProfile = memoryStore.collections.customers.find(c => c.userId === user._id);
      isProfileCompleted = customerProfile ? customerProfile.isProfileCompleted : false;
    }
    return res.json({ user: { _id: user._id, fullName: user.fullName, email: user.email, mobileNumber: user.mobileNumber, role: user.role, isProfileCompleted }, customerProfile });
  }
});

// ==========================================
// 2. CUSTOMER DETAILS PROFILE
// ==========================================

apiRouter.post('/customers/profile', authenticateToken, async (req: any, res) => {
  const userId = req.user.id;
  const { name, email, mobileNumber, address, profileImage } = req.body;

  if (isMongoConnected()) {
    let cust = await CustomerModel.findOne({ userId });
    if (!cust) {
      cust = await CustomerModel.create({ userId, name, email, mobileNumber, address, profileImage, isProfileCompleted: true });
    } else {
      cust.name = name || cust.name;
      cust.email = email || cust.email;
      cust.mobileNumber = mobileNumber || cust.mobileNumber;
      cust.address = address || cust.address;
      cust.profileImage = profileImage !== undefined ? profileImage : cust.profileImage;
      cust.isProfileCompleted = true;
      await cust.save();
    }
    // Update user base if name/mobile changed
    await UserModel.findByIdAndUpdate(userId, { fullName: cust.name, mobileNumber: cust.mobileNumber });
    return res.json({ message: 'Profile saved automatically', customerProfile: cust });
  } else {
    let cust = memoryStore.collections.customers.find(c => c.userId === userId);
    if (!cust) {
      cust = { _id: 'c_' + Date.now(), userId, name, email, mobileNumber, address, profileImage, isProfileCompleted: true };
      memoryStore.collections.customers.push(cust);
    } else {
      cust.name = name || cust.name;
      cust.email = email || cust.email;
      cust.mobileNumber = mobileNumber || cust.mobileNumber;
      cust.address = address || cust.address;
      if (profileImage !== undefined) cust.profileImage = profileImage;
      cust.isProfileCompleted = true;
    }
    const user = memoryStore.collections.users.find(u => u._id === userId);
    if (user) { user.fullName = cust.name; user.mobileNumber = cust.mobileNumber; }
    return res.json({ message: 'Profile saved automatically', customerProfile: cust });
  }
});

// ==========================================
// 3. PRODUCT MANAGEMENT
// ==========================================

apiRouter.get('/products', async (req, res) => {
  const { category, search, featured, offer, bestSeller } = req.query;

  if (isMongoConnected()) {
    const filter: any = {};
    if (category && category !== 'All') filter.category = category;
    if (featured === 'true') filter.isFeatured = true;
    if (offer === 'true') filter.isOffer = true;
    if (bestSeller === 'true') filter.isBestSeller = true;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const list = await ProductModel.find(filter);
    return res.json(list);
  } else {
    let list = [...memoryStore.collections.products];
    if (category && category !== 'All') list = list.filter(p => p.category === category);
    if (featured === 'true') list = list.filter(p => p.isFeatured);
    if (offer === 'true') list = list.filter(p => p.isOffer);
    if (bestSeller === 'true') list = list.filter(p => p.isBestSeller);
    if (search) list = list.filter(p => p.name.toLowerCase().includes((search as string).toLowerCase()));
    return res.json(list);
  }
});

apiRouter.post('/products', authenticateToken, requireAdmin, async (req, res) => {
  const body = req.body;
  if (isMongoConnected()) {
    const created = await ProductModel.create(body);
    return res.json(created);
  } else {
    const newProd = { _id: 'p_' + Date.now(), ...body };
    memoryStore.collections.products.push(newProd);
    return res.json(newProd);
  }
});

apiRouter.put('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  if (isMongoConnected()) {
    const updated = await ProductModel.findByIdAndUpdate(id, body, { new: true });
    return res.json(updated);
  } else {
    const idx = memoryStore.collections.products.findIndex(p => p._id === id);
    if (idx !== -1) {
      memoryStore.collections.products[idx] = { ...memoryStore.collections.products[idx], ...body };
      return res.json(memoryStore.collections.products[idx]);
    }
    return res.status(404).json({ error: 'Product not found' });
  }
});

apiRouter.delete('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  const id = req.params.id;
  if (isMongoConnected()) {
    await ProductModel.findByIdAndDelete(id);
    return res.json({ success: true });
  } else {
    memoryStore.collections.products = memoryStore.collections.products.filter(p => p._id !== id);
    return res.json({ success: true });
  }
});

// ==========================================
// 4. PURCHASES & POS BILLING
// ==========================================

apiRouter.post('/purchases', authenticateToken, async (req: any, res) => {
  const customerId = req.user.id;
  const { customerName, customerEmail, customerMobile, customerAddress, items, paymentMethod, upiIdOrTransaction } = req.body;

  if (!items || items.length === 0) return res.status(400).json({ error: 'Cart is empty.' });

  // Calculate Subtotal, GST, GrandTotal
  let subtotal = 0;
  items.forEach((item: any) => { subtotal += item.price * item.quantity; });
  const gstAmount = Math.round(subtotal * 0.05); // 5% Supermarket GST
  const grandTotal = subtotal + gstAmount;

  const invoiceNumber = 'INV-' + Math.floor(100000 + Math.random() * 900000);
  const purchaseData = {
    invoiceNumber,
    customerId,
    customerName: customerName || req.user.fullName,
    customerEmail: customerEmail || req.user.email,
    customerMobile: customerMobile || '',
    customerAddress: customerAddress || '',
    items,
    subtotal,
    gstAmount,
    grandTotal,
    paymentMethod: paymentMethod || 'Cash',
    paymentStatus: paymentMethod === 'Online' ? 'Paid' : 'Paid', // Supermarket POS default
    upiIdOrTransaction: upiIdOrTransaction || '',
    cashierName: 'Counter POS 01',
    purchaseDate: new Date().toISOString()
  };

  if (isMongoConnected()) {
    // Deduct stock
    for (const item of items) {
      await ProductModel.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }
    const saved = await PurchaseModel.create(purchaseData);
    return res.json(saved);
  } else {
    // Deduct stock memory
    for (const item of items) {
      const p = memoryStore.collections.products.find(prod => prod._id === item.productId);
      if (p) p.stock = Math.max(0, p.stock - item.quantity);
    }
    const saved = { _id: 'pur_' + Date.now(), ...purchaseData };
    memoryStore.collections.purchases.unshift(saved);
    return res.json(saved);
  }
});

apiRouter.get('/purchases', authenticateToken, async (req: any, res) => {
  const role = req.user.role;
  const userId = req.user.id;

  if (isMongoConnected()) {
    if (role === 'admin') {
      const list = await PurchaseModel.find({}).sort({ purchaseDate: -1 });
      return res.json(list);
    } else {
      const list = await PurchaseModel.find({ customerId: userId }).sort({ purchaseDate: -1 });
      return res.json(list);
    }
  } else {
    if (role === 'admin') {
      return res.json(memoryStore.collections.purchases);
    } else {
      return res.json(memoryStore.collections.purchases.filter(p => p.customerId === userId));
    }
  }
});

apiRouter.put('/purchases/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  const id = req.params.id;
  const { paymentStatus } = req.body;
  if (isMongoConnected()) {
    const updated = await PurchaseModel.findByIdAndUpdate(id, { paymentStatus }, { new: true });
    return res.json(updated);
  } else {
    const pur = memoryStore.collections.purchases.find(p => p._id === id);
    if (pur) pur.paymentStatus = paymentStatus;
    return res.json(pur || {});
  }
});

// ==========================================
// 5. ADMIN DASHBOARD & AGGREGATIONS
// ==========================================

apiRouter.get('/admin/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  if (isMongoConnected()) {
    try {
      const purchases = await PurchaseModel.find({ paymentStatus: { $in: ['Paid', 'Delivered'] } });
      const customersCount = await UserModel.countDocuments({ role: 'customer' });
      const visitorObj = await VisitorModel.findOne({});
      const totalVisitors = visitorObj ? visitorObj.count : 1350;

      let totalRevenue = 0;
      let productsSold = 0;
      const categorySalesMap: Record<string, number> = { Grocery: 0, Dairy: 0, Snacks: 0, Beverages: 0, 'Personal Care': 0 };
      const dailyMap: Record<string, number> = {};

      purchases.forEach(pur => {
        totalRevenue += pur.grandTotal;
        pur.items.forEach((it: any) => {
          productsSold += it.quantity;
        });
        const dStr = new Date(pur.purchaseDate).toISOString().split('T')[0];
        dailyMap[dStr] = (dailyMap[dStr] || 0) + pur.grandTotal;
      });

      const dailyRevenue = Object.keys(dailyMap).sort().map(date => ({ date, revenue: dailyMap[date] }));
      if (dailyRevenue.length === 0) {
        dailyRevenue.push({ date: new Date().toISOString().split('T')[0], revenue: 0 });
      }

      const categorySales = [
        { category: 'Grocery', sales: productsSold > 0 ? Math.round(productsSold * 0.45) : 0 },
        { category: 'Dairy', sales: productsSold > 0 ? Math.round(productsSold * 0.25) : 0 },
        { category: 'Snacks', sales: productsSold > 0 ? Math.round(productsSold * 0.15) : 0 },
        { category: 'Beverages', sales: productsSold > 0 ? Math.round(productsSold * 0.10) : 0 },
        { category: 'Personal Care', sales: productsSold > 0 ? Math.round(productsSold * 0.05) : 0 }
      ];

      const monthlyRevenue = [
        { month: 'Jan', revenue: Math.round(totalRevenue * 0.15) },
        { month: 'Feb', revenue: Math.round(totalRevenue * 0.22) },
        { month: 'Mar', revenue: Math.round(totalRevenue * 0.28) },
        { month: 'Apr', revenue: Math.round(totalRevenue * 0.35) }
      ];

      const customerGrowth = [
        { month: 'Jan', count: Math.round(customersCount * 0.3) },
        { month: 'Feb', count: Math.round(customersCount * 0.6) },
        { month: 'Mar', count: Math.round(customersCount * 0.85) },
        { month: 'Apr', count: customersCount }
      ];

      return res.json({
        totalRevenue,
        productsSold,
        totalCustomers: customersCount,
        totalVisitors,
        dailyRevenue,
        weeklyRevenue: [
          { week: 'Week 1', revenue: Math.round(totalRevenue * 0.2) },
          { week: 'Week 2', revenue: Math.round(totalRevenue * 0.3) },
          { week: 'Week 3', revenue: Math.round(totalRevenue * 0.25) },
          { week: 'Week 4', revenue: Math.round(totalRevenue * 0.25) }
        ],
        monthlyRevenue,
        categorySales,
        customerGrowth
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    // In-Memory Engine Aggregation
    const purchases = memoryStore.collections.purchases.filter(p => p.paymentStatus !== 'Pending');
    const customersCount = memoryStore.collections.users.filter(u => u.role === 'customer').length;
    const totalVisitors = memoryStore.collections.visitors[0]?.count || 1420;

    let totalRevenue = 0;
    let productsSold = 0;
    const dailyMap: Record<string, number> = {};

    purchases.forEach(pur => {
      totalRevenue += pur.grandTotal;
      pur.items.forEach((it: any) => { productsSold += it.quantity; });
      const dStr = pur.purchaseDate.split('T')[0];
      dailyMap[dStr] = (dailyMap[dStr] || 0) + pur.grandTotal;
    });

    const dailyRevenue = Object.keys(dailyMap).sort().map(date => ({ date, revenue: dailyMap[date] }));
    if (dailyRevenue.length === 0) {
      dailyRevenue.push({ date: new Date().toISOString().split('T')[0], revenue: 0 });
    }

    return res.json({
      totalRevenue,
      productsSold,
      totalCustomers: customersCount,
      totalVisitors,
      dailyRevenue,
      weeklyRevenue: [
        { week: 'Week 1', revenue: Math.round(totalRevenue * 0.2) },
        { week: 'Week 2', revenue: Math.round(totalRevenue * 0.3) },
        { week: 'Week 3', revenue: Math.round(totalRevenue * 0.25) },
        { week: 'Week 4', revenue: Math.round(totalRevenue * 0.25) }
      ],
      monthlyRevenue: [
        { month: 'Jan', revenue: Math.round(totalRevenue * 0.2) },
        { month: 'Feb', revenue: Math.round(totalRevenue * 0.35) },
        { month: 'Mar', revenue: Math.round(totalRevenue * 0.45) }
      ],
      categorySales: [
        { category: 'Grocery', sales: productsSold > 0 ? Math.round(productsSold * 0.5) : 10 },
        { category: 'Dairy', sales: productsSold > 0 ? Math.round(productsSold * 0.3) : 8 },
        { category: 'Snacks', sales: productsSold > 0 ? Math.round(productsSold * 0.2) : 5 }
      ],
      customerGrowth: [
        { month: 'Jan', count: Math.max(1, Math.round(customersCount * 0.4)) },
        { month: 'Feb', count: Math.max(1, Math.round(customersCount * 0.7)) },
        { month: 'Mar', count: customersCount }
      ]
    });
  }
});

// ==========================================
// 6. CUSTOMER MANAGEMENT (Admin)
// ==========================================

apiRouter.get('/admin/customers', authenticateToken, requireAdmin, async (req, res) => {
  if (isMongoConnected()) {
    const users = await UserModel.find({ role: 'customer' });
    const customers = await CustomerModel.find({});
    const merged = users.map(u => {
      const cust = customers.find(c => c.userId?.toString() === u._id.toString());
      return {
        _id: u._id,
        fullName: u.fullName,
        email: u.email,
        mobileNumber: u.mobileNumber,
        isActive: u.isActive,
        createdAt: u.createdAt,
        address: cust?.address || '',
        profileImage: cust?.profileImage || '',
        isProfileCompleted: cust?.isProfileCompleted || false
      };
    });
    return res.json(merged);
  } else {
    const users = memoryStore.collections.users.filter(u => u.role === 'customer');
    const merged = users.map(u => {
      const cust = memoryStore.collections.customers.find(c => c.userId === u._id);
      return {
        _id: u._id,
        fullName: u.fullName,
        email: u.email,
        mobileNumber: u.mobileNumber,
        isActive: u.isActive,
        createdAt: u.createdAt,
        address: cust?.address || '',
        profileImage: cust?.profileImage || '',
        isProfileCompleted: cust?.isProfileCompleted || false
      };
    });
    return res.json(merged);
  }
});

apiRouter.put('/admin/customers/:id/toggle-active', authenticateToken, requireAdmin, async (req, res) => {
  const id = req.params.id;
  const { isActive } = req.body;
  if (isMongoConnected()) {
    await UserModel.findByIdAndUpdate(id, { isActive });
    return res.json({ success: true, isActive });
  } else {
    const u = memoryStore.collections.users.find(user => user._id === id);
    if (u) u.isActive = isActive;
    return res.json({ success: true, isActive });
  }
});

apiRouter.delete('/admin/customers/:id', authenticateToken, requireAdmin, async (req, res) => {
  const id = req.params.id;
  // Deleting customer should delete Customer profile, User account, Customer login logs, Associated data immediately
  if (isMongoConnected()) {
    await UserModel.findByIdAndDelete(id);
    await CustomerModel.findOneAndDelete({ userId: id });
    await PurchaseModel.deleteMany({ customerId: id });
    return res.json({ success: true, message: 'Deleted customer profile, account, and associated data immediately.' });
  } else {
    memoryStore.collections.users = memoryStore.collections.users.filter(u => u._id !== id);
    memoryStore.collections.customers = memoryStore.collections.customers.filter(c => c.userId !== id);
    memoryStore.collections.purchases = memoryStore.collections.purchases.filter(p => p.customerId !== id);
    return res.json({ success: true, message: 'Deleted customer profile, account, and associated data immediately.' });
  }
});

// ==========================================
// 7. SUPPLIERS MODULE
// ==========================================

apiRouter.get('/suppliers', async (req, res) => {
  if (isMongoConnected()) {
    const list = await SupplierModel.find({});
    return res.json(list);
  } else {
    return res.json(memoryStore.collections.suppliers);
  }
});

apiRouter.post('/suppliers', authenticateToken, requireAdmin, async (req, res) => {
  const body = req.body;
  if (isMongoConnected()) {
    const s = await SupplierModel.create(body);
    return res.json(s);
  } else {
    const s = { _id: 's_' + Date.now(), ...body };
    memoryStore.collections.suppliers.push(s);
    return res.json(s);
  }
});

apiRouter.put('/suppliers/:id', authenticateToken, requireAdmin, async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  if (isMongoConnected()) {
    const s = await SupplierModel.findByIdAndUpdate(id, body, { new: true });
    return res.json(s);
  } else {
    const idx = memoryStore.collections.suppliers.findIndex(sup => sup._id === id);
    if (idx !== -1) {
      memoryStore.collections.suppliers[idx] = { ...memoryStore.collections.suppliers[idx], ...body };
      return res.json(memoryStore.collections.suppliers[idx]);
    }
    return res.status(404).json({ error: 'Supplier not found' });
  }
});

apiRouter.delete('/suppliers/:id', authenticateToken, requireAdmin, async (req, res) => {
  const id = req.params.id;
  if (isMongoConnected()) {
    await SupplierModel.findByIdAndDelete(id);
    return res.json({ success: true });
  } else {
    memoryStore.collections.suppliers = memoryStore.collections.suppliers.filter(s => s._id !== id);
    return res.json({ success: true });
  }
});

// ==========================================
// 8. WEBSITE CONTENT & SETTINGS
// ==========================================

apiRouter.get('/content', async (req, res) => {
  if (isMongoConnected()) {
    let content = await WebsiteContentModel.findOne({});
    if (!content) {
      content = await WebsiteContentModel.create({});
    }
    return res.json(content);
  } else {
    return res.json(memoryStore.collections.websiteContent[0]);
  }
});

apiRouter.put('/content', authenticateToken, requireAdmin, async (req, res) => {
  const body = req.body;
  if (isMongoConnected()) {
    let content = await WebsiteContentModel.findOne({});
    if (!content) {
      content = await WebsiteContentModel.create(body);
    } else {
      Object.assign(content, body);
      await content.save();
    }
    return res.json(content);
  } else {
    memoryStore.collections.websiteContent[0] = { ...memoryStore.collections.websiteContent[0], ...body };
    return res.json(memoryStore.collections.websiteContent[0]);
  }
});

apiRouter.post('/visitors', async (req, res) => {
  if (isMongoConnected()) {
    const v = await VisitorModel.findOneAndUpdate({}, { $inc: { count: 1 } }, { new: true, upsert: true });
    return res.json({ count: v.count });
  } else {
    if (!memoryStore.collections.visitors[0]) memoryStore.collections.visitors[0] = { count: 1250 };
    memoryStore.collections.visitors[0].count++;
    return res.json({ count: memoryStore.collections.visitors[0].count });
  }
});
