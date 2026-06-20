import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight, Sparkles } from 'lucide-react';
import { categoriesAPI, productsAPI, advertisementsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, productsRes, adsRes] = await Promise.all([
        categoriesAPI.getRoot(),
        productsAPI.getFeatured(),
        advertisementsAPI.getAll()
      ]);
      setCategories(categoriesRes.data);
      setFeaturedProducts(productsRes.data);
      setAdvertisements(adsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };


  const homeBannerAd = advertisements.find(ad => ad.position === 'HomeBanner');

  const categoryGradients = [
    'from-blue-400 to-indigo-500',
    'from-pink-400 to-rose-500',
    'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-500',
    'from-violet-400 to-purple-500',
    'from-cyan-400 to-sky-500',
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"></div>
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-pink-400/20 blur-3xl"></div>
        <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20 relative">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-4">
              <Sparkles size={14} /> {homeBannerAd ? 'Featured Offer' : 'Welcome to ShopHub'}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
              {homeBannerAd ? homeBannerAd.title : 'Discover products you’ll love'}
            </h2>
            <p className="text-base sm:text-xl text-blue-50/90 mb-6">
              {homeBannerAd ? homeBannerAd.description : 'Shop the latest trends across every category, with great deals every day.'}
            </p>
            <Link
              to={homeBannerAd?.link || '/shopping'}
              className="inline-flex items-center bg-white text-blue-600 px-5 sm:px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-gray-100 active:scale-95 transition-all"
            >
              Shop Now <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </div>


      {/* Root Categories */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
          {categories.map((category, i) => (
            <Link
              key={category.id}
              to={`/shopping?category=${category.id}`}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl overflow-hidden transition-all duration-300 group active:scale-95"
            >
              <div className={`aspect-square bg-gradient-to-br ${categoryGradients[i % categoryGradients.length]} flex items-center justify-center relative overflow-hidden`}>
                {category.imageUrl ? (
                  <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="text-5xl sm:text-6xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300">🛍️</div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="font-semibold text-sm sm:text-base text-gray-800 text-center group-hover:text-blue-600 transition-colors line-clamp-1">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">Featured Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {featuredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
              <Link to={`/product/${product.id}`} className="block active:scale-95 transition-transform">
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="text-6xl">📦</div>
                  )}
                </div>
              </Link>
              <div className="p-3 sm:p-4 flex flex-col grow">
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-semibold text-sm sm:text-base text-gray-800 mb-2 line-clamp-1 hover:text-blue-600 transition-colors">{product.name}</h3>
                </Link>
                <div className="flex items-end justify-between gap-2 flex-wrap mb-3">
                  <div>
                    <span className="text-xl sm:text-2xl font-bold text-blue-600">{formatPrice(product.price)}</span>
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
                  onClick={() => addToCart(product)}
                  className="mt-auto w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <ShoppingCart size={16} /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
          <p className="text-xl mb-6">Explore our wide range of products and find amazing deals!</p>
          <Link
            to="/shopping"
            className="inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Start Shopping <ArrowRight className="ml-2" size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
