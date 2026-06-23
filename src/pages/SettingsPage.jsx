import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bell, Shield, CreditCard, MapPin, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/settings' } });
      return;
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account preferences</p>
            </div>
          </div>

          {/* Settings Cards */}
          <div className="space-y-4">
            {/* Profile Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{user?.fullName}</h2>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Edit Profile
              </button>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Account</h3>
              <div className="space-y-3">
                <button className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 rounded-lg transition-colors text-left">
                  <User className="text-gray-600" size={20} />
                  <div>
                    <p className="font-medium text-gray-800">Personal Information</p>
                    <p className="text-sm text-gray-500">Update your name and email</p>
                  </div>
                </button>
                <button className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 rounded-lg transition-colors text-left">
                  <Shield className="text-gray-600" size={20} />
                  <div>
                    <p className="font-medium text-gray-800">Security</p>
                    <p className="text-sm text-gray-500">Change password and security settings</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Preferences</h3>
              <div className="space-y-3">
                <button className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 rounded-lg transition-colors text-left">
                  <Bell className="text-gray-600" size={20} />
                  <div>
                    <p className="font-medium text-gray-800">Notifications</p>
                    <p className="text-sm text-gray-500">Manage notification preferences</p>
                  </div>
                </button>
                <button className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 rounded-lg transition-colors text-left">
                  <MapPin className="text-gray-600" size={20} />
                  <div>
                    <p className="font-medium text-gray-800">Addresses</p>
                    <p className="text-sm text-gray-500">Manage your saved addresses</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Payment Methods</h3>
              <button className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 rounded-lg transition-colors text-left">
                <CreditCard className="text-gray-600" size={20} />
                <div>
                  <p className="font-medium text-gray-800">Payment Methods</p>
                  <p className="text-sm text-gray-500">Add or remove payment methods</p>
                </div>
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full bg-white rounded-xl shadow-md p-6 hover:bg-red-50 transition-colors"
            >
              <div className="flex items-center gap-3 text-red-600">
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
