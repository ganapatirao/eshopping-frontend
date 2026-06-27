import { Plus, Edit, Trash2, Search, Filter, Grid3X3, List, Package } from 'lucide-react';

const ProductsSection = ({ 
  products, 
  productFilter, 
  setProductFilter, 
  handleOpenProductModal, 
  handleDeleteProduct, 
  categories 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-xl shadow-lg">
            <Package size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Products Management</h2>
            <p className="text-gray-500 text-sm">Manage your product inventory</p>
          </div>
        </div>
        <button 
          onClick={() => handleOpenProductModal()}
          className="w-full lg:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6 border border-purple-100">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={productFilter.search}
              onChange={(e) => setProductFilter({ ...productFilter, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>
          <select 
            value={productFilter.category}
            onChange={(e) => setProductFilter({ ...productFilter, category: e.target.value })}
            className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all bg-white"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.displayName || cat.name}</option>
            ))}
          </select>
          <select 
            value={productFilter.status}
            onChange={(e) => setProductFilter({ ...productFilter, status: e.target.value })}
            className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all bg-white"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="featured">Featured</option>
            <option value="trending">Trending</option>
          </select>
        </div>
      </div>
      
      {/* Products Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[700px]">
          <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <tr>
              <th className="text-left py-4 px-4 font-semibold text-sm">Product</th>
              <th className="text-left py-4 px-4 font-semibold text-sm">Price</th>
              <th className="text-left py-4 px-4 font-semibold text-sm">Stock</th>
              <th className="text-left py-4 px-4 font-semibold text-sm">Category</th>
              <th className="text-left py-4 px-4 font-semibold text-sm">Status</th>
              <th className="text-left py-4 px-4 font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products
              .filter(product => {
                const matchesSearch = product.name?.toLowerCase().includes(productFilter.search.toLowerCase()) || 
                                    product.description?.toLowerCase().includes(productFilter.search.toLowerCase());
                const category = categories.find(c => c.id === product.categoryId);
                const categoryName = category?.name || category?.displayName || '';
                const matchesCategory = productFilter.category === '' || categoryName === productFilter.category;
                const matchesStatus = productFilter.status === '' || 
                                    (productFilter.status === 'active' && product.isActive) ||
                                    (productFilter.status === 'inactive' && !product.isActive) ||
                                    (productFilter.status === 'featured' && product.isFeatured) ||
                                    (productFilter.status === 'trending' && product.isTrending);
                return matchesSearch && matchesCategory && matchesStatus;
              })
              .map(product => {
                const category = categories.find(c => c.id === product.categoryId);
                const categoryName = category?.displayName || category?.name || 'Unknown';
                return (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={product.imageBase64?.[0] || product.imageUrls?.[0] || 'https://via.placeholder.com/50'} 
                            alt={product.name}
                            className="w-14 h-14 object-cover rounded-xl shadow-md"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">{categoryName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-gray-800 text-lg">₹{product.price?.toLocaleString()}</p>
                      <p className="text-sm text-gray-400 line-through">₹{product.originalPrice?.toLocaleString()}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{product.stock}</span>
                        <span className="text-xs text-gray-500">in stock</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                        {categoryName}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          product.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {product.isFeatured && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                            Featured
                          </span>
                        )}
                        {product.isTrending && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                            Trending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 min-w-[120px]">
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => handleOpenProductModal(product)}
                          className="p-2 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
                          title="Edit"
                        >
                          <Edit size={18} className="text-blue-600 group-hover:scale-110 transition-transform" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product)}
                          className="p-2 bg-red-50 hover:bg-red-100 rounded-xl transition-colors group"
                          title="Delete"
                        >
                          <Trash2 size={18} className="text-red-600 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={40} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-500">Click "Add Product" to create your first product</p>
          </div>
        )}
      </div>
      {/* Footer */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
        <p className="text-sm text-gray-600 font-medium">
          Showing <span className="text-purple-600 font-bold">{products.length}</span> products
        </p>
        <div className="flex gap-2">
          <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Grid3X3 size={18} className="text-gray-600" />
          </button>
          <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <List size={18} className="text-gray-600" />
          </button>
          <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={18} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsSection;
