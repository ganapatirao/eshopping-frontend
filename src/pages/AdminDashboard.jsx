import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Package,
  Layers,
  ShoppingBag,
  Plus,
  Pencil,
  Trash2,
  X,
  LogOut,
  TrendingUp,
  Layout,
  Database,
  Settings,
  AlertCircle,
  CheckCircle,
  Eye,
  User,
  CreditCard,
  Calendar,
  Box,
  MapPin as MapPinIcon,
} from 'lucide-react';
import { productsAPI, categoriesAPI, ordersAPI, layoutAPI, seedAPI, imageAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/format';

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const emptyProduct = {
  name: '',
  description: '',
  categoryId: '',
  price: '',
  originalPrice: '',
  imageUrl: '',
  stock: 0,
  rating: 0,
  reviewCount: 0,
  isFeatured: false,
  isActive: true,
  availableColors: [],
  availableSizes: [],
  variants: [],
  warranty: '',
  warrantyIcon: '',
  specifications: [],
  dynamicSections: [],
  trustBadges: [],
};

const emptyCategory = {
  name: '',
  description: '',
  imageUrl: '',
  parentCategoryId: '',
  displayOrder: 0,
  isActive: true,
};

const AdminDashboard = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [productModal, setProductModal] = useState({ open: false, data: null });
  const [categoryModal, setCategoryModal] = useState({ open: false, data: null });
  const [subCategoryModal, setSubCategoryModal] = useState({ open: false, data: null });
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [variantModal, setVariantModal] = useState({ open: false, data: null, index: null });
  const [dragOverColor, setDragOverColor] = useState(null);

  const [headerData, setHeaderData] = useState(null);
  const [footerData, setFooterData] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [menuItemModal, setMenuItemModal] = useState({ open: false, data: null, index: null });
  const [iconPreview, setIconPreview] = useState(null);
  const [subMenuModal, setSubMenuModal] = useState({ open: false, data: null, index: null });
  const [subMenuIconPreview, setSubMenuIconPreview] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null, type: null, onConfirm: null });
  const [footerSectionModal, setFooterSectionModal] = useState({ open: false, data: null, index: null });
  const [footerLinkModal, setFooterLinkModal] = useState({ open: false, data: null, sectionIndex: null, linkIndex: null });
  const [productImagePreview, setProductImagePreview] = useState(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState(null);
  const [users, setUsers] = useState([]);
  const [userModal, setUserModal] = useState({ open: false, data: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: null });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderDateFrom, setOrderDateFrom] = useState('');
  const [orderDateTo, setOrderDateTo] = useState('');
  const [orderIdSearch, setOrderIdSearch] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/admin' } });
      return;
    }
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadAll();
  }, [user, isAdmin, navigate]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [p, c, sc, o, h, f, u] = await Promise.all([
        productsAPI.getAllAdmin(),
        categoriesAPI.getAllAdmin(),
        categoriesAPI.getSubCategories(),
        ordersAPI.getAll(),
        layoutAPI.getHeader(),
        layoutAPI.getFooter(),
        usersAPI.getAll(),
      ]);
      setProducts(p.data);
      setCategories(c.data);
      setSubCategories(sc.data);
      setOrders(o.data);
      setHeaderData(h.data);
      setFooterData(f.data);
      setLogoPreview(h.data?.logoUrl || null);
      setUsers(u.data);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const categoryName = (id) => categories.find((c) => c.id === id)?.name || '—';
  const subCategoryName = (id) => subCategories.find((sc) => sc.id === id)?.name || '—';

  const openSubCategory = (data) => {
    setForm(data ? { ...emptyCategory, ...data } : { ...emptyCategory });
    setSubCategoryModal({ open: true, data });
    setCategoryImagePreview(data?.imageUrl || null);
  };

  const saveSubCategory = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (categoryImagePreview) {
        payload.imageUrl = categoryImagePreview;
      }
      if (subCategoryModal.data) {
        await categoriesAPI.updateSubCategory(subCategoryModal.data.id, payload);
      } else {
        await categoriesAPI.createSubCategory(payload);
      }
      loadAll();
      setSubCategoryModal({ open: false, data: null });
      setForm({ ...emptyCategory });
      setCategoryImagePreview(null);
    } catch (err) {
      console.error('Error saving subcategory:', err);
      alert('Failed to save subcategory');
    } finally {
      setSaving(false);
    }
  };

  const deleteSubCategory = async (id) => {
    setDeleteModal({
      open: true,
      item: subCategories.find(sc => sc.id === id),
      type: 'subcategory',
      onConfirm: async () => {
        await categoriesAPI.removeSubCategory(id);
        loadAll();
        setDeleteModal({ open: false, item: null, type: null, onConfirm: null });
      }
    });
  };

  const formatDateTime = (d) =>
    new Date(d).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const revenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    pendingTotal: orders.filter(o => o.status === 'Pending').reduce((sum, o) => sum + o.total, 0),
    processing: orders.filter(o => o.status === 'Processing').length,
    processingTotal: orders.filter(o => o.status === 'Processing').reduce((sum, o) => sum + o.total, 0),
    shipped: orders.filter(o => o.status === 'Shipped').length,
    shippedTotal: orders.filter(o => o.status === 'Shipped').reduce((sum, o) => sum + o.total, 0),
    delivered: orders.filter(o => o.status === 'Delivered').length,
    deliveredTotal: orders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + o.total, 0),
    cancelled: orders.filter(o => o.status === 'Cancelled').length,
    cancelledTotal: orders.filter(o => o.status === 'Cancelled').reduce((sum, o) => sum + o.total, 0),
  };

  // ---- Product CRUD ----
  const openProduct = (data) => {
    setForm(data ? { ...emptyProduct, ...data } : { ...emptyProduct });
    setProductModal({ open: true, data });
    setProductImagePreview(data?.imageUrl || null);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const blobUrlToBase64 = async (blobUrl) => {
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      return await fileToBase64(blob);
    } catch (error) {
      console.error('Error converting blob URL to base64:', error);
      return null;
    }
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Convert color images from blob URLs to base64
    const processedColors = await Promise.all(
      (form.availableColors || []).map(async (color) => {
        const processedImages = await Promise.all(
          (color.images || []).map(async (img) => {
            // If it's already a base64 string, return as is
            if (img.startsWith('data:')) {
              return img;
            }
            // If it's a blob URL, convert to base64
            if (img.startsWith('blob:')) {
              return await blobUrlToBase64(img);
            }
            // If it's a regular URL, keep as is
            return img;
          })
        );
        return {
          ...color,
          images: processedImages.filter(img => img !== null)
        };
      })
    );

    const payload = {
      ...form,
      price: parseFloat(form.price) || 0,
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
      stock: parseInt(form.stock) || 0,
      rating: parseFloat(form.rating) || 0,
      reviewCount: parseInt(form.reviewCount) || 0,
      availableColors: processedColors,
      availableSizes: form.availableSizes || [],
      variants: form.variants || [],
    };

    // Preserve existing reviews when updating - don't send reviews in payload
    // Reviews will be managed separately by users who have purchased the product
    delete payload.reviews;

    try {
      if (productModal.data?.id) {
        await productsAPI.update(productModal.data.id, { ...productModal.data, ...payload });
      } else {
        await productsAPI.create(payload);
      }
      setProductModal({ open: false, data: null });
      loadAll();
    } catch (err) {
      console.error(err);
      alert('Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const openVariant = (index = null) => {
    const currentVariants = form.variants || [];
    if (index !== null) {
      const variant = currentVariants[index];
      setVariantModal({ open: true, data: { ...variant }, index });
    } else {
      setVariantModal({ open: true, data: { color: '', colorCode: '#000000', size: '', price: form.price || 0, originalPrice: form.originalPrice || null, stock: 0, imageUrls: [], isActive: true }, index: null });
    }
  };

  const saveVariant = (e) => {
    e.preventDefault();
    const currentVariants = [...(form.variants || [])];
    if (variantModal.index !== null) {
      currentVariants[variantModal.index] = variantModal.data;
    } else {
      currentVariants.push(variantModal.data);
    }
    setForm({ ...form, variants: currentVariants });
    setVariantModal({ open: false, data: null, index: null });
  };

  const deleteVariant = (index) => {
    const currentVariants = form.variants.filter((_, i) => i !== index);
    setForm({ ...form, variants: currentVariants });
  };

  const addColor = () => {
    const color = prompt('Enter color name:');
    const colorCode = prompt('Enter color hex code (e.g., #FF0000):');
    if (color && colorCode) {
      setForm({ ...form, availableColors: [...(form.availableColors || []), { name: color, code: colorCode, images: [] }] });
    }
  };

  const removeColor = (index) => {
    setForm({ ...form, availableColors: form.availableColors.filter((_, i) => i !== index) });
  };

  const handleColorImageUpload = (colorIndex, files) => {
    const newImages = Array.from(files).map(file => URL.createObjectURL(file));
    const updatedColors = [...form.availableColors];
    updatedColors[colorIndex] = {
      ...updatedColors[colorIndex],
      images: [...(updatedColors[colorIndex].images || []), ...newImages]
    };
    setForm({ ...form, availableColors: updatedColors });
  };

  const handleColorImageDrop = (e, colorIndex) => {
    e.preventDefault();
    setDragOverColor(null);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleColorImageUpload(colorIndex, files);
    }
  };

  const removeColorImage = (colorIndex, imageIndex) => {
    const updatedColors = [...form.availableColors];
    updatedColors[colorIndex] = {
      ...updatedColors[colorIndex],
      images: updatedColors[colorIndex].images.filter((_, i) => i !== imageIndex)
    };
    setForm({ ...form, availableColors: updatedColors });
  };

  const addSize = () => {
    const size = prompt('Enter size (e.g., S, M, L, XL):');
    if (size) {
      setForm({ ...form, availableSizes: [...(form.availableSizes || []), size] });
    }
  };

  const removeSize = (index) => {
    setForm({ ...form, availableSizes: form.availableSizes.filter((_, i) => i !== index) });
  };

  const addSpecification = () => {
    setForm({ ...form, specifications: [...(form.specifications || []), { name: '', value: '' }] });
  };

  const deleteSpecification = (index) => {
    setForm({ ...form, specifications: form.specifications.filter((_, i) => i !== index) });
  };

  const addDynamicSection = () => {
    setForm({ ...form, dynamicSections: [...(form.dynamicSections || []), { id: '', title: '', content: '', icon: '📄', sectionType: 'text', displayOrder: (form.dynamicSections?.length || 0), isActive: true }] });
  };

  const deleteDynamicSection = (index) => {
    setForm({ ...form, dynamicSections: form.dynamicSections.filter((_, i) => i !== index) });
  };

  const addTrustBadge = () => {
    setForm({ ...form, trustBadges: [...(form.trustBadges || []), { id: '', label: '', icon: '📦', displayOrder: (form.trustBadges?.length || 0), isActive: true }] });
  };

  const deleteTrustBadge = (index) => {
    setForm({ ...form, trustBadges: form.trustBadges.filter((_, i) => i !== index) });
  };

  const deleteProduct = async (id) => {
    setConfirmModal({
      open: true,
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      onConfirm: async () => {
        await productsAPI.remove(id);
        loadAll();
        setConfirmModal({ open: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  // ---- Category CRUD ----
  const openCategory = (data) => {
    setForm(data ? { ...emptyCategory, ...data } : { ...emptyCategory });
    setCategoryModal({ open: true, data });
    setCategoryImagePreview(data?.imageUrl || null);
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, displayOrder: parseInt(form.displayOrder) || 0 };
    try {
      if (categoryModal.data?.id) {
        await categoriesAPI.update(categoryModal.data.id, { ...categoryModal.data, ...payload });
      } else {
        await categoriesAPI.create(payload);
      }
      setCategoryModal({ open: false, data: null });
      loadAll();
    } catch (err) {
      console.error(err);
      alert('Error saving category');
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id) => {
    setConfirmModal({
      open: true,
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category? This action cannot be undone.',
      onConfirm: async () => {
        await categoriesAPI.remove(id);
        loadAll();
        setConfirmModal({ open: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  const handleProductImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Uploading product image file:', file.name, file.type, file.size);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setProductImagePreview(base64);
        setForm({ ...form, imageUrl: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductImageDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      console.log('Dropping product image file:', file.name, file.type, file.size);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setProductImagePreview(base64);
        setForm({ ...form, imageUrl: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Uploading category image file:', file.name, file.type, file.size);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setCategoryImagePreview(base64);
        setForm({ ...form, imageUrl: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryImageDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      console.log('Dropping category image file:', file.name, file.type, file.size);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setCategoryImagePreview(base64);
        setForm({ ...form, imageUrl: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  // ---- User CRUD ----
  const openUser = (data) => {
    setUserModal({ open: true, data });
  };

  const saveUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (userModal.data?.id) {
        await usersAPI.update(userModal.data.id, userModal.data);
      } else {
        await usersAPI.create(userModal.data);
      }
      setUserModal({ open: false, data: null });
      loadAll();
    } catch (err) {
      console.error(err);
      alert('Error saving user');
    } finally {
      setSaving(false);
    }
  };

  const toggleUserActive = async (id) => {
    try {
      await usersAPI.toggleActive(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u)));
    } catch (err) {
      console.error(err);
      alert('Error toggling user status');
    }
  };

  const deleteUser = async (id) => {
    setConfirmModal({
      open: true,
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      onConfirm: async () => {
        await usersAPI.remove(id);
        loadAll();
        setConfirmModal({ open: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  // Filter handlers
  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCategories = categories.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(o => {
    // Apply status filter
    if (orderStatusFilter !== 'All' && o.status !== orderStatusFilter) return false;

    // Apply order ID search
    if (orderIdSearch && !o.id.toLowerCase().includes(orderIdSearch.toLowerCase())) return false;

    // Apply date range filter
    if (orderDateFrom || orderDateTo) {
      const orderDate = new Date(o.createdAt);
      if (orderDateFrom && orderDate < new Date(orderDateFrom)) return false;
      if (orderDateTo && orderDate > new Date(orderDateTo)) return false;
    }

    // Apply search term (customer name/email)
    if (searchTerm && !o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !o.email?.toLowerCase().includes(searchTerm.toLowerCase())) return false;

    return true;
  });

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && u.isActive) || 
      (filterStatus === 'inactive' && !u.isActive);
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const updateOrderStatus = async (id, status) => {
    try {
      await ordersAPI.updateStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    }
  };

  const handleSeedDatabase = async () => {
    setConfirmModal({
      open: true,
      title: 'Seed Database',
      message: 'This will seed the database with sample data. This may overwrite existing data. Continue?',
      onConfirm: async () => {
        setSeeding(true);
        setConfirmModal({ open: false, title: '', message: '', onConfirm: null });
        try {
          await seedAPI.seedDatabase();
          alert('Database seeded successfully!');
          loadAll();
        } catch (err) {
          console.error(err);
          alert('Error seeding database');
        } finally {
          setSeeding(false);
        }
      }
    });
  };

  const handleSaveHeader = async () => {
    setSaving(true);
    try {
      console.log('Saving header data:', headerData);
      
      // Validate menu items before saving
      if (headerData.menuItems) {
        for (let i = 0; i < headerData.menuItems.length; i++) {
          const item = headerData.menuItems[i];
          if (!item.label || !item.label.trim()) {
            alert(`Menu item at position ${i + 1} is missing a label`);
            setSaving(false);
            return;
          }
          if (!item.link || !item.link.trim()) {
            alert(`Menu item "${item.label}" is missing a link`);
            setSaving(false);
            return;
          }
        }
      }
      
      const response = await layoutAPI.updateHeader(headerData);
      console.log('Header save response:', response);
      alert('Header updated successfully!');
    } catch (err) {
      console.error('Error saving header:', err);
      alert('Error updating header: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFooter = async () => {
    setSaving(true);
    try {
      await layoutAPI.updateFooter(footerData);
      alert('Footer updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Error updating footer');
    } finally {
      setSaving(false);
    }
  };

  const openMenuItem = (index = null) => {
    console.log('Opening menu item modal, index:', index);
    if (index !== null) {
      const item = headerData.menuItems[index];
      console.log('Editing existing menu item:', item);
      setMenuItemModal({ open: true, data: { ...item }, index });
      setIconPreview(item.icon || null);
    } else {
      console.log('Adding new menu item');
      setMenuItemModal({ open: true, data: { id: Date.now().toString(), label: '', link: '', isActive: true, displayOrder: 0, subMenus: [] }, index: null });
      setIconPreview(null);
    }
  };

  const openSubMenu = (index = null) => {
    const currentSubMenus = menuItemModal.data.subMenus || [];
    if (index !== null) {
      const subItem = currentSubMenus[index];
      setSubMenuModal({ open: true, data: { ...subItem }, index });
      setSubMenuIconPreview(subItem.icon || null);
    } else {
      setSubMenuModal({ open: true, data: { id: Date.now().toString(), label: '', link: '', isActive: true, displayOrder: 0, icon: '' }, index: null });
      setSubMenuIconPreview(null);
    }
  };

  const saveSubMenu = (e) => {
    e.preventDefault();
    
    console.log('Saving submenu:', subMenuModal.data);
    
    if (!subMenuModal.data.label || !subMenuModal.data.label.trim()) {
      alert('Sub-menu label is required');
      return;
    }
    if (!subMenuModal.data.link || !subMenuModal.data.link.trim()) {
      alert('Sub-menu link is required');
      return;
    }

    const currentSubMenus = [...(menuItemModal.data.subMenus || [])];
    if (subMenuModal.index !== null) {
      console.log('Updating existing submenu at index:', subMenuModal.index);
      currentSubMenus[subMenuModal.index] = subMenuModal.data;
    } else {
      console.log('Adding new submenu');
      currentSubMenus.push(subMenuModal.data);
    }
    
    setMenuItemModal({ ...menuItemModal, data: { ...menuItemModal.data, subMenus: currentSubMenus } });
    setSubMenuModal({ open: false, data: null, index: null });
    setSubMenuIconPreview(null);
    
    console.log('Submenu saved. Updated submenus:', currentSubMenus);
  };

  const deleteSubMenu = (index) => {
    const subItem = menuItemModal.data.subMenus[index];
    setDeleteModal({
      open: true,
      item: subItem,
      type: 'submenu',
      onConfirm: () => {
        const currentSubMenus = menuItemModal.data.subMenus.filter((_, i) => i !== index);
        setMenuItemModal({ ...menuItemModal, data: { ...menuItemModal.data, subMenus: currentSubMenus } });
        setDeleteModal({ open: false, item: null, type: null, onConfirm: null });
      }
    });
  };

  const handleSubMenuIconUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Uploading submenu icon file:', file.name, file.type, file.size);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setSubMenuIconPreview(base64);
        setSubMenuModal({ ...subMenuModal, data: { ...subMenuModal.data, icon: base64, iconType: 'base64' } });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubMenuIconDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      console.log('Dropping submenu icon file:', file.name, file.type, file.size);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setSubMenuIconPreview(base64);
        setSubMenuModal({ ...subMenuModal, data: { ...subMenuModal.data, icon: base64, iconType: 'base64' } });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Uploading logo file:', file.name, file.type, file.size);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setLogoPreview(base64);
        setHeaderData({ ...headerData, logoUrl: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      console.log('Dropping logo file:', file.name, file.type, file.size);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setLogoPreview(base64);
        setHeaderData({ ...headerData, logoUrl: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const openFooterSection = (index = null) => {
    if (index !== null) {
      const section = footerData.sections[index];
      setFooterSectionModal({ open: true, data: { ...section }, index });
    } else {
      setFooterSectionModal({ open: true, data: { id: Date.now().toString(), title: '', links: [], displayOrder: 0, isActive: true }, index: null });
    }
  };

  const saveFooterSection = (e) => {
    e.preventDefault();
    
    if (!footerSectionModal.data.title || !footerSectionModal.data.title.trim()) {
      alert('Title is required');
      return;
    }

    const updatedSections = [...(footerData.sections || [])];
    if (footerSectionModal.index !== null) {
      updatedSections[footerSectionModal.index] = footerSectionModal.data;
    } else {
      updatedSections.push(footerSectionModal.data);
    }
    
    setFooterData({ ...footerData, sections: updatedSections });
    setFooterSectionModal({ open: false, data: null, index: null });
  };

  const deleteFooterSection = (index) => {
    const section = footerData.sections[index];
    setDeleteModal({
      open: true,
      item: section,
      type: 'footerSection',
      onConfirm: () => {
        const updatedSections = footerData.sections.filter((_, i) => i !== index);
        setFooterData({ ...footerData, sections: updatedSections });
        setDeleteModal({ open: false, item: null, type: null, onConfirm: null });
      }
    });
  };

  const openFooterLink = (sectionIndex, linkIndex = null) => {
    const section = footerData.sections[sectionIndex];
    if (linkIndex !== null) {
      const link = section.links[linkIndex];
      setFooterLinkModal({ open: true, data: { ...link }, sectionIndex, linkIndex });
    } else {
      setFooterLinkModal({ open: true, data: { id: Date.now().toString(), label: '', link: '', displayOrder: 0, isActive: true }, sectionIndex, linkIndex: null });
    }
  };

  const saveFooterLink = (e) => {
    e.preventDefault();
    
    if (!footerLinkModal.data.label || !footerLinkModal.data.label.trim()) {
      alert('Label is required');
      return;
    }
    if (!footerLinkModal.data.link || !footerLinkModal.data.link.trim()) {
      alert('Link is required');
      return;
    }

    const updatedSections = [...footerData.sections];
    const section = { ...updatedSections[footerLinkModal.sectionIndex] };
    const updatedLinks = [...section.links];
    
    if (footerLinkModal.linkIndex !== null) {
      updatedLinks[footerLinkModal.linkIndex] = footerLinkModal.data;
    } else {
      updatedLinks.push(footerLinkModal.data);
    }
    
    section.links = updatedLinks;
    updatedSections[footerLinkModal.sectionIndex] = section;
    
    setFooterData({ ...footerData, sections: updatedSections });
    setFooterLinkModal({ open: false, data: null, sectionIndex: null, linkIndex: null });
  };

  const deleteFooterLink = (sectionIndex, linkIndex) => {
    const link = footerData.sections[sectionIndex].links[linkIndex];
    setDeleteModal({
      open: true,
      item: link,
      type: 'footerLink',
      onConfirm: () => {
        const updatedSections = [...footerData.sections];
        const section = { ...updatedSections[sectionIndex] };
        section.links = section.links.filter((_, i) => i !== linkIndex);
        updatedSections[sectionIndex] = section;
        setFooterData({ ...footerData, sections: updatedSections });
        setDeleteModal({ open: false, item: null, type: null, onConfirm: null });
      }
    });
  };

  const handleIconUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Uploading icon file:', file.name, file.type, file.size);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setIconPreview(base64);
        setMenuItemModal({ ...menuItemModal, data: { ...menuItemModal.data, icon: base64, iconType: 'base64' } });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIconDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      console.log('Dropping icon file:', file.name, file.type, file.size);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setIconPreview(base64);
        setMenuItemModal({ ...menuItemModal, data: { ...menuItemModal.data, icon: base64, iconType: 'base64' } });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveMenuItem = (e) => {
    e.preventDefault();
    
    console.log('Saving menu item:', menuItemModal.data);
    
    // Validate required fields
    if (!menuItemModal.data.label || !menuItemModal.data.label.trim()) {
      alert('Label is required');
      return;
    }
    if (!menuItemModal.data.link || !menuItemModal.data.link.trim()) {
      alert('Link is required');
      return;
    }

    const updatedMenuItems = [...(headerData.menuItems || [])];
    if (menuItemModal.index !== null) {
      console.log('Updating existing menu item at index:', menuItemModal.index);
      updatedMenuItems[menuItemModal.index] = menuItemModal.data;
    } else {
      console.log('Adding new menu item');
      updatedMenuItems.push(menuItemModal.data);
    }
    
    setHeaderData({ ...headerData, menuItems: updatedMenuItems });
    setMenuItemModal({ open: false, data: null, index: null });
    setIconPreview(null);
    
    console.log('Menu item saved to local state. Updated menu items:', updatedMenuItems);
    alert('Menu item saved! Click "Save Header" to persist changes to database.');
  };

  const deleteMenuItem = (index) => {
    const item = headerData.menuItems[index];
    setDeleteModal({
      open: true,
      item: item,
      type: 'menu',
      onConfirm: () => {
        const updatedMenuItems = headerData.menuItems.filter((_, i) => i !== index);
        setHeaderData({ ...headerData, menuItems: updatedMenuItems });
        setDeleteModal({ open: false, item: null, type: null, onConfirm: null });
      }
    });
  };

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Products', value: products.length, icon: Package, cls: 'from-green-500 to-emerald-600', tab: 'products' },
    { label: 'Categories', value: categories.length, icon: Layers, cls: 'from-blue-500 to-indigo-600', tab: 'categories' },
    { label: 'Orders', value: orders.length, icon: ShoppingBag, cls: 'from-purple-500 to-violet-600', tab: 'orders' },
    { label: 'Revenue', value: formatPrice(revenue), icon: TrendingUp, cls: 'from-amber-500 to-orange-600', tab: 'orders' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
              <ShieldCheck className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-500 text-sm">Welcome, {user?.fullName}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['overview', 'products', 'categories', 'orders', 'users', 'header', 'footer', 'seeding'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 sm:px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
                tab === t
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {stats.map(({ label, value, icon: Icon, cls, tab: targetTab }) => (
              <button
                key={label}
                onClick={() => setTab(targetTab)}
                className={`bg-gradient-to-br ${cls} rounded-2xl shadow-lg p-4 sm:p-6 text-white hover:shadow-xl transition-all cursor-pointer`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-xs sm:text-sm font-medium mb-1">{label}</p>
                    <p className="text-2xl sm:text-4xl font-bold">{value}</p>
                  </div>
                  <div className="bg-white/20 rounded-2xl p-2 sm:p-3">
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Products */}
        {tab === 'products' && (
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Products ({filteredProducts.length})</h2>
              <button
                onClick={() => openProduct(null)}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all"
              >
                <Plus size={16} /> Add
              </button>
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="py-3 pr-4">Product</th>
                    <th className="py-3 pr-4">Category</th>
                    <th className="py-3 pr-4">Price</th>
                    <th className="py-3 pr-4">Stock</th>
                    <th className="py-3 pr-4">Featured</th>
                    <th className="py-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                            {p.imageUrl ? <img src={p.imageUrl} alt="" className="w-full h-full object-cover" /> : '📦'}
                          </div>
                          <span className="font-medium text-gray-800 line-clamp-1">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">{categoryName(p.categoryId)}</td>
                      <td className="py-3 pr-4 font-semibold text-blue-600">{formatPrice(p.price)}</td>
                      <td className="py-3 pr-4 text-gray-600">{p.stock}</td>
                      <td className="py-3 pr-4">{p.isFeatured ? '⭐' : '—'}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openProduct(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Categories */}
        {tab === 'categories' && (
          <div className="space-y-6">
            {/* Categories Section */}
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Categories ({filteredCategories.length})</h2>
                <button
                  onClick={() => openCategory(null)}
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all"
                >
                  <Plus size={16} /> Add Category
                </button>
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((c) => (
                  <div key={c.id} className="border border-gray-100 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                      {c.imageUrl ? <img src={c.imageUrl} alt="" className="w-full h-full object-cover" /> : '🏷️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{c.name}</p>
                      <p className="text-xs text-gray-500">Order: {c.displayOrder}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openCategory(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => deleteCategory(c.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subcategories Section */}
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Subcategories ({subCategories.length})</h2>
                <button
                  onClick={() => openSubCategory(null)}
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all"
                >
                  <Plus size={16} /> Add Subcategory
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Parent Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Display Order</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {subCategories.map((sc) => (
                      <tr key={sc.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                              {sc.imageUrl ? <img src={sc.imageUrl} alt="" className="w-full h-full object-cover" /> : '🏷️'}
                            </div>
                            <span className="font-medium text-gray-800">{sc.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{categoryName(sc.parentCategoryId)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{sc.displayOrder}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openSubCategory(sc)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => deleteSubCategory(sc.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <div className="space-y-6">
            {/* Status Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                <p className="text-xs font-semibold text-amber-700 mb-1">Pending</p>
                <p className="text-2xl font-bold text-gray-800">{orderStats.pending}</p>
                <p className="text-sm text-amber-600">{formatPrice(orderStats.pendingTotal)}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs font-semibold text-blue-700 mb-1">Processing</p>
                <p className="text-2xl font-bold text-gray-800">{orderStats.processing}</p>
                <p className="text-sm text-blue-600">{formatPrice(orderStats.processingTotal)}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
                <p className="text-xs font-semibold text-purple-700 mb-1">Shipped</p>
                <p className="text-2xl font-bold text-gray-800">{orderStats.shipped}</p>
                <p className="text-sm text-purple-600">{formatPrice(orderStats.shippedTotal)}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <p className="text-xs font-semibold text-green-700 mb-1">Delivered</p>
                <p className="text-2xl font-bold text-gray-800">{orderStats.delivered}</p>
                <p className="text-sm text-green-600">{formatPrice(orderStats.deliveredTotal)}</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-100">
                <p className="text-xs font-semibold text-red-700 mb-1">Cancelled</p>
                <p className="text-2xl font-bold text-gray-800">{orderStats.cancelled}</p>
                <p className="text-sm text-red-600">{formatPrice(orderStats.cancelledTotal)}</p>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Orders ({filteredOrders.length})</h2>
                <p className="text-sm text-gray-500">Total: {formatPrice(filteredOrders.reduce((sum, o) => sum + o.total, 0))}</p>
              </div>

              {/* Advanced Filters */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Order ID</label>
                    <input
                      type="text"
                      placeholder="Search by order ID..."
                      value={orderIdSearch}
                      onChange={(e) => setOrderIdSearch(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                      <option value="All">All Status</option>
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
                    <input
                      type="date"
                      value={orderDateFrom}
                      onChange={(e) => setOrderDateFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
                    <input
                      type="date"
                      value={orderDateTo}
                      onChange={(e) => setOrderDateTo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                </div>
                {(orderStatusFilter !== 'All' || orderDateFrom || orderDateTo || orderIdSearch) && (
                  <button
                    onClick={() => {
                      setOrderStatusFilter('All');
                      setOrderDateFrom('');
                      setOrderDateTo('');
                      setOrderIdSearch('');
                    }}
                    className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {filteredOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-10">No orders found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Order ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Total</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className="font-bold text-gray-800 text-sm">#ORD-{o.id.slice(0, 8).toUpperCase()}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{o.customerName || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{o.email || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 font-bold text-blue-600 text-sm">{formatPrice(o.total)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                              o.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                              o.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                              o.status === 'Shipped' ? 'bg-indigo-100 text-indigo-700' :
                              o.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewOrder(o)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-xs font-medium"
                              >
                                <Eye size={12} /> View
                              </button>
                              <select
                                value={o.status}
                                onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                                className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-purple-500"
                              >
                                {ORDER_STATUSES.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <Box size={28} /> Order Details
                    </h2>
                    <p className="text-purple-100 mt-1">Order #ORD-{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Order Status */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                        selectedOrder.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                        selectedOrder.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                        selectedOrder.status === 'Shipped' ? 'bg-indigo-100 text-indigo-700' :
                        selectedOrder.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      <span className="text-sm">{formatDateTime(selectedOrder.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <User size={18} className="text-purple-600" /> Customer Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium text-gray-800">{selectedOrder.customerName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-800">{selectedOrder.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-800">{selectedOrder.customerPhone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-medium text-gray-800 flex items-center gap-2">
                        <CreditCard size={16} /> {selectedOrder.paymentMethod || 'Credit Card'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <MapPinIcon size={18} className="text-purple-600" /> Shipping Address
                  </h3>
                  {selectedOrder.shippingAddress ? (
                    <div className="text-gray-700">
                      <p className="font-medium">{selectedOrder.shippingAddress.fullName || selectedOrder.customerName}</p>
                      <p className="text-sm">{selectedOrder.shippingAddress.addressLine1}</p>
                      {selectedOrder.shippingAddress.addressLine2 && (
                        <p className="text-sm">{selectedOrder.shippingAddress.addressLine2}</p>
                      )}
                      <p className="text-sm">
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No shipping address provided</p>
                  )}
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <h3 className="font-semibold text-gray-800 p-4 border-b border-gray-200 flex items-center gap-2">
                    <Package size={18} className="text-purple-600" /> Order Items
                  </h3>
                  <div className="divide-y divide-gray-100">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-3xl">📦</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800">{item.name}</p>
                            {item.selectedVariant && (
                              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                <span className="bg-gray-200 px-2 py-0.5 rounded">{item.selectedVariant.color}</span>
                                <span className="bg-gray-200 px-2 py-0.5 rounded">{item.selectedVariant.size}</span>
                              </div>
                            )}
                            <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-purple-600">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <CreditCard size={18} className="text-purple-600" /> Pricing Breakdown
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal</span>
                      <span className="font-medium">{formatPrice(selectedOrder.subtotal || selectedOrder.total)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Shipping</span>
                      <span className="font-medium">{formatPrice(selectedOrder.shipping || 0)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Tax</span>
                      <span className="font-medium">{formatPrice(selectedOrder.tax || 0)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700 pt-2 border-t border-green-200">
                      <span className="font-semibold text-lg">Total</span>
                      <span className="font-bold text-xl text-purple-600">{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 p-4 border-t border-gray-200">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-xl">
                  <ShieldCheck className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Users ({filteredUsers.length})</h2>
                  <p className="text-sm text-gray-500">Manage user accounts and permissions</p>
                </div>
              </div>
              <button
                onClick={() => openUser(null)}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all"
              >
                <Plus size={16} /> Add User
              </button>
            </div>
            <div className="mb-6 space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex-1">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="all">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="Customer">Customer</option>
                    <option value="Advertiser">Advertiser</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="py-3 pr-4">User</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Phone</th>
                    <th className="py-3 pr-4">Role</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Joined</th>
                    <th className="py-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md ${
                            u.role === 'Admin' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' :
                            u.role === 'Advertiser' ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
                            u.role === 'Other' ? 'bg-gradient-to-br from-orange-500 to-amber-600' :
                            'bg-gradient-to-br from-gray-400 to-gray-500'
                          }`}>
                            {u.fullName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800 block">{u.fullName || '—'}</span>
                            <span className="text-xs text-gray-500">{u.city || ''}, {u.state || ''}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-gray-600">{u.email || '—'}</td>
                      <td className="py-4 pr-4 text-gray-600">{u.phoneNumber || '—'}</td>
                      <td className="py-4 pr-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                          u.role === 'Admin' ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border border-purple-200' : 
                          u.role === 'Advertiser' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-200' : 
                          u.role === 'Other' ? 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-200' : 
                          'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-200'
                        }`}>
                          {u.role === 'Other' ? (u.customRole || 'Custom') : (u.role || 'Customer')}
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                          u.isActive ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200' : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200'
                        }`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-gray-600">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openUser(u)} className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors" title="Edit">
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => toggleUserActive(u.id)}
                            className={`p-2.5 rounded-xl transition-colors ${u.isActive ? 'text-orange-500 hover:bg-orange-100' : 'text-green-500 hover:bg-green-100'}`}
                            title={u.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {u.isActive ? <X size={16} /> : <Plus size={16} />}
                          </button>
                          <button onClick={() => deleteUser(u.id)} className="p-2.5 text-red-500 hover:bg-red-100 rounded-xl transition-colors" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Header */}
        {tab === 'header' && (
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl">
                <Layout className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Header Settings</h2>
                <p className="text-sm text-gray-500">Manage header logo, title, and menu items</p>
              </div>
            </div>
            {headerData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={headerData.title || ''}
                      onChange={(e) => setHeaderData({ ...headerData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                    <div
                      onDrop={handleLogoDrop}
                      onDragOver={(e) => e.preventDefault()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-500 transition-colors cursor-pointer"
                    >
                      {logoPreview ? (
                        <div className="relative inline-block">
                          <img src={logoPreview} alt="Logo preview" className="h-16 object-contain mx-auto" />
                          <button
                            type="button"
                            onClick={() => {
                              setLogoPreview(null);
                              setHeaderData({ ...headerData, logoUrl: null });
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <div>
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="mt-1 text-sm text-gray-600">Drop logo here or click to upload</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="mt-2 inline-block text-sm text-purple-600 hover:text-purple-700 cursor-pointer"
                      >
                        Choose file
                      </label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={headerData.showSearchIcon || false}
                      onChange={(e) => setHeaderData({ ...headerData, showSearchIcon: e.target.checked })}
                    />
                    Show Search Icon
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={headerData.showUserIcon || false}
                      onChange={(e) => setHeaderData({ ...headerData, showUserIcon: e.target.checked })}
                    />
                    Show User Icon
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={headerData.showCartIcon || false}
                      onChange={(e) => setHeaderData({ ...headerData, showCartIcon: e.target.checked })}
                    />
                    Show Cart Icon
                  </label>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">Menu Items</label>
                    <button
                      onClick={() => openMenuItem()}
                      className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={14} /> Add Item
                    </button>
                  </div>
                  <div className="space-y-2">
                    {headerData.menuItems && headerData.menuItems.length > 0 ? (
                      headerData.menuItems.map((item, index) => (
                        <div key={item.id || index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          {item.icon && (
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-white border border-gray-200">
                              <img src={item.icon} alt={item.label} className="w-full h-full object-contain" onError={(e) => e.target.style.display = 'none'} />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.link}</p>
                            {item.subMenus && item.subMenus.length > 0 && (
                              <p className="text-xs text-gray-400 mt-1">{item.subMenus.length} sub-menu(s)</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                              {item.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <button
                              onClick={() => openMenuItem(index)}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => deleteMenuItem(index)}
                              className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm text-center py-4">No menu items yet. Click "Add Item" to create one.</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleSaveHeader}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2.5 rounded-xl font-semibold disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Header'}
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-10">No header data found.</p>
            )}
          </div>
        )}

        {/* Footer */}
        {tab === 'footer' && (
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl">
                <Layout className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Footer Settings</h2>
                <p className="text-sm text-gray-500">Manage footer content and links</p>
              </div>
            </div>
            {footerData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={footerData.companyName || ''}
                      onChange={(e) => setFooterData({ ...footerData, companyName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Copyright Text</label>
                    <input
                      type="text"
                      value={footerData.copyrightText || ''}
                      onChange={(e) => setFooterData({ ...footerData, copyrightText: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={footerData.description || ''}
                    onChange={(e) => setFooterData({ ...footerData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Social Links</label>
                  <div className="space-y-2">
                    {footerData.socialLinks && footerData.socialLinks.length > 0 ? (
                      footerData.socialLinks.map((link, index) => (
                        <div key={link.id || index} className="flex gap-2 items-start">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={link.name || ''}
                              onChange={(e) => {
                                const updatedLinks = [...footerData.socialLinks];
                                updatedLinks[index] = { ...updatedLinks[index], name: e.target.value };
                                setFooterData({ ...footerData, socialLinks: updatedLinks });
                              }}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                              placeholder="Name (e.g., Facebook)"
                            />
                            <input
                              type="text"
                              value={link.url || ''}
                              onChange={(e) => {
                                const updatedLinks = [...footerData.socialLinks];
                                updatedLinks[index] = { ...updatedLinks[index], url: e.target.value };
                                setFooterData({ ...footerData, socialLinks: updatedLinks });
                              }}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                              placeholder="URL (e.g., https://facebook.com/eshop)"
                            />
                          </div>
                          <button
                            onClick={() => {
                              const updatedLinks = footerData.socialLinks.filter((_, i) => i !== index);
                              setFooterData({ ...footerData, socialLinks: updatedLinks });
                            }}
                            className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No social links added</p>
                    )}
                    <button
                      onClick={() => setFooterData({ 
                        ...footerData, 
                        socialLinks: [...(footerData.socialLinks || []), { 
                          id: Date.now().toString(), 
                          name: '', 
                          url: '', 
                          displayOrder: (footerData.socialLinks?.length || 0),
                          isActive: true 
                        }] 
                      })}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Add Social Link
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Information</label>
                  <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Email</label>
                      <input
                        type="email"
                        value={footerData.contactInfo?.email || ''}
                        onChange={(e) => setFooterData({ 
                          ...footerData, 
                          contactInfo: { 
                            ...(footerData.contactInfo || { id: Date.now().toString() }), 
                            email: e.target.value 
                          } 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="contact@eshop.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Phone</label>
                      <input
                        type="text"
                        value={footerData.contactInfo?.phone || ''}
                        onChange={(e) => setFooterData({ 
                          ...footerData, 
                          contactInfo: { 
                            ...(footerData.contactInfo || { id: Date.now().toString() }), 
                            phone: e.target.value 
                          } 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="+1 234 567 890"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Address</label>
                      <input
                        type="text"
                        value={footerData.contactInfo?.address || ''}
                        onChange={(e) => setFooterData({ 
                          ...footerData, 
                          contactInfo: { 
                            ...(footerData.contactInfo || { id: Date.now().toString() }), 
                            address: e.target.value 
                          } 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">City</label>
                        <input
                          type="text"
                          value={footerData.contactInfo?.city || ''}
                          onChange={(e) => setFooterData({ 
                            ...footerData, 
                            contactInfo: { 
                              ...(footerData.contactInfo || { id: Date.now().toString() }), 
                              city: e.target.value 
                            } 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="New York"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">State</label>
                        <input
                          type="text"
                          value={footerData.contactInfo?.state || ''}
                          onChange={(e) => setFooterData({ 
                            ...footerData, 
                            contactInfo: { 
                              ...(footerData.contactInfo || { id: Date.now().toString() }), 
                              state: e.target.value 
                            } 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="NY"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Zip Code</label>
                        <input
                          type="text"
                          value={footerData.contactInfo?.zipCode || ''}
                          onChange={(e) => setFooterData({ 
                            ...footerData, 
                            contactInfo: { 
                              ...(footerData.contactInfo || { id: Date.now().toString() }), 
                              zipCode: e.target.value 
                            } 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="10001"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Country</label>
                        <input
                          type="text"
                          value={footerData.contactInfo?.country || ''}
                          onChange={(e) => setFooterData({ 
                            ...footerData, 
                            contactInfo: { 
                              ...(footerData.contactInfo || { id: Date.now().toString() }), 
                              country: e.target.value 
                            } 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="USA"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">Footer Sections</label>
                    <button
                      onClick={() => openFooterSection()}
                      className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={14} /> Add Section
                    </button>
                  </div>
                  <div className="space-y-3">
                    {footerData.sections && footerData.sections.length > 0 ? (
                      footerData.sections.map((section, sectionIndex) => (
                        <div key={section.id || sectionIndex} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium text-gray-800">{section.title}</p>
                              <p className="text-xs text-gray-500">{section.links?.length || 0} link(s)</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${section.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                {section.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <button
                                onClick={() => openFooterSection(sectionIndex)}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => deleteFooterSection(sectionIndex)}
                                className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {section.links && section.links.length > 0 ? (
                              section.links.map((link, linkIndex) => (
                                <div key={link.id || linkIndex} className="flex items-center justify-between pl-4 border-l-2 border-gray-200">
                                  <div>
                                    <p className="text-sm text-gray-700">{link.label}</p>
                                    <p className="text-xs text-gray-500">{link.link}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => openFooterLink(sectionIndex, linkIndex)}
                                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                    >
                                      <Pencil size={14} />
                                    </button>
                                    <button
                                      onClick={() => deleteFooterLink(sectionIndex, linkIndex)}
                                      className="p-1 text-red-500 hover:bg-red-100 rounded"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500 text-sm pl-4">No links</p>
                            )}
                            <button
                              onClick={() => openFooterLink(sectionIndex)}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium pl-4"
                            >
                              + Add Link
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm text-center py-4">No sections yet. Click "Add Section" to create one.</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleSaveFooter}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2.5 rounded-xl font-semibold disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Footer'}
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-10">No footer data found.</p>
            )}
          </div>
        )}

        {/* Seeding */}
        {tab === 'seeding' && (
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-3 rounded-xl">
                <Database className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Database Seeding</h2>
                <p className="text-sm text-gray-500">Seed the database with sample data</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>Warning:</strong> Seeding will add sample data to your database. This operation cannot be undone.
              </p>
            </div>
            <button
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-xl font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Database size={20} />
              {seeding ? 'Seeding...' : 'Seed Database'}
            </button>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {productModal.open && (
        <Modal title={productModal.data ? 'Edit Product' : 'Add Product'} onClose={() => setProductModal({ open: false, data: null })}>
          <form onSubmit={saveProduct} className="space-y-5">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
              <Field label="Name" value={form.name} onChange={(v) => setField('name', v)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description || ''}
                onChange={(e) => setField('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter product description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.categoryId || ''}
                onChange={(e) => {
                  setField('categoryId', e.target.value);
                  setField('subCategoryId', ''); // Reset subcategory when category changes
                }}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
              <select
                value={form.subCategoryId || ''}
                onChange={(e) => setField('subCategoryId', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="">Select subcategory</option>
                {subCategories.filter(sc => sc.parentCategoryId === form.categoryId).map((sc) => (
                  <option key={sc.id} value={sc.id}>{sc.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <Field label="Price" type="number" value={form.price} onChange={(v) => setField('price', v)} required />
              </div>
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                <Field label="Original Price" type="number" value={form.originalPrice} onChange={(v) => setField('originalPrice', v)} />
              </div>
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border border-red-100">
                <Field label="Discount %" type="number" value={form.discountPercentage} onChange={(v) => setField('discountPercentage', v)} />
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
              <div
                onDrop={handleProductImageDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer"
              >
                {productImagePreview ? (
                  <div className="relative inline-block">
                    <img src={productImagePreview} alt="Product preview" className="h-40 object-contain mx-auto rounded-lg shadow-md" />
                    <button
                      type="button"
                      onClick={() => {
                        setProductImagePreview(null);
                        setForm({ ...form, imageUrl: '' });
                      }}
                      className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 shadow-lg"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <div>
                    <svg className="mx-auto h-16 w-16 text-blue-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600 font-medium">Drop product image here or click to upload</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProductImageUpload}
                  className="hidden"
                  id="product-image-upload"
                />
                <label
                  htmlFor="product-image-upload"
                  className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Choose file
                </label>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <Field label="Stock" type="number" value={form.stock} onChange={(v) => setField('stock', v)} />
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-100">
                <Field label="Rating" type="number" value={form.rating} onChange={(v) => setField('rating', v)} />
              </div>
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-100">
                <Field label="Reviews" type="number" value={form.reviewCount} onChange={(v) => setField('reviewCount', v)} />
              </div>
            </div>
            <div className="flex items-center gap-6 bg-gray-50 rounded-xl p-4">
              <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={!!form.isFeatured} onChange={(e) => setField('isFeatured', e.target.checked)} className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" />
                <span className="font-medium">Featured Product</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.isActive !== false} onChange={(e) => setField('isActive', e.target.checked)} className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" />
                <span className="font-medium">Active</span>
              </label>
            </div>

            {/* Colors Section */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Available Colors</h3>
                <button type="button" onClick={addColor} className="text-xs bg-pink-500 text-white px-3 py-1.5 rounded-lg hover:bg-pink-600 transition-colors">
                  + Add Color
                </button>
              </div>
              {/* Excel-like table for colors */}
              <div className="bg-white rounded-lg border border-pink-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-pink-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Color</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Code</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Images</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.availableColors?.map((color, colorIndex) => (
                      <tr key={colorIndex} className="border-t border-pink-100 hover:bg-pink-50/50">
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={color.name}
                            onChange={(e) => {
                              const updatedColors = [...form.availableColors];
                              updatedColors[colorIndex] = { ...updatedColors[colorIndex], name: e.target.value };
                              setForm({ ...form, availableColors: updatedColors });
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={color.code || '#000000'}
                              onChange={(e) => {
                                const updatedColors = [...form.availableColors];
                                updatedColors[colorIndex] = { ...updatedColors[colorIndex], code: e.target.value };
                                setForm({ ...form, availableColors: updatedColors });
                              }}
                              className="w-8 h-8 rounded cursor-pointer border-0"
                            />
                            <input
                              type="text"
                              value={color.code || ''}
                              onChange={(e) => {
                                const updatedColors = [...form.availableColors];
                                updatedColors[colorIndex] = { ...updatedColors[colorIndex], code: e.target.value };
                                setForm({ ...form, availableColors: updatedColors });
                              }}
                              className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
                              placeholder="#000000"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            {/* Drag-drop zone for color images */}
                            <div
                              className={`w-8 h-8 border-2 border-dashed rounded flex items-center justify-center cursor-pointer transition-colors ${
                                dragOverColor === colorIndex ? 'border-pink-400 bg-pink-50' : 'border-gray-300 hover:border-pink-300'
                              }`}
                              onDragOver={(e) => { e.preventDefault(); setDragOverColor(colorIndex); }}
                              onDragLeave={() => setDragOverColor(null)}
                              onDrop={(e) => handleColorImageDrop(e, colorIndex)}
                              title="Click to upload or drag images"
                            >
                              <input
                                type="file"
                                id={`color-image-${colorIndex}`}
                                className="hidden"
                                multiple
                                accept="image/*"
                                onChange={(e) => handleColorImageUpload(colorIndex, e.target.files)}
                              />
                              <label htmlFor={`color-image-${colorIndex}`} className="cursor-pointer w-full h-full flex items-center justify-center">
                                <Plus size={14} className="text-gray-400" />
                              </label>
                            </div>
                            {/* Color images count */}
                            {color.images && color.images.length > 0 && (
                              <span className="text-xs text-gray-500">{color.images.length} images</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => removeColor(colorIndex)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!form.availableColors || form.availableColors.length === 0) && (
                      <tr>
                        <td colSpan="4" className="px-4 py-4 text-center text-sm text-gray-500">
                          No colors added yet. Click "+ Add Color" to add one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Color images preview section */}
              {form.availableColors?.some(c => c.images && c.images.length > 0) && (
                <div className="mt-3 space-y-2">
                  {form.availableColors.map((color, colorIndex) => (
                    color.images && color.images.length > 0 && (
                      <div key={colorIndex} className="bg-white rounded-lg border border-pink-200 p-2">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: color.code }}></div>
                          <span className="text-xs font-medium text-gray-600">{color.name} Images</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {color.images.map((img, imgIndex) => (
                            <div key={imgIndex} className="relative group">
                              <img src={img} alt={`${color.name} ${imgIndex + 1}`} className="w-12 h-12 object-cover rounded border border-gray-200" />
                              <button
                                type="button"
                                onClick={() => removeColorImage(colorIndex, imgIndex)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>

            {/* Sizes Section */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Available Sizes</h3>
                <button type="button" onClick={addSize} className="text-xs bg-indigo-500 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-600 transition-colors">
                  + Add Size
                </button>
              </div>
              {/* Excel-like table for sizes */}
              <div className="bg-white rounded-lg border border-indigo-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-indigo-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Size</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.availableSizes?.map((size, index) => (
                      <tr key={index} className="border-t border-indigo-100 hover:bg-indigo-50/50">
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={size}
                            onChange={(e) => {
                              const updatedSizes = [...form.availableSizes];
                              updatedSizes[index] = e.target.value;
                              setForm({ ...form, availableSizes: updatedSizes });
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => removeSize(index)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!form.availableSizes || form.availableSizes.length === 0) && (
                      <tr>
                        <td colSpan="2" className="px-4 py-4 text-center text-sm text-gray-500">
                          No sizes added yet. Click "+ Add Size" to add one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Variants Section */}
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Product Variants (Color + Size)</h3>
                <button type="button" onClick={() => openVariant()} className="text-xs bg-purple-500 text-white px-3 py-1.5 rounded-lg hover:bg-purple-600 transition-colors">
                  + Add Variant
                </button>
              </div>
              <div className="space-y-2">
                {form.variants?.map((variant, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-gray-200" style={{ backgroundColor: variant.colorCode }}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{variant.color} - {variant.size}</p>
                        <p className="text-xs text-gray-500">₹{variant.price} | Stock: {variant.stock}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => openVariant(index)} className="text-blue-500 hover:text-blue-600">
                        <Pencil size={16} />
                      </button>
                      <button type="button" onClick={() => deleteVariant(index)} className="text-red-500 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warranty Section */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">Warranty Information</label>
              <input
                type="text"
                value={form.warranty || ''}
                onChange={(e) => setField('warranty', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all mb-3"
                placeholder="e.g., 1 Year Manufacturer Warranty"
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">Warranty Icon (Emoji or Image URL)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.warrantyIcon || ''}
                  onChange={(e) => setField('warrantyIcon', e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="🛡️ or image URL"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('warrantyIconUpload').click()}
                  className="px-4 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                >
                  Upload
                </button>
                <input
                  type="file"
                  id="warrantyIconUpload"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setField('warrantyIcon', reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
              {form.warrantyIcon && (
                <div className="mt-2 flex items-center gap-2">
                  {form.warrantyIcon.startsWith('data:') ? (
                    <img src={form.warrantyIcon} alt="Warranty icon" className="w-8 h-8 object-contain" />
                  ) : (
                    <span className="text-2xl">{form.warrantyIcon}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setField('warrantyIcon', '')}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Specifications Section */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Product Specifications</h3>
                <button type="button" onClick={addSpecification} className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors">
                  + Add Specification
                </button>
              </div>
              <div className="space-y-2">
                {form.specifications?.map((spec, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={spec.name}
                      onChange={(e) => {
                        const updatedSpecs = [...form.specifications];
                        updatedSpecs[index] = { ...updatedSpecs[index], name: e.target.value };
                        setForm({ ...form, specifications: updatedSpecs });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                      placeholder="Specification name (e.g., Display)"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => {
                        const updatedSpecs = [...form.specifications];
                        updatedSpecs[index] = { ...updatedSpecs[index], value: e.target.value };
                        setForm({ ...form, specifications: updatedSpecs });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                      placeholder="Value (e.g., 6.5 inches)"
                    />
                    <button type="button" onClick={() => deleteSpecification(index)} className="text-red-500 hover:text-red-600 p-2">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {(!form.specifications || form.specifications.length === 0) && (
                  <p className="text-sm text-gray-500 italic">No specifications added yet.</p>
                )}
              </div>
            </div>

            {/* Dynamic Sections Section */}
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Dynamic Sections (Warranty, Shipping, etc.)</h3>
                <button type="button" onClick={addDynamicSection} className="text-xs bg-violet-500 text-white px-3 py-1.5 rounded-lg hover:bg-violet-600 transition-colors">
                  + Add Section
                </button>
              </div>
              <div className="space-y-3">
                {form.dynamicSections?.map((section, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-violet-200">
                    <div className="flex gap-2 mb-2">
                      <div className="flex flex-col gap-1">
                        <input
                          type="text"
                          value={section.icon}
                          onChange={(e) => {
                            const updatedSections = [...form.dynamicSections];
                            updatedSections[index] = { ...updatedSections[index], icon: e.target.value };
                            setForm({ ...form, dynamicSections: updatedSections });
                          }}
                          className="w-12 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-violet-500 text-sm text-center"
                          placeholder="📄"
                          title="Icon (emoji)"
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById(`sectionIconUpload${index}`).click()}
                          className="w-12 px-2 py-1 bg-violet-500 text-white rounded text-xs hover:bg-violet-600"
                        >
                          Upload
                        </button>
                        <input
                          type="file"
                          id={`sectionIconUpload${index}`}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const updatedSections = [...form.dynamicSections];
                                updatedSections[index] = { ...updatedSections[index], icon: reader.result };
                                setForm({ ...form, dynamicSections: updatedSections });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => {
                          const updatedSections = [...form.dynamicSections];
                          updatedSections[index] = { ...updatedSections[index], title: e.target.value };
                          setForm({ ...form, dynamicSections: updatedSections });
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-violet-500 text-sm"
                        placeholder="Section title (e.g., Warranty)"
                      />
                      <button type="button" onClick={() => deleteDynamicSection(index)} className="text-red-500 hover:text-red-600 p-2">
                        <X size={16} />
                      </button>
                    </div>
                    {section.icon && (
                      <div className="flex items-center gap-2 mb-2">
                        {section.icon.startsWith('data:') ? (
                          <img src={section.icon} alt="Section icon" className="w-6 h-6 object-contain" />
                        ) : (
                          <span className="text-xl">{section.icon}</span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const updatedSections = [...form.dynamicSections];
                            updatedSections[index] = { ...updatedSections[index], icon: '' };
                            setForm({ ...form, dynamicSections: updatedSections });
                          }}
                          className="text-red-500 hover:text-red-600 text-xs"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                    <textarea
                      value={section.content}
                      onChange={(e) => {
                        const updatedSections = [...form.dynamicSections];
                        updatedSections[index] = { ...updatedSections[index], content: e.target.value };
                        setForm({ ...form, dynamicSections: updatedSections });
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-violet-500 text-sm"
                      placeholder="Section content..."
                      rows={2}
                    />
                    <div className="flex gap-2 mt-2">
                      <select
                        value={section.sectionType}
                        onChange={(e) => {
                          const updatedSections = [...form.dynamicSections];
                          updatedSections[index] = { ...updatedSections[index], sectionType: e.target.value };
                          setForm({ ...form, dynamicSections: updatedSections });
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-violet-500 text-sm"
                      >
                        <option value="text">Text</option>
                        <option value="list">List</option>
                        <option value="table">Table</option>
                      </select>
                      <input
                        type="number"
                        value={section.displayOrder}
                        onChange={(e) => {
                          const updatedSections = [...form.dynamicSections];
                          updatedSections[index] = { ...updatedSections[index], displayOrder: parseInt(e.target.value) };
                          setForm({ ...form, dynamicSections: updatedSections });
                        }}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-violet-500 text-sm"
                        placeholder="Order"
                        title="Display order"
                      />
                      <label className="flex items-center gap-1 text-xs text-gray-600">
                        <input
                          type="checkbox"
                          checked={section.isActive}
                          onChange={(e) => {
                            const updatedSections = [...form.dynamicSections];
                            updatedSections[index] = { ...updatedSections[index], isActive: e.target.checked };
                            setForm({ ...form, dynamicSections: updatedSections });
                          }}
                          className="w-4 h-4 text-violet-600 rounded"
                        />
                        Active
                      </label>
                    </div>
                  </div>
                ))}
                {(!form.dynamicSections || form.dynamicSections.length === 0) && (
                  <p className="text-sm text-gray-500 italic">No dynamic sections added yet. Add sections like Warranty, Shipping Info, Returns, etc.</p>
                )}
              </div>
            </div>

            {/* Trust Badges Section */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Trust Badges (Free Shipping, Secure Payment, etc.)</h3>
                <button type="button" onClick={addTrustBadge} className="text-xs bg-cyan-500 text-white px-3 py-1.5 rounded-lg hover:bg-cyan-600 transition-colors">
                  + Add Badge
                </button>
              </div>
              <div className="space-y-3">
                {form.trustBadges?.map((badge, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-cyan-200">
                    <div className="flex gap-2 mb-2">
                      <div className="flex flex-col gap-1">
                        <input
                          type="text"
                          value={badge.icon}
                          onChange={(e) => {
                            const updatedBadges = [...form.trustBadges];
                            updatedBadges[index] = { ...updatedBadges[index], icon: e.target.value };
                            setForm({ ...form, trustBadges: updatedBadges });
                          }}
                          className="w-12 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 text-sm text-center"
                          placeholder="📦"
                          title="Icon (emoji)"
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById(`badgeIconUpload${index}`).click()}
                          className="w-12 px-2 py-1 bg-cyan-500 text-white rounded text-xs hover:bg-cyan-600"
                        >
                          Upload
                        </button>
                        <input
                          type="file"
                          id={`badgeIconUpload${index}`}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const updatedBadges = [...form.trustBadges];
                                updatedBadges[index] = { ...updatedBadges[index], icon: reader.result };
                                setForm({ ...form, trustBadges: updatedBadges });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                      <input
                        type="text"
                        value={badge.label}
                        onChange={(e) => {
                          const updatedBadges = [...form.trustBadges];
                          updatedBadges[index] = { ...updatedBadges[index], label: e.target.value };
                          setForm({ ...form, trustBadges: updatedBadges });
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 text-sm"
                        placeholder="Badge label (e.g., Free shipping over ₹100)"
                      />
                      <button type="button" onClick={() => deleteTrustBadge(index)} className="text-red-500 hover:text-red-600 p-2">
                        <X size={16} />
                      </button>
                    </div>
                    {badge.icon && (
                      <div className="flex items-center gap-2 mb-2">
                        {badge.icon.startsWith('data:') ? (
                          <img src={badge.icon} alt="Badge icon" className="w-6 h-6 object-contain" />
                        ) : (
                          <span className="text-xl">{badge.icon}</span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const updatedBadges = [...form.trustBadges];
                            updatedBadges[index] = { ...updatedBadges[index], icon: '' };
                            setForm({ ...form, trustBadges: updatedBadges });
                          }}
                          className="text-red-500 hover:text-red-600 text-xs"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={badge.displayOrder}
                        onChange={(e) => {
                          const updatedBadges = [...form.trustBadges];
                          updatedBadges[index] = { ...updatedBadges[index], displayOrder: parseInt(e.target.value) };
                          setForm({ ...form, trustBadges: updatedBadges });
                        }}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 text-sm"
                        placeholder="Order"
                        title="Display order"
                      />
                      <label className="flex items-center gap-1 text-xs text-gray-600">
                        <input
                          type="checkbox"
                          checked={badge.isActive}
                          onChange={(e) => {
                            const updatedBadges = [...form.trustBadges];
                            updatedBadges[index] = { ...updatedBadges[index], isActive: e.target.checked };
                            setForm({ ...form, trustBadges: updatedBadges });
                          }}
                          className="w-4 h-4 text-cyan-600 rounded"
                        />
                        Active
                      </label>
                    </div>
                  </div>
                ))}
                {(!form.trustBadges || form.trustBadges.length === 0) && (
                  <p className="text-sm text-gray-500 italic">No trust badges added yet. Add badges like Free Shipping, Secure Payment, Easy Returns, etc.</p>
                )}
              </div>
            </div>

            <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-xl font-semibold disabled:opacity-60 hover:shadow-lg transition-all">
              {saving ? 'Saving...' : 'Save Product'}
            </button>
          </form>
        </Modal>
      )}

      {/* Variant Modal */}
      {variantModal.open && (
        <Modal title={variantModal.index !== null ? 'Edit Variant' : 'Add Variant'} onClose={() => setVariantModal({ open: false, data: null, index: null })}>
          <form onSubmit={saveVariant} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color Name</label>
                <input
                  type="text"
                  value={variantModal.data?.color || ''}
                  onChange={(e) => setVariantModal({ ...variantModal, data: { ...variantModal.data, color: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Red"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color Code</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={variantModal.data?.colorCode || '#000000'}
                    onChange={(e) => setVariantModal({ ...variantModal, data: { ...variantModal.data, colorCode: e.target.value } })}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={variantModal.data?.colorCode || '#000000'}
                    onChange={(e) => setVariantModal({ ...variantModal, data: { ...variantModal.data, colorCode: e.target.value } })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="#FF0000"
                    required
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
              <input
                type="text"
                value={variantModal.data?.size || ''}
                onChange={(e) => setVariantModal({ ...variantModal, data: { ...variantModal.data, size: e.target.value } })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., S, M, L, XL"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  value={variantModal.data?.price || 0}
                  onChange={(e) => setVariantModal({ ...variantModal, data: { ...variantModal.data, price: parseFloat(e.target.value) || 0 } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
                <input
                  type="number"
                  value={variantModal.data?.originalPrice || ''}
                  onChange={(e) => setVariantModal({ ...variantModal, data: { ...variantModal.data, originalPrice: e.target.value ? parseFloat(e.target.value) : null } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                <input
                  type="number"
                  value={variantModal.data?.discountPercentage || 0}
                  onChange={(e) => setVariantModal({ ...variantModal, data: { ...variantModal.data, discountPercentage: parseFloat(e.target.value) || 0 } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                value={variantModal.data?.stock || 0}
                onChange={(e) => setVariantModal({ ...variantModal, data: { ...variantModal.data, stock: parseInt(e.target.value) || 0 } })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
              Save Variant
            </button>
          </form>
        </Modal>
      )}

      {/* Category Modal */}
      {categoryModal.open && (
        <Modal title={categoryModal.data ? 'Edit Category' : 'Add Category'} onClose={() => setCategoryModal({ open: false, data: null })}>
          <form onSubmit={saveCategory} className="space-y-4">
            <Field label="Name" value={form.name} onChange={(v) => setField('name', v)} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description || ''}
                onChange={(e) => setField('description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
              <div
                onDrop={handleCategoryImageDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-500 transition-colors cursor-pointer"
              >
                {categoryImagePreview ? (
                  <div className="relative inline-block">
                    <img src={categoryImagePreview} alt="Category preview" className="h-32 object-contain mx-auto" />
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryImagePreview(null);
                        setForm({ ...form, imageUrl: '' });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <div>
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-1 text-sm text-gray-600">Drop category image here or click to upload</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCategoryImageUpload}
                  className="hidden"
                  id="category-image-upload"
                />
                <label
                  htmlFor="category-image-upload"
                  className="mt-2 inline-block text-sm text-purple-600 hover:text-purple-700 cursor-pointer"
                >
                  Choose file
                </label>
              </div>
            </div>
            <Field label="Display Order" type="number" value={form.displayOrder} onChange={(v) => setField('displayOrder', v)} />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.isActive !== false} onChange={(e) => setField('isActive', e.target.checked)} />
              Active
            </label>
            <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2.5 rounded-xl font-semibold disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Category'}
            </button>
          </form>
        </Modal>
      )}

      {/* Subcategory Modal */}
      {subCategoryModal.open && (
        <Modal title={subCategoryModal.data ? 'Edit Subcategory' : 'Add Subcategory'} onClose={() => setSubCategoryModal({ open: false, data: null })}>
          <form onSubmit={saveSubCategory} className="space-y-4">
            <Field label="Name" value={form.name} onChange={(v) => setField('name', v)} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
              <select
                value={form.parentCategoryId || ''}
                onChange={(e) => setField('parentCategoryId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description || ''}
                onChange={(e) => setField('description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory Image</label>
              <div
                onDrop={handleCategoryImageDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-500 transition-colors cursor-pointer"
              >
                {categoryImagePreview ? (
                  <div className="relative inline-block">
                    <img src={categoryImagePreview} alt="Subcategory preview" className="h-32 object-contain mx-auto" />
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryImagePreview(null);
                        setForm({ ...form, imageUrl: '' });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <div>
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-1 text-sm text-gray-600">Drop subcategory image here or click to upload</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCategoryImageUpload}
                  className="hidden"
                  id="subcategory-image-upload"
                />
                <label
                  htmlFor="subcategory-image-upload"
                  className="mt-2 inline-block text-sm text-purple-600 hover:text-purple-700 cursor-pointer"
                >
                  Choose file
                </label>
              </div>
            </div>
            <Field label="Display Order" type="number" value={form.displayOrder} onChange={(v) => setField('displayOrder', v)} />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.isActive !== false} onChange={(e) => setField('isActive', e.target.checked)} />
              Active
            </label>
            <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2.5 rounded-xl font-semibold disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Subcategory'}
            </button>
          </form>
        </Modal>
      )}

      {/* User Modal */}
      {userModal.open && (
        <Modal title={userModal.data?.id ? 'Edit User' : 'Add User'} onClose={() => setUserModal({ open: false, data: null })}>
          <form onSubmit={saveUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={userModal.data?.fullName || ''}
                onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, fullName: e.target.value } })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={userModal.data?.email || ''}
                onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, email: e.target.value } })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={userModal.data?.phoneNumber || ''}
                onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, phoneNumber: e.target.value } })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={userModal.data?.address || ''}
                onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, address: e.target.value } })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={userModal.data?.city || ''}
                  onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, city: e.target.value } })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={userModal.data?.state || ''}
                  onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, state: e.target.value } })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
              <input
                type="text"
                value={userModal.data?.zipCode || ''}
                onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, zipCode: e.target.value } })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={userModal.data?.role || 'Customer'}
                onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, role: e.target.value } })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="Customer">Customer</option>
                <option value="Admin">Admin</option>
                <option value="Advertiser">Advertiser</option>
                <option value="Other">Other (Custom)</option>
              </select>
            </div>
            {userModal.data?.role === 'Other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Role</label>
                <input
                  type="text"
                  value={userModal.data?.customRole || ''}
                  onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, customRole: e.target.value } })}
                  placeholder="Enter custom role name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            )}
            <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
              <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={userModal.data?.isActive !== false}
                  onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, isActive: e.target.checked } })}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="font-medium">Active</span>
              </label>
            </div>
            <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-xl font-semibold disabled:opacity-60 hover:shadow-lg transition-all">
              {saving ? 'Saving...' : 'Save User'}
            </button>
          </form>
        </Modal>
      )}

      {/* Menu Item Modal */}
      {menuItemModal.open && (
        <Modal title={menuItemModal.index !== null ? 'Edit Menu Item' : 'Add Menu Item'} onClose={() => setMenuItemModal({ open: false, data: null, index: null })}>
          <form onSubmit={saveMenuItem} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                type="text"
                value={menuItemModal.data.label || ''}
                onChange={(e) => setMenuItemModal({ ...menuItemModal, data: { ...menuItemModal.data, label: e.target.value } })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
              <input
                type="text"
                value={menuItemModal.data.link || ''}
                onChange={(e) => setMenuItemModal({ ...menuItemModal, data: { ...menuItemModal.data, link: e.target.value } })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon Image</label>
              <div
                onDrop={handleIconDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-500 transition-colors cursor-pointer"
              >
                {iconPreview ? (
                  <div className="relative">
                    <img src={iconPreview} alt="Icon preview" className="w-16 h-16 mx-auto object-contain" />
                    <button
                      type="button"
                      onClick={() => {
                        setIconPreview(null);
                        setMenuItemModal({ ...menuItemModal, data: { ...menuItemModal.data, icon: null } });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <div>
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-1 text-sm text-gray-600">Drop image here or click to upload</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIconUpload}
                  className="hidden"
                  id="icon-upload"
                />
                <label
                  htmlFor="icon-upload"
                  className="mt-2 inline-block text-sm text-purple-600 hover:text-purple-700 cursor-pointer"
                >
                  Choose file
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input
                type="number"
                value={menuItemModal.data.displayOrder || 0}
                onChange={(e) => setMenuItemModal({ ...menuItemModal, data: { ...menuItemModal.data, displayOrder: parseInt(e.target.value) || 0 } })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Sub Menus</label>
                <button
                  type="button"
                  onClick={() => openSubMenu()}
                  className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <Plus size={14} /> Add Sub Menu
                </button>
              </div>
              <div className="space-y-2">
                {menuItemModal.data.subMenus && menuItemModal.data.subMenus.length > 0 ? (
                  menuItemModal.data.subMenus.map((subItem, subIndex) => (
                    <div key={subItem.id || subIndex} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {subItem.icon && (
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-white border border-gray-200">
                          <img src={subItem.icon} alt={subItem.label} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 text-sm">{subItem.label}</p>
                        <p className="text-xs text-gray-500">{subItem.link}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${subItem.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                          {subItem.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          type="button"
                          onClick={() => openSubMenu(subIndex)}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSubMenu(subIndex)}
                          className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">No sub-menus yet. Click "Add Sub Menu" to create one.</p>
                )}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={menuItemModal.data.isActive !== false}
                onChange={(e) => setMenuItemModal({ ...menuItemModal, data: { ...menuItemModal.data, isActive: e.target.checked } })}
              />
              Active
            </label>
            <button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2.5 rounded-xl font-semibold">
              {menuItemModal.index !== null ? 'Update Menu Item' : 'Add Menu Item'}
            </button>
          </form>
        </Modal>
      )}

      {/* Sub Menu Modal */}
      {subMenuModal.open && (
        <Modal title={subMenuModal.index !== null ? 'Edit Sub Menu' : 'Add Sub Menu'} onClose={() => setSubMenuModal({ open: false, data: null, index: null })}>
          <form onSubmit={saveSubMenu} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                type="text"
                value={subMenuModal.data.label || ''}
                onChange={(e) => setSubMenuModal({ ...subMenuModal, data: { ...subMenuModal.data, label: e.target.value } })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
              <input
                type="text"
                value={subMenuModal.data.link || ''}
                onChange={(e) => setSubMenuModal({ ...subMenuModal, data: { ...subMenuModal.data, link: e.target.value } })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon Image</label>
              <div
                onDrop={handleSubMenuIconDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-500 transition-colors cursor-pointer"
              >
                {subMenuIconPreview ? (
                  <div className="relative">
                    <img src={subMenuIconPreview} alt="Icon preview" className="w-16 h-16 mx-auto object-contain" />
                    <button
                      type="button"
                      onClick={() => {
                        setSubMenuIconPreview(null);
                        setSubMenuModal({ ...subMenuModal, data: { ...subMenuModal.data, icon: null } });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <div>
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-1 text-sm text-gray-600">Drop image here or click to upload</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSubMenuIconUpload}
                  className="hidden"
                  id="submenu-icon-upload"
                />
                <label
                  htmlFor="submenu-icon-upload"
                  className="mt-2 inline-block text-sm text-purple-600 hover:text-purple-700 cursor-pointer"
                >
                  Choose file
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input
                type="number"
                value={subMenuModal.data.displayOrder || 0}
                onChange={(e) => setSubMenuModal({ ...subMenuModal, data: { ...subMenuModal.data, displayOrder: parseInt(e.target.value) || 0 } })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={subMenuModal.data.isActive !== false}
                onChange={(e) => setSubMenuModal({ ...subMenuModal, data: { ...subMenuModal.data, isActive: e.target.checked } })}
              />
              Active
            </label>
            <button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2.5 rounded-xl font-semibold">
              {subMenuModal.index !== null ? 'Update Sub Menu' : 'Add Sub Menu'}
            </button>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={deleteModal.open}
        item={deleteModal.item}
        type={deleteModal.type}
        onClose={() => setDeleteModal({ open: false, item: null, type: null, onConfirm: null })}
        onConfirm={deleteModal.onConfirm}
      />

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        onClose={() => setConfirmModal({ open: false, title: '', message: '', onConfirm: null })}
        onConfirm={confirmModal.onConfirm}
      />
    </div>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
    <div
      className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 border border-gray-100"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors">
          <X size={24} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const DeleteConfirmModal = ({ open, item, type, onClose, onConfirm }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-red-100 rounded-full p-3">
            <Trash2 className="text-red-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Delete {type === 'menu' ? 'Menu Item' : 'Sub Menu'}</h3>
            <p className="text-sm text-gray-500">This action cannot be undone</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <span className="font-semibold text-gray-800">"{item?.label || 'this item'}"</span>?
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const ConfirmModal = ({ open, title, message, onClose, onConfirm }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-orange-100 rounded-full p-3">
            <AlertCircle className="text-orange-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500">Please confirm your action</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">{message}</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, type = 'text', required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      step={type === 'number' ? 'any' : undefined}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
    />
  </div>
);

export default AdminDashboard;
