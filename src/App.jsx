import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit3,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  TrendingUp,
  AlertTriangle,
  Layers,
  LayoutGrid,
  List,
  Sparkles,
  Laptop,
  Shirt,
  BookOpen,
  ArrowUpDown,
  Coins,
  LogOut,
  User,
  Lock,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Heart,
  Star,
  Eye,
  CheckCircle,
  Truck,
  ShieldCheck,
  Gamepad2,
  Home,
  CreditCard,
  QrCode,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import './App.css';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Akun Demo Tersedia
const DEMO_USERS = [
  { username: 'admin', password: '123', name: 'Administrator', role: 'admin', avatar: '👑' },
  { username: 'budi', password: '123', name: 'Budi Santoso', role: 'client', avatar: '🧑‍💻' },
  { username: 'siti', password: '123', name: 'Siti Rahma', role: 'client', avatar: '👩‍💼' }
];

export default function App() {
  // Sesi User Tab-Spesifik (sessionStorage menjamin tiap tab Chrome memiliki login terisolasi)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('apex_session_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Global Products State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Common Filter / Search State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Admin Specific State
  const [adminViewMode, setAdminViewMode] = useState('grid'); // 'grid' | 'table'
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: 0,
    tags: ''
  });

  // Client Specific State (Cart & Wishlist scoped per session / user)
  const [cart, setCart] = useState(() => {
    try {
      const u = sessionStorage.getItem('apex_session_user');
      if (!u) return [];
      const userObj = JSON.parse(u);
      const saved = sessionStorage.getItem(`cart_${userObj.username}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const u = sessionStorage.getItem('apex_session_user');
      if (!u) return [];
      const userObj = JSON.parse(u);
      const saved = sessionStorage.getItem(`wish_${userObj.username}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [checkoutData, setCheckoutData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    payment: 'qris'
  });

  // Sinkronisasi Cart & Wishlist per user ke sessionStorage
  useEffect(() => {
    if (currentUser?.username) {
      sessionStorage.setItem(`cart_${currentUser.username}`, JSON.stringify(cart));
    }
  }, [cart, currentUser]);

  useEffect(() => {
    if (currentUser?.username) {
      sessionStorage.setItem(`wish_${currentUser.username}`, JSON.stringify(wishlist));
    }
  }, [wishlist, currentUser]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Products & Categories
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resP, resC, resH] = await Promise.all([
        fetch(`${API_BASE}/products?limit=100`),
        fetch(`${API_BASE}/categories`),
        fetch(`${API_BASE}/health`)
      ]);
      if (resP.ok) {
        const data = await resP.json();
        setProducts(data);
      }
      if (resC.ok) {
        const cats = await resC.json();
        setCategories(cats);
      }
      setBackendOnline(resH.ok);
    } catch {
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Format Mata Uang IDR
  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val || 0);
  };

  // ==========================================
  // AUTHENTICATION HANDLERS
  // ==========================================
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    const matched = DEMO_USERS.find(
      (u) =>
        u.username.toLowerCase() === loginUsername.trim().toLowerCase() &&
        u.password === loginPassword
    );

    if (matched) {
      performLogin(matched);
    } else {
      setLoginError('Username atau password salah. Coba gunakan akun demo di bawah.');
    }
  };

  const performLogin = (userObj) => {
    sessionStorage.setItem('apex_session_user', JSON.stringify(userObj));
    setCurrentUser(userObj);

    // Muat cart tab ini
    try {
      const savedCart = sessionStorage.getItem(`cart_${userObj.username}`);
      setCart(savedCart ? JSON.parse(savedCart) : []);
      const savedWish = sessionStorage.getItem(`wish_${userObj.username}`);
      setWishlist(savedWish ? JSON.parse(savedWish) : []);
    } catch {
      setCart([]);
      setWishlist([]);
    }

    if (userObj.role === 'client') {
      setCheckoutData((prev) => ({ ...prev, name: userObj.name }));
    }
    showToast(`Selamat datang, ${userObj.name}!`);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('apex_session_user');
    setCurrentUser(null);
    setLoginUsername('');
    setLoginPassword('');
    setLoginError('');
  };

  const handleOpenNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  // ==========================================
  // FILTER & SORT CALCULATIONS
  // ==========================================
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchSearch =
          search.trim() === '' ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

        const matchCat =
          selectedCategory === '' ||
          p.category.toLowerCase() === selectedCategory.toLowerCase();

        return matchSearch && matchCat;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'stock-asc') return a.stock - b.stock;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        return b.id - a.id; // newest
      });
  }, [products, search, selectedCategory, sortBy]);

  // Admin KPI Stats
  const adminStats = useMemo(() => {
    const totalItems = products.length;
    const totalVal = products.reduce((acc, p) => acc + p.price * p.stock, 0);
    const lowStock = products.filter((p) => p.stock <= 5).length;
    return { totalItems, totalVal, lowStock, totalCats: categories.length };
  }, [products, categories]);

  // Cart Calculations
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingCost = cartSubtotal >= 200000 || cartSubtotal === 0 ? 0 : 15000;
  const grandTotal = cartSubtotal + shippingCost;

  // Category Icon Meta
  const getCategoryMeta = (cat = '') => {
    const c = (cat || '').toLowerCase();
    if (c.includes('electronic')) return { theme: 'electronics', icon: <Laptop size={36} /> };
    if (c.includes('gaming')) return { theme: 'gaming', icon: <Gamepad2 size={36} /> };
    if (c.includes('apparel')) return { theme: 'apparel', icon: <Shirt size={36} /> };
    if (c.includes('book')) return { theme: 'books', icon: <BookOpen size={36} /> };
    return { theme: 'home', icon: <Sparkles size={36} /> };
  };

  // ==========================================
  // ADMIN CRUD HANDLERS
  // ==========================================
  const handleQuickStock = async (product, delta) => {
    const newStock = Math.max(0, product.stock + delta);
    try {
      const res = await fetch(`${API_BASE}/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p))
        );
      }
    } catch {
      showToast('Gagal mengubah stok');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Hapus produk "${name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Produk "${name}" berhasil dihapus`);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      showToast('Gagal menghapus produk');
    }
  };

  const openAdminModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description || '',
        price: product.price,
        category: product.category,
        stock: product.stock,
        tags: product.tags ? product.tags.join(', ') : ''
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        category: categories[0] || 'Electronics',
        stock: 10,
        tags: ''
      });
    }
    setIsAdminModalOpen(true);
  };

  const handleAdminFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: productForm.name.trim(),
      description: productForm.description.trim() || null,
      price: parseFloat(productForm.price) || 0,
      category: productForm.category.trim(),
      stock: parseInt(productForm.stock, 10) || 0,
      tags: productForm.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    };

    try {
      const url = editingProduct
        ? `${API_BASE}/products/${editingProduct.id}`
        : `${API_BASE}/products`;
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(editingProduct ? 'Produk berhasil diupdate!' : 'Produk baru ditambahkan!');
        setIsAdminModalOpen(false);
        fetchAllData();
      } else {
        const err = await res.json();
        showToast(err.detail?.[0]?.msg || 'Gagal menyimpan');
      }
    } catch {
      showToast('Error koneksi backend');
    }
  };

  // ==========================================
  // CLIENT SHOPPING HANDLERS
  // ==========================================
  const addToCart = (product, quantity = 1) => {
    if (product.stock <= 0) {
      showToast('Stok produk habis!');
      return;
    }
    setCart((prev) => {
      const exists = prev.find((item) => item.product.id === product.id);
      if (exists) {
        const nextQty = Math.min(product.stock, exists.quantity + quantity);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: nextQty } : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`"${product.name}" masuk keranjang!`);
  };

  const updateCartQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === id) {
            const next = item.quantity + delta;
            return next > 0 ? { ...item, quantity: next } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const toggleWishlist = (id, name) => {
    setWishlist((prev) => {
      const has = prev.includes(id);
      showToast(has ? `Dihapus dari Favorit` : `"${name}" masuk Favorit!`);
      return has ? prev.filter((item) => item !== id) : [...prev, id];
    });
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    const orderId = `APX-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderSuccess({
      orderId,
      items: [...cart],
      total: grandTotal,
      customer: { ...checkoutData }
    });
    setCart([]);
    setIsCheckoutOpen(false);
  };

  // ==========================================
  // VIEW 1: LOGIN SCREEN (Jika belum login di tab ini)
  // ==========================================
  if (!currentUser) {
    return (
      <div className="login-screen-bg">
        <div className="login-card">
          <div className="login-brand-header">
            <div className="login-logo-gem">
              <Package size={28} />
            </div>
            <h1>Apex Store & Admin</h1>
            <p>Sistem Multi-User Terisolasi per Tab Browser</p>
          </div>

          {loginError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: 10, fontSize: '0.82rem', marginBottom: 16 }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="login-form">
            <div className="login-input-group">
              <label className="login-label">Username</label>
              <div className="login-input-wrapper">
                <User size={16} className="login-icon-pos" />
                <input
                  type="text"
                  required
                  placeholder="admin / budi / siti"
                  className="login-input-field"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="login-input-group">
              <label className="login-label">Password</label>
              <div className="login-input-wrapper">
                <Lock size={16} className="login-icon-pos" />
                <input
                  type="password"
                  required
                  placeholder="Ketik password (demo: 123)"
                  className="login-input-field"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn-submit-login">
              Masuk ke Akun
            </button>
          </form>

          <div className="demo-divider">Atau 1-Click Login Demo</div>

          <div className="demo-accounts-grid">
            <button
              type="button"
              className="demo-account-btn"
              onClick={() => performLogin(DEMO_USERS[0])}
            >
              <div className="demo-acc-left">
                <div className="demo-acc-avatar admin">👑</div>
                <div>
                  <div className="demo-acc-name">Administrator (Admin)</div>
                  <div className="demo-acc-role">Akses penuh CRUD katalog & stok</div>
                </div>
              </div>
              <span className="demo-role-badge admin">Dashboard Admin</span>
            </button>

            <button
              type="button"
              className="demo-account-btn"
              onClick={() => performLogin(DEMO_USERS[1])}
            >
              <div className="demo-acc-left">
                <div className="demo-acc-avatar client1">🧑‍💻</div>
                <div>
                  <div className="demo-acc-name">Budi Santoso (Klien 1)</div>
                  <div className="demo-acc-role">Belanja, keranjang, checkout</div>
                </div>
              </div>
              <span className="demo-role-badge client">Toko Klien 1</span>
            </button>

            <button
              type="button"
              className="demo-account-btn"
              onClick={() => performLogin(DEMO_USERS[2])}
            >
              <div className="demo-acc-left">
                <div className="demo-acc-avatar client2">👩‍💼</div>
                <div>
                  <div className="demo-acc-name">Siti Rahma (Klien 2)</div>
                  <div className="demo-acc-role">Sesi & keranjang terpisah</div>
                </div>
              </div>
              <span className="demo-role-badge client">Toko Klien 2</span>
            </button>
          </div>

          <div className="multi-tab-notice">
            <Sparkles size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong>Multi-Login di 1 Chrome:</strong> Buka tab baru di browser Anda untuk login sebagai user lain secara bersamaan tanpa saling menimpa.
            </div>
          </div>
        </div>

        {toastMessage && (
          <div className="toast-floating">
            <CheckCircle2 size={18} color="#34d399" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // SHARED NAVBAR UNTUK ADMIN MAUPUN CLIENT
  // ==========================================
  const renderNavbar = () => (
    <nav className="navbar-glass">
      <div className="brand-section">
        <div className="logo-gem">
          {currentUser.role === 'admin' ? <Shield size={22} /> : <ShoppingBag size={22} />}
        </div>
        <div className="brand-info">
          <h1>Apex {currentUser.role === 'admin' ? 'Catalog Admin' : 'Store'}</h1>
          <p>{currentUser.role === 'admin' ? 'Management Dashboard' : 'Official Storefront'}</p>
        </div>
      </div>

      <div className="nav-actions">
        {currentUser.role === 'admin' && (
          <div className={`status-pill ${backendOnline ? 'online' : 'offline'}`}>
            <span className="pulse-dot"></span>
            {backendOnline ? 'FastAPI Online' : 'Backend Offline'}
          </div>
        )}

        {currentUser.role === 'client' && (
          <button
            className="btn-modern-primary"
            style={{ padding: '8px 14px' }}
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart size={16} />
            Keranjang ({totalCartCount})
          </button>
        )}

        {/* User Identity Pill */}
        <div className="user-profile-badge">
          <div className={`user-avatar-circle ${currentUser.role}`}>
            {currentUser.avatar}
          </div>
          <div className="user-meta-text">
            <span className="user-meta-name">{currentUser.name}</span>
            <span className="user-meta-role">
              {currentUser.role === 'admin' ? 'Administrator' : 'Customer'}
            </span>
          </div>
        </div>

        {/* Tombol Buka Tab Baru (Test Multi-User) */}
        <button
          className="btn-open-new-tab"
          onClick={handleOpenNewTab}
          title="Buka tab baru untuk login sebagai user lain di Chrome"
        >
          <ExternalLink size={14} />
          Buka Tab Baru
        </button>

        {/* Logout */}
        <button className="btn-logout" onClick={handleLogout} title="Keluar dari sesi tab ini">
          <LogOut size={14} />
          Keluar
        </button>
      </div>
    </nav>
  );

  // ==========================================
  // VIEW 2: ADMIN DASHBOARD
  // ==========================================
  if (currentUser.role === 'admin') {
    return (
      <div className="app-wrapper">
        {renderNavbar()}

        {/* Admin KPI Stats */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-box indigo"><Package size={22} /></div>
            <div>
              <div className="stat-label">Total Produk</div>
              <div className="stat-value">{adminStats.totalItems}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-box emerald"><Coins size={22} /></div>
            <div>
              <div className="stat-label">Valuasi Inventaris</div>
              <div className="stat-value">{formatRupiah(adminStats.totalVal)}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-box amber"><AlertTriangle size={22} /></div>
            <div>
              <div className="stat-label">Stok Kritis (≤ 5)</div>
              <div className="stat-value">{adminStats.lowStock}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-box purple"><Layers size={22} /></div>
            <div>
              <div className="stat-label">Kategori Aktif</div>
              <div className="stat-value">{adminStats.totalCats}</div>
            </div>
          </div>
        </section>

        {/* Control Panel */}
        <section className="control-panel">
          <div className="search-and-tools">
            <div className="search-input-wrapper">
              <Search className="search-icon-inside" size={16} />
              <input
                type="text"
                className="search-input"
                placeholder="Cari produk katalog..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="clear-search-btn" onClick={() => setSearch('')}>
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="tools-right">
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Terbaru (ID Terbesar)</option>
                <option value="price-asc">Harga: Termurah</option>
                <option value="price-desc">Harga: Termahal</option>
                <option value="stock-asc">Stok Tersedikit</option>
                <option value="name-asc">Nama: A - Z</option>
              </select>

              <div className="view-switcher">
                <button
                  className={`view-btn ${adminViewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setAdminViewMode('grid')}
                  title="Grid View"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  className={`view-btn ${adminViewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setAdminViewMode('table')}
                  title="Table View"
                >
                  <List size={16} />
                </button>
              </div>

              <button className="btn-modern-primary" onClick={() => openAdminModal()}>
                <Plus size={16} />
                Tambah Produk
              </button>
            </div>
          </div>

          <div className="category-pills">
            <button
              className={`pill-item ${selectedCategory === '' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('')}
            >
              Semua ({products.length})
            </button>
            {categories.map((c) => (
              <button
                key={c}
                className={`pill-item ${selectedCategory === c ? 'active' : ''}`}
                onClick={() => setSelectedCategory(c)}
              >
                {c} ({products.filter((p) => p.category === c).length})
              </button>
            ))}
          </div>
        </section>

        {/* Content */}
        <main>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>Memuat data produk...</div>
          ) : adminViewMode === 'grid' ? (
            <div className="products-grid-modern">
              {filteredProducts.map((p) => {
                const meta = getCategoryMeta(p.category);
                const pct = Math.min(100, (p.stock / 50) * 100);
                const stockStatus = p.stock === 0 ? 'out-stock' : p.stock <= 5 ? 'low-stock' : 'in-stock';

                return (
                  <div key={p.id} className="card-modern">
                    <div className={`card-banner ${meta.theme}`}>
                      {meta.icon}
                      <span className="category-chip">{p.category}</span>
                      <span className={`stock-badge-floating ${stockStatus}`}>
                        {p.stock === 0 ? 'Habis' : `Stok: ${p.stock}`}
                      </span>
                    </div>

                    <div className="card-content">
                      <div>
                        <h3 className="card-title">{p.name}</h3>
                        <p className="card-desc">{p.description || 'Tidak ada deskripsi.'}</p>
                        <div className="price-row">
                          <div className="price-val">{formatRupiah(p.price)}</div>
                        </div>

                        <div className="stock-meter">
                          <div className="stock-meter-label">
                            <span>Ketersediaan</span>
                            <span>{p.stock} unit</span>
                          </div>
                          <div className="meter-track">
                            <div
                              className={`meter-fill ${p.stock <= 5 ? 'low' : p.stock <= 15 ? 'medium' : 'high'}`}
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="card-actions-footer">
                        <div className="stock-stepper">
                          <button
                            className="stepper-btn"
                            disabled={p.stock <= 0}
                            onClick={() => handleQuickStock(p, -1)}
                          >
                            -
                          </button>
                          <span className="stepper-value">{p.stock}</span>
                          <button
                            className="stepper-btn"
                            onClick={() => handleQuickStock(p, 1)}
                          >
                            +
                          </button>
                        </div>

                        <div className="action-buttons-group">
                          <button className="btn-ghost-icon" onClick={() => openAdminModal(p)}>
                            <Edit3 size={15} />
                          </button>
                          <button
                            className="btn-ghost-icon trash"
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>Kategori</th>
                    <th>Harga Satuan</th>
                    <th>Stok</th>
                    <th>Nilai Stok</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.name}</strong>
                      </td>
                      <td>{p.category}</td>
                      <td>{formatRupiah(p.price)}</td>
                      <td>{p.stock} unit</td>
                      <td style={{ fontWeight: 600, color: '#059669' }}>
                        {formatRupiah(p.price * p.stock)}
                      </td>
                      <td>
                        <div className="action-buttons-group" style={{ justifyContent: 'flex-end' }}>
                          <button className="btn-ghost-icon" onClick={() => openAdminModal(p)}>
                            <Edit3 size={14} />
                          </button>
                          <button
                            className="btn-ghost-icon trash"
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {/* Modal Admin Create/Edit */}
        {isAdminModalOpen && (
          <div className="modal-overlay-blur" onClick={() => setIsAdminModalOpen(false)}>
            <div className="modal-card-double" onClick={(e) => e.stopPropagation()}>
              <div className="modal-form-pane">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                    {editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Baru'}
                  </h2>
                  <button onClick={() => setIsAdminModalOpen(false)} style={{ background: 'transparent' }}>
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleAdminFormSubmit}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
                      Nama Produk *
                    </label>
                    <input
                      type="text"
                      required
                      className="search-input"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    />
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
                      Deskripsi
                    </label>
                    <textarea
                      rows={2}
                      className="search-input"
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
                        Harga (Rp) *
                      </label>
                      <input
                        type="number"
                        required
                        className="search-input"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
                        Stok *
                      </label>
                      <input
                        type="number"
                        required
                        className="search-input"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
                      Kategori *
                    </label>
                    <input
                      type="text"
                      required
                      className="search-input"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    />
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
                      Tags (Pisahkan koma)
                    </label>
                    <input
                      type="text"
                      className="search-input"
                      value={productForm.tags}
                      onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button
                      type="button"
                      className="btn-modern-secondary"
                      onClick={() => setIsAdminModalOpen(false)}
                    >
                      Batal
                    </button>
                    <button type="submit" className="btn-modern-primary">
                      Simpan
                    </button>
                  </div>
                </form>
              </div>

              {/* Preview Pane */}
              <div className="modal-preview-pane">
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase' }}>
                  Live Preview
                </div>
                <div className="card-modern" style={{ boxShadow: 'none' }}>
                  <div className={`card-banner ${getCategoryMeta(productForm.category).theme}`}>
                    {getCategoryMeta(productForm.category).icon}
                    <span className="category-chip">{productForm.category || 'Category'}</span>
                    <span className="stock-badge-floating in-stock">Stok: {productForm.stock || 0}</span>
                  </div>
                  <div className="card-content">
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>
                      {productForm.name || 'Nama Produk Pratinjau'}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', minHeight: 32 }}>
                      {productForm.description || 'Deskripsi produk...'}
                    </p>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                      {formatRupiah(productForm.price)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {toastMessage && (
          <div className="toast-floating">
            <CheckCircle2 size={18} color="#34d399" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW 3: CUSTOMER / CLIENT STOREFRONT
  // ==========================================
  return (
    <div className="app-wrapper">
      {renderNavbar()}

      {/* Customer Hero Banner */}
      <section className="hero-banner-customer">
        <div className="hero-customer-content">
          <h2>Selamat Berbelanja, {currentUser.name}!</h2>
          <p>
            Jelajahi 50+ produk pilihan terbaik dengan jaminan original dan promo gratis ongkir ke seluruh Indonesia.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.1)', padding: '12px 18px', borderRadius: 12 }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>50+</div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Produk Ready</div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.1)', padding: '12px 18px', borderRadius: 12 }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>100%</div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Garansi Resmi</div>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="control-panel">
        <div className="search-and-tools">
          <div className="search-input-wrapper">
            <Search className="search-icon-inside" size={16} />
            <input
              type="text"
              className="search-input"
              placeholder="Cari barang idaman Anda..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="clear-search-btn" onClick={() => setSearch('')}>
                <X size={12} />
              </button>
            )}
          </div>

          <div className="tools-right">
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Produk Terbaru</option>
              <option value="price-asc">Harga: Termurah</option>
              <option value="price-desc">Harga: Termahal</option>
              <option value="name-asc">Nama: A - Z</option>
            </select>
          </div>
        </div>

        <div className="category-pills">
          <button
            className={`pill-item ${selectedCategory === '' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('')}
          >
            Semua Produk ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c}
              className={`pill-item ${selectedCategory === c ? 'active' : ''}`}
              onClick={() => setSelectedCategory(c)}
            >
              {c} ({products.filter((p) => p.category === c).length})
            </button>
          ))}
        </div>
      </section>

      {/* Product Storefront Grid */}
      <main>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>Memuat katalog produk...</div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: 16 }}>
            <h3>Tidak ada produk yang cocok</h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Coba ubah kata kunci atau pilih kategori lain.</p>
          </div>
        ) : (
          <div className="customer-grid">
            {filteredProducts.map((p) => {
              const meta = getCategoryMeta(p.category);
              const isWished = wishlist.includes(p.id);
              const rating = (4.6 + (p.id % 4) * 0.1).toFixed(1);

              return (
                <div key={p.id} className="store-card">
                  <div className={`card-hero-img ${meta.theme}`}>
                    {meta.icon}
                    <span className="category-chip">{p.category}</span>
                    <button
                      className={`wishlist-btn-corner ${isWished ? 'active' : ''}`}
                      onClick={() => toggleWishlist(p.id, p.name)}
                      title="Favorit"
                    >
                      <Heart size={16} fill={isWished ? '#ef4444' : 'none'} />
                    </button>
                  </div>

                  <div className="card-content">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700, marginBottom: 4 }}>
                        <Star size={13} fill="#f59e0b" />
                        <span>{rating}</span>
                        <span style={{ color: '#94a3b8', fontWeight: 400 }}>({40 + (p.id * 3) % 90} ulasan)</span>
                      </div>

                      <h3
                        className="card-title"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setQuickViewProduct(p)}
                      >
                        {p.name}
                      </h3>
                      <p className="card-desc">{p.description || 'Barang berkualitas.'}</p>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                        <div className="price-val">{formatRupiah(p.price)}</div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: p.stock > 0 ? '#059669' : '#dc2626' }}>
                          {p.stock > 0 ? `Sisa ${p.stock}` : 'Habis'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn-add-cart-store"
                          disabled={p.stock <= 0}
                          onClick={() => addToCart(p, 1)}
                        >
                          <ShoppingCart size={15} />
                          + Keranjang
                        </button>
                        <button
                          className="btn-ghost-icon"
                          onClick={() => setQuickViewProduct(p)}
                          title="Lihat Detail"
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <>
          <div className="drawer-backdrop" onClick={() => setIsCartOpen(false)}></div>
          <div className="cart-drawer">
            <div className="drawer-header">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                Keranjang Belanja ({currentUser.name})
              </h2>
              <button onClick={() => setIsCartOpen(false)} style={{ background: 'transparent' }}>
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body">
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto', color: '#64748b' }}>
                  <ShoppingCart size={40} color="#cbd5e1" style={{ marginBottom: 8 }} />
                  <p style={{ fontWeight: 600 }}>Keranjang belanja Anda kosong</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: '#f8fafc', borderRadius: 10 }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.product.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{formatRupiah(item.product.price)}</div>
                      <div className="stock-stepper" style={{ marginTop: 4 }}>
                        <button className="stepper-btn" onClick={() => updateCartQty(item.product.id, -1)}>-</button>
                        <span className="stepper-value">{item.quantity}</span>
                        <button
                          className="stepper-btn"
                          disabled={item.quantity >= item.product.stock}
                          onClick={() => updateCartQty(item.product.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => updateCartQty(item.product.id, -item.quantity)}
                      style={{ background: 'transparent', color: '#ef4444' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="drawer-footer">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                  <span>Subtotal</span>
                  <span>{formatRupiah(cartSubtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                  <span>Ongkir</span>
                  <span style={{ color: shippingCost === 0 ? '#10b981' : 'inherit', fontWeight: 600 }}>
                    {shippingCost === 0 ? 'GRATIS' : formatRupiah(shippingCost)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, margin: '10px 0 14px 0' }}>
                  <span>Total</span>
                  <span style={{ color: '#4f46e5' }}>{formatRupiah(grandTotal)}</span>
                </div>

                <button
                  className="btn-checkout-action"
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                >
                  Lanjut ke Pembayaran <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="modal-overlay-blur" onClick={() => setQuickViewProduct(null)}>
          <div className="login-card" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="category-chip" style={{ position: 'static' }}>{quickViewProduct.category}</span>
              <button onClick={() => setQuickViewProduct(null)} style={{ background: 'transparent' }}><X size={16} /></button>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 6 }}>{quickViewProduct.name}</h3>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
              {formatRupiah(quickViewProduct.price)}
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: 16 }}>
              {quickViewProduct.description || 'Barang berkualitas.'}
            </p>
            <button
              className="btn-modern-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={quickViewProduct.stock <= 0}
              onClick={() => {
                addToCart(quickViewProduct, 1);
                setQuickViewProduct(null);
              }}
            >
              <ShoppingCart size={16} /> Tambah ke Keranjang
            </button>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="modal-overlay-blur" onClick={() => setIsCheckoutOpen(false)}>
          <div className="login-card" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Konfirmasi Pengiriman</h3>
              <button onClick={() => setIsCheckoutOpen(false)} style={{ background: 'transparent' }}><X size={16} /></button>
            </div>

            <form onSubmit={handleCheckoutSubmit}>
              <div style={{ marginBottom: 10 }}>
                <label className="login-label">Nama Penerima</label>
                <input
                  type="text"
                  required
                  className="search-input"
                  value={checkoutData.name}
                  onChange={(e) => setCheckoutData({ ...checkoutData, name: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label className="login-label">Nomor WhatsApp / HP</label>
                <input
                  type="tel"
                  required
                  placeholder="0812xxxxxxxx"
                  className="search-input"
                  value={checkoutData.phone}
                  onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label className="login-label">Kota & Alamat Lengkap</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Jl. Thamrin No. 5, Jakarta..."
                  className="search-input"
                  value={checkoutData.address}
                  onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
                />
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, margin: '14px 0', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                  <span>Total Bayar:</span>
                  <span style={{ color: '#4f46e5' }}>{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              <button type="submit" className="btn-checkout-action">
                Bayar & Selesaikan Pesanan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Order Complete Modal */}
      {orderSuccess && (
        <div className="modal-overlay-blur" onClick={() => setOrderSuccess(null)}>
          <div className="login-card" style={{ maxWidth: 420, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
              <CheckCircle size={32} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 4 }}>Pesanan Berhasil!</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 16 }}>
              Nomor Pesanan: <strong>{orderSuccess.orderId}</strong>
            </p>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, textAlign: 'left', fontSize: '0.85rem', marginBottom: 16 }}>
              <div>Penerima: <strong>{orderSuccess.customer.name}</strong></div>
              <div>Total: <strong style={{ color: '#059669' }}>{formatRupiah(orderSuccess.total)}</strong></div>
            </div>
            <button className="btn-modern-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setOrderSuccess(null)}>
              Kembali ke Toko
            </button>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="toast-floating">
          <CheckCircle2 size={18} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
