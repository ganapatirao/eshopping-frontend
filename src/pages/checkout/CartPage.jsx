import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Truck, Percent, CheckCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/format';
import { productsAPI } from '../../services/api';

const CartPage = () => {
  const { items: cartItems, updateQuantity, removeItem, subtotal, shipping, tax, total, taxConfig } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState({});
  const [productDetails, setProductDetails] = useState({});

  useEffect(() => {
    // Fetch product details for items that don't have descriptions
    cartItems.forEach(async (item) => {
      if (!item.description && !productDetails[item.productId]) {
        try {
          const res = await productsAPI.getById(item.productId);
          setProductDetails(prev => ({
            ...prev,
            [item.productId]: res.data
          }));
        } catch (err) {
          console.error('Error fetching product details:', err);
        }
      }
    });
  }, [cartItems]);

  const toggleDescription = (productId) => {
    setExpandedItems(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const getItemDescription = (item) => {
    return item.description || productDetails[item.productId]?.description || '';
  };

  const proceed = () => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout/shipping' } });
    } else {
      navigate('/checkout/shipping');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 flex items-center">
            <ShoppingBag className="mr-3 text-blue-600" />
            Shopping Cart
          </h1>
          <p className="text-gray-600">Review your items before checkout</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-xl max-w-lg mx-auto">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <ShoppingBag size={64} className="text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <Link
              to="/shopping"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <Sparkles size={20} />
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <div 
                  key={item.productId} 
                  className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all border border-gray-100"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <div className="text-4xl">📦</div>
                      )}
                    </div>
                    <div className="grow min-w-0">
                      <h3 className="font-bold text-gray-800 mb-1 line-clamp-2 text-lg">{item.name}</h3>
                      <div className="flex items-center gap-2 mb-1">
                        {item.discountPercentage > 0 && item.originalPrice > item.price && (
                          <>
                            <p className="text-gray-400 line-through text-sm">{formatPrice(item.originalPrice)}</p>
                            <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                              {item.discountPercentage}% OFF
                            </span>
                          </>
                        )}
                        <p className="text-blue-600 font-bold text-xl">{formatPrice(item.price)}</p>
                      </div>
                      {item.selectedVariant && (
                        <p className="text-sm text-gray-600">
                          {item.selectedVariant.color} / {item.selectedVariant.size}
                        </p>
                      )}

                      {(() => {
                        const description = getItemDescription(item);
                        if (description) {
                          return (
                            <div className="mt-2">
                              <p className="text-gray-600 text-sm">
                                {expandedItems[item.productId]
                                  ? description
                                  : `${description.substring(0, 80)}${description.length > 80 ? '...' : ''}`
                                }
                              </p>
                              {description.length > 80 && (
                                <button
                                  onClick={() => toggleDescription(item.productId)}
                                  className="text-blue-600 text-sm font-medium hover:text-blue-700 mt-1 flex items-center gap-1"
                                >
                                  {expandedItems[item.productId] ? (
                                    <>
                                      <span>Show less</span>
                                      <ChevronUp size={14} />
                                    </>
                                  ) : (
                                    <>
                                      <span>Show more</span>
                                      <ChevronDown size={14} />
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}
                      
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
                        >
                          <Minus size={18} />
                        </button>
                        <span className="w-12 text-center font-bold text-xl">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-10 h-10 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors flex items-center justify-center"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <p className="font-bold text-gray-800 text-right text-xl">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-24 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <Sparkles className="mr-2 text-purple-600" />
                  Order Summary
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600 items-center">
                    <div className="flex items-center gap-2">
                      <Truck size={18} />
                      <span>Shipping</span>
                    </div>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-semibold flex items-center gap-1">
                        <CheckCircle size={16} />
                        Free
                      </span>
                    ) : (
                      <span className="font-semibold">{formatPrice(shipping)}</span>
                    )}
                  </div>
                  
                  {subtotal < taxConfig.freeShippingThreshold && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 text-sm">
                      <p className="text-blue-700">
                        Add {formatPrice(taxConfig.freeShippingThreshold - subtotal)} more for free shipping!
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-gray-600 items-center">
                    <div className="flex items-center gap-2">
                      <Percent size={18} />
                      <span>{taxConfig.taxName} ({(taxConfig.taxRate * 100).toFixed(0)}%)</span>
                    </div>
                    <span className="font-semibold">{formatPrice(tax)}</span>
                  </div>
                  
                  <div className="border-t-2 border-gray-200 pt-4 flex justify-between font-bold text-gray-800 text-lg">
                    <span>Total</span>
                    <span className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={proceed}
                  className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl text-center font-bold text-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  {user ? 'Proceed to Checkout' : 'Login to Checkout'}
                </button>

                <Link
                  to="/shopping"
                  className="block w-full mt-4 text-center text-blue-600 hover:text-purple-600 font-medium transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
