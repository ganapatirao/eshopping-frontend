import { Plus, Edit, Trash2, Building } from 'lucide-react';

const VendorsSection = ({ 
  vendors, 
  vendorFilter, 
  setVendorFilter, 
  handleOpenVendorModal, 
  handleDeleteVendor 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 text-white">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Building size={20} sm:size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">Vendors Management</h2>
              <p className="text-orange-100 text-xs sm:text-sm">Manage vendors and suppliers</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <button 
            onClick={() => handleOpenVendorModal()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold flex items-center gap-2 text-xs sm:text-sm md:text-base justify-center"
          >
            <Plus size={16} sm:size={18} />
            <span>Add Vendor</span>
          </button>
          <input
            type="text"
            placeholder="Search vendors..."
            value={vendorFilter.search}
            onChange={(e) => setVendorFilter({ ...vendorFilter, search: e.target.value })}
            className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
          />
          <select 
            value={vendorFilter.status}
            onChange={(e) => setVendorFilter({ ...vendorFilter, status: e.target.value })}
            className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="verified">Verified</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Vendor</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Category</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Products</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Status</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors
              .filter(vendor => {
                const matchesSearch = vendor.companyName?.toLowerCase().includes(vendorFilter.search.toLowerCase()) || 
                                    vendor.contactPerson?.toLowerCase().includes(vendorFilter.search.toLowerCase());
                const matchesStatus = vendorFilter.status === '' || 
                                    (vendorFilter.status === 'active' && vendor.isActive) ||
                                    (vendorFilter.status === 'inactive' && !vendor.isActive) ||
                                    (vendorFilter.status === 'verified' && vendor.isVerified);
                return matchesSearch && matchesStatus;
              })
              .map(vendor => (
              <tr key={vendor.id} className="border-b hover:bg-gray-50">
                <td className="py-2 sm:py-3 px-2 sm:px-4">
                  <div>
                    <p className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base">{vendor.companyName}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{vendor.contactPerson}</p>
                  </div>
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-4">
                  <p className="text-gray-700 text-xs sm:text-sm md:text-base">{vendor.category}</p>
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-4">
                  <p className="font-semibold text-xs sm:text-sm md:text-base">{vendor.productCount || 0}</p>
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-4">
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                      vendor.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {vendor.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {vendor.isVerified && (
                      <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        Verified
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenVendorModal(vendor)}
                      className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit size={16} sm:size={18} className="text-blue-600" />
                    </button>
                    <button 
                      onClick={() => handleDeleteVendor(vendor)}
                      className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} sm:size={18} className="text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {vendors.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No vendors found. Click "Add Vendor" to create one.
          </div>
        )}
      </div>
      <p className="mt-4 text-sm text-gray-500">Showing {vendors.length} vendors</p>
    </div>
  );
};

export default VendorsSection;
