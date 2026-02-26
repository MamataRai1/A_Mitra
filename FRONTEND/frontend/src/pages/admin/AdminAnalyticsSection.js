import React from 'react';

const AdminAnalyticsSection = ({
  isDark,
  totalUsers,
  totalProviders,
  totalClients,
  totalBookings,
  totalRevenue,
}) => {
  const cardBase =
    'rounded-[24px] border p-6 md:p-7 ' +
    (isDark
      ? 'bg-[#1a1625]/60 border-white/10'
      : 'bg-white border-gray-200 shadow-sm');

  const labelClass =
    'text-[10px] font-black uppercase tracking-[0.22em] opacity-60 mb-1';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={cardBase}>
          <p className={labelClass}>Users</p>
          <p className="text-2xl font-black">{totalUsers}</p>
          <p className="text-xs opacity-60 mt-1">
            {totalProviders} providers • {totalClients} clients
          </p>
        </div>
        <div className={cardBase}>
          <p className={labelClass}>Bookings</p>
          <p className="text-2xl font-black">{totalBookings}</p>
          <p className="text-xs opacity-60 mt-1">
            Platform-wide completed & active bookings
          </p>
        </div>
        <div className={cardBase}>
          <p className={labelClass}>Revenue</p>
          <p className="text-2xl font-black">NPR {totalRevenue}</p>
          <p className="text-xs opacity-60 mt-1">
            Sum of confirmed & completed bookings
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsSection;

