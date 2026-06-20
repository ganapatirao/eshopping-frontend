import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { layoutAPI } from '../services/api';

const SmartFooter = () => {
  const [footerData, setFooterData] = useState(null);

  useEffect(() => {
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    try {
      const response = await layoutAPI.getFooter();
      setFooterData(response.data);
    } catch (error) {
      console.error('Error fetching footer data:', error);
    }
  };

  if (!footerData) {
    return (
      <footer className="bg-gray-800 text-white mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-700 animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-12 pb-24 md:pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <div className="mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {footerData.companyName}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{footerData.description}</p>
            </div>
            
            {/* Contact Information */}
            {footerData.contactInfo && (
              <div className="space-y-3 text-sm bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-gray-700/50">
                {footerData.contactInfo.email && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Email</p>
                      <p className="text-gray-300">{footerData.contactInfo.email}</p>
                    </div>
                  </div>
                )}
                {footerData.contactInfo.phone && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Phone</p>
                      <p className="text-gray-300">{footerData.contactInfo.phone}</p>
                    </div>
                  </div>
                )}
                {footerData.contactInfo.address && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Address</p>
                      <p className="text-gray-300">{footerData.contactInfo.address}</p>
                    </div>
                  </div>
                )}
                {(footerData.contactInfo.city || footerData.contactInfo.state || footerData.contactInfo.zipCode || footerData.contactInfo.country) && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Location</p>
                      <p className="text-gray-300">
                        {footerData.contactInfo.city && footerData.contactInfo.city}
                        {footerData.contactInfo.city && footerData.contactInfo.state && ', '}
                        {footerData.contactInfo.state && footerData.contactInfo.state}
                        {footerData.contactInfo.state && footerData.contactInfo.zipCode && ' '}
                        {footerData.contactInfo.zipCode && footerData.contactInfo.zipCode}
                        {(footerData.contactInfo.city || footerData.contactInfo.state || footerData.contactInfo.zipCode) && footerData.contactInfo.country && ', '}
                        {footerData.contactInfo.country && footerData.contactInfo.country}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Sections */}
          {footerData.sections
            .filter(section => section.isActive)
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map(section => (
              <div key={section.id}>
                <h4 className="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links
                    .filter(link => link.isActive)
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map(link => (
                      <li key={link.id}>
                        <Link
                          to={link.link || '#'}
                          className="text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 transition-all px-3 py-2 rounded-lg inline-block"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
        </div>

        {/* Social Links */}
        {footerData.socialLinks && footerData.socialLinks.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-700/50">
            <h5 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">Follow Us</h5>
            <div className="flex flex-wrap gap-3">
              {footerData.socialLinks
                .filter(link => link.isActive !== false)
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-gray-700/50 hover:border-blue-500/50 rounded-lg text-gray-300 hover:text-white transition-all text-sm font-medium"
                  >
                    {link.name || 'Social Link'}
                  </a>
                ))}
            </div>
          </div>
        )}

        {/* Copyright */}
        {footerData.copyrightText && (
          <div className="mt-8 pt-8 border-t border-gray-700/50 text-center">
            <p className="text-gray-400 text-sm">{footerData.copyrightText}</p>
          </div>
        )}
      </div>
    </footer>
  );
};

export default SmartFooter;
