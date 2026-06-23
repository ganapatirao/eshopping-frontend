import React from 'react';
import { ShoppingBag, Package, Users, TrendingUp, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { formatPrice } from '../../utils/format';

const AdminOverview = ({ orders, products, categories, users, onTabChange }) => {
  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    processing: orders.filter(o => o.status === 'Processing').length,
    shipped: orders.filter(o => o.status === 'Shipped').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    cancelled: orders.filter(o => o.status === 'Cancelled').length,
  };

  const revenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const recentOrders = orders.slice(0, 5);

  const statusStyles = {
    Pending: { icon: Clock, cls: 'bg-amber-100 text-amber-700' },
    Processing: { icon: Package, cls: 'bg-blue-100 text-blue-700' },
    Shipped: { icon: Truck, cls: 'bg-indigo-100 text-indigo-700' },
    Delivered: { icon: CheckCircle, cls: 'bg-green-100 text-green-700' },
    Cancelled: { icon: XCircle, cls: 'bg-red-100 text-red-700' },
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-4 sm:p-6 text-white hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-white/20 rounded-xl p-2 sm:p-3">
              <ShoppingBag size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm font-medium text-blue-100">Revenue</p>
              <p className="text-lg sm:text-2xl font-bold">{formatPrice(revenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-4 sm:p-6 text-white hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-white/20 rounded-xl p-2 sm:p-3">
              <Package size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm font-medium text-green-100">Orders</p>
              <p className="text-lg sm:text-2xl font-bold">{orderStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-4 sm:p-6 text-white hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-white/20 rounded-xl p-2 sm:p-3">
              <Users size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm font-medium text-purple-100">Users</p>
              <p className="text-lg sm:text-2xl font-bold">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-4 sm:p-6 text-white hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-white/20 rounded-xl p-2 sm:p-3">
              <TrendingUp size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm font-medium text-orange-100">Products</p>
              <p className="text-lg sm:text-2xl font-bold">{products.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => onTabChange('products')}
          className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all cursor-pointer text-left border border-gray-100 hover:border-blue-300"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <Package className="text-white w-5 h-5 sm:w-6 sm:h-6" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Products</h3>
              <p className="text-xs sm:text-sm text-gray-500">Manage products</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onTabChange('categories')}
          className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all cursor-pointer text-left border border-gray-100 hover:border-green-300"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shrink-0">
              <ShoppingBag className="text-white w-5 h-5 sm:w-6 sm:h-6" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Categories</h3>
              <p className="text-xs sm:text-sm text-gray-500">Manage categories</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onTabChange('orders')}
          className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all cursor-pointer text-left border border-gray-100 hover:border-purple-300"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
              <ShoppingBag className="text-white w-5 h-5 sm:w-6 sm:h-6" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Orders</h3>
              <p className="text-xs sm:text-sm text-gray-500">View orders</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onTabChange('users')}
          className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-lg transition-all cursor-pointer text-left border border-gray-100 hover:border-orange-300"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shrink-0">
              <Users className="text-white w-5 h-5 sm:w-6 sm:h-6" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Users</h3>
              <p className="text-xs sm:text-sm text-gray-500">Manage users</p>
            </div>
          </div>
        </button>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Orders</h2>
          <button
            onClick={() => onTabChange('orders')}
            className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm"
          >
            View All
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBag className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {recentOrders.map((order) => {
              const StatusIcon = statusStyles[order.status]?.icon || Clock;
              return (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-xl p-3 sm:p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 sm:mb-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">#{order.id}</span>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${statusStyles[order.status]?.cls || 'bg-gray-100 text-gray-700'}`}>
                        <div className="flex items-center gap-1">
                          <StatusIcon size={12} className="sm:w-3.5 sm:h-3.5" />
                          {order.status}
                        </div>
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
                    <div className="text-xs sm:text-sm text-gray-600">
                      {order.customerName || order.email}
                    </div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">
                      {formatPrice(order.total)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOverview;
