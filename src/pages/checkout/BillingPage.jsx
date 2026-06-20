import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, ArrowRight, Star, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { savedAddressesAPI, addressConfigurationAPI } from '../../services/api';
import { useValidation } from '../../hooks/useValidation';
import { indianStates, getDistrictsByState, getCitiesByDistrict } from '../../data/indianLocations';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/format';

const BillingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subtotal, shipping, tax, total } = useCart();
  const { errors, validateField, validateAll, getMaxLength, clearError } = useValidation('BillingAddress');
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [saveBillingAddress, setSaveBillingAddress] = useState(false);
  const [saveBillingAsDefault, setSaveBillingAsDefault] = useState(false);
  const [billingAddressType, setBillingAddressType] = useState('Home');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState(null);
  const [addressConfig, setAddressConfig] = useState({ maxAddressesPerType: 3, maxTotalAddresses: 10 });

  const [formData, setFormData] = useState({
    billingFullName: '',
    billingPhone: '',
    billingAddress: '',
    billingCity: '',
    billingDistrict: '',
    billingState: '',
    billingZipCode: '',
    billingCountry: 'India',
    billingLandmark: '',
    billingBuildingName: '',
    billingFloorUnit: '',
    billingAlternatePhone: '',
  });

  const [selectedBillingStateCode, setSelectedBillingStateCode] = useState('');
  const availableBillingDistricts = selectedBillingStateCode ? getDistrictsByState(selectedBillingStateCode) : [];
  const availableBillingCities = (selectedBillingStateCode && formData.billingDistrict) 
    ? getCitiesByDistrict(selectedBillingStateCode, formData.billingDistrict) 
    : [];

  useEffect(() => {
    try {
      const shipping = JSON.parse(localStorage.getItem('shippingInfo') || 'null');
      setShippingAddress(shipping);
      if (shipping) {
        setFormData((prev) => ({
          ...prev,
          billingFullName: shipping.fullName,
          billingPhone: shipping.phone,
          billingAddress: shipping.address,
          billingCity: shipping.city,
          billingDistrict: shipping.district,
          billingState: shipping.state,
          billingZipCode: shipping.zipCode,
          billingCountry: shipping.country,
        }));
        const stateObj = indianStates.find(s => s.name === shipping.state);
        setSelectedBillingStateCode(stateObj ? stateObj.code : '');
      }
    } catch {
      setShippingAddress(null);
    }
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
      console.log('BillingPage - Loaded saved addresses:', res.data);
      
      // Auto-populate default address if exists and form is empty
      try {
        const defaultRes = await savedAddressesAPI.getDefault(user.id);
        if (defaultRes.data && !formData.billingFullName && !sameAsShipping) {
          handleSelectSavedAddress(defaultRes.data);
          console.log('BillingPage - Auto-populated default address:', defaultRes.data);
        }
      } catch (err) {
        // If no default address API response, fallback to finding from list
        const defaultAddress = res.data.find(addr => addr.isDefault);
        if (defaultAddress && !formData.billingFullName && !sameAsShipping) {
          handleSelectSavedAddress(defaultAddress);
          console.log('BillingPage - Auto-populated default address from list:', defaultAddress);
        }
      }
    } catch (err) {
      console.error('BillingPage - Error loading saved addresses:', err);
      setSavedAddresses([]);
    }
  };

  const handleSelectSavedAddress = (address) => {
    const newFormData = {
      ...formData,
      billingFullName: address.fullName,
      billingPhone: address.phone,
      billingAddress: address.address,
      billingCity: address.city,
      billingDistrict: address.district,
      billingState: address.state,
      billingZipCode: address.zipCode,
      billingCountry: address.country,
      billingLandmark: address.landmark || '',
      billingBuildingName: address.buildingName || '',
      billingFloorUnit: address.floorUnit || '',
      billingAlternatePhone: address.alternatePhone || '',
    };
    setFormData(newFormData);
    const stateObj = indianStates.find(s => s.name === address.state);
    setSelectedBillingStateCode(stateObj ? stateObj.code : '');
    setSelectedSavedAddressId(address.id);
    setSameAsShipping(false);
    setShowSavedAddresses(false);
    
    // Clear any existing validation errors
    Object.keys(newFormData).forEach(field => {
      if (errors[field]) {
        validateField(field, newFormData[field]);
      }
    });
  };

  const handleSetDefault = async (addressId) => {
    try {
      await savedAddressesAPI.setDefault(addressId);
      // Reload saved addresses to reflect the change
      await loadSavedAddresses();
      console.log('BillingPage - Set default address:', addressId);
    } catch (err) {
      console.error('BillingPage - Error setting default address:', err);
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
    
    if (name === 'billingState') {
      const stateObj = indianStates.find(s => s.name === truncatedValue);
      setSelectedBillingStateCode(stateObj ? stateObj.code : '');
      setFormData((prev) => ({ ...prev, [name]: truncatedValue, billingDistrict: '', billingCity: '' }));
    } else if (name === 'billingDistrict') {
      setFormData((prev) => ({ ...prev, [name]: truncatedValue, billingCity: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: truncatedValue }));
    }
    
    if (errors[name]) validateField(name, truncatedValue);
  };

  const handleSameAsShippingChange = (e) => {
    const checked = e.target.checked;
    setSameAsShipping(checked);
    if (checked && shippingAddress) {
      setFormData((prev) => ({
        ...prev,
        billingFullName: shippingAddress.fullName,
        billingPhone: shippingAddress.phone,
        billingAddress: shippingAddress.address,
        billingCity: shippingAddress.city,
        billingDistrict: shippingAddress.district,
        billingState: shippingAddress.state,
        billingZipCode: shippingAddress.zipCode,
        billingCountry: shippingAddress.country,
      }));
      const stateObj = indianStates.find(s => s.name === shippingAddress.state);
      setSelectedBillingStateCode(stateObj ? stateObj.code : '');
    } else if (!checked) {
      // Clear billing form data and state when unchecking
      setFormData((prev) => ({
        ...prev,
        billingFullName: '',
        billingPhone: '',
        billingAddress: '',
        billingCity: '',
        billingDistrict: '',
        billingState: '',
        billingZipCode: '',
        billingCountry: 'India',
        billingLandmark: '',
        billingBuildingName: '',
        billingFloorUnit: '',
        billingAlternatePhone: '',
      }));
      setSelectedBillingStateCode('');
      // Clear all billing validation errors without triggering validation
      // This prevents showing errors for empty required fields when form is cleared
      Object.keys(errors).forEach(field => {
        if (field.startsWith('billing')) {
          clearError(field);
        }
      });
    }
  };

  const handleBlur = (e) => {
    validateField(e.target.name, e.target.value);
  };

  const inputCls = (field) =>
    `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate billing address if not same as shipping
    if (!sameAsShipping) {
      const billingFields = {
        billingFullName: formData.billingFullName,
        billingPhone: formData.billingPhone,
        billingAddress: formData.billingAddress,
        billingCity: formData.billingCity,
        billingDistrict: formData.billingDistrict,
        billingState: formData.billingState,
        billingZipCode: formData.billingZipCode,
        billingCountry: formData.billingCountry,
        billingLandmark: formData.billingLandmark,
        billingBuildingName: formData.billingBuildingName,
        billingFloorUnit: formData.billingFloorUnit,
        billingAlternatePhone: formData.billingAlternatePhone,
      };
      const isValid = validateAll(billingFields);
      if (!isValid) {
        return;
      }
      
      // Save billing address if checkbox is checked
      if (saveBillingAddress && user) {
        try {
          // Check address limits before saving (only for new addresses)
          if (!selectedSavedAddressId) {
            const typeCount = savedAddresses.filter(a => a.addressType === billingAddressType).length;
            if (typeCount >= addressConfig.maxAddressesPerType) {
              alert(`Maximum of ${addressConfig.maxAddressesPerType} addresses allowed for ${billingAddressType} type. Please delete an existing address or choose a different type.`);
              return;
            }
            
            if (savedAddresses.length >= addressConfig.maxTotalAddresses) {
              alert(`Maximum of ${addressConfig.maxTotalAddresses} total addresses allowed. Please delete an existing address.`);
              return;
            }
          }
          
          const addressData = {
            userId: user.id,
            fullName: formData.billingFullName,
            phone: formData.billingPhone,
            address: formData.billingAddress,
            city: formData.billingCity,
            district: formData.billingDistrict,
            state: formData.billingState,
            zipCode: formData.billingZipCode,
            country: formData.billingCountry,
            landmark: formData.billingLandmark,
            buildingName: formData.billingBuildingName,
            floorUnit: formData.billingFloorUnit,
            alternatePhone: formData.billingAlternatePhone,
            addressType: billingAddressType,
            isDefault: saveBillingAsDefault || savedAddresses.length === 0,
          };
          
          let res;
          if (selectedSavedAddressId) {
            // Update existing address
            res = await savedAddressesAPI.update(selectedSavedAddressId, addressData);
            alert('Billing address updated successfully!');
          } else {
            // Create new address
            res = await savedAddressesAPI.create(addressData);
            alert('Billing address saved successfully!');
          }
          
          await loadSavedAddresses();
          setSelectedSavedAddressId(res.data.id);
        } catch (err) {
          console.error('Error saving billing address:', err);
          if (err.response?.data?.error) {
            alert(err.response.data.error);
          } else {
            alert('Failed to save billing address. Please try again.');
          }
          return; // Don't proceed if saving fails
        }
      }
    }
    
    // Save billing info to localStorage
    localStorage.setItem('billingInfo', JSON.stringify({
      sameAsShipping,
      billingAddress: sameAsShipping ? shippingAddress : {
        fullName: formData.billingFullName,
        phone: formData.billingPhone,
        address: formData.billingAddress,
        city: formData.billingCity,
        district: formData.billingDistrict,
        state: formData.billingState,
        zipCode: formData.billingZipCode,
        country: formData.billingCountry,
        landmark: formData.billingLandmark,
        buildingName: formData.billingBuildingName,
        floorUnit: formData.billingFloorUnit,
        alternatePhone: formData.billingAlternatePhone,
      },
    }));
    
    navigate('/checkout/payment');
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
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold text-sm sm:text-lg shadow-md">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm sm:text-base">Billing</p>
                    <p className="text-xs sm:text-sm text-gray-500">Step 3 of 5</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">60% Complete</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 sm:h-3 rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
              </div>
              <div className="flex justify-between mt-3 text-xs sm:text-sm">
                <span className="text-purple-600 font-medium">Cart ✓</span>
                <span className="text-purple-600 font-medium">Shipping ✓</span>
                <span className="text-purple-600 font-medium">Billing</span>
                <span className="text-gray-400">Payment</span>
                <span className="text-gray-400">Confirmation</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <MapPin className="mr-3" />
              Billing Information
            </h1>

            <form onSubmit={handleSubmit} noValidate className="space-y-8">
              {/* Same as Shipping Checkbox */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-6 shadow-lg border border-purple-100">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    id="sameAsShipping"
                    checked={sameAsShipping}
                    onChange={handleSameAsShippingChange}
                    className="w-6 h-6 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="sameAsShipping" className="font-bold text-gray-800 flex items-center cursor-pointer">
                    <Check className="mr-2 text-purple-600" size={20} />
                    Billing address same as shipping address
                  </label>
                </div>
              </div>

              {/* Saved Addresses for Billing */}
              {!sameAsShipping && (
                <div>
                  {user && savedAddresses.length > 0 && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowSavedAddresses(!showSavedAddresses)}
                        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-bold mb-4 text-lg"
                      >
                        <Star size={20} fill={showSavedAddresses ? "currentColor" : "none"} />
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
                                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50' 
                                  : 'border-gray-200 hover:border-purple-300 bg-white'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-bold text-gray-800 text-lg">{addr.fullName}</span>
                                {addr.isDefault && (
                                  <span className="text-xs text-purple-600 font-bold flex items-center gap-1 bg-purple-100 px-2 py-1 rounded-full">
                                    <Star size={12} fill="currentColor" /> Default
                                  </span>
                                )}
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
                                      ? 'text-gray-500 bg-gray-100 cursor-not-allowed'
                                      : 'text-purple-600 bg-purple-50 hover:bg-purple-100'
                                  }`}
                                  disabled={addr.isDefault}
                                >
                                  <Star size={16} />
                                  {addr.isDefault ? 'Default' : 'Set Default'}
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
                      <p className="text-blue-700">Fill out the form below and check "Save this billing address" to create your first saved address.</p>
                    </div>
                  )}
                  {!user && (
                    <div className="text-sm text-gray-600 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-100 mb-6">
                      <p className="font-bold text-amber-800 text-lg mb-1">Log in to save addresses</p>
                      <p className="text-amber-700">Sign in to access your saved addresses for faster checkout.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Divider */}
              <div className="flex items-center justify-center my-6">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-full"></div>
              </div>

              {/* Billing Address Form */}
              {!sameAsShipping && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-6 shadow-lg border border-purple-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mr-3">
                      <MapPin size={20} className="text-white" />
                    </div>
                    Billing Address
                  </h3>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                        <input
                          type="text"
                          name="billingFullName"
                          value={formData.billingFullName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={inputCls('billingFullName')}
                          placeholder="John Doe"
                          maxLength={getMaxLength('billingFullName')}
                        />
                        {errors.billingFullName && <p className="text-red-500 text-xs mt-1">{errors.billingFullName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                        <input
                          type="tel"
                          name="billingPhone"
                          value={formData.billingPhone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          onInput={(e) => {
                            if (e.target.value.length > 10) {
                              e.target.value = e.target.value.slice(0, 10);
                            }
                          }}
                          className={inputCls('billingPhone')}
                          placeholder="9876543210"
                          maxLength={10}
                        />
                        {errors.billingPhone && <p className="text-red-500 text-xs mt-1">{errors.billingPhone}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">State *</label>
                        <select
                          name="billingState"
                          value={formData.billingState}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={inputCls('billingState')}
                        >
                          <option value="">Select State</option>
                          {indianStates.map((state) => (
                            <option key={state.code} value={state.name}>{state.name}</option>
                          ))}
                        </select>
                        {errors.billingState && <p className="text-red-500 text-xs mt-1">{errors.billingState}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">District *</label>
                        <select
                          name="billingDistrict"
                          value={formData.billingDistrict}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={inputCls('billingDistrict')}
                          disabled={!selectedBillingStateCode}
                        >
                          <option value="">Select District</option>
                          {availableBillingDistricts.map((district) => (
                            <option key={district.name} value={district.name}>{district.name}</option>
                          ))}
                        </select>
                        {errors.billingDistrict && <p className="text-red-500 text-xs mt-1">{errors.billingDistrict}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                        <select
                          name="billingCity"
                          value={formData.billingCity}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={inputCls('billingCity')}
                          disabled={!formData.billingDistrict}
                        >
                          <option value="">Select City</option>
                          {availableBillingCities.map((city) => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                        {errors.billingCity && <p className="text-red-500 text-xs mt-1">{errors.billingCity}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP Code *</label>
                        <input
                          type="text"
                          name="billingZipCode"
                          value={formData.billingZipCode}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={inputCls('billingZipCode')}
                          placeholder="400001"
                          maxLength={getMaxLength('billingZipCode')}
                        />
                        {errors.billingZipCode && <p className="text-red-500 text-xs mt-1">{errors.billingZipCode}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Country *</label>
                      <select
                        name="billingCountry"
                        value={formData.billingCountry}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={inputCls('billingCountry')}
                      >
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                      </select>
                      {errors.billingCountry && <p className="text-red-500 text-xs mt-1">{errors.billingCountry}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
                      <input
                        type="text"
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={inputCls('billingAddress')}
                        placeholder="123 Main Street"
                        maxLength={getMaxLength('billingAddress')}
                      />
                      {errors.billingAddress && <p className="text-red-500 text-xs mt-1">{errors.billingAddress}</p>}
                    </div>

                    {/* Additional Billing Address Details */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <span className="text-xl mr-2">📍</span>
                        Additional Details (Optional)
                      </h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Landmark</label>
                        <input
                          type="text"
                          name="billingLandmark"
                          value={formData.billingLandmark}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={inputCls('billingLandmark')}
                          placeholder="Near railway station, temple, etc."
                          maxLength={getMaxLength('billingLandmark')}
                        />
                        {errors.billingLandmark && <p className="text-red-500 text-xs mt-1">{errors.billingLandmark}</p>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Building Name</label>
                          <input
                            type="text"
                            name="billingBuildingName"
                            value={formData.billingBuildingName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={inputCls('billingBuildingName')}
                            placeholder="Apartment name, building name"
                            maxLength={getMaxLength('billingBuildingName')}
                          />
                          {errors.billingBuildingName && <p className="text-red-500 text-xs mt-1">{errors.billingBuildingName}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Floor/Unit</label>
                          <input
                            type="text"
                            name="billingFloorUnit"
                            value={formData.billingFloorUnit}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={inputCls('billingFloorUnit')}
                            placeholder="Flat 101, 2nd Floor"
                            maxLength={getMaxLength('billingFloorUnit')}
                          />
                          {errors.billingFloorUnit && <p className="text-red-500 text-xs mt-1">{errors.billingFloorUnit}</p>}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Alternate Phone</label>
                        <input
                          type="tel"
                          name="billingAlternatePhone"
                          value={formData.billingAlternatePhone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          onInput={(e) => {
                            if (e.target.value.length > 10) {
                              e.target.value = e.target.value.slice(0, 10);
                            }
                          }}
                          className={inputCls('billingAlternatePhone')}
                          placeholder="9876543210"
                          maxLength={10}
                        />
                        {errors.billingAlternatePhone && <p className="text-red-500 text-xs mt-1">{errors.billingAlternatePhone}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="flex items-center justify-center my-6">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-full"></div>
              </div>

              {/* Save Billing Address Option */}
              {!sameAsShipping && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-6 shadow-lg border border-amber-100">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      id="saveBillingAddress"
                      checked={saveBillingAddress}
                      onChange={(e) => setSaveBillingAddress(e.target.checked)}
                      className="w-6 h-6 text-amber-600 rounded focus:ring-amber-500"
                    />
                    <div className="flex-1">
                      <label htmlFor="saveBillingAddress" className="font-bold text-gray-800 cursor-pointer flex items-center">
                        <span className="text-xl mr-2">💾</span>
                        Save this billing address for future orders
                      </label>
                      {saveBillingAddress && (
                        <div className="mt-3 space-y-3">
                          <select
                            value={billingAddressType}
                            onChange={(e) => setBillingAddressType(e.target.value)}
                            className="px-4 py-2 border-2 border-amber-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 bg-white"
                          >
                            <option value="Home">🏠 Home</option>
                            <option value="Work">🏢 Work</option>
                            <option value="Other">📍 Other</option>
                          </select>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={saveBillingAsDefault}
                              onChange={(e) => setSaveBillingAsDefault(e.target.checked)}
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
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Link
                  to="/checkout/shipping"
                  className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="mr-2" size={20} />
                  Back to Shipping
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

export default BillingPage;
