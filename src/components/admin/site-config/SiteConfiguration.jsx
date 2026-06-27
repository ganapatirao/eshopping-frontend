import { Settings, Plus, Trash2, Globe, Camera, X, Palette, Layout, Sparkles, Save, ChevronDown, ChevronUp, Upload } from 'lucide-react';
import { useState } from 'react';

const SiteConfiguration = ({
  config,
  setConfig,
  handleSaveConfiguration,
  convertToBase64
}) => {
  const [siteExpanded, setSiteExpanded] = useState(true);
  const [headerExpanded, setHeaderExpanded] = useState(false);
  const [footerExpanded, setFooterExpanded] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleToggleSection = (section) => {
    if (section === 'site') {
      setSiteExpanded(!siteExpanded);
      setHeaderExpanded(false);
      setFooterExpanded(false);
    } else if (section === 'header') {
      setHeaderExpanded(!headerExpanded);
      setSiteExpanded(false);
      setFooterExpanded(false);
    } else if (section === 'footer') {
      setFooterExpanded(!footerExpanded);
      setSiteExpanded(false);
      setHeaderExpanded(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (type === 'hero') {
            setConfig({ ...config, site: { ...config.site, heroImageBase64: reader.result } });
          } else if (type === 'logo') {
            setConfig({ ...config, header: { ...config.header, logoBase64: reader.result } });
          } else if (type === 'slideshow') {
            setConfig(prev => ({
              ...prev,
              site: {
                ...prev.site,
                slideshowImages: [...(prev.site.slideshowImages || []), reader.result]
              }
            }));
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleImageDelete = (type, index = null) => {
    if (type === 'hero') {
      setConfig({ ...config, site: { ...config.site, heroImageBase64: '' } });
    } else if (type === 'logo') {
      setConfig({ ...config, header: { ...config.header, logoBase64: '' } });
    } else if (type === 'slideshow' && index !== null) {
      const newImages = config.site.slideshowImages.filter((_, i) => i !== index);
      setConfig({ ...config, site: { ...config.site, slideshowImages: newImages } });
    }
  };

  const handleFileSelect = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (type === 'hero') {
            setConfig({ ...config, site: { ...config.site, heroImageBase64: reader.result } });
          } else if (type === 'logo') {
            setConfig({ ...config, header: { ...config.header, logoBase64: reader.result } });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-4 sm:p-6 md:p-8 relative overflow-hidden">
          <div className="relative">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-white/20 p-3 sm:p-4 rounded-2xl backdrop-blur-sm border border-white/30 shadow-lg shrink-0">
                <Settings size={24} sm:size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">Site Configuration</h2>
                <p className="text-purple-100 text-xs sm:text-sm md:text-base mt-1">Manage your site's header, footer, and branding settings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Site Section */}
        <div className="border-b-4 border-double border-blue-200">
          <button
            onClick={() => handleToggleSection('site')}
            className="w-full p-4 flex items-center justify-between text-left bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            <span className="font-semibold text-gray-700 text-sm sm:text-base flex items-center gap-3">
              <Globe size={18} sm:size={20} className="text-blue-600" />
              Site Information
            </span>
            {siteExpanded ? <ChevronUp size={20} className="text-blue-600" /> : <ChevronDown size={20} className="text-blue-600" />}
          </button>
          <div className={`p-4 sm:p-6 bg-blue-50/30 ${siteExpanded ? 'block' : 'hidden'}`}>
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Basic Information</h4>
                  <input
                    type="number"
                    value={config.site?.basicInfoOrder || 1}
                    onChange={(e) => setConfig({ ...config, site: { ...config.site, basicInfoOrder: parseInt(e.target.value) || 1 } })}
                    className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-xs text-center"
                    placeholder="Order"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Site Name</label>
                    <input
                      type="text"
                      value={config.site?.name || ''}
                      onChange={(e) => setConfig({ ...config, site: { ...config.site, name: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                      placeholder="Site name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Site Description</label>
                    <textarea
                      value={config.site?.description || ''}
                      onChange={(e) => setConfig({ ...config, site: { ...config.site, description: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none text-sm"
                      rows={2}
                      placeholder="Site description"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Hero Image</h4>
                  <input
                    type="number"
                    value={config.site?.heroImageOrder || 2}
                    onChange={(e) => setConfig({ ...config, site: { ...config.site, heroImageOrder: parseInt(e.target.value) || 2 } })}
                    className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-xs text-center"
                    placeholder="Order"
                  />
                </div>
                <div className="flex items-center gap-3">
                  {config.site?.heroImageBase64 && (
                    <div className="relative">
                      <img src={config.site.heroImageBase64} alt="Hero" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                      <button
                        onClick={() => setConfig({ ...config, site: { ...config.site, heroImageBase64: '' } })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  )}
                  <div
                    className={`flex-1 border-2 border-dashed rounded-lg p-4 transition-all ${
                      dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={(e) => handleDrop(e, 'hero')}
                  >
                    <div className="text-center">
                      <Upload size={20} className="text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500 mb-2">Drag & drop or</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, 'hero')}
                        className="hidden"
                        id="siteHeroImage"
                      />
                      <label
                        htmlFor="siteHeroImage"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors text-xs font-medium"
                      >
                        <Camera size={14} />
                        <span>Browse</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Slideshow Settings</h4>
                  <input
                    type="number"
                    value={config.site?.slideshowOrder || 3}
                    onChange={(e) => setConfig({ ...config, site: { ...config.site, slideshowOrder: parseInt(e.target.value) || 3 } })}
                    className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-xs text-center"
                    placeholder="Order"
                  />
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.site?.enableSlideshow || false}
                      onChange={(e) => setConfig({ ...config, site: { ...config.site, enableSlideshow: e.target.checked } })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-0 shrink-0"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable Slideshow</span>
                  </label>
                  {config.site?.enableSlideshow && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Slideshow Images</label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-4 transition-all ${
                          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={(e) => handleDrop(e, 'slideshow')}
                      >
                        <div className="flex flex-wrap gap-2 mb-3">
                          {config.site?.slideshowImages?.map((img, index) => (
                            <div key={index} className="relative">
                              <img src={img} alt={`Slide ${index + 1}`} className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                              <button
                                onClick={() => handleImageDelete('slideshow', index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="text-center">
                          <Upload size={20} className="text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500 mb-2">Drag & drop or</p>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files);
                              files.forEach(file => {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setConfig(prev => ({
                                    ...prev,
                                    site: {
                                      ...prev.site,
                                      slideshowImages: [...(prev.site.slideshowImages || []), reader.result]
                                    }
                                  }));
                                };
                                reader.readAsDataURL(file);
                              });
                            }}
                            className="hidden"
                            id="slideshowImages"
                          />
                          <label
                            htmlFor="slideshowImages"
                            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors text-xs font-medium"
                          >
                            <Camera size={14} />
                            <span>Add Images</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="border-b-4 border-double border-purple-200">
          <button
            onClick={() => handleToggleSection('header')}
            className="w-full p-4 flex items-center justify-between text-left bg-purple-50 hover:bg-purple-100 transition-colors"
          >
            <span className="font-semibold text-gray-700 text-sm sm:text-base flex items-center gap-3">
              <Layout size={18} sm:size={20} className="text-purple-600" />
              Header Configuration
            </span>
            {headerExpanded ? <ChevronUp size={20} className="text-purple-600" /> : <ChevronDown size={20} className="text-purple-600" />}
          </button>
          <div className={`p-4 sm:p-6 bg-purple-50/30 ${headerExpanded ? 'block' : 'hidden'}`}>
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Logo & Branding</h4>
                  <input
                    type="number"
                    value={config.header?.logoBrandingOrder || 1}
                    onChange={(e) => setConfig({ ...config, header: { ...config.header, logoBrandingOrder: parseInt(e.target.value) || 1 } })}
                    className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-xs text-center"
                    placeholder="Order"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo</label>
                    <div className="flex items-center gap-3">
                      {config.header?.logoBase64 && (
                        <div className="relative">
                          <img src={config.header.logoBase64} alt="Logo" className="h-12 object-contain rounded-lg border border-gray-200" />
                          <button
                            onClick={() => setConfig({ ...config, header: { ...config.header, logoBase64: '' } })}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      )}
                      <div
                        className={`flex-1 border-2 border-dashed rounded-lg p-4 transition-all ${
                          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={(e) => handleDrop(e, 'logo')}
                      >
                        <div className="text-center">
                          <Upload size={20} className="text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500 mb-2">Drag & drop or</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileSelect(e, 'logo')}
                            className="hidden"
                            id="headerLogo"
                          />
                          <label
                            htmlFor="headerLogo"
                            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors text-xs font-medium"
                          >
                            <Camera size={14} />
                            <span>Browse</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo Text</label>
                    <input
                      type="text"
                      value={config.header?.logoText || ''}
                      onChange={(e) => setConfig({ ...config, header: { ...config.header, logoText: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                      placeholder="Logo text"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Search Settings</h4>
                  <input
                    type="number"
                    value={config.header?.searchSettingsOrder || 2}
                    onChange={(e) => setConfig({ ...config, header: { ...config.header, searchSettingsOrder: parseInt(e.target.value) || 2 } })}
                    className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-xs text-center"
                    placeholder="Order"
                  />
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.header?.showSearchIcon || false}
                      onChange={(e) => setConfig({ ...config, header: { ...config.header, showSearchIcon: e.target.checked } })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-0 shrink-0"
                    />
                    <span className="text-sm font-medium text-gray-700">Show Search Icon</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.header?.showLoginIcon || false}
                      onChange={(e) => setConfig({ ...config, header: { ...config.header, showLoginIcon: e.target.checked } })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-0 shrink-0"
                    />
                    <span className="text-sm font-medium text-gray-700">Show Login Icon</span>
                  </label>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Customizable Icons</h4>
                  <input
                    type="number"
                    value={config.header?.customIconsOrder || 4}
                    onChange={(e) => setConfig({ ...config, header: { ...config.header, customIconsOrder: parseInt(e.target.value) || 4 } })}
                    className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-xs text-center"
                    placeholder="Order"
                  />
                </div>
                <button
                  onClick={() => {
                    const newIcon = {
                      title: '',
                      icon: '',
                      linkUrl: '',
                      displayOrder: (config.header?.customIcons?.length || 0) + 1,
                      active: true,
                      showMobile: true,
                      showDesktop: true
                    };
                    setConfig({
                      ...config,
                      header: {
                        ...config.header,
                        customIcons: [...(config.header?.customIcons || []), newIcon]
                      }
                    });
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors text-xs font-medium mb-3"
                >
                  <Plus size={14} />
                  <span>Add Icon</span>
                </button>
                {config.header?.customIcons?.map((icon, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 mb-2 border border-gray-200">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        type="text"
                        value={icon.title}
                        onChange={(e) => {
                          const newIcons = [...config.header.customIcons];
                          newIcons[index].title = e.target.value;
                          setConfig({ ...config, header: { ...config.header, customIcons: newIcons } });
                        }}
                        className="px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-xs"
                        placeholder="Title"
                      />
                      <input
                        type="text"
                        value={icon.icon}
                        onChange={(e) => {
                          const newIcons = [...config.header.customIcons];
                          newIcons[index].icon = e.target.value;
                          setConfig({ ...config, header: { ...config.header, customIcons: newIcons } });
                        }}
                        className="px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-xs"
                        placeholder="Icon name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        type="text"
                        value={icon.linkUrl}
                        onChange={(e) => {
                          const newIcons = [...config.header.customIcons];
                          newIcons[index].linkUrl = e.target.value;
                          setConfig({ ...config, header: { ...config.header, customIcons: newIcons } });
                        }}
                        className="px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-xs"
                        placeholder="Link URL"
                      />
                      <input
                        type="number"
                        value={icon.displayOrder}
                        onChange={(e) => {
                          const newIcons = [...config.header.customIcons];
                          newIcons[index].displayOrder = parseInt(e.target.value) || 0;
                          setConfig({ ...config, header: { ...config.header, customIcons: newIcons } });
                        }}
                        className="px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-xs"
                        placeholder="Order"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={icon.active}
                            onChange={(e) => {
                              const newIcons = [...config.header.customIcons];
                              newIcons[index].active = e.target.checked;
                              setConfig({ ...config, header: { ...config.header, customIcons: newIcons } });
                            }}
                            className="w-3 h-3 text-blue-600 rounded focus:ring-blue-500 shrink-0"
                          />
                          <span className="text-xs text-gray-600">Active</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={icon.showMobile}
                            onChange={(e) => {
                              const newIcons = [...config.header.customIcons];
                              newIcons[index].showMobile = e.target.checked;
                              setConfig({ ...config, header: { ...config.header, customIcons: newIcons } });
                            }}
                            className="w-3 h-3 text-blue-600 rounded focus:ring-blue-500 shrink-0"
                          />
                          <span className="text-xs text-gray-600">Mobile</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={icon.showDesktop}
                            onChange={(e) => {
                              const newIcons = [...config.header.customIcons];
                              newIcons[index].showDesktop = e.target.checked;
                              setConfig({ ...config, header: { ...config.header, customIcons: newIcons } });
                            }}
                            className="w-3 h-3 text-blue-600 rounded focus:ring-blue-500 shrink-0"
                          />
                          <span className="text-xs text-gray-600">Desktop</span>
                        </label>
                      </div>
                      <button
                        onClick={() => {
                          const newIcons = config.header.customIcons.filter((_, i) => i !== index);
                          setConfig({ ...config, header: { ...config.header, customIcons: newIcons } });
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Header Colors</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Background Start</label>
                    <input
                      type="color"
                      value={config.header?.backgroundColor || '#EC4899'}
                      onChange={(e) => setConfig({ ...config, header: { ...config.header, backgroundColor: e.target.value } })}
                      className="w-full h-10 rounded-lg cursor-pointer border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Background End</label>
                    <input
                      type="color"
                      value={config.header?.backgroundColorEnd || '#8B5CF6'}
                      onChange={(e) => setConfig({ ...config, header: { ...config.header, backgroundColorEnd: e.target.value } })}
                      className="w-full h-10 rounded-lg cursor-pointer border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Text Color</label>
                    <input
                      type="color"
                      value={config.header?.textColor || '#FFFFFF'}
                      onChange={(e) => setConfig({ ...config, header: { ...config.header, textColor: e.target.value } })}
                      className="w-full h-10 rounded-lg cursor-pointer border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="border-b-4 border-double border-green-200">
          <button
            onClick={() => handleToggleSection('footer')}
            className="w-full p-4 flex items-center justify-between text-left bg-green-50 hover:bg-green-100 transition-colors"
          >
            <span className="font-semibold text-gray-700 text-sm sm:text-base flex items-center gap-3">
              <Layout size={18} sm:size={20} className="text-green-600" />
              Footer Configuration
            </span>
            {footerExpanded ? <ChevronUp size={20} className="text-green-600" /> : <ChevronDown size={20} className="text-green-600" />}
          </button>
          <div className={`p-4 sm:p-6 bg-green-50/30 ${footerExpanded ? 'block' : 'hidden'}`}>
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Company Information</h4>
                  <input
                    type="number"
                    value={config.footer?.companyInfoOrder || 1}
                    onChange={(e) => setConfig({ ...config, footer: { ...config.footer, companyInfoOrder: parseInt(e.target.value) || 1 } })}
                    className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-xs text-center"
                    placeholder="Order"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
                    <input
                      type="text"
                      value={config.footer?.companyName || ''}
                      onChange={(e) => setConfig({ ...config, footer: { ...config.footer, companyName: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Description</label>
                    <textarea
                      value={config.footer?.companyDescription || ''}
                      onChange={(e) => setConfig({ ...config, footer: { ...config.footer, companyDescription: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none text-sm"
                      rows={2}
                      placeholder="Company description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Social Network Links</label>
                    <button
                      onClick={() => {
                        const newLink = {
                          icon: '',
                          iconLinkUrl: '',
                          iconName: ''
                        };
                        setConfig({
                          ...config,
                          footer: {
                            ...config.footer,
                            socialLinks: [...(config.footer?.socialLinks || []), newLink]
                          }
                        });
                      }}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors text-xs font-medium mb-3"
                    >
                      <Plus size={14} />
                      <span>Add Social Link</span>
                    </button>
                    {config.footer?.socialLinks?.map((link, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 mb-2 border border-gray-200">
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <input
                            type="text"
                            value={link.icon}
                            onChange={(e) => {
                              const newLinks = [...config.footer.socialLinks];
                              newLinks[index].icon = e.target.value;
                              setConfig({ ...config, footer: { ...config.footer, socialLinks: newLinks } });
                            }}
                            className="px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-xs"
                            placeholder="Icon"
                          />
                          <input
                            type="text"
                            value={link.iconLinkUrl}
                            onChange={(e) => {
                              const newLinks = [...config.footer.socialLinks];
                              newLinks[index].iconLinkUrl = e.target.value;
                              setConfig({ ...config, footer: { ...config.footer, socialLinks: newLinks } });
                            }}
                            className="px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-xs"
                            placeholder="Icon Link URL"
                          />
                          <input
                            type="text"
                            value={link.iconName}
                            onChange={(e) => {
                              const newLinks = [...config.footer.socialLinks];
                              newLinks[index].iconName = e.target.value;
                              setConfig({ ...config, footer: { ...config.footer, socialLinks: newLinks } });
                            }}
                            className="px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-xs"
                            placeholder="Icon Name"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const newLinks = config.footer.socialLinks.filter((_, i) => i !== index);
                            setConfig({ ...config, footer: { ...config.footer, socialLinks: newLinks } });
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors text-xs flex items-center gap-1"
                        >
                          <Trash2 size={12} />
                          <span>Remove</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Business Links</h4>
                  <input
                    type="number"
                    value={config.footer?.businessLinksOrder || 2}
                    onChange={(e) => setConfig({ ...config, footer: { ...config.footer, businessLinksOrder: parseInt(e.target.value) || 2 } })}
                    className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-xs text-center"
                    placeholder="Order"
                  />
                </div>
                <button
                  onClick={() => {
                    const newLink = {
                      name: '',
                      linkUrl: ''
                    };
                    setConfig({
                      ...config,
                      footer: {
                        ...config.footer,
                        businessLinks: [...(config.footer?.businessLinks || []), newLink]
                      }
                    });
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors text-xs font-medium mb-3"
                >
                  <Plus size={14} />
                  <span>Add Link</span>
                </button>
                {config.footer?.businessLinks?.map((link, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 mb-2 border border-gray-200">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={link.name}
                        onChange={(e) => {
                          const newLinks = [...config.footer.businessLinks];
                          newLinks[index].name = e.target.value;
                          setConfig({ ...config, footer: { ...config.footer, businessLinks: newLinks } });
                        }}
                        className="px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-xs"
                        placeholder="Link name"
                      />
                      <input
                        type="text"
                        value={link.linkUrl}
                        onChange={(e) => {
                          const newLinks = [...config.footer.businessLinks];
                          newLinks[index].linkUrl = e.target.value;
                          setConfig({ ...config, footer: { ...config.footer, businessLinks: newLinks } });
                        }}
                        className="px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-xs"
                        placeholder="Link URL"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const newLinks = config.footer.businessLinks.filter((_, i) => i !== index);
                        setConfig({ ...config, footer: { ...config.footer, businessLinks: newLinks } });
                      }}
                      className="mt-2 text-red-500 hover:text-red-700 transition-colors text-xs flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      <span>Remove</span>
                    </button>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Contact Us</h4>
                  <input
                    type="number"
                    value={config.footer?.contactUsOrder || 3}
                    onChange={(e) => setConfig({ ...config, footer: { ...config.footer, contactUsOrder: parseInt(e.target.value) || 3 } })}
                    className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-xs text-center"
                    placeholder="Order"
                  />
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      const newFields = [...(config.footer?.contactFields || []), { icon: '', name: '', value: '' }];
                      setConfig({ ...config, footer: { ...config.footer, contactFields: newFields } });
                    }}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors text-xs font-medium mb-3"
                  >
                    <Plus size={14} />
                    <span>Add Contact Field</span>
                  </button>
                  {config.footer?.contactFields?.map((field, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 mb-2 border border-gray-200">
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <input
                          type="text"
                          value={field.icon}
                          onChange={(e) => {
                            const newFields = [...config.footer.contactFields];
                            newFields[index].icon = e.target.value;
                            setConfig({ ...config, footer: { ...config.footer, contactFields: newFields } });
                          }}
                          className="px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-xs"
                          placeholder="Icon"
                        />
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => {
                            const newFields = [...config.footer.contactFields];
                            newFields[index].name = e.target.value;
                            setConfig({ ...config, footer: { ...config.footer, contactFields: newFields } });
                          }}
                          className="px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-xs"
                          placeholder="Name"
                        />
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => {
                            const newFields = [...config.footer.contactFields];
                            newFields[index].value = e.target.value;
                            setConfig({ ...config, footer: { ...config.footer, contactFields: newFields } });
                          }}
                          className="px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-xs"
                          placeholder="Value"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const newFields = config.footer.contactFields.filter((_, i) => i !== index);
                          setConfig({ ...config, footer: { ...config.footer, contactFields: newFields } });
                        }}
                        className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Copyright Section</h4>
                  <input
                    type="number"
                    value={config.footer?.copyrightSectionOrder || 4}
                    onChange={(e) => setConfig({ ...config, footer: { ...config.footer, copyrightSectionOrder: parseInt(e.target.value) || 4 } })}
                    className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-xs text-center"
                    placeholder="Order"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Copyright Text</label>
                    <input
                      type="text"
                      value={config.footer?.copyrightText || ''}
                      onChange={(e) => setConfig({ ...config, footer: { ...config.footer, copyrightText: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                      placeholder="Copyright text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Copyright Links</label>
                    <button
                      onClick={() => {
                        const newLink = {
                          icon: '',
                          linkText: '',
                          linkUrl: ''
                        };
                        setConfig({
                          ...config,
                          footer: {
                            ...config.footer,
                            copyrightLinks: [...(config.footer?.copyrightLinks || []), newLink]
                          }
                        });
                      }}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors text-xs font-medium mb-3"
                    >
                      <Plus size={14} />
                      <span>Add Link</span>
                    </button>
                    {config.footer?.copyrightLinks?.map((link, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 mb-2 border border-gray-200">
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <input
                            type="text"
                            value={link.icon}
                            onChange={(e) => {
                              const newLinks = [...config.footer.copyrightLinks];
                              newLinks[index].icon = e.target.value;
                              setConfig({ ...config, footer: { ...config.footer, copyrightLinks: newLinks } });
                            }}
                            className="px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-xs"
                            placeholder="Icon"
                          />
                          <input
                            type="text"
                            value={link.linkText}
                            onChange={(e) => {
                              const newLinks = [...config.footer.copyrightLinks];
                              newLinks[index].linkText = e.target.value;
                              setConfig({ ...config, footer: { ...config.footer, copyrightLinks: newLinks } });
                            }}
                            className="px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-xs"
                            placeholder="Link Text"
                          />
                          <input
                            type="text"
                            value={link.linkUrl}
                            onChange={(e) => {
                              const newLinks = [...config.footer.copyrightLinks];
                              newLinks[index].linkUrl = e.target.value;
                              setConfig({ ...config, footer: { ...config.footer, copyrightLinks: newLinks } });
                            }}
                            className="px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-xs"
                            placeholder="Link URL"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const newLinks = config.footer.copyrightLinks.filter((_, i) => i !== index);
                            setConfig({ ...config, footer: { ...config.footer, copyrightLinks: newLinks } });
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors text-xs flex items-center gap-1"
                        >
                          <Trash2 size={12} />
                          <span>Remove</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Footer Colors</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Background Start</label>
                    <input
                      type="color"
                      value={config.footer?.backgroundColor || '#1F2937'}
                      onChange={(e) => setConfig({ ...config, footer: { ...config.footer, backgroundColor: e.target.value } })}
                      className="w-full h-10 rounded-lg cursor-pointer border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Background End</label>
                    <input
                      type="color"
                      value={config.footer?.backgroundColorEnd || '#111827'}
                      onChange={(e) => setConfig({ ...config, footer: { ...config.footer, backgroundColorEnd: e.target.value } })}
                      className="w-full h-10 rounded-lg cursor-pointer border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Text Color</label>
                    <input
                      type="color"
                      value={config.footer?.textColor || '#FFFFFF'}
                      onChange={(e) => setConfig({ ...config, footer: { ...config.footer, textColor: e.target.value } })}
                      className="w-full h-10 rounded-lg cursor-pointer border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleSaveConfiguration}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Save size={18} />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteConfiguration;
