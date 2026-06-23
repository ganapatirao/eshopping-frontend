import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ShoppingBag, MapPin, CreditCard, Settings, LogOut, Package, Clock, CheckCircle, ChevronRight, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import { formatPrice } from '../utils/format';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/dashboard' } });
      return;
    }
    ordersAPI
      .getUserOrders(user.id)
      .then((res) => {
        setRecentOrders(res.data.slice(0, 5)); // Show last 5 orders
      })
      .catch((err) => console.error('Error loading orders:', err))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const statusStyles = {
    Pending: { icon: Clock, cls: 'bg-amber-100 text-amber-700' },
    Processing: { icon: Package, cls: 'bg-blue-100 text-blue-700' },
    Shipped: { icon: Package, cls: 'bg-indigo-100 text-indigo-700' },
    Delivered: { icon: CheckCircle, cls: 'bg-green-100 text-green-700' },
    Cancelled: { icon: Clock, cls: 'bg-red-100 text-red-700' },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.fullName || 'User'}!</h1>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Link
            to="/orders"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">My Orders</h3>
                <p className="text-sm text-gray-500">View order history</p>
              </div>
              <ChevronRight className="ml-auto text-gray-400" size={20} />
            </div>
          </Link>

          <Link
            to="/addresses"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPin className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Addresses</h3>
                <p className="text-sm text-gray-500">Manage addresses</p>
              </div>
              <ChevronRight className="ml-auto text-gray-400" size={20} />
            </div>
          </Link>

          <Link
            to="/cart"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Cart</h3>
                <p className="text-sm text-gray-500">View cart items</p>
              </div>
              <ChevronRight className="ml-auto text-gray-400" size={20} />
            </div>
          </Link>

          <Link
            to="/settings"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Settings className="text-orange-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Settings</h3>
                <p className="text-sm text-gray-500">Account settings</p>
              </div>
              <ChevronRight className="ml-auto text-gray-400" size={20} />
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <Link to="/orders" className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
              View All
              <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading orders...</div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">No orders yet</p>
              <Link to="/shopping" className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => {
                const StatusIcon = statusStyles[order.status]?.icon || Clock;
                return (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">#{order.id}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[order.status]?.cls || 'bg-gray-100 text-gray-700'}`}>
                          <div className="flex items-center gap-1">
                            <StatusIcon size={14} />
                            {order.status}
                          </div>
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {order.items?.length || 0} item(s)
                      </div>
                      <div className="font-semibold text-gray-900">
                        {formatPrice(order.totalAmount)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
