import { ShoppingCart, Edit, Eye } from 'lucide-react';

const OrdersSection = ({ orders }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 text-white">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <ShoppingCart size={20} sm:size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">Orders Management</h2>
              <p className="text-green-100 text-xs sm:text-sm">Manage customer orders</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Order ID</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Customer</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Total</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Status</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Date</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="py-2 sm:py-3 px-2 sm:px-4">
                  <p className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base">#{order.id}</p>
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-4">
                  <p className="text-gray-700 text-xs sm:text-sm md:text-base">{order.customerName || 'N/A'}</p>
                  <p className="text-xs text-gray-500">{order.customerEmail || ''}</p>
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-4">
                  <p className="font-semibold text-xs sm:text-sm md:text-base">₹{order.totalAmount?.toLocaleString() || 0}</p>
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-4">
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status || 'Pending'}
                  </span>
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-4">
                  <p className="text-gray-700 text-xs sm:text-sm md:text-base">{new Date(order.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-4">
                  <div className="flex gap-2">
                    <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Eye size={16} sm:size={18} className="text-blue-600" />
                    </button>
                    <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit size={16} sm:size={18} className="text-green-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No orders found.
          </div>
        )}
      </div>
      <p className="mt-4 text-sm text-gray-500">Showing {orders.length} orders</p>
    </div>
  );
};

export default OrdersSection;
