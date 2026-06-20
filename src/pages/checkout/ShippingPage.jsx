import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, MapPin, ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { useValidation } from '../../hooks/useValidation';
import { indianStates, getDistrictsByState, getCitiesByDistrict } from '../../data/indianLocations';
import { savedAddressesAPI, addressConfigurationAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/format';

const ShippingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subtotal, shipping, tax, total } = useCart();
  const { errors, validateField, validateAll, getMaxLength } = useValidation('Shipping');
  const [saveAddress, setSaveAddress] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [addressType, setAddressType] = useState('Home');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState(null);
  const [addressConfig, setAddressConfig] = useState({ maxAddressesPerType: 3, maxTotalAddresses: 10 });
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    state: '',
    zipCode: '',
    country: 'India',
    landmark: '',
    buildingName: '',
    floorUnit: '',
    alternatePhone: '',
  });

  const [selectedStateCode, setSelectedStateCode] = useState('');
  const availableDistricts = selectedStateCode ? getDistrictsByState(selectedStateCode) : [];
  const availableCities = (selectedStateCode && formData.district) 
    ? getCitiesByDistrict(selectedStateCode, formData.district) 
    : [];

  useEffect(() => {
    if (user) {
      loadSavedAddresses();
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

  const loadSavedAddresses = async () => {
    try {
      const res = await savedAddressesAPI.getByUserId(user.id);
      setSavedAddresses(res.data);
      console.log('ShippingPage - Loaded saved addresses:', res.data);
      
      // Auto-populate default address if exists and form is empty
      try {
        const defaultRes = await savedAddressesAPI.getDefault(user.id);
        if (defaultRes.data && !formData.fullName) {
          handleSelectSavedAddress(defaultRes.data);
          console.log('ShippingPage - Auto-populated default address:', defaultRes.data);
        }
      } catch (err) {
        // If no default address API response, fallback to finding from list
        const defaultAddress = res.data.find(addr => addr.isDefault);
        if (defaultAddress && !formData.fullName) {
          handleSelectSavedAddress(defaultAddress);
          console.log('ShippingPage - Auto-populated default address from list:', defaultAddress);
        }
      }
    } catch (err) {
      console.error('ShippingPage - Error loading saved addresses:', err);
      setSavedAddresses([]);
    }
  };

  const handleSelectSavedAddress = (address) => {
    setFormData({
      ...formData,
      fullName: address.fullName,
      email: address.email || '',
      phone: address.phone,
      address: address.address,
      city: address.city,
      district: address.district,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      landmark: address.landmark || '',
      buildingName: address.buildingName || '',
      floorUnit: address.floorUnit || '',
      alternatePhone: address.alternatePhone || '',
    });
    const stateObj = indianStates.find(s => s.name === address.state);
    setSelectedStateCode(stateObj ? stateObj.code : '');
    setSelectedSavedAddressId(address.id);
    setShowSavedAddresses(false);
  };

  const handleSetDefault = async (addressId) => {
    try {
      await savedAddressesAPI.setDefault(addressId);
      // Reload saved addresses to reflect the change
      await loadSavedAddresses();
      console.log('ShippingPage - Set default address:', addressId);
    } catch (err) {
      console.error('ShippingPage - Error setting default address:', err);
      alert('Failed to set default address');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const maxLength = getMaxLength(name);
    
    // Reset selected saved address ID when user manually changes form
    if (selectedSavedAddressId) {
      setSelectedSavedAddressId(null);
    }
    
    // Enforce maxLength with fallback for phone fields
    let truncatedValue = value;
    if (maxLength && value.length > maxLength) {
      truncatedValue = value.substring(0, maxLength);
    }
    
    // Hardcoded fallback for phone fields if maxLength not set
    if ((name === 'phone' || name === 'billingPhone') && truncatedValue.length > 10) {
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

  const inputCls = (field) =>
    `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll(formData)) return;
    
    // Save address if checkbox is checked
    if (saveAddress && user) {
      try {
        // Check address limits before saving (only for new addresses)
        if (!selectedSavedAddressId) {
          const typeCount = savedAddresses.filter(a => a.addressType === addressType).length;
          if (typeCount >= addressConfig.maxAddressesPerType) {
            alert(`Maximum of ${addressConfig.maxAddressesPerType} addresses allowed for ${addressType} type. Please delete an existing address or choose a different type.`);
            return;
          }
          
          if (savedAddresses.length >= addressConfig.maxTotalAddresses) {
            alert(`Maximum of ${addressConfig.maxTotalAddresses} total addresses allowed. Please delete an existing address.`);
            return;
          }
        }
        
        const addressData = {
          userId: user.id,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          district: formData.district,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          landmark: formData.landmark,
          buildingName: formData.buildingName,
          floorUnit: formData.floorUnit,
          alternatePhone: formData.alternatePhone,
          addressType: addressType,
          isDefault: saveAsDefault || savedAddresses.length === 0,
        };
        
        let res;
        if (selectedSavedAddressId) {
          // Update existing address
          res = await savedAddressesAPI.update(selectedSavedAddressId, addressData);
          alert('Address updated successfully!');
        } else {
          // Create new address
          res = await savedAddressesAPI.create(addressData);
          alert('Address saved successfully!');
        }
        
        await loadSavedAddresses();
        setSelectedSavedAddressId(res.data.id);
      } catch (err) {
        console.error('Error saving address:', err);
        if (err.response?.data?.error) {
          alert(err.response.data.error);
        } else {
          alert('Failed to save address. Please try again.');
        }
        return; // Don't proceed if saving fails
      }
    }
    
    localStorage.setItem('shippingInfo', JSON.stringify(formData));
    navigate('/checkout/billing');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-sm sm:text-lg shadow-md">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm sm:text-base">Shipping</p>
                    <p className="text-xs sm:text-sm text-gray-500">Step 2 of 5</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">40% Complete</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 sm:h-3 rounded-full transition-all duration-500" style={{ width: '40%' }}></div>
              </div>
              <div className="flex justify-between mt-3 text-xs sm:text-sm">
                <span className="text-blue-600 font-medium">Cart ✓</span>
                <span className="text-blue-600 font-medium">Shipping</span>
                <span className="text-gray-400">Billing</span>
                <span className="text-gray-400">Payment</span>
                <span className="text-gray-400">Confirmation</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Truck className="mr-3" />
              Shipping Information
            </h1>

            {/* Saved Addresses Section */}
            <div className="mb-6">
              {user && savedAddresses.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowSavedAddresses(!showSavedAddresses)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-3"
                  >
                    <Star size={18} fill={showSavedAddresses ? "currentColor" : "none"} />
                    {showSavedAddresses ? 'Hide' : 'Show'} Saved Addresses ({savedAddresses.length})
                  </button>
                  {showSavedAddresses && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`p-5 border-2 rounded-2xl cursor-pointer transition-all shadow-md hover:shadow-lg ${
                            addr.isDefault 
                              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50' 
                              : 'border-gray-200 hover:border-blue-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-gray-800 text-lg">{addr.fullName}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{addr.address}</p>
                          <p className="text-sm text-gray-600">{addr.city}, {addr.district}, {addr.state} - {addr.zipCode}</p>
                          {addr.landmark && (
                            <p className="text-sm text-gray-500 mt-2 flex items-center">
                              <span className="mr-1">📍</span> {addr.landmark}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetDefault(addr.id);
                              }}
                              className={`flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-xl transition-colors ${
                                addr.isDefault
                                  ? 'text-green-600 bg-green-50 hover:bg-green-100'
                                  : 'text-purple-600 bg-purple-50 hover:bg-purple-100'
                              }`}
                            >
                              <Star size={16} fill={addr.isDefault ? "currentColor" : "none"} />
                              {addr.isDefault ? 'Default Address' : 'Set as Default'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {user && savedAddresses.length === 0 && (
                <div className="text-sm text-gray-600 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-2xl border border-blue-100 mb-6">
                  <p className="font-bold text-blue-800 text-lg mb-1">No saved addresses yet</p>
                  <p className="text-blue-700">Fill out the form below and check "Save this address" to create your first saved address for faster checkout next time.</p>
                </div>
              )}
              {!user && (
                <div className="text-sm text-gray-600 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-100 mb-6">
                  <p className="font-bold text-amber-800 text-lg mb-1">Log in to save addresses</p>
                  <p className="text-amber-700">Sign in to access your saved addresses for faster checkout.</p>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-8">
              {/* Contact Information */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-6 shadow-lg border border-blue-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                    <span className="text-white text-lg">👤</span>
                  </div>
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

              {/* Divider */}
              <div className="flex items-center justify-center my-6">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-full"></div>
              </div>

              {/* Shipping Address */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-6 shadow-lg border border-green-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mr-3">
                    <MapPin size={20} className="text-white" />
                  </div>
                  Shipping Address
                </h2>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

                  {/* Additional Address Details */}
                  <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <span className="text-xl mr-2">📍</span>
                      Additional Details (Optional)
                    </h3>
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
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center justify-center my-6">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-full"></div>
              </div>

              {/* Save Address Option */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-6 shadow-lg border border-amber-100">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    id="saveAddress"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="w-6 h-6 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="saveAddress" className="font-bold text-gray-800 cursor-pointer flex items-center">
                      <span className="text-xl mr-2">💾</span>
                      Save this address for future orders
                    </label>
                    {saveAddress && (
                      <div className="mt-3 space-y-3">
                        <select
                          value={addressType}
                          onChange={(e) => setAddressType(e.target.value)}
                          className="px-4 py-2 border-2 border-amber-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 bg-white"
                        >
                          <option value="Home">🏠 Home</option>
                          <option value="Work">🏢 Work</option>
                          <option value="Other">📍 Other</option>
                        </select>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={saveAsDefault}
                            onChange={(e) => setSaveAsDefault(e.target.checked)}
                            className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                          />
                          <span className="text-sm font-medium text-gray-700 flex items-center">
                            <Star size={16} className="mr-2 text-amber-500" />
                            Set as default address
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Link
                  to="/cart"
                  className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="mr-2" size={20} />
                  Back to Cart
                </Link>
                <button
                  type="submit"
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue to Payment
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

export default ShippingPage;
