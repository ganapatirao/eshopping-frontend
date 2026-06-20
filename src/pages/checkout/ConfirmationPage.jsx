import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, Truck, Home, ShoppingBag, Sparkles, Percent, MapPin, CreditCard, MessageCircle, Phone, Mail, Building2, ArrowRight } from 'lucide-react';
import { formatPrice } from '../../utils/format';

const ConfirmationPage = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;
  const orderData = location.state?.orderData;
  const shippingAddress = location.state?.shippingAddress;
  const billingAddress = location.state?.billingAddress;
  const paymentMethod = location.state?.paymentMethod;
  const [shippingInfo, setShippingInfo] = useState(null);
  const [billingInfo, setBillingInfo] = useState(null);
  const orderNumber = orderId
    ? 'ORD-' + orderId.slice(0, 8).toUpperCase()
    : 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();

  useEffect(() => {
    // Use data from location.state if available, otherwise fallback to localStorage
    if (shippingAddress) {
      setShippingInfo(shippingAddress);
    } else {
      const shipping = JSON.parse(localStorage.getItem('shippingInfo') || 'null');
      setShippingInfo(shipping);
    }
    
    if (billingAddress) {
      setBillingInfo({ sameAsShipping: false, billingAddress });
    } else {
      const billing = JSON.parse(localStorage.getItem('billingInfo') || 'null');
      setBillingInfo(billing);
    }
  }, [shippingAddress, billingAddress]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Success Message */}
          <div className="bg-white rounded-3xl shadow-2xl p-10 text-center mb-8 border-2 border-green-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle className="text-white" size={64} />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
              Order Confirmed!
            </h1>
            <p className="text-gray-600 text-lg mb-6">Thank you for your purchase</p>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 inline-block border-2 border-green-200">
              <p className="text-sm text-gray-600 font-medium mb-1">Order Number</p>
              <p className="text-3xl font-bold text-gray-800 tracking-wider">{orderNumber}</p>
            </div>
          </div>

          {/* Order Summary */}
          {orderData && (
            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border-2 border-purple-100">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <Sparkles className="text-white" size={24} />
                </div>
                Order Summary
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-gray-700 text-lg">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold">{formatPrice(orderData.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-700 text-lg">
                  <span className="font-medium">Shipping</span>
                  <span className="font-bold text-green-600">{orderData.shipping === 0 ? 'Free' : formatPrice(orderData.shipping)}</span>
                </div>
                <div className="flex justify-between text-gray-700 text-lg items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                      <Percent size={16} className="text-white" />
                    </div>
                    <span className="font-medium">Tax</span>
                  </div>
                  <span className="font-bold">{formatPrice(orderData.tax)}</span>
                </div>
                <div className="border-t-2 border-purple-200 pt-6 flex justify-between font-bold text-gray-800 text-xl">
                  <span>Total</span>
                  <span className="text-3xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {formatPrice(orderData.total)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Shipping Information */}
          {shippingInfo && (
            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border-2 border-blue-100">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <MapPin className="text-white" size={24} />
                </div>
                Shipping Information
              </h2>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100">
                <div className="space-y-3">
                  <p className="font-bold text-gray-800 text-xl">{shippingInfo.fullName}</p>
                  {shippingInfo.email && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail size={18} className="text-blue-500" />
                      <span>{shippingInfo.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone size={18} className="text-green-500" />
                    <span>{shippingInfo.phone}</span>
                  </div>
                  <p className="text-gray-700 font-medium">{shippingInfo.address}</p>
                  {shippingInfo.landmark && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin size={18} className="text-purple-500" />
                      <span>Landmark: {shippingInfo.landmark}</span>
                    </div>
                  )}
                  {shippingInfo.buildingName && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Building2 size={18} className="text-orange-500" />
                      <span>Building: {shippingInfo.buildingName}</span>
                    </div>
                  )}
                  {shippingInfo.floorUnit && <p className="text-gray-700">Floor/Unit: {shippingInfo.floorUnit}</p>}
                  <p className="text-gray-700">{shippingInfo.city}, {shippingInfo.district}</p>
                  <p className="text-gray-700">{shippingInfo.state} - {shippingInfo.zipCode}</p>
                  <p className="text-gray-700">{shippingInfo.country}</p>
                  {shippingInfo.alternatePhone && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone size={18} className="text-gray-400" />
                      <span>Alt: {shippingInfo.alternatePhone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Billing Information */}
          {billingInfo && (
            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border-2 border-purple-100">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <CreditCard className="text-white" size={24} />
                </div>
                Billing Information
              </h2>
              {billingInfo.sameAsShipping ? (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="text-white" size={20} />
                    </div>
                    <p className="text-gray-700 font-bold text-lg">Same as shipping address</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                  <div className="space-y-3">
                    <p className="font-bold text-gray-800 text-xl">{billingInfo.billingAddress?.fullName}</p>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone size={18} className="text-green-500" />
                      <span>{billingInfo.billingAddress?.phone}</span>
                    </div>
                    <p className="text-gray-700 font-medium">{billingInfo.billingAddress?.address}</p>
                    {billingInfo.billingAddress?.landmark && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin size={18} className="text-purple-500" />
                        <span>Landmark: {billingInfo.billingAddress?.landmark}</span>
                      </div>
                    )}
                    {billingInfo.billingAddress?.buildingName && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Building2 size={18} className="text-orange-500" />
                        <span>Building: {billingInfo.billingAddress?.buildingName}</span>
                      </div>
                    )}
                    {billingInfo.billingAddress?.floorUnit && <p className="text-gray-700">Floor/Unit: {billingInfo.billingAddress?.floorUnit}</p>}
                    <p className="text-gray-700">{billingInfo.billingAddress?.city}, {billingInfo.billingAddress?.district}</p>
                    <p className="text-gray-700">{billingInfo.billingAddress?.state} - {billingInfo.billingAddress?.zipCode}</p>
                    <p className="text-gray-700">{billingInfo.billingAddress?.country}</p>
                    {billingInfo.billingAddress?.alternatePhone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone size={18} className="text-gray-400" />
                        <span>Alt: {billingInfo.billingAddress?.alternatePhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment Method */}
          {paymentMethod && (
            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border-2 border-green-100">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <CreditCard className="text-white" size={24} />
                </div>
                Payment Method
              </h2>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                    {paymentMethod === 'whatsapp' ? (
                      <MessageCircle className="text-white" size={32} />
                    ) : (
                      <span className="text-white text-3xl">💵</span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-xl">
                      {paymentMethod === 'whatsapp' ? 'WhatsApp Payment' : 'Cash on Delivery'}
                    </p>
                    <p className="text-gray-600 text-base mt-1">
                      {paymentMethod === 'whatsapp' 
                        ? 'Payment completed via WhatsApp' 
                        : 'Pay when your order is delivered'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order Details */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border-2 border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Order Details</h2>
            
            <div className="space-y-6">
              <div className="flex items-start p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mr-5 shrink-0 shadow-lg">
                  <Package className="text-white" size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-xl">Order Status</h3>
                  <p className="text-gray-600 text-base mt-1">Your order has been confirmed and is being processed</p>
                </div>
              </div>

              <div className="flex items-start p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-100">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-5 shrink-0 shadow-lg">
                  <Truck className="text-white" size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-xl">Shipping Information</h3>
                  <p className="text-gray-600 text-base mt-1">You will receive a shipping confirmation email once your order ships</p>
                </div>
              </div>

              <div className="flex items-start p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-100">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-5 shrink-0 shadow-lg">
                  <CheckCircle className="text-white" size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-xl">Payment</h3>
                  <p className="text-gray-600 text-base mt-1">Payment has been successfully processed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border-2 border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">What's Next?</h2>
            
            <div className="space-y-5">
              <div className="flex items-center p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-100 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center mr-5 font-bold text-xl shadow-lg">1</div>
                <div>
                  <p className="font-bold text-gray-800 text-lg">Order Processing</p>
                  <p className="text-gray-600 text-base mt-1">Your order is being prepared for shipment</p>
                </div>
              </div>

              <div className="flex items-center p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-100 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center mr-5 font-bold text-xl shadow-lg">2</div>
                <div>
                  <p className="font-bold text-gray-800 text-lg">Shipping Notification</p>
                  <p className="text-gray-600 text-base mt-1">You'll receive an email with tracking information</p>
                </div>
              </div>

              <div className="flex items-center p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-100 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full flex items-center justify-center mr-5 font-bold text-xl shadow-lg">3</div>
                <div>
                  <p className="font-bold text-gray-800 text-lg">Delivery</p>
                  <p className="text-gray-600 text-base mt-1">Your package will arrive at your doorstep</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/"
              className="flex items-center justify-center px-8 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 shadow-lg"
            >
              <Home className="mr-3" size={24} />
              Back to Home
            </Link>
            <Link
              to="/shopping"
              className="flex items-center justify-center px-8 py-5 border-2 border-gray-300 rounded-2xl text-gray-700 hover:bg-gray-50 font-bold text-lg transition-all hover:border-gray-400"
            >
              <ShoppingBag className="mr-3" size={24} />
              Continue Shopping
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
