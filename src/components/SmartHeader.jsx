import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { ShoppingCart, User, Menu, X, LogOut, Package, ShieldCheck, Search, Home, ShoppingBag } from 'lucide-react';
import { layoutAPI, productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/format';

const SmartHeader = () => {
  const [headerData, setHeaderData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { count } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('SmartHeader: User state:', user);
    console.log('SmartHeader: isAdmin:', isAdmin);
  }, [user, isAdmin]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    fetchHeaderData();
  }, []);

  const fetchHeaderData = async () => {
    try {
      const response = await layoutAPI.getHeader();
      console.log('Header data loaded:', response.data);
      if (response.data.menuItems) {
        console.log('Menu items:', response.data.menuItems);
        response.data.menuItems.forEach((item, index) => {
          console.log(`Menu item ${index}:`, item.label, 'icon:', item.icon, 'iconType:', item.iconType);
        });
      }
      setHeaderData(response.data);
    } catch (error) {
      console.error('Error fetching header data:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shopping?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const fetchSearchResults = async () => {
        try {
          const res = await productsAPI.getAll();
          const allProducts = res.data;
          const filtered = allProducts.filter(product =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase())
          ).slice(0, 6);
          setSearchResults(filtered);
        } catch (error) {
          console.error('Error fetching search results:', error);
        }
      };
      fetchSearchResults();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const getIconComponent = (iconName, iconType) => {
    if (!iconName) return null;
    // If it's a binary image (has iconType 'binary'), return null to render as img
    if (iconType === 'binary' || iconType === 'base64' || iconName.startsWith('http')) {
      return null;
    }
    // Check if it's a base64 image (starts with data:image)
    if (iconName.startsWith('data:image')) {
      return null; // Will render as img tag
    }
    const IconComponent = LucideIcons[iconName];
    return IconComponent ? IconComponent : null;
  };

  if (!headerData) {
    return (
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="h-8 w-32 bg-gray-200 animate-pulse"></div>
            <div className="space-x-4">
              <div className="h-8 w-8 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-xl sticky top-0 z-50 border-b-4 border-blue-600">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-3 group">
            {headerData.logoUrl ? (
              <div className="relative">
                <img src={headerData.logoUrl} alt="Logo" className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            ) : (
              <div className="relative group">
                <span className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 text-white font-bold shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
                  {(headerData.title || 'S').charAt(0)}
                </span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/30 to-purple-400/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            )}
            <h1 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:via-purple-700 group-hover:to-indigo-700 transition-all">
              {headerData.title}
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {headerData.menuItems
              .filter(item => item.isActive)
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map(item => {
                const IconComponent = getIconComponent(item.icon, item.iconType);
                const isImageIcon = item.iconType === 'binary' || item.iconType === 'base64' || item.icon?.startsWith('http') || item.icon?.startsWith('data:image');
                return (
                  <div key={item.id} className="relative group">
                    <Link
                      to={item.link || '#'}
                      className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-all font-medium flex items-center gap-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                    >
                      {isImageIcon ? (
                        <img 
                          src={item.icon} 
                          alt={item.label} 
                          className="w-5 h-5 object-contain" 
                          onError={(e) => {
                            console.error('Failed to load icon for', item.label, item.icon);
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        IconComponent && <IconComponent size={18} className="text-blue-500" />
                      )}
                      {item.label}
                      {item.subMenus && item.subMenus.length > 0 && (
                        <svg className="ml-1 h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </Link>
                    {item.subMenus && item.subMenus.length > 0 && (
                      <div className="absolute left-0 mt-2 w-56 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                        {item.subMenus
                          .filter(sub => sub.isActive)
                          .sort((a, b) => a.displayOrder - b.displayOrder)
                          .map(sub => {
                            const SubIconComponent = getIconComponent(sub.icon, sub.iconType);
                            const isSubImageIcon = sub.iconType === 'binary' || sub.iconType === 'base64' || sub.icon?.startsWith('http') || sub.icon?.startsWith('data:image');
                            return (
                              <Link
                                key={sub.id}
                                to={sub.link || '#'}
                                className="block px-4 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 transition-all flex items-center gap-3 rounded-lg mx-2"
                              >
                                {isSubImageIcon ? (
                                  <img 
                                    src={sub.icon} 
                                    alt={sub.label} 
                                    className="w-4 h-4 object-contain"
                                    onError={(e) => {
                                      console.error('Failed to load submenu icon for', sub.label, sub.icon);
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  SubIconComponent && <SubIconComponent size={16} className="text-blue-500" />
                                )}
                                <span className="font-medium">{sub.label}</span>
                              </Link>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              })}
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {headerData.showSearchIcon && (
              <button 
                onClick={() => setSearchOpen(true)}
                className="p-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                <Search size={22} />
              </button>
            )}
            {/* Mobile-specific Cart icon */}
            <div className="flex md:hidden items-center">
              <Link
                to="/cart"
                className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative"
                title="Cart"
              >
                <ShoppingCart size={20} />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs rounded-full h-4 min-w-4 px-0.5 flex items-center justify-center shadow-md">
                    {count}
                  </span>
                )}
              </Link>
            </div>
            {searchOpen && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSearchOpen(false)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X size={24} />
                      </button>
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search for products..."
                          className="w-full pl-12 pr-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                          autoFocus
                        />
                      </div>
                    </div>
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-4 space-y-3">
                        {searchResults.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleProductClick(product.id)}
                            className="w-full flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors text-left"
                          >
                            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-white flex items-center justify-center shadow-sm">
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-3xl">📦</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-bold text-gray-900 truncate">{product.name}</p>
                              <p className="text-sm text-gray-500 truncate">{product.description}</p>
                              <p className="text-base font-bold text-blue-600 mt-1">{formatPrice(product.price)}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <button
                          onClick={handleSearch}
                          className="w-full text-center text-base font-bold text-white bg-blue-600 hover:bg-blue-700 py-3 rounded-xl transition-colors"
                        >
                          View all results
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {searchResults.length === 0 && searchQuery.length >= 2 && (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                        <Search className="text-gray-400" size={32} />
                      </div>
                      <p className="text-lg font-semibold text-gray-700 mb-1">No results found</p>
                      <p className="text-gray-500">Try a different search term</p>
                    </div>
                  )}
                  
                  {searchQuery.length < 2 && (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                        <Search className="text-blue-600" size={32} />
                      </div>
                      <p className="text-lg font-semibold text-gray-700 mb-1">Search for products</p>
                      <p className="text-gray-500">Type at least 2 characters</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {headerData.showUserIcon && (
              user ? (
                <div className="hidden md:flex items-center gap-1 sm:gap-2">
                  {isAdmin && (
                    <Link to="/admin" title="Admin" className="p-2.5 text-gray-700 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 rounded-xl transition-all">
                      <ShieldCheck size={22} />
                    </Link>
                  )}
                  <Link to="/dashboard" title="Dashboard" className="p-2.5 text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all">
                    <Home size={22} />
                  </Link>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                    <span className="text-sm font-semibold text-gray-700">
                      Hi, {user.fullName.split(' ')[0]}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    title="Logout"
                    className="p-2.5 text-gray-700 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 rounded-xl transition-all"
                  >
                    <LogOut size={22} />
                  </button>
                </div>
              ) : (
                <Link to="/login" title="Login" className="p-2.5 text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all">
                  <User size={22} />
                </Link>
              )
            )}
            {headerData.showCartIcon && (
              <Link to="/cart" className="hidden md:block p-2.5 text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all relative">
                <ShoppingCart size={22} />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center shadow-md">
                    {count}
                  </span>
                )}
              </Link>
            )}
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2.5 text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t-2 border-blue-100 bg-white">
            {/* User section in mobile menu */}
            {user ? (
              <div>
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.fullName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all font-medium rounded-lg"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.scrollTo(0, 0);
                    }}
                  >
                    <User size={20} className="text-blue-500" />
                    My Dashboard
                  </Link>
                  <Link
                    to="/orders"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all font-medium rounded-lg"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.scrollTo(0, 0);
                    }}
                  >
                    <Package size={20} className="text-blue-500" />
                    My Orders
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all font-medium rounded-lg"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        window.scrollTo(0, 0);
                      }}
                    >
                      <ShieldCheck size={20} className="text-purple-500" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      window.scrollTo(0, 0);
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-all font-medium rounded-lg w-full"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  to="/login"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all font-medium rounded-lg"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.scrollTo(0, 0);
                  }}
                >
                  <User size={20} className="text-blue-500" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all font-medium rounded-lg"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.scrollTo(0, 0);
                  }}
                >
                  <User size={20} className="text-blue-500" />
                  Register
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default SmartHeader;
