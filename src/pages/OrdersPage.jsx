import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, Clock, CheckCircle, Truck, XCircle, MapPin, Filter, X } from 'lucide-react';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/format';

const statusStyles = {
  Pending: { icon: Clock, cls: 'bg-amber-100 text-amber-700' },
  Processing: { icon: Package, cls: 'bg-blue-100 text-blue-700' },
  Shipped: { icon: Truck, cls: 'bg-indigo-100 text-indigo-700' },
  Delivered: { icon: CheckCircle, cls: 'bg-green-100 text-green-700' },
  Cancelled: { icon: XCircle, cls: 'bg-red-100 text-red-700' },
};

const OrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/orders' } });
      return;
    }
    ordersAPI
      .getUserOrders(user.id)
      .then((res) => {
        setOrders(res.data);
        setFilteredOrders(res.data);
      })
      .catch((err) => console.error('Error loading orders:', err))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  useEffect(() => {
    let filtered = [...orders];

    if (statusFilter !== 'All') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(query) ||
        `ORD-${order.id.slice(0, 8).toUpperCase()}`.toLowerCase().includes(query)
      );
    }

    if (dateFilter !== 'All') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const last7Days = new Date(today);
      last7Days.setDate(last7Days.getDate() - 7);
      const last30Days = new Date(today);
      last30Days.setDate(last30Days.getDate() - 30);
      const last90Days = new Date(today);
      last90Days.setDate(last90Days.getDate() - 90);

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        switch (dateFilter) {
          case 'Today':
            return orderDate >= today;
          case 'Last7Days':
            return orderDate >= last7Days;
          case 'Last30Days':
            return orderDate >= last30Days;
          case 'Last90Days':
            return orderDate >= last90Days;
          default:
            return true;
        }
      });
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchQuery, dateFilter]);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const clearFilters = () => {
    setStatusFilter('All');
    setSearchQuery('');
    setDateFilter('All');
  };

  const hasActiveFilters = statusFilter !== 'All' || searchQuery || dateFilter !== 'All';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Package className="text-blue-600" /> My Orders
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Filter size={18} />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              )}
            </button>
            <Link
              to="/addresses"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <MapPin size={18} />
              Manage Addresses
            </Link>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Filter size={20} />
                Filter Orders
              </h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <X size={16} />
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Order ID</label>
                <input
                  type="text"
                  placeholder="Search by order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All Time</option>
                  <option value="Today">Today</option>
                  <option value="Last7Days">Last 7 Days</option>
                  <option value="Last30Days">Last 30 Days</option>
                  <option value="Last90Days">Last 90 Days</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {statusFilter !== 'All' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      Status: {statusFilter}
                      <button onClick={() => setStatusFilter('All')} className="ml-1 hover:text-blue-900">
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      Search: {searchQuery}
                      <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-blue-900">
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  {dateFilter !== 'All' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {dateFilter}
                      <button onClick={() => setDateFilter('All')} className="ml-1 hover:text-blue-900">
                        <X size={14} />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {orders.length > 0 && (
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredOrders.length} of {orders.length} orders
            {hasActiveFilters && ' (filtered)'}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">Your placed orders will appear here.</p>
            <Link
              to="/shopping"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              <ShoppingBag size={18} /> Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search query.</p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  <X size={18} /> Clear Filters
                </button>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const sInfo = statusStyles[order.status] || statusStyles.Pending;
                const StatusIcon = sInfo.icon;
                return (
                  <div key={order.id} className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
                      <div>
                        <p className="text-sm text-gray-500">Order</p>
                        <p className="font-bold text-gray-800">
                          #ORD-{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${sInfo.cls}`}
                        >
                          <StatusIcon size={14} /> {order.status}
                        </span>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="font-bold text-blue-600">{formatPrice(order.total)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xl">📦</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              Qty {item.quantity} × {formatPrice(item.price)}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-gray-700">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
