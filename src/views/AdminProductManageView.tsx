import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Product } from '../types.ts';
import { Package, Plus, Edit, Trash2, Search, Upload, CheckCircle, Store, X } from 'lucide-react';

export const AdminProductManageView: React.FC = () => {
  const { token, showToast } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Grocery');
  const [price, setPrice] = useState('100');
  const [stock, setStock] = useState('50');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isOffer, setIsOffer] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState('10');
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const categories = ['Grocery', 'Dairy', 'Snacks', 'Beverages', 'Personal Care'];

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch {
      showToast('Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (p?: Product) => {
    if (p) {
      setEditId(p._id);
      setName(p.name);
      setCategory(p.category);
      setPrice(String(p.price));
      setStock(String(p.stock));
      setDescription(p.description || '');
      setImage(p.image || '');
      setIsOffer(Boolean(p.isOffer));
      setDiscountPercentage(String(p.discountPercentage || 10));
      setIsBestSeller(Boolean(p.isBestSeller));
    } else {
      setEditId(null);
      setName('');
      setCategory('Grocery');
      setPrice('100');
      setStock('50');
      setDescription('');
      setImage('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80');
      setIsOffer(false);
      setDiscountPercentage('10');
      setIsBestSeller(false);
    }
    setShowModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const url = editId ? `/api/products/${editId}` : '/api/products';
    const method = editId ? 'PUT' : 'POST';

    const payload = {
      name,
      category,
      price: Number(price),
      stock: Number(stock),
      description,
      image,
      isOffer,
      discountPercentage: Number(discountPercentage),
      isBestSeller
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(`Product ${editId ? 'updated' : 'created'} successfully!`);
        setShowModal(false);
        fetchProducts();
      } else {
        showToast('Failed to save product');
      }
    } catch {
      showToast('Network error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, prodName: string) => {
    if (!confirm(`Delete product "${prodName}" from supermarket shelves?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setProducts(products.filter(p => p._id !== id));
        showToast('Product removed.');
      }
    } catch {
      showToast('Failed to delete product.');
    }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div id="admin-product-manage-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-8 h-8 text-emerald-600" />
            <span>Product Inventory Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Add, edit pricing, or update stock units in MongoDB inventory
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs outline-none"
            />
          </div>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition flex items-center gap-1.5 text-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-900 text-white font-semibold text-xs">
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price (₹)</th>
                  <th className="p-4">Available Stock</th>
                  <th className="p-4">Flags</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-sans">
                {filtered.map((prod) => (
                  <tr key={prod._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition">
                    <td className="p-4 flex items-center gap-3">
                      <img src={prod.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0" />
                      <div>
                        <strong className="block text-slate-900 dark:text-white line-clamp-1">{prod.name}</strong>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{prod.description}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 font-medium">{prod.category}</td>
                    <td className="p-4 font-extrabold text-slate-900 dark:text-white">₹{prod.price}</td>
                    <td className="p-4">
                      <span className={`font-bold ${prod.stock < 10 ? 'text-amber-500' : 'text-emerald-600'}`}>
                        {prod.stock} Units
                      </span>
                    </td>
                    <td className="p-4 space-x-1">
                      {prod.isOffer && <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold rounded">Offer</span>}
                      {prod.isBestSeller && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold rounded">BestSeller</span>}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => openModal(prod)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(prod._id, prod.name)} className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CRUD Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border space-y-6 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{editId ? 'Edit Supermarket Item' : 'Add New Inventory Item'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Product Name *</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-transparent" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Category *</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border rounded-xl outline-none bg-white dark:bg-slate-800">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Price (₹) *</label>
                  <input type="number" required value={price} onChange={e => setPrice(e.target.value)} className="w-full px-3 py-2 border rounded-xl outline-none bg-transparent" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Stock Units *</label>
                  <input type="number" required value={stock} onChange={e => setStock(e.target.value)} className="w-full px-3 py-2 border rounded-xl outline-none bg-transparent" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-xl outline-none bg-transparent" />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Product Image URL or Upload Photo</label>
                <div className="flex gap-2">
                  <input type="text" value={image} onChange={e => setImage(e.target.value)} placeholder="https://..." className="flex-1 px-3 py-2 border rounded-xl outline-none bg-transparent" />
                  <label className="px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl cursor-pointer hover:bg-slate-200 flex items-center justify-center font-bold">
                    <Upload className="w-4 h-4" />
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                {image && <img src={image} alt="" className="w-16 h-16 rounded-lg object-cover mt-2 border" />}
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input type="checkbox" checked={isOffer} onChange={e => setIsOffer(e.target.checked)} className="rounded text-emerald-600" />
                  <span>Is Offer Item?</span>
                </label>

                {isOffer && (
                  <div className="flex items-center gap-1">
                    <span>Discount %:</span>
                    <input type="number" value={discountPercentage} onChange={e => setDiscountPercentage(e.target.value)} className="w-16 px-2 py-1 border rounded" />
                  </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input type="checkbox" checked={isBestSeller} onChange={e => setIsBestSeller(e.target.checked)} className="rounded text-emerald-600" />
                  <span>Best Seller Flag</span>
                </label>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={submitting} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow">
                  {submitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
