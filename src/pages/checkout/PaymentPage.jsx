import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, ArrowLeft, ArrowRight, Shield, MessageCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI } from '../../services/api';
import { formatPrice } from '../../utils/format';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, shipping, tax, total, clearCart } = useCart();
  const { user } = useAuth();
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('whatsapp');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    setPlacing(true);
    let shippingAddress = null;
    let billingInfo = null;
    try {
      shippingAddress = JSON.parse(localStorage.getItem('shippingInfo') || 'null');
      billingInfo = JSON.parse(localStorage.getItem('billingInfo') || 'null');
    } catch {
      shippingAddress = null;
      billingInfo = null;
    }
    const order = {
      userId: user.id,
      customerName: user.fullName,
      email: user.email,
      items: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        imageUrl: i.imageUrl,
        price: i.price,
        quantity: i.quantity,
      })),
      subtotal: Number(subtotal.toFixed(2)),
      shipping,
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
      shippingAddress,
      billingAddress: billingInfo?.billingAddress || shippingAddress,
      paymentMethod: paymentMethod,
      status: 'Pending',
    };
    try {
      const res = await ordersAPI.create(order);
      clearCart();
      localStorage.removeItem('shippingInfo');
      localStorage.removeItem('billingInfo');
      navigate('/checkout/confirmation', { 
        state: { 
          orderId: res.data.id,
          orderData: {
            subtotal: order.subtotal,
            shipping: order.shipping,
            tax: order.tax,
            total: order.total
          },
          shippingAddress: order.shippingAddress,
          billingAddress: order.billingAddress,
          paymentMethod: order.paymentMethod
        } 
      });
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Could not place your order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full font-bold text-sm sm:text-lg shadow-md">
                    4
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm sm:text-base">Payment</p>
                    <p className="text-xs sm:text-sm text-gray-500">Step 4 of 5</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">80% Complete</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 sm:h-3 rounded-full transition-all duration-500" style={{ width: '80%' }}></div>
              </div>
              <div className="flex justify-between mt-3 text-xs sm:text-sm">
                <span className="text-green-600 font-medium">Cart ✓</span>
                <span className="text-green-600 font-medium">Shipping ✓</span>
                <span className="text-green-600 font-medium">Billing ✓</span>
                <span className="text-green-600 font-medium">Payment</span>
                <span className="text-gray-400">Confirmation</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-purple-100">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <CreditCard size={24} className="text-white" />
              </div>
              Payment Information
            </h1>

            {/* Security Notice */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 mb-8 flex items-start shadow-sm">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                <Shield className="text-white" size={20} />
              </div>
              <div>
                <p className="text-green-800 font-bold text-lg mb-1">Secure Payment</p>
                <p className="text-green-700 text-sm">Your payment information is encrypted and secure</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Payment Method Selection */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                    <CreditCard size={16} className="text-white" />
                  </div>
                  Select Payment Method
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('whatsapp')}
                    className={`p-6 border-2 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                      paymentMethod === 'whatsapp' 
                        ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg' 
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-md">
                        <MessageCircle size={32} className="text-white" />
                      </div>
                    </div>
                    <div className="font-bold text-gray-800 text-lg">WhatsApp Payment</div>
                    <div className="text-sm text-gray-600 mt-1">Pay via WhatsApp</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-6 border-2 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                      paymentMethod === 'cod' 
                        ? 'border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg' 
                        : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-md">
                        <span className="text-white text-4xl font-bold">₹</span>
                      </div>
                    </div>
                    <div className="font-bold text-gray-800 text-lg">Cash on Delivery</div>
                    <div className="text-sm text-gray-600 mt-1">Pay when delivered</div>
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center justify-center my-6">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-full"></div>
              </div>

              {/* Order Summary */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                    <CreditCard size={16} className="text-white" />
                  </div>
                  Order Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span>{formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="border-t border-purple-200 pt-3 mt-3">
                    <div className="flex justify-between text-xl font-bold text-gray-800">
                      <span>Total Amount</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Link
                  to="/checkout/billing"
                  className="flex items-center px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold"
                >
                  <ArrowLeft className="mr-2" size={20} />
                  Back to Billing
                </Link>
                <button
                  type="submit"
                  disabled={placing}
                  className="flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-60 shadow-lg font-semibold"
                >
                  {placing ? 'Placing...' : 'Place Order'}
                  <ArrowRight className="ml-2" size={20} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
