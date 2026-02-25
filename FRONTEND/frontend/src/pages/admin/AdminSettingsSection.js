import React from 'react';

const AdminSettingsSection = ({ isDark }) => (
  <div
    className={`rounded-[35px] border mt-4 p-8 ${
      isDark ? 'bg-[#1a1625]/40 border-white/10' : 'bg-white border-gray-200 shadow-sm'
    }`}
  >
    <h2 className="text-xl font-bold mb-2">Platform Settings</h2>
    <p
      className={`text-sm ${
        isDark ? 'text-gray-400' : 'text-gray-600'
      }`}
    >
      Here you can later manage categories, pricing rules, banners, and other
      system-wide settings. For now this section is just a placeholder to keep
      the layout clean and separated by topic.
    </p>
  </div>
);

export default AdminSettingsSection;

