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
  const [reviewsExpanded, setReviewsExpanded] = useState(false);

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
    // Enforce variant selection if product has variants
    if (product.variants && product.variants.length > 0) {
      if (!selectedColor || !selectedSize) {
        alert('Please select a color and size before adding to cart');
        return;
      }
      if (!selectedVariant) {
        alert('Please select a valid variant');
        return;
      }
    }

    const productToAdd = selectedVariant
      ? { ...product, price: selectedVariant.price, originalPrice: selectedVariant.originalPrice, stock: selectedVariant.stock, selectedVariant }
      : product;
    addToCart(productToAdd, quantity, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    // Enforce variant selection if product has variants
    if (product.variants && product.variants.length > 0) {
      if (!selectedColor || !selectedSize) {
        alert('Please select a color and size before buying');
        return;
      }
      if (!selectedVariant) {
        alert('Please select a valid variant');
        return;
      }
    }

    const productToAdd = selectedVariant
      ? { ...product, price: selectedVariant.price, originalPrice: selectedVariant.originalPrice, stock: selectedVariant.stock, selectedVariant }
      : product;
    addToCart(productToAdd, quantity, selectedVariant);
    navigate('/cart');
  };

  const scrollToReviews = () => {
    const element = document.getElementById('reviews');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setReviewsExpanded(true);
    }
  };

  const toggleReviews = () => {
    setReviewsExpanded(!reviewsExpanded);
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

  const discount = product.discountPercentage || 0;

  const basePrice = selectedVariant?.price || product.price;
  const baseOriginalPrice = selectedVariant?.originalPrice || product.originalPrice || basePrice;
  const currentDiscount = selectedVariant?.discountPercentage || product.discountPercentage || 0;
  const currentPrice = currentDiscount > 0
    ? Math.round(baseOriginalPrice * (1 - currentDiscount / 100))
    : basePrice;
  const currentOriginalPrice = baseOriginalPrice;
  const currentStock = selectedVariant?.stock || product.stock;

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
              <button
                onClick={scrollToReviews}
                className="text-sm text-gray-500 hover:text-blue-600 transition-colors cursor-pointer underline decoration-dotted"
              >
                {product.rating || 0} ({product.reviewCount || 0} reviews)
              </button>
            </div>

            <div className="flex items-end gap-3 mb-5">
              {currentDiscount > 0 && currentOriginalPrice > currentPrice && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg text-gray-400 line-through">{formatPrice(currentOriginalPrice)}</span>
                  <span className="bg-red-100 text-red-600 text-sm font-semibold px-3 py-1 rounded-full">
                    {currentDiscount}% OFF
                  </span>
                </div>
              )}
              <span className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {formatPrice(currentPrice)}
              </span>
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
              {product.trustBadges && product.trustBadges.length > 0 ? (
                product.trustBadges
                  .filter(badge => badge.isActive)
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((badge, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center text-center gap-2 bg-white rounded-xl p-3 shadow-sm"
                    >
                      {badge.icon ? (
                        badge.icon.startsWith('data:') ? (
                          <img src={badge.icon} alt={badge.label} className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                        ) : (
                          <span className="text-2xl">{badge.icon}</span>
                        )
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                      <span className="text-[11px] sm:text-xs text-gray-600 leading-tight">{badge.label}</span>
                    </div>
                  ))
              ) : (
                // Fallback to default badges if none configured
                [
                  { icon: '🚚', label: 'Free shipping over ₹100' },
                  { icon: '🛡️', label: 'Secure payment' },
                  { icon: '↩️', label: 'Easy returns' },
                ].map(({ icon, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center text-center gap-2 bg-white rounded-xl p-3 shadow-sm"
                  >
                    <span className="text-2xl">{icon}</span>
                    <span className="text-[11px] sm:text-xs text-gray-600 leading-tight">{label}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Warranty Section */}
        {product.warranty && (
          <div id="warranty" className="mt-6 sm:mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-100">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              {product.warrantyIcon ? (
                product.warrantyIcon.startsWith('data:') ? (
                  <img src={product.warrantyIcon} alt="Warranty icon" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                ) : (
                  <span className="text-2xl sm:text-3xl">{product.warrantyIcon}</span>
                )
              ) : (
                <ShieldCheck className="text-emerald-600" size={20} />
              )}
              <h3 className="text-base sm:text-lg font-bold text-gray-800">Warranty</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-700">{product.warranty}</p>
          </div>
        )}

        {/* Dynamic Sections (additional sections added by admin) */}
        {product.dynamicSections && product.dynamicSections.length > 0 && (
          <>
            {product.dynamicSections
              .filter(section => section.isActive)
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((section, index) => (
                <div key={index} id={`section-${section.id || index}`} className="mt-6 sm:mt-8 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-violet-100">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    {section.icon ? (
                      section.icon.startsWith('data:') ? (
                        <img src={section.icon} alt={section.title} className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                      ) : (
                        <span className="text-2xl sm:text-3xl">{section.icon}</span>
                      )
                    ) : (
                      <span className="text-2xl sm:text-3xl">📄</span>
                    )}
                    <h3 className="text-base sm:text-lg font-bold text-gray-800">{section.title}</h3>
                  </div>
                  {section.sectionType === 'text' && (
                    <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">{section.content}</p>
                  )}
                  {section.sectionType === 'list' && (
                    <ul className="text-sm sm:text-base text-gray-700 list-disc list-inside space-y-1">
                      {section.content.split('\n').map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {section.sectionType === 'table' && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm sm:text-base text-gray-700">
                        <tbody>
                          {section.content.split('\n').map((row, i) => {
                            const [label, value] = row.split(':');
                            return (
                              <tr key={i} className="border-b border-violet-100 last:border-0">
                                <td className="py-2 pr-4 font-medium text-violet-700">{label}</td>
                                <td className="py-2">{value}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
          </>
        )}

        {/* Specifications Section */}
        {product.specifications && product.specifications.length > 0 && (
          <div id="specs" className="mt-6 sm:mt-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-orange-100">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-800">Specifications</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {product.specifications.map((spec, index) => (
                <div key={index} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-100 to-amber-100 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 font-bold text-xs sm:text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] sm:text-xs font-semibold text-orange-700 uppercase tracking-wide mb-0.5 sm:mb-1">{spec.name}</p>
                      <p className="text-xs sm:text-sm font-medium text-gray-800 break-words">{spec.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {product.reviews && product.reviews.length > 0 && (
          <div id="reviews" className="mt-6 sm:mt-8 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={toggleReviews}
              className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Star className="text-white" size={16} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800">Customer Reviews</h3>
                <span className="text-xs sm:text-sm text-gray-500">({product.reviews.length})</span>
              </div>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${reviewsExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                reviewsExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
                {product.reviews.map((review, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                          {review.userName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-gray-800">{review.userName}</p>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={12}
                                className={
                                  s <= review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] sm:text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-2">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetailPage;
