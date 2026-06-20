import React, { useState, useEffect } from 'react';
import { MapPin, Edit, Trash2, Plus, Home, Briefcase, Star, X, Phone, Mail, Building2 } from 'lucide-react';
import { savedAddressesAPI, addressConfigurationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useValidation } from '../hooks/useValidation';
import { indianStates, getDistrictsByState, getCitiesByDistrict } from '../data/indianLocations';

const SavedAddresses = ({ onSelectAddress, onClose }) => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [addressConfig, setAddressConfig] = useState({ maxAddressesPerType: 3, maxTotalAddresses: 10 });

  useEffect(() => {
    if (user) {
      loadAddresses();
      loadAddressConfiguration();
    }
  }, [user]);

  const loadAddressConfiguration = async () => {
    try {
      const res = await addressConfigurationAPI.getConfiguration();
      setAddressConfig(res.data);
    } catch (err) {
      console.error('Error loading address configuration:', err);
    }
  };

  const loadAddresses = async () => {
    try {
      const res = await savedAddressesAPI.getByUserId(user.id);
      setAddresses(res.data);
    } catch (err) {
      console.error('Error loading addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await savedAddressesAPI.delete(id);
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting address:', err);
      alert('Failed to delete address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await savedAddressesAPI.setDefault(id);
      await loadAddresses();
    } catch (err) {
      console.error('Error setting default address:', err);
      alert('Failed to set default address');
    }
  };

  const handleSelect = (address) => {
    if (onSelectAddress) {
      onSelectAddress(address);
    }
    if (onClose) {
      onClose();
    }
  };

  const getAddressIcon = (type) => {
    switch (type) {
      case 'Home': return <Home size={20} className="text-blue-600" />;
      case 'Work': return <Briefcase size={20} className="text-purple-600" />;
      default: return <MapPin size={20} className="text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3">
            <MapPin size={20} className="text-white" />
          </div>
          Saved Addresses
        </h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl border-2 border-blue-100">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin size={40} className="text-blue-600" />
          </div>
          <p className="text-xl font-semibold text-gray-800 mb-2">No saved addresses yet</p>
          <p className="text-gray-600">Add an address to make checkout faster</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`border-2 rounded-3xl p-6 cursor-pointer transition-all shadow-md hover:shadow-lg ${
                address.isDefault 
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50' 
                  : 'border-gray-200 hover:border-blue-300 bg-white'
              }`}
              onClick={() => handleSelect(address)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    address.addressType === 'Home' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                      : address.addressType === 'Work'
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600'
                      : 'bg-gradient-to-r from-gray-500 to-gray-600'
                  }`}>
                    {getAddressIcon(address.addressType)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-lg">{address.fullName}</p>
                    <p className="text-sm text-gray-500">{address.addressType}</p>
                  </div>
                </div>
                {address.isDefault && (
                  <div className="flex items-center gap-1 text-blue-600 text-sm font-bold bg-blue-100 px-3 py-1 rounded-full">
                    <Star size={14} fill="currentColor" />
                    Default
                  </div>
                )}
              </div>
              
              <div className="space-y-2 mb-4">
                {address.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={16} className="text-blue-500" />
                    <span>{address.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={16} className="text-green-500" />
                  <span>{address.phone}</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">{address.address}</p>
                {address.landmark && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="text-purple-500" />
                    <span>Landmark: {address.landmark}</span>
                  </div>
                )}
                {address.buildingName && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 size={16} className="text-orange-500" />
                    <span>Building: {address.buildingName}</span>
                  </div>
                )}
                {address.floorUnit && (
                  <p className="text-sm text-gray-600">Floor/Unit: {address.floorUnit}</p>
                )}
                <p className="text-sm text-gray-600">{address.city}, {address.district}</p>
                <p className="text-sm text-gray-600">{address.state} - {address.zipCode}</p>
                <p className="text-sm text-gray-600">{address.country}</p>
                {address.alternatePhone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} className="text-gray-400" />
                    <span>Alt: {address.alternatePhone}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingAddress(address);
                    setShowForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                >
                  <Edit size={16} />
                  Edit
                </button>
                {!address.isDefault && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetDefault(address.id);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
                  >
                    <Star size={16} />
                    Set Default
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(address.id);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors ml-auto"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AddressForm
          address={editingAddress}
          addresses={addresses}
          addressConfig={addressConfig}
          onSave={() => {
            setShowForm(false);
            setEditingAddress(null);
            loadAddresses();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingAddress(null);
          }}
        />
      )}
    </div>
  );
};

const AddressForm = ({ address, onSave, onCancel, addresses, addressConfig }) => {
  const { user } = useAuth();
  const { errors, validateField, validateAll, getMaxLength, clearError } = useValidation('SavedAddress');
  const [formData, setFormData] = useState({
    fullName: address?.fullName || '',
    email: address?.email || '',
    phone: address?.phone || '',
    address: address?.address || '',
    city: address?.city || '',
    district: address?.district || '',
    state: address?.state || '',
    zipCode: address?.zipCode || '',
    country: address?.country || 'India',
    landmark: address?.landmark || '',
    buildingName: address?.buildingName || '',
    floorUnit: address?.floorUnit || '',
    alternatePhone: address?.alternatePhone || '',
    addressType: address?.addressType || 'Home',
    isDefault: address?.isDefault || false,
  });

  const [selectedStateCode, setSelectedStateCode] = useState('');
  const availableDistricts = selectedStateCode ? getDistrictsByState(selectedStateCode) : [];
  const availableCities = (selectedStateCode && formData.district) 
    ? getCitiesByDistrict(selectedStateCode, formData.district) 
    : [];

  useEffect(() => {
    if (address?.state) {
      const stateObj = indianStates.find(s => s.name === address.state);
      setSelectedStateCode(stateObj ? stateObj.code : '');
    }
  }, [address]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const maxLength = getMaxLength(name);
    
    let truncatedValue = value;
    if (maxLength && value.length > maxLength) {
      truncatedValue = value.substring(0, maxLength);
    }
    
    if ((name === 'phone' || name === 'alternatePhone') && truncatedValue.length > 10) {
      truncatedValue = truncatedValue.substring(0, 10);
    }
    
    if (name === 'state') {
      const stateObj = indianStates.find(s => s.name === truncatedValue);
      setSelectedStateCode(stateObj ? stateObj.code : '');
      setFormData((prev) => ({ ...prev, [name]: truncatedValue, district: '', city: '' }));
    } else if (name === 'district') {
      setFormData((prev) => ({ ...prev, [name]: truncatedValue, city: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: truncatedValue }));
    }
    
    if (errors[name]) validateField(name, truncatedValue);
  };

  const handleBlur = (e) => validateField(e.target.name, e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isValid = validateAll(formData);
    if (!isValid) return;
    
    try {
      const data = {
        ...formData,
        userId: user.id,
      };

      // Check address limits before saving (only for new addresses)
      if (!address?.id) {
        const typeCount = addresses.filter(a => a.addressType === formData.addressType).length;
        if (typeCount >= addressConfig.maxAddressesPerType) {
          alert(`Maximum of ${addressConfig.maxAddressesPerType} addresses allowed for ${formData.addressType} type. Please delete an existing address or choose a different type.`);
          return;
        }
        
        if (addresses.length >= addressConfig.maxTotalAddresses) {
          alert(`Maximum of ${addressConfig.maxTotalAddresses} total addresses allowed. Please delete an existing address.`);
          return;
        }
      }

      if (address?.id) {
        await savedAddressesAPI.update(address.id, data);
      } else {
        await savedAddressesAPI.create(data);
      }
      onSave();
    } catch (err) {
      console.error('Error saving address:', err);
      if (err.response?.data?.error) {
        alert(err.response.data.error);
      } else {
        alert('Failed to save address');
      }
    }
  };

  const inputCls = (field) =>
    `w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200'
    }`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                <MapPin size={20} className="text-white" />
              </div>
              {address?.id ? 'Edit Address' : 'Add New Address'}
            </h3>
            <button
              onClick={onCancel}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Address Type */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-100">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address Type</label>
              <select
                value={formData.addressType}
                onChange={(e) => setFormData({ ...formData, addressType: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="Home">🏠 Home</option>
                <option value="Work">🏢 Work</option>
                <option value="Other">📍 Other</option>
              </select>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-lg">👤</span>
                </div>
                Contact Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputCls('fullName')}
                    placeholder="John Doe"
                    maxLength={getMaxLength('fullName')}
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputCls('email')}
                    placeholder="john@example.com"
                    maxLength={getMaxLength('email')}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onInput={(e) => {
                      if (e.target.value.length > 10) {
                        e.target.value = e.target.value.slice(0, 10);
                      }
                    }}
                    className={inputCls('phone')}
                    placeholder="9876543210"
                    maxLength={10}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                  <MapPin size={18} className="text-white" />
                </div>
                Address Information
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">State *</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputCls('state')}
                    >
                      <option value="">Select State</option>
                      {indianStates.map((state) => (
                        <option key={state.code} value={state.name}>{state.name}</option>
                      ))}
                    </select>
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">District *</label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputCls('district')}
                      disabled={!selectedStateCode}
                    >
                      <option value="">Select District</option>
                      {availableDistricts.map((district) => (
                        <option key={district.name} value={district.name}>{district.name}</option>
                      ))}
                    </select>
                    {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputCls('city')}
                      disabled={!formData.district}
                    >
                      <option value="">Select City</option>
                      {availableCities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP Code *</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputCls('zipCode')}
                      placeholder="400001"
                      maxLength={getMaxLength('zipCode')}
                    />
                    {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Country *</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputCls('country')}
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                  </select>
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputCls('address')}
                    placeholder="123 Main Street"
                    maxLength={getMaxLength('address')}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-white rounded-2xl p-5 border-2 border-gray-200 space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="text-xl mr-2">📍</span>
                Additional Details (Optional)
              </h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Landmark</label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputCls('landmark')}
                  placeholder="Near railway station, temple, etc."
                  maxLength={getMaxLength('landmark')}
                />
                {errors.landmark && <p className="text-red-500 text-xs mt-1">{errors.landmark}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Building Name</label>
                  <input
                    type="text"
                    name="buildingName"
                    value={formData.buildingName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputCls('buildingName')}
                    placeholder="Apartment name, building name"
                    maxLength={getMaxLength('buildingName')}
                  />
                  {errors.buildingName && <p className="text-red-500 text-xs mt-1">{errors.buildingName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Floor/Unit</label>
                  <input
                    type="text"
                    name="floorUnit"
                    value={formData.floorUnit}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputCls('floorUnit')}
                    placeholder="Flat 101, 2nd Floor"
                    maxLength={getMaxLength('floorUnit')}
                  />
                  {errors.floorUnit && <p className="text-red-500 text-xs mt-1">{errors.floorUnit}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alternate Phone</label>
                <input
                  type="tel"
                  name="alternatePhone"
                  value={formData.alternatePhone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onInput={(e) => {
                    if (e.target.value.length > 10) {
                      e.target.value = e.target.value.slice(0, 10);
                    }
                  }}
                  className={inputCls('alternatePhone')}
                  placeholder="9876543210"
                  maxLength={10}
                />
                {errors.alternatePhone && <p className="text-red-500 text-xs mt-1">{errors.alternatePhone}</p>}
              </div>
            </div>

            {/* Set Default */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
              <label className="flex items-center gap-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-6 h-6 text-amber-600 rounded focus:ring-amber-500"
                />
                <div className="flex-1">
                  <span className="font-bold text-gray-800 flex items-center">
                    <span className="text-xl mr-2">⭐</span>
                    Set as default address
                  </span>
                  <p className="text-sm text-gray-600 mt-1">This address will be used as your primary address for orders</p>
                </div>
              </label>
            </div>
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Save Address
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SavedAddresses;
