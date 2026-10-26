export interface User {
  _id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: 'customer' | 'admin';
  isActive: boolean;
  createdAt: string;
}

export interface CustomerProfile {
  _id: string;
  userId: string;
  name: string;
  email: string;
  mobileNumber: string;
  address: string;
  profileImage: string;
  isProfileCompleted: boolean;
}

export interface Product {
  _id: string;
  name: string;
  category: 'Grocery' | 'Dairy' | 'Snacks' | 'Beverages' | 'Personal Care';
  price: number;
  stock: number;
  image: string;
  description?: string;
  isFeatured?: boolean;
  isOffer?: boolean;
  isBestSeller?: boolean;
  discountPercentage?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface PurchaseItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  itemTotal: number;
}

export interface Purchase {
  _id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  customerAddress: string;
  items: PurchaseItem[];
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
  paymentMethod: 'Cash' | 'Online';
  paymentStatus: 'Paid' | 'Pending' | 'Delivered';
  upiIdOrTransaction?: string;
  cashierName: string;
  purchaseDate: string;
}

export interface Supplier {
  _id: string;
  supplierName: string;
  companyName: string;
  email: string;
  phone: string;
  gstNumber: string;
  address: string;
  productsSupplied: string[];
}

export interface WebsiteContent {
  storeName: string;
  storeDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  workingHours: string;
  aboutVision: string;
  aboutMission: string;
  heroBannerTitle: string;
  heroBannerSubtitle: string;
  heroImage: string;
  announcementText?: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  language: string;
  notificationsEnabled: boolean;
}

export interface LoginLog {
  _id: string;
  email: string;
  role: string;
  loginTime: string;
  ipAddress: string;
}

export interface VisitorStat {
  count: number;
}

export interface DashboardStats {
  totalRevenue: number;
  productsSold: number;
  totalCustomers: number;
  totalVisitors: number;
  dailyRevenue: { date: string; revenue: number }[];
  weeklyRevenue: { week: string; revenue: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
  categorySales: { category: string; sales: number }[];
  customerGrowth: { month: string; count: number }[];
}
