import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import SavedAddresses from '../components/SavedAddresses';

const AddressManagementPage = () => {
  const navigate = useNavigate();

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
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <MapPin className="mr-3" />
                Manage Addresses
              </h1>
              <p className="text-gray-600 mt-1">Add, edit, or delete your saved addresses for faster checkout</p>
            </div>
          </div>

          {/* Saved Addresses Component */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <SavedAddresses />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressManagementPage;
