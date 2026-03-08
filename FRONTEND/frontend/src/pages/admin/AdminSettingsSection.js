import React, { useState, useEffect } from 'react';
import API from '../../api';
import { FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';

const AdminSettingsSection = ({ isDark }) => {
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState('');

  const [pricingRules, setPricingRules] = useState({
    commissionPercentage: 10,
    minimumPrice: 500
  });

  const [siteContent, setSiteContent] = useState({
    announcementBanner: '',
    welcomeText: ''
  });

  const [loading, setLoading] = useState(true);

  // Load existing settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await API.get('/settings/');
        const data = res.data; // array of SystemSetting objects

        const catSetting = data.find(s => s.key === 'service_categories');
        if (catSetting && catSetting.value) setCategories(catSetting.value);

        const priceSetting = data.find(s => s.key === 'pricing_rules');
        if (priceSetting && priceSetting.value) setPricingRules(priceSetting.value);

        const contentSetting = data.find(s => s.key === 'site_content');
        if (contentSetting && contentSetting.value) setSiteContent(contentSetting.value);
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Update backend setting
  const saveSetting = async (key, value) => {
    try {
      // We will try to update using PATCH (or PUT) if exists, else POST
      try {
        await API.patch(`/settings/${key}/`, { value });
      } catch (err) {
        // If 404, it means it doesn't exist yet, so we create it
        if (err.response && err.response.status === 404) {
          await API.post('/settings/', { key, value });
        } else {
          throw err;
        }
      }
      alert(`Settings for ${key} saved successfully!`);
    } catch (err) {
      alert(`Failed to save ${key}.`);
      console.error(err);
    }
  };

  const handleAddCategory = () => {
    if (!newCat.trim()) return;
    if (categories.includes(newCat.trim())) return;
    setCategories([...categories, newCat.trim()]);
    setNewCat('');
  };

  const handleRemoveCategory = (cat) => {
    setCategories(categories.filter(c => c !== cat));
  };

  const handleSaveCategories = () => saveSetting('service_categories', categories);
  const handleSavePricing = () => saveSetting('pricing_rules', pricingRules);
  const handleSaveContent = () => saveSetting('site_content', siteContent);

  const cardBase = `rounded-[24px] border p-6 md:p-7 ${isDark ? 'bg-[#1a1625]/60 border-white/10' : 'bg-white border-gray-200 shadow-sm'
    }`;

  const inputClass = `w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors ${isDark
      ? 'bg-black/20 border-white/10 text-white focus:border-indigo-500'
      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500 hover:border-gray-300'
    }`;

  const labelClass = 'text-xs font-bold uppercase tracking-widest opacity-60 mb-2 block';

  if (loading) return <div className="animate-pulse">Loading settings...</div>;

  return (
    <div className="space-y-6">

      {/* 1. Manage Categories */}
      <div className={cardBase}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Manage Categories</h2>
          <button
            onClick={handleSaveCategories}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
          >
            <FiSave /> Save Categories
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              placeholder="New Category Name (e.g. Virtual Assistant)"
              className={inputClass}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <button
              onClick={handleAddCategory}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 rounded-xl font-bold flex items-center justify-center transition-colors shadow-lg shadow-emerald-500/20"
            >
              <FiPlus />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {categories.length === 0 && <p className="text-sm opacity-50">No categories defined yet.</p>}
            {categories.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-2 rounded-full text-sm font-bold">
                {cat}
                <button onClick={() => handleRemoveCategory(cat)} className="hover:text-red-400 transition-colors ml-1">
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Pricing Rules */}
      <div className={cardBase}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Pricing Rules</h2>
          <button
            onClick={handleSavePricing}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
          >
            <FiSave /> Save Pricing
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Platform Commission (%)</label>
            <input
              type="number"
              value={pricingRules.commissionPercentage}
              onChange={(e) => setPricingRules({ ...pricingRules, commissionPercentage: Number(e.target.value) })}
              className={inputClass}
            />
            <p className="text-[10px] opacity-50 mt-2">Percentage deducted from provider payouts.</p>
          </div>
          <div>
            <label className={labelClass}>Global Minimum Price (NPR)</label>
            <input
              type="number"
              value={pricingRules.minimumPrice}
              onChange={(e) => setPricingRules({ ...pricingRules, minimumPrice: Number(e.target.value) })}
              className={inputClass}
            />
            <p className="text-[10px] opacity-50 mt-2">Services cannot be priced lower than this amount.</p>
          </div>
        </div>
      </div>

      {/* 3. Site Content */}
      <div className={cardBase}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Site Content</h2>
          <button
            onClick={handleSaveContent}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
          >
            <FiSave /> Save Content
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className={labelClass}>Announcement Banner</label>
            <input
              type="text"
              value={siteContent.announcementBanner}
              onChange={(e) => setSiteContent({ ...siteContent, announcementBanner: e.target.value })}
              placeholder="e.g. Server maintenance scheduled for tonight at 11 PM"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Client Welcome Text</label>
            <textarea
              rows={3}
              value={siteContent.welcomeText}
              onChange={(e) => setSiteContent({ ...siteContent, welcomeText: e.target.value })}
              placeholder="Welcome to our platform!"
              className={inputClass}
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminSettingsSection;

