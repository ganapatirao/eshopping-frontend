import { useState, useEffect } from 'react';
import { X, Plus, Edit, Package, AlertCircle } from 'lucide-react';
import { productAPI } from '../../services/api';

const ProductModal = ({ 
  show, 
  onClose, 
  onSave, 
  editingProduct, 
  productForm, 
  setProductForm, 
  categories,
  subCategories,
  handleImageDrop,
  convertToBase64,
  handleRemoveImage,
  showToast
}) => {
  const [validationRules, setValidationRules] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [rulesLoading, setRulesLoading] = useState(false);

  useEffect(() => {
    if (show) {
      loadValidationRules();
      setValidationErrors({});
      setTouchedFields({});
    }
  }, [show]);

  const loadValidationRules = async () => {
    try {
      setRulesLoading(true);
      const response = await productAPI.getValidationRules();
      if (response.data.success && response.data.rules) {
        setValidationRules(response.data.rules);
      }
    } catch (error) {
    } finally {
      setRulesLoading(false);
    }
  };

  const validateField = (fieldName, value) => {
    if (!validationRules) return '';

    // Handle both camelCase and PascalCase field names
    const pascalFieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    const rules = validationRules[fieldName] || validationRules[pascalFieldName];
    
    if (!rules) return '';

    // Handle backend rule structure (PascalCase with single ErrorMessage)
    const isRequired = rules.Required !== undefined ? rules.Required : rules.required;
    const errorMessage = rules.ErrorMessage || rules.errorMessage;
    
    if (isRequired && (!value || value === '')) {
      return errorMessage || `${fieldName} is required`;
    }

    const minLength = rules.MinLength !== undefined ? rules.MinLength : rules.minLength;
    const maxLength = rules.MaxLength !== undefined ? rules.MaxLength : rules.maxLength;
    
    if (minLength && value && value.length < minLength) {
      return errorMessage || `${fieldName} must be at least ${minLength} characters`;
    }

    if (maxLength && value && value.length > maxLength) {
      return errorMessage || `${fieldName} must not exceed ${maxLength} characters`;
    }

    const pattern = rules.Pattern !== undefined ? rules.Pattern : rules.pattern;
    if (pattern && value && !new RegExp(pattern).test(value)) {
      return errorMessage || `${fieldName} format is invalid`;
    }

    const minValue = rules.MinValue !== undefined ? rules.MinValue : rules.minValue;
    if (minValue && value && parseFloat(value) < minValue) {
      return errorMessage || `${fieldName} must be at least ${minValue}`;
    }

    const maxValue = rules.MaxValue !== undefined ? rules.MaxValue : rules.maxValue;
    if (maxValue && value && parseFloat(value) > maxValue) {
      return errorMessage || `${fieldName} must not exceed ${maxValue}`;
    }

    return '';
  };

  const handleFieldBlur = (fieldName, value) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    const error = validateField(fieldName, value);
    setValidationErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleFieldMouseOut = (fieldName, value) => {
    if (touchedFields[fieldName]) {
      const error = validateField(fieldName, value);
      setValidationErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  };

  const handleFieldChange = (fieldName, value) => {
    setProductForm({ ...productForm, [fieldName]: value });
    if (touchedFields[fieldName]) {
      const error = validateField(fieldName, value);
      setValidationErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate all fields based on server rules
    if (validationRules) {
      Object.keys(validationRules).forEach(fieldName => {
        const value = productForm[fieldName];
        const error = validateField(fieldName, value);
        if (error) errors[fieldName] = error;
      });
    }
    
    setValidationErrors(errors);
    setTouchedFields(validationRules ? Object.keys(validationRules).reduce((acc, field) => ({ ...acc, [field]: true }), {}) : {});
    
    // Show toast with validation errors if any
    if (Object.keys(errors).length > 0 && showToast) {
      const errorMessages = Object.values(errors).join(', ');
      showToast(`Validation errors: ${errorMessages}`, 'error');
    }
    
    return Object.keys(errors).length === 0;
  };

  const handleSaveClick = () => {
    if (validateForm()) {
      onSave();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 mx-2 sm:mx-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-3 sm:p-4 md:p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <Package size={20} sm:size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {editingProduct ? 'Edit Product' : 'Add Product'}
                </h3>
                <p className="text-purple-100 text-xs sm:text-sm">
                  {editingProduct ? 'Update product details' : 'Create a new product'}
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
          {/* Product Name & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                Product Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  onBlur={() => handleFieldBlur('name', productForm.name)}
                  onMouseOut={() => handleFieldMouseOut('name', productForm.name)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 pl-4 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    validationErrors.name && touchedFields.name
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                  placeholder="Product name"
                />
                {validationErrors.name && touchedFields.name && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AlertCircle size={16} className="text-red-500" />
                  </div>
                )}
              </div>
              {validationErrors.name && touchedFields.name && (
                <div className="flex items-center gap-2 mt-1.5 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                  <span className="text-xs text-red-700 font-medium">{validationErrors.name}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={productForm.categoryId}
                  onChange={(e) => handleFieldChange('categoryId', e.target.value)}
                  onBlur={() => handleFieldBlur('categoryId', productForm.categoryId)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 pl-12 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all appearance-none bg-white ${
                    validationErrors.categoryId && touchedFields.categoryId
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.displayName || category.name}
                    </option>
                  ))}
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▼</span>
                {validationErrors.categoryId && touchedFields.categoryId && (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2">
                    <AlertCircle size={16} className="text-red-500" />
                  </div>
                )}
              </div>
              {validationErrors.categoryId && touchedFields.categoryId && (
                <div className="flex items-center gap-2 mt-1.5 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                  <span className="text-xs text-red-700 font-medium">{validationErrors.categoryId}</span>
                </div>
              )}
            </div>
          </div>

          {/* SubCategory & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                SubCategory <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={productForm.subCategoryId}
                  onChange={(e) => handleFieldChange('subCategoryId', e.target.value)}
                  onBlur={() => handleFieldBlur('subCategoryId', productForm.subCategoryId)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 pl-12 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all appearance-none bg-white ${
                    validationErrors.subCategoryId && touchedFields.subCategoryId
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                >
                  <option value="">Select a subcategory</option>
                  {subCategories
                    .filter(sc => !productForm.categoryId || sc.categoryId === productForm.categoryId)
                    .map((subCategory) => (
                      <option key={subCategory.id} value={subCategory.id}>
                        {subCategory.displayName || subCategory.name}
                      </option>
                    ))}
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▼</span>
                {validationErrors.subCategoryId && touchedFields.subCategoryId && (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2">
                    <AlertCircle size={16} className="text-red-500" />
                  </div>
                )}
              </div>
              {validationErrors.subCategoryId && touchedFields.subCategoryId && (
                <div className="flex items-center gap-2 mt-1.5 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                  <span className="text-xs text-red-700 font-medium">{validationErrors.subCategoryId}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                Stock <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => handleFieldChange('stock', e.target.value)}
                  onBlur={() => handleFieldBlur('stock', productForm.stock)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 pl-4 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    validationErrors.stock && touchedFields.stock
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                  placeholder="0"
                />
                {validationErrors.stock && touchedFields.stock && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AlertCircle size={16} className="text-red-500" />
                  </div>
                )}
              </div>
              {validationErrors.stock && touchedFields.stock && (
                <div className="flex items-center gap-2 mt-1.5 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                  <span className="text-xs text-red-700 font-medium">{validationErrors.stock}</span>
                </div>
              )}
            </div>
          </div>

          {/* Price & Original Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={productForm.price}
                  onChange={(e) => handleFieldChange('price', e.target.value)}
                  onBlur={() => handleFieldBlur('price', productForm.price)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 pl-4 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    validationErrors.price && touchedFields.price
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                  placeholder="0"
                />
                {validationErrors.price && touchedFields.price && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AlertCircle size={16} className="text-red-500" />
                  </div>
                )}
              </div>
              {validationErrors.price && touchedFields.price && (
                <div className="flex items-center gap-2 mt-1.5 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                  <span className="text-xs text-red-700 font-medium">{validationErrors.price}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                Original Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={productForm.originalPrice}
                  onChange={(e) => handleFieldChange('originalPrice', e.target.value)}
                  onBlur={() => handleFieldBlur('originalPrice', productForm.originalPrice)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 pl-4 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    validationErrors.originalPrice && touchedFields.originalPrice
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                  placeholder="0"
                />
                {validationErrors.originalPrice && touchedFields.originalPrice && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AlertCircle size={16} className="text-red-500" />
                  </div>
                )}
              </div>
              {validationErrors.originalPrice && touchedFields.originalPrice && (
                <div className="flex items-center gap-2 mt-1.5 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                  <span className="text-xs text-red-700 font-medium">{validationErrors.originalPrice}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={productForm.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              onBlur={() => handleFieldBlur('description', productForm.description)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all resize-none ${
                validationErrors.description && touchedFields.description
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'
              }`}
              rows={4}
              placeholder="Product description"
            />
            {validationErrors.description && touchedFields.description && (
              <div className="flex items-center gap-2 mt-1.5 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                <span className="text-xs text-red-700 font-medium">{validationErrors.description}</span>
              </div>
            )}
          </div>

          {/* Image Upload Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
              Product Images
            </label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 transition-colors cursor-pointer relative"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleImageDrop(e, 'product')}
            >
              <div>
                <span className="text-4xl mb-2 block">📷</span>
                <p className="text-gray-600 mb-2">Drag & drop images here</p>
                <p className="text-gray-400 text-sm">or click to select files</p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  for (const file of e.target.files) {
                    convertToBase64(file, 'product');
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            {productForm.imageBase64.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                {productForm.imageBase64.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img}
                      alt={`Product preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => handleRemoveImage(e, 'product', index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Toggle Switches */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 pt-2">
            <label className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl cursor-pointer hover:from-green-100 hover:to-emerald-100 transition-all border-2 border-transparent hover:border-green-300">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={productForm.isActive}
                  onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-500"></div>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-700">Active</span>
                <p className="text-xs text-gray-500">Visible to users</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl cursor-pointer hover:from-purple-100 hover:to-pink-100 transition-all border-2 border-transparent hover:border-purple-300">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={productForm.isFeatured}
                  onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-500"></div>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-700">Featured</span>
                <p className="text-xs text-gray-500">Show on homepage</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl cursor-pointer hover:from-orange-100 hover:to-amber-100 transition-all border-2 border-transparent hover:border-orange-300">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={productForm.isTrending}
                  onChange={(e) => setProductForm({ ...productForm, isTrending: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-amber-500"></div>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-700">Trending</span>
                <p className="text-xs text-gray-500">Popular items</p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
          >
            <X size={18} />
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {editingProduct ? <Edit size={18} /> : <Plus size={18} />}
            {editingProduct ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
