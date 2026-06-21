import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Filter, ChevronDown, ChevronRight, X, Sparkles, Tag, Layers, SlidersHorizontal } from 'lucide-react';
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
  onResetCategories
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
    <div className="space-y-5">
      {/* Clear All Button */}
      {hasActiveFilters && (
        <button
          onClick={onClearAll}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl p-3 font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
        >
          <X size={18} />
          Clear All Filters
        </button>
      )}

      {/* Sort Options - Pills */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sort By</h3>
          {sortBy !== 'featured' && (
            <button
              onClick={() => setSortBy('featured')}
              className="text-xs text-red-500 hover:text-red-600 font-medium"
            >
              Reset
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'featured', label: 'Featured', icon: '⭐' },
            { id: 'price-low', label: 'Price: Low', icon: '📉' },
            { id: 'price-high', label: 'Price: High', icon: '📈' },
            { id: 'rating', label: 'Top Rated', icon: '⭐' }
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setSortBy(option.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                sortBy === option.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range - Compact */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Price Range</h3>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">💰</span>
              <span className="text-sm font-medium text-gray-700">₹{priceRange.min} - ₹{priceRange.max}</span>
            </div>
            {(priceRange.min > 0 || priceRange.max < 10000) && (
              <button
                onClick={() => setPriceRange({ min: 0, max: 10000 })}
                className="text-xs text-red-500 hover:text-red-600 font-medium"
              >
                Reset
              </button>
            )}
          </div>
          <input
            type="range"
            min="0"
            max="10000"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>

      {/* Categories - Chips */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Categories</h3>
          {(selectedCategory || selectedSubCategory) && (
            <button
              onClick={onResetCategories}
              className="text-xs text-red-500 hover:text-red-600 font-medium"
            >
              Reset
            </button>
          )}
        </div>
        <div className="space-y-2">
          {rootCategories.map(category => (
            <div key={category.id}>
              <button
                onClick={() => {
                  toggleCategory(category.id);
                  handleCategoryClick(category);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getCategoryIcon(category.name)}</span>
                  <span className="font-semibold">{category.name}</span>
                </div>
                {getSubCategories(category.id).length > 0 && (
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    {getSubCategories(category.id).length}
                  </span>
                )}
              </button>
              
              {expandedCategories.has(category.id) && getSubCategories(category.id).length > 0 && (
                <div className="ml-4 mt-2 space-y-2">
                  {getSubCategories(category.id).map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => handleSubCategoryClick(sub)}
                      className={`w-full text-left p-2.5 rounded-lg transition-all ${
                        selectedSubCategory === sub.id
                          ? 'bg-purple-100 text-purple-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getCategoryIcon(sub.name)}</span>
                        <span className="text-sm">{sub.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
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
  const { addToCart } = useCart();

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
      const [categoriesRes, productsRes, adsRes] = await Promise.all([
        categoriesAPI.getAll(),
        productsAPI.getAll(selectedCategory),
        advertisementsAPI.getAll('BetweenProducts', selectedCategory)
      ]);
      setCategories(categoriesRes.data);
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
    setFilterOpen(false);
  };

  const handleSubCategoryClick = (subCategory) => {
    setSelectedSubCategory(subCategory.id);
    setFilterOpen(false);
  };

  const handleClearAll = () => {
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setPriceRange({ min: 0, max: 10000 });
    setSortBy('featured');
    setFilterOpen(false);
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
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setFilterOpen(false)}
            >
              <div 
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
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
                <div className="p-4">
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
                  />
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
              {filteredProducts.map((product, index) => (
                <div key={product.id}>
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                    <Link to={`/product/${product.id}`} className="block relative active:scale-95 transition-transform">
                      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="text-6xl">📦</div>
                        )}
                        {product.isFeatured && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                    </Link>
                    <div className="p-3 sm:p-4 flex flex-col grow">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-semibold text-sm sm:text-base text-gray-800 mb-1 line-clamp-2 hover:text-blue-600 transition-colors">{product.name}</h3>
                      </Link>
                      <p className="hidden sm:block text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-end justify-between gap-1 mb-3 flex-wrap mt-auto">
                        <div>
                          <span className="text-lg sm:text-2xl font-bold text-blue-600">{formatPrice(product.price)}</span>
                          {product.originalPrice && (
                            <span className="text-xs sm:text-sm text-gray-500 line-through ml-1.5">{formatPrice(product.originalPrice)}</span>
                          )}
                        </div>
                        <div className="flex items-center text-yellow-500 text-sm">
                          <span>⭐ {product.rating}</span>
                          <span className="text-gray-500 text-xs ml-1">({product.reviewCount})</span>
                        </div>
                      </div>
                      <button
                        className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                        onClick={() => addToCart(product)}
                      >
                        <ShoppingCart size={16} />
                        <span>Add to Cart</span>
                      </button>
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
                </div>
              ))}
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
