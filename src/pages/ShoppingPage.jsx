import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Filter, ChevronDown, ChevronRight, X, Sparkles, Tag, Layers, SlidersHorizontal, Check } from 'lucide-react';
import { categoriesAPI, productsAPI, advertisementsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

const FilterContent = ({ 
  rootCategories, 
  getSubCategories, 
  expandedCategories, 
  toggleCategory, 
  handleCategoryClick, 
  handleSubCategoryClick, 
  selectedCategory, 
  selectedSubCategory,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  onClearAll,
  onResetCategories,
  onApply,
  onCancel,
  isMobile,
  categories,
  expandedSections,
  toggleSection
}) => {

  const categoryIcons = {
    'Electronics': '📱',
    'Clothing': '👕',
    'Home': '🏠',
    'Books': '📚',
    'Sports': '⚽',
    'Beauty': '💄',
    'Toys': '🧸',
    'Food': '🍔',
  };

  const getCategoryIcon = (name) => {
    return categoryIcons[name] || '📦';
  };

  const hasActiveFilters = selectedCategory || selectedSubCategory || priceRange.min > 0 || priceRange.max < 10000 || sortBy !== 'featured';

  return (
    <div className="space-y-4">
      {/* Header - Desktop Only */}
      {!isMobile && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-gray-800">Filters</h2>
            {hasActiveFilters && (
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {[selectedCategory, selectedSubCategory, priceRange.max < 10000, sortBy !== 'featured'].filter(Boolean).length}
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            >
              <X size={12} />
              Clear All
            </button>
          )}
        </div>
      )}

      {/* Active Filters Summary - Mobile Only */}
      {isMobile && hasActiveFilters && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Check size={14} className="text-blue-600" />
              <span className="text-xs font-semibold text-gray-700">Active Filters</span>
            </div>
            <button
              onClick={onClearAll}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedCategory && (
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full text-xs font-medium text-blue-700 border border-blue-300 shadow-sm">
                <span>📁 {categories.find(c => c.id === selectedCategory)?.name || 'Category'}</span>
                <button onClick={() => onResetCategories()} className="hover:text-red-500 ml-1">
                  <X size={10} />
                </button>
              </div>
            )}
            {selectedSubCategory && (
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full text-xs font-medium text-purple-700 border border-purple-300 shadow-sm">
                <span>🏷️ {categories.find(c => c.id === selectedSubCategory)?.name || 'Subcategory'}</span>
                <button onClick={() => onResetCategories()} className="hover:text-red-500 ml-1">
                  <X size={10} />
                </button>
              </div>
            )}
            {priceRange.max < 10000 && (
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full text-xs font-medium text-green-700 border border-green-300 shadow-sm">
                <span>💰 Max: ₹{priceRange.max}</span>
                <button onClick={() => setPriceRange({ min: 0, max: 10000 })} className="hover:text-red-500 ml-1">
                  <X size={10} />
                </button>
              </div>
            )}
            {sortBy !== 'featured' && (
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full text-xs font-medium text-orange-700 border border-orange-300 shadow-sm">
                <span>🔄 {sortBy === 'price-low' ? 'Price: Low' : sortBy === 'price-high' ? 'Price: High' : 'Top Rated'}</span>
                <button onClick={() => setSortBy('featured')} className="hover:text-red-500 ml-1">
                  <X size={10} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sort Options - Collapsible */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('sort')}
          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">🔄</span>
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Sort By</h3>
          </div>
          <ChevronDown size={16} className={`text-gray-500 transition-transform ${expandedSections.sort ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.sort && (
          <div className="p-3 grid grid-cols-2 gap-2">
            {[
              { id: 'featured', label: 'Featured', icon: '⭐' },
              { id: 'price-low', label: 'Price: Low', icon: '📉' },
              { id: 'price-high', label: 'Price: High', icon: '📈' },
              { id: 'rating', label: 'Top Rated', icon: '⭐' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setSortBy(option.id)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  sortBy === option.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-sm">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price Range - Collapsible */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">💰</span>
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Price Range</h3>
          </div>
          <ChevronDown size={16} className={`text-gray-500 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.price && (
          <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-800">₹{priceRange.min} - ₹{priceRange.max}</span>
              {(priceRange.min > 0 || priceRange.max < 10000) && (
                <button
                  onClick={() => setPriceRange({ min: 0, max: 10000 })}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                >
                  <X size={12} />
                  Reset
                </button>
              )}
            </div>
            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label className="text-xs text-gray-600 mb-1 block">Min</label>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={priceRange.min}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 0) {
                      setPriceRange({ ...priceRange, min: Math.min(value, priceRange.max - 1) });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-600 mb-1 block">Max</label>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={priceRange.max}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 0) {
                      setPriceRange({ ...priceRange, max: Math.max(value, priceRange.min + 1) });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10000"
                />
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              value={priceRange.max}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setPriceRange({ ...priceRange, max: Math.max(value, priceRange.min + 1) });
              }}
              className="w-full h-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        )}
      </div>

      {/* Categories - Collapsible */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('categories')}
          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">📁</span>
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Categories</h3>
            {(selectedCategory || selectedSubCategory) && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {(selectedCategory || selectedSubCategory) && (
              <button
                onClick={(e) => { e.stopPropagation(); onResetCategories(); }}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
              >
                <X size={12} />
                Reset
              </button>
            )}
            <ChevronDown size={16} className={`text-gray-500 transition-transform ${expandedSections.categories ? 'rotate-180' : ''}`} />
          </div>
        </button>
        {expandedSections.categories && (
          <div className="p-3 space-y-2">
            {rootCategories.map(category => (
              <div key={category.id}>
                <button
                  onClick={() => {
                    toggleCategory(category.id);
                    handleCategoryClick(category);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md border-transparent'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{getCategoryIcon(category.name)}</span>
                    <span className="text-sm font-semibold">{category.name}</span>
                  </div>
                  {getSubCategories(category.id).length > 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      selectedCategory === category.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getSubCategories(category.id).length}
                    </span>
                  )}
                </button>
                
                {expandedCategories.has(category.id) && getSubCategories(category.id).length > 0 && (
                  <div className="ml-4 mt-2 space-y-1.5">
                    {getSubCategories(category.id).map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => handleSubCategoryClick(sub)}
                        className={`w-full text-left p-2.5 rounded-lg transition-all border ${
                          selectedSubCategory === sub.id
                            ? 'bg-purple-100 text-purple-700 font-medium text-xs border-purple-300'
                            : 'bg-white text-gray-600 hover:bg-gray-50 text-xs border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{getCategoryIcon(sub.name)}</span>
                          <span className="text-xs font-medium">{sub.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

const ShoppingPage = () => {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryId || null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [advertisements, setAdvertisements] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState('featured');
  const [expandedSections, setExpandedSections] = useState({ sort: true, price: true, categories: true });
  const { addToCart } = useCart();

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedSubCategory]);

  useEffect(() => {
    let filtered = [...products];

    // Apply search query filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply price range filter
    filtered = filtered.filter(product =>
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    // Apply sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // featured - keep original order
        break;
    }

    setFilteredProducts(filtered);
  }, [searchQuery, products, priceRange, sortBy]);

  const fetchData = async () => {
    try {
      const [categoriesRes, subCategoriesRes, productsRes, adsRes] = await Promise.all([
        categoriesAPI.getAll(),
        categoriesAPI.getSubCategories(),
        productsAPI.getAll(selectedCategory, selectedSubCategory),
        advertisementsAPI.getAll('BetweenProducts', selectedCategory)
      ]);
      // Combine root categories and subcategories
      const allCategories = [...categoriesRes.data, ...subCategoriesRes.data];
      setCategories(allCategories);
      setProducts(productsRes.data);
      setAdvertisements(adsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category.id);
    setSelectedSubCategory(null);
  };

  const handleSubCategoryClick = (subCategory) => {
    setSelectedSubCategory(subCategory.id);
  };

  const handleClearAll = () => {
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setPriceRange({ min: 0, max: 10000 });
    setSortBy('featured');
  };

  const handleResetCategories = () => {
    setSelectedCategory(null);
    setSelectedSubCategory(null);
  };

  const rootCategories = categories.filter(c => !c.parentCategoryId);
  const getSubCategories = (parentId) => categories.filter(c => c.parentCategoryId === parentId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg p-4 font-semibold active:scale-[0.98] transition-all"
          >
            <SlidersHorizontal size={22} />
            <span>{filterOpen ? 'Hide Filters' : 'Show Filters'}</span>
            {filterOpen ? <X size={22} /> : <ChevronDown size={22} />}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile Filter Overlay */}
          {filterOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-50 lg:hidden flex flex-col"
              onClick={() => setFilterOpen(false)}
            >
              <div 
                className="mt-auto bg-white rounded-t-3xl max-h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between flex-shrink-0">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Layers size={24} className="text-blue-600" />
                    Filters
                  </h2>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X size={24} className="text-gray-600" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <FilterContent 
                    rootCategories={rootCategories}
                    getSubCategories={getSubCategories}
                    expandedCategories={expandedCategories}
                    toggleCategory={toggleCategory}
                    handleCategoryClick={handleCategoryClick}
                    handleSubCategoryClick={handleSubCategoryClick}
                    selectedCategory={selectedCategory}
                    selectedSubCategory={selectedSubCategory}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    onClearAll={handleClearAll}
                    onResetCategories={handleResetCategories}
                    isMobile={true}
                    categories={categories}
                    expandedSections={expandedSections}
                    toggleSection={toggleSection}
                  />
                </div>
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex-shrink-0">
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-3 text-sm font-semibold shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                  >
                    <Check size={16} />
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sidebar - Categories */}
          <div className={`${filterOpen ? 'block' : 'hidden'} lg:block lg:w-1/4`}>
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Layers size={22} className="text-blue-600" />
                  Categories
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                    {rootCategories.length}
                  </span>
                </div>
              </div>
              
              <FilterContent 
                rootCategories={rootCategories}
                getSubCategories={getSubCategories}
                expandedCategories={expandedCategories}
                toggleCategory={toggleCategory}
                handleCategoryClick={(cat) => { setSelectedCategory(cat.id); setSelectedSubCategory(null); }}
                handleSubCategoryClick={(sub) => setSelectedSubCategory(sub.id)}
                selectedCategory={selectedCategory}
                selectedSubCategory={selectedSubCategory}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onClearAll={() => { setSelectedCategory(null); setSelectedSubCategory(null); setPriceRange({ min: 0, max: 10000 }); setSortBy('featured'); }}
                onResetCategories={() => { setSelectedCategory(null); setSelectedSubCategory(null); }}
                isMobile={false}
                categories={categories}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
              />
            </div>
          </div>

          {/* Main Content - Products */}
          <div className="lg:w-3/4">
            {/* Breadcrumb */}
            <div className="mb-6">
              <nav className="flex items-center space-x-2 text-sm text-gray-600">
                <Link to="/" className="hover:text-blue-600">Home</Link>
                <span>/</span>
                <span className="text-gray-800 font-medium">
                  {selectedCategory 
                    ? categories.find(c => c.id === selectedCategory)?.name 
                    : 'All Products'}
                </span>
              </nav>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {/* Sort Bar */}
              <div className="col-span-full flex items-center justify-between bg-white rounded-xl p-3 shadow-sm border border-gray-100 mb-2">
                <span className="text-sm text-gray-600 font-medium">
                  {filteredProducts.length} products
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
              {filteredProducts.map((product, index) => {
                // Get first color's images or default product images
                const colorImages = product.availableColors?.[0]?.images || [];
                const displayImages = colorImages.length > 0 ? colorImages : (product.imageUrls || (product.imageUrl ? [product.imageUrl] : []));
                const displayImage = displayImages[0];

                return (
                  <React.Fragment key={product.id}>
                    <div>
                      <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                        <Link to={`/product/${product.id}`} className="block relative active:scale-95 transition-transform">
                          <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
                            {displayImage ? (
                              <img src={displayImage} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="text-6xl">📦</div>
                            )}
                            {product.isFeatured && (
                              <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                Featured
                              </span>
                            )}
                            {/* Color indicators */}
                            {product.availableColors && product.availableColors.length > 0 && (
                              <div className="absolute bottom-2 left-2 flex gap-1">
                                {product.availableColors.slice(0, 3).map((color, i) => (
                                  <div key={i} className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: color.code || (typeof color === 'string' ? '#000000' : color.code) }}></div>
                                ))}
                                {product.availableColors.length > 3 && (
                                  <span className="text-xs text-gray-600 bg-white/80 px-1.5 py-0.5 rounded-full">+{product.availableColors.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </Link>
                        <div className="p-3 sm:p-4 flex flex-col grow">
                          <Link to={`/product/${product.id}`}>
                            <h3 className="font-semibold text-sm sm:text-base text-gray-800 mb-1 line-clamp-2 hover:text-blue-600 transition-colors">{product.name}</h3>
                          </Link>
                          <p className="hidden sm:block text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                          {/* Size indicators */}
                          {product.availableSizes && product.availableSizes.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {product.availableSizes.slice(0, 4).map((size, i) => (
                                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{size}</span>
                              ))}
                              {product.availableSizes.length > 4 && (
                                <span className="text-xs text-gray-500">+{product.availableSizes.length - 4}</span>
                              )}
                            </div>
                          )}
                          <div className="flex items-end justify-between gap-1 mb-3 flex-wrap mt-auto">
                            <div>
                              {(() => {
                                const originalPrice = product.originalPrice || product.price;
                                const discountPercentage = product.discountPercentage || 0;
                                const finalPrice = discountPercentage > 0
                                  ? Math.round(originalPrice * (1 - discountPercentage / 100))
                                  : product.price;

                                return (
                                  <>
                                    {discountPercentage > 0 && (
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs sm:text-sm text-gray-500 line-through">{formatPrice(originalPrice)}</span>
                                        <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                                          {discountPercentage}% OFF
                                        </span>
                                      </div>
                                    )}
                                    <span className="text-lg sm:text-2xl font-bold text-blue-600">{formatPrice(finalPrice)}</span>
                                  </>
                                );
                              })()}
                            </div>
                            <div className="flex items-center text-yellow-500 text-sm">
                              <span>⭐ {product.rating}</span>
                              <span className="text-gray-500 text-xs ml-1">({product.reviewCount})</span>
                            </div>
                          </div>
                          <button
                            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                            onClick={() => {
                              if (product.variants && product.variants.length > 0) {
                                // Redirect to product detail page for variant selection
                                window.location.href = `/product/${product.id}`;
                              } else {
                                addToCart(product);
                              }
                            }}
                          >
                            <ShoppingCart size={16} />
                            <span>{product.variants && product.variants.length > 0 ? 'Select Options' : 'Add to Cart'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Advertisement between products */}
                    {index === 2 && advertisements.length > 0 && (
                      <div className="mt-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 text-center">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{advertisements[0].title}</h3>
                        <p className="text-gray-600 mb-4">{advertisements[0].description}</p>
                        <Link
                          to={advertisements[0].link || '#'}
                          className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Learn More
                        </Link>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {searchQuery ? 'No products found' : 'No products found'}
                </h3>
                <p className="text-gray-600">
                  {searchQuery 
                    ? 'Try a different search term or select a category' 
                    : 'Try selecting a different category'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingPage;
