import React, { useState, useEffect } from 'react';
import { advertisementsAPI } from '../services/api';

const AdvertisementsPage = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      const response = await advertisementsAPI.getAll();
      setAdvertisements(response.data);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const positionLabels = {
    'HomeBanner': 'Home Banner',
    'Sidebar': 'Sidebar',
    'BetweenProducts': 'Between Products',
    'Popup': 'Popup',
    'FooterBanner': 'Footer Banner'
  };

  const groupedAds = advertisements.reduce((acc, ad) => {
    const position = ad.position || 'Other';
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(ad);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Advertisements</h1>
        <p className="text-gray-600 mb-8">Browse all active advertisements and promotions</p>

        {Object.entries(groupedAds).map(([position, ads]) => (
          <div key={position} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-lg mr-3">
                {positionLabels[position] || position}
              </span>
              <span className="text-gray-500 font-normal">({ads.length} ads)</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map(ad => (
                <div key={ad.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    {ad.imageUrl ? (
                      <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-6xl">📢</div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{ad.title}</h3>
                    <p className="text-gray-600 mb-4">{ad.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>Start: {new Date(ad.startDate).toLocaleDateString()}</span>
                      <span>End: {new Date(ad.endDate).toLocaleDateString()}</span>
                    </div>
                    {ad.link && (
                      <a
                        href={ad.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Advertisement
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {advertisements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📢</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No advertisements found</h3>
            <p className="text-gray-600">Check back later for new promotions and deals!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvertisementsPage;
