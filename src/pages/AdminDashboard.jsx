import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Package,
  Layers,
  ShoppingBag,
  DollarSign,
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
};

const emptyCategory = {
  name: '',
  description: '',
  imageUrl: '',
  displayOrder: 0,
  isActive: true,
};

const AdminDashboard = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [productModal, setProductModal] = useState({ open: false, data: null });
  const [categoryModal, setCategoryModal] = useState({ open: false, data: null });
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

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
      const [p, c, o, h, f, u] = await Promise.all([
        productsAPI.getAllAdmin(),
        categoriesAPI.getAllAdmin(),
        ordersAPI.getAll(),
        layoutAPI.getHeader(),
        layoutAPI.getFooter(),
        usersAPI.getAll(),
      ]);
      setProducts(p.data);
      setCategories(c.data);
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

  const revenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  // ---- Product CRUD ----
  const openProduct = (data) => {
    setForm(data ? { ...emptyProduct, ...data } : { ...emptyProduct });
    setProductModal({ open: true, data });
    setProductImagePreview(data?.imageUrl || null);
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      price: parseFloat(form.price) || 0,
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
      stock: parseInt(form.stock) || 0,
      rating: parseFloat(form.rating) || 0,
      reviewCount: parseInt(form.reviewCount) || 0,
    };
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

  const filteredOrders = orders.filter(o => 
    o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Categories ({filteredCategories.length})</h2>
              <button
                onClick={() => openCategory(null)}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all"
              >
                <Plus size={16} /> Add
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
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Orders ({filteredOrders.length})</h2>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            {filteredOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-10">No orders found.</p>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((o) => (
                  <div key={o.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      <div>
                        <p className="font-bold text-gray-800">#ORD-{o.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-gray-500">
                          {o.customerName} · {o.email} · {new Date(o.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-blue-600">{formatPrice(o.total)}</span>
                        <select
                          value={o.status}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {o.items.map((it, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">
                          {it.name} ×{it.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                onChange={(e) => setField('categoryId', e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <Field label="Price" type="number" value={form.price} onChange={(v) => setField('price', v)} required />
              </div>
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                <Field label="Original Price" type="number" value={form.originalPrice} onChange={(v) => setField('originalPrice', v)} />
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
            <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-xl font-semibold disabled:opacity-60 hover:shadow-lg transition-all">
              {saving ? 'Saving...' : 'Save Product'}
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
