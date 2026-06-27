import { X, Plus, Edit, Users } from 'lucide-react';

const VendorModal = ({ 
  show, 
  onClose, 
  onSave, 
  editingVendor, 
  vendorForm, 
  setVendorForm, 
  validationErrors,
  validateField,
  defaultValidationRules 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 mx-2 sm:mx-0">
        <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-3 sm:p-4 md:p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <Users size={20} sm:size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {editingVendor ? 'Edit Vendor' : 'Add Vendor'}
                </h3>
                <p className="text-purple-100 text-xs sm:text-sm">
                  {editingVendor ? 'Update vendor details' : 'Create a new vendor'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-xl backdrop-blur-sm transition-all"
            >
              <X size={18} sm:size={20} className="text-white" />
            </button>
          </div>
        </div>
        
        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
              Contact Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={vendorForm.name}
                onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                onBlur={() => validateField('name', vendorForm.name, { required: true, minLength: 2, maxLength: 100 })}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 pl-11 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${validationErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'}`}
                placeholder="Contact name"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
            </div>
            {validationErrors.name && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
              Business Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={vendorForm.businessName}
                onChange={(e) => setVendorForm({ ...vendorForm, businessName: e.target.value })}
                onBlur={() => validateField('businessName', vendorForm.businessName, { required: true, minLength: 2, maxLength: 200 })}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 pl-11 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${validationErrors.businessName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'}`}
                placeholder="Business name"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🏢</span>
            </div>
            {validationErrors.businessName && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.businessName}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={vendorForm.email}
                onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                onBlur={() => validateField('email', vendorForm.email, { required: true, pattern: defaultValidationRules.email })}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 pl-11 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${validationErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'}`}
                placeholder="Email address"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
            </div>
            {validationErrors.email && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
              Phone
            </label>
            <div className="relative">
              <input
                type="tel"
                value={vendorForm.phone}
                onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                onBlur={() => validateField('phone', vendorForm.phone, { required: true, pattern: defaultValidationRules.phone })}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 pl-11 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${validationErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'}`}
                placeholder="Phone number"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📱</span>
            </div>
            {validationErrors.phone && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
              Business Type
            </label>
            <div className="relative">
              <input
                type="text"
                value={vendorForm.businessType}
                onChange={(e) => setVendorForm({ ...vendorForm, businessType: e.target.value })}
                onBlur={() => validateField('businessType', vendorForm.businessType, { required: true })}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 pl-11 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${validationErrors.businessType ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'}`}
                placeholder="Business type"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🏷️</span>
            </div>
            {validationErrors.businessType && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.businessType}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
              Address
            </label>
            <textarea
              value={vendorForm.address}
              onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
              rows={3}
              placeholder="Business address"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
              Description
            </label>
            <textarea
              value={vendorForm.description}
              onChange={(e) => setVendorForm({ ...vendorForm, description: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
              rows={3}
              placeholder="Vendor description"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 pt-2">
            <label className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl cursor-pointer hover:from-green-100 hover:to-emerald-100 transition-all border-2 border-transparent hover:border-green-300">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={vendorForm.isActive}
                  onChange={(e) => setVendorForm({ ...vendorForm, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-500"></div>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-700">Active</span>
                <p className="text-xs text-gray-500">Visible to users</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl cursor-pointer hover:from-blue-100 hover:to-cyan-100 transition-all border-2 border-transparent hover:border-blue-300">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={vendorForm.isVerified}
                  onChange={(e) => setVendorForm({ ...vendorForm, isVerified: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-cyan-500"></div>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-700">Verified</span>
                <p className="text-xs text-gray-500">Trusted vendor</p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex gap-3 p-3 sm:p-4 md:p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
          >
            <X size={18} />
            Cancel
          </button>
          <button
            onClick={onSave}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {editingVendor ? <Edit size={18} /> : <Plus size={18} />}
            {editingVendor ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorModal;
