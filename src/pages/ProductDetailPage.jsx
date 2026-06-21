import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingCart,
  ArrowLeft,
  Minus,
  Plus,
  Star,
  Check,
  Truck,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    productsAPI
      .getById(id)
      .then((res) => {
        if (active) {
          setProduct(res.data);
          // Set default selections
          if (res.data.availableColors?.length > 0) {
            const firstColor = res.data.availableColors[0];
            setSelectedColor(typeof firstColor === 'string' ? { name: firstColor, code: '#000000' } : firstColor);
          }
          if (res.data.availableSizes?.length > 0) {
            setSelectedSize(res.data.availableSizes[0]);
          }
        }
      })
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  // Update selected variant when color or size changes
  useEffect(() => {
    if (selectedColor && selectedSize && product?.variants) {
      const colorName = typeof selectedColor === 'string' ? selectedColor : selectedColor.name;
      const variant = product.variants.find(
        v => v.color === colorName && v.size === selectedSize
      );
      setSelectedVariant(variant || null);
    }
  }, [selectedColor, selectedSize, product]);

  // Reset active image when color changes
  useEffect(() => {
    setActiveImage(0);
  }, [selectedColor]);

  const images = (() => {
    // If a color is selected and has images, use those
    if (selectedColor && selectedColor.images && selectedColor.images.length > 0) {
      return selectedColor.images;
    }
    // Otherwise, use product's default images
    if (product?.imageUrls && product.imageUrls.length > 0) {
      return product.imageUrls;
    }
    if (product?.imageUrl) {
      return [product.imageUrl];
    }
    return [];
  })();

  const handleAddToCart = () => {
    const productToAdd = selectedVariant 
      ? { ...product, price: selectedVariant.price, originalPrice: selectedVariant.originalPrice, stock: selectedVariant.stock, selectedVariant }
      : product;
    addToCart(productToAdd, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    const productToAdd = selectedVariant 
      ? { ...product, price: selectedVariant.price, originalPrice: selectedVariant.originalPrice, stock: selectedVariant.stock, selectedVariant }
      : product;
    addToCart(productToAdd, quantity);
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Product not found</h2>
        <p className="text-gray-600 mb-6">It may have been removed or is unavailable.</p>
        <Link
          to="/shopping"
          className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Back to Shopping
        </Link>
      </div>
    );
  }

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const currentPrice = selectedVariant?.price || product.price;
  const currentOriginalPrice = selectedVariant?.originalPrice || product.originalPrice;
  const currentStock = selectedVariant?.stock || product.stock;
  const currentDiscount =
    currentOriginalPrice && currentOriginalPrice > currentPrice
      ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-gray-600 hover:text-blue-600 mb-5 transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Gallery */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 shadow-sm flex items-center justify-center">
              {images.length > 0 ? (
                <img
                  src={images[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-8xl">📦</div>
              )}
              {currentDiscount > 0 && (
                <span className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                  {currentDiscount}% OFF
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`h-20 w-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === i ? 'border-blue-600 scale-105' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={18}
                    className={
                      s <= Math.round(product.rating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {product.rating || 0} ({product.reviewCount || 0} reviews)
              </span>
            </div>

            <div className="flex items-end gap-3 mb-5">
              <span className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {formatPrice(currentPrice)}
              </span>
              {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                <span className="text-lg text-gray-400 line-through mb-1">
                  {formatPrice(currentOriginalPrice)}
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
            )}

            <div className="flex items-center gap-2 mb-6">
              {currentStock > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-green-600 text-sm font-medium">
                  <Check size={16} /> In stock ({currentStock} available)
                </span>
              ) : (
                <span className="text-red-500 text-sm font-medium">Out of stock</span>
              )}
            </div>

            {/* Color Selection */}
            {product.availableColors && product.availableColors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Color: {typeof selectedColor === 'string' ? selectedColor : selectedColor?.name}</h3>
                <div className="flex flex-wrap gap-3">
                  {product.availableColors.map((color, i) => {
                    const colorName = typeof color === 'string' ? color : color.name;
                    const colorCode = typeof color === 'string' ? '#000000' : color.code;
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedColor(typeof color === 'string' ? color : color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          (typeof selectedColor === 'string' ? selectedColor : selectedColor?.name) === colorName
                            ? 'border-blue-600 ring-2 ring-blue-200 scale-110'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: colorCode }}
                        title={colorName}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.availableSizes && product.availableSizes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Size: {selectedSize}</h3>
                <div className="flex flex-wrap gap-3">
                  {product.availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                        selectedSize === size
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-gray-700">Quantity</span>
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 hover:bg-gray-100 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2 hover:bg-gray-100 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all active:scale-95 ${
                  added
                    ? 'bg-green-600 text-white'
                    : 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                }`}
              >
                {added ? <Check size={20} /> : <ShoppingCart size={20} />}
                {added ? 'Added to Cart' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all active:scale-95"
              >
                Buy Now
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: 'Free shipping over ₹100' },
                { icon: ShieldCheck, label: 'Secure payment' },
                { icon: RefreshCw, label: 'Easy returns' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center gap-2 bg-white rounded-xl p-3 shadow-sm"
                >
                  <Icon className="text-blue-600" size={22} />
                  <span className="text-[11px] sm:text-xs text-gray-600 leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
