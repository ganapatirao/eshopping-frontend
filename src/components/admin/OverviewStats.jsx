import { Package, Users, ShoppingCart, DollarSign, Folder, UserCheck, TrendingUp, CheckCircle } from 'lucide-react';

const OverviewStats = ({ dashboardStats }) => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-2 sm:gap-3 md:gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 sm:p-4 md:p-6 border border-blue-200">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <div className="bg-blue-600 p-1.5 sm:p-2 md:p-3 rounded-lg">
              <Package size={14} sm:size={16} md:size={20} className="text-white" />
            </div>
            <TrendingUp size={12} sm:size={14} md:size={16} className="text-green-600" />
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">{dashboardStats.totalProducts}</h3>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base">Total Products</p>
          <div className="mt-1 sm:mt-2 text-xs text-gray-500">
            <span className="text-green-600">{dashboardStats.activeProducts} active</span> • 
            <span className="text-purple-600"> {dashboardStats.featuredProducts} featured</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 sm:p-4 md:p-6 border border-purple-200">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <div className="bg-purple-600 p-1.5 sm:p-2 md:p-3 rounded-lg">
              <Users size={14} sm:size={16} md:size={20} className="text-white" />
            </div>
            <TrendingUp size={12} sm:size={14} md:size={16} className="text-green-600" />
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">{dashboardStats.totalVendors}</h3>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base">Total Vendors</p>
          <div className="mt-1 sm:mt-2 text-xs text-gray-500">
            <span className="text-green-600">{dashboardStats.activeVendors} active</span> • 
            <span className="text-blue-600"> {dashboardStats.verifiedVendors} verified</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 sm:p-4 md:p-6 border border-green-200">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <div className="bg-green-600 p-1.5 sm:p-2 md:p-3 rounded-lg">
              <ShoppingCart size={14} sm:size={16} md:size={20} className="text-white" />
            </div>
            <TrendingUp size={12} sm:size={14} md:size={16} className="text-green-600" />
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">{dashboardStats.totalOrders}</h3>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base">Total Orders</p>
          <div className="mt-1 sm:mt-2 text-xs text-gray-500">
            <span className="text-yellow-600">{dashboardStats.pendingOrders} pending</span> • 
            <span className="text-green-600"> {dashboardStats.completedOrders} completed</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 sm:p-4 md:p-6 border border-orange-200">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <div className="bg-orange-600 p-1.5 sm:p-2 md:p-3 rounded-lg">
              <DollarSign size={14} sm:size={16} md:size={20} className="text-white" />
            </div>
            <TrendingUp size={12} sm:size={14} md:size={16} className="text-green-600" />
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">₹{dashboardStats.totalRevenue.toLocaleString()}</h3>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base">Total Revenue</p>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-3 sm:p-4 md:p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-lg">
              <Folder size={20} sm:size={24} />
            </div>
            <div>
              <p className="text-white/80 text-xs sm:text-sm">Total Categories</p>
              <h3 className="text-2xl sm:text-3xl font-bold">{dashboardStats.totalCategories}</h3>
            </div>
          </div>
          <p className="text-white/70 text-xs">{dashboardStats.totalSubCategories} subcategories</p>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg p-3 sm:p-4 md:p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-lg">
              <UserCheck size={20} sm:size={24} />
            </div>
            <div>
              <p className="text-white/80 text-xs sm:text-sm">Total Users</p>
              <h3 className="text-2xl sm:text-3xl font-bold">{dashboardStats.totalUsers}</h3>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-3 sm:p-4 md:p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-lg">
              <TrendingUp size={20} sm:size={24} />
            </div>
            <div>
              <p className="text-white/80 text-xs sm:text-sm">Growth Rate</p>
              <h3 className="text-2xl sm:text-3xl font-bold">+12.5%</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="font-semibold text-gray-800">New order received</p>
              <p className="text-sm text-gray-600">Order #12345 - ₹2,499</p>
            </div>
            <span className="text-sm text-gray-500 ml-auto">2 min ago</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="bg-blue-100 p-2 rounded-full">
              <Package className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="font-semibold text-gray-800">New product added</p>
              <p className="text-sm text-gray-600">Men's Casual Shirt by Fashion Hub</p>
            </div>
            <span className="text-sm text-gray-500 ml-auto">15 min ago</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="bg-purple-100 p-2 rounded-full">
              <Users className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="font-semibold text-gray-800">New vendor registered</p>
              <p className="text-sm text-gray-600">Fashion Hub - Clothing</p>
            </div>
            <span className="text-sm text-gray-500 ml-auto">1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewStats;
