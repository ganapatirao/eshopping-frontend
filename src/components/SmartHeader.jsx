import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { ShoppingCart, User, Search, Menu, X, LogOut, Package, ShieldCheck } from 'lucide-react';
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
  const [showDropdown, setShowDropdown] = useState(false);
  const { count } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

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
      setShowDropdown(false);
    }
  };

  const handleSearchIconClick = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      setTimeout(() => document.getElementById('search-input')?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
      setSearchQuery('');
      setSearchResults([]);
      setShowDropdown(false);
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
          ).slice(0, 8);
          setSearchResults(filtered);
          setShowDropdown(true);
        } catch (error) {
          console.error('Error fetching search results:', error);
        }
      };
      fetchSearchResults();
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, [searchQuery]);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
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
    <header className="bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-gray-100/50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
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
          <div className="flex items-center space-x-2">
            {headerData.showSearchIcon && (
              <div className="relative">
                <button 
                  onClick={handleSearchIconClick}
                  className="p-2.5 text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all"
                >
                  <Search size={22} />
                </button>
                {searchOpen && (
                  <div className="absolute right-0 top-14 w-96 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          id="search-input"
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Search products..."
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                        />
                      </div>
                    </div>
                    
                    {showDropdown && searchResults.length > 0 && (
                      <div className="max-h-96 overflow-y-auto">
                        <div className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {searchResults.length} product{searchResults.length !== 1 ? 's' : ''} found
                          </p>
                        </div>
                        {searchResults.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleProductClick(product.id)}
                            className="w-full flex items-center gap-3 p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all text-left border-b border-gray-50 last:border-0 group"
                          >
                            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-white shadow-sm border border-gray-100 group-hover:shadow-md transition-shadow">
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-2xl">📦</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">{product.name}</p>
                              <p className="text-xs text-gray-500 truncate mt-0.5">{product.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{formatPrice(product.price)}</p>
                            </div>
                          </button>
                        ))}
                        <div className="p-3 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
                          <button
                            onClick={handleSearch}
                            className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            View all results for "{searchQuery}"
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {showDropdown && searchResults.length === 0 && searchQuery.length >= 2 && (
                      <div className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                          <Search className="text-gray-400" size={32} />
                        </div>
                        <p className="text-gray-600 font-medium mb-2">No products found</p>
                        <p className="text-gray-400 text-sm">Try a different search term</p>
                      </div>
                    )}
                    
                    {!showDropdown && (
                      <div className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-100 via-purple-100 to-indigo-100 rounded-full flex items-center justify-center shadow-md">
                          <Search className="text-blue-600" size={32} />
                        </div>
                        <p className="text-gray-600 font-medium mb-2">Start typing to search</p>
                        <p className="text-gray-400 text-sm">Search by product name or description</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {headerData.showUserIcon && (
              user ? (
                <div className="flex items-center gap-1 sm:gap-2">
                  {isAdmin && (
                    <Link to="/admin" title="Admin" className="p-2.5 text-gray-700 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 rounded-xl transition-all">
                      <ShieldCheck size={22} />
                    </Link>
                  )}
                  <Link to="/orders" title="My Orders" className="p-2.5 text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all">
                    <Package size={22} />
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
              <Link to="/cart" className="p-2.5 text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all relative">
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
          <nav className="md:hidden py-4 border-t border-gray-100 bg-gradient-to-b from-white to-gray-50">
            {headerData.menuItems
              .filter(item => item.isActive)
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map(item => {
                const IconComponent = getIconComponent(item.icon, item.iconType);
                const isImageIcon = item.iconType === 'binary' || item.iconType === 'base64' || item.icon?.startsWith('http') || item.icon?.startsWith('data:image');
                return (
                  <div key={item.id} className="py-2">
                    <Link
                      to={item.link || '#'}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all font-medium rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {isImageIcon ? (
                        <img 
                          src={item.icon} 
                          alt={item.label} 
                          className="w-5 h-5 object-contain"
                          onError={(e) => {
                            console.error('Failed to load mobile icon for', item.label, item.icon);
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        IconComponent && <IconComponent size={18} className="text-blue-500" />
                      )}
                      {item.label}
                    </Link>
                    {item.subMenus && item.subMenus.length > 0 && (
                      <div className="ml-6 mt-2 space-y-1">
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
                                className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all rounded-lg"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {isSubImageIcon ? (
                                  <img 
                                    src={sub.icon} 
                                    alt={sub.label} 
                                    className="w-4 h-4 object-contain"
                                    onError={(e) => {
                                      console.error('Failed to load mobile submenu icon for', sub.label, sub.icon);
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  SubIconComponent && <SubIconComponent size={16} className="text-blue-500" />
                                )}
                                <span className="text-sm">{sub.label}</span>
                              </Link>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              })}
          </nav>
        )}
      </div>
    </header>
  );
};

export default SmartHeader;
