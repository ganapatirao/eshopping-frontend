import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { categoriesAPI, productsAPI, advertisementsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

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
  const { addToCart } = useCart();

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedSubCategory]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

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
  };

  const handleSubCategoryClick = (subCategory) => {
    setSelectedSubCategory(subCategory.id);
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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Categories</h2>
                <Filter size={20} className="text-gray-600" />
              </div>
              
              <div className="space-y-2">
                {rootCategories.map(category => (
                  <div key={category.id}>
                    <button
                      onClick={() => {
                        toggleCategory(category.id);
                        handleCategoryClick(category);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="font-medium">{category.name}</span>
                      {getSubCategories(category.id).length > 0 && (
                        expandedCategories.has(category.id) ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )
                      )}
                    </button>
                    
                    {expandedCategories.has(category.id) && getSubCategories(category.id).length > 0 && (
                      <div className="ml-4 mt-2 space-y-1">
                        {getSubCategories(category.id).map(sub => (
                          <button
                            key={sub.id}
                            onClick={() => handleSubCategoryClick(sub)}
                            className={`w-full text-left p-2 rounded-lg transition-colors ${
                              selectedSubCategory === sub.id
                                ? 'bg-blue-50 text-blue-600'
                                : 'hover:bg-gray-100 text-gray-600'
                            }`}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
