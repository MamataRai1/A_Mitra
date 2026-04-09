import React from 'react';

const AdminAnalyticsSection = ({
  isDark,
  totalUsers,
  totalProviders,
  totalClients,
  totalBookings,
  totalRevenue,
  payments = [],
  bookings = [],
  reports = [],
}) => {
  const cardBase =
    'rounded-[24px] border p-6 md:p-7 ' +
    (isDark ? 'bg-[#1a1625]/60 border-white/10' : 'bg-white border-gray-200 shadow-sm');
  const labelClass = 'text-[10px] font-black uppercase tracking-[0.22em] opacity-60 mb-1';

  // --- REVENUE CALCS ---
  const completedStats = payments.filter((p) => p.status?.toLowerCase() === 'completed');
  const pendingStats = payments.filter((p) => p.status?.toLowerCase() === 'pending');
  const refundedStats = payments.filter((p) => p.status?.toLowerCase() === 'refunded');

  const sumCompleted = completedStats.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const sumPending = pendingStats.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const sumRefunded = refundedStats.reduce((acc, p) => acc + Number(p.amount || 0), 0);

  const totalVolume = sumCompleted + sumPending + sumRefunded;

  const widthCompleted = totalVolume > 0 ? (sumCompleted / totalVolume) * 100 : 0;
  const widthPending = totalVolume > 0 ? (sumPending / totalVolume) * 100 : 0;
  const widthRefunded = totalVolume > 0 ? (sumRefunded / totalVolume) * 100 : 0;

  // --- MOST ACTIVE RENTERS CALCS ---
  const clientMap = {};

  bookings.forEach((b) => {
    if (!b.client || !b.client.user) return;
    const clientId = b.client.id;
    if (!clientMap[clientId]) {
      clientMap[clientId] = {
        name: b.client.user.username || 'Unknown',
        completedCount: 0,
        totalCount: 0,
        totalSpent: 0,
      };
    }

    clientMap[clientId].totalCount += 1;
    if (b.status === 'completed') {
      clientMap[clientId].completedCount += 1;
      clientMap[clientId].totalSpent += Number(b.service?.price || 0);
    }
  });

  const topRenters = Object.values(clientMap)
    .sort((a, b) => b.totalSpent - a.totalSpent || b.totalCount - a.totalCount)
    .slice(0, 5); // Top 5

  // --- SAFETY CALCS ---
  const totalReports = reports.length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const resolvedReports = reports.filter(r => r.status === 'resolved').length;

  const reasonMap = {};
  const userReportMap = {};

  reports.forEach(r => {
    // Tally reasons
    const reason = r.reason ? r.reason.replace('_', ' ') : 'other';
    reasonMap[reason] = (reasonMap[reason] || 0) + 1;

    // Tally reported users
    if (r.reported_user && r.reported_user.user) {
      const uid = r.reported_user.id;
      if (!userReportMap[uid]) {
        userReportMap[uid] = {
          name: r.reported_user.user.username || 'Unknown',
          role: r.reported_user.role,
          count: 0
        };
      }
      userReportMap[uid].count += 1;
    }
  });

  const frequentReasons = Object.entries(reasonMap).sort((a, b) => b[1] - a[1]);
  const allReported = Object.values(userReportMap).sort((a, b) => b.count - a.count);
  const topReportedUsers = allReported.slice(0, 5);
  const topReportedRenters = allReported.filter(u => u.role === 'client').slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 1. Global Platform Overview */}
      <h2 className="text-xl font-bold px-2">Global Overview</h2>
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
          <p className="text-xs opacity-60 mt-1">Platform-wide total logged bookings</p>
        </div>
        <div className={cardBase}>
          <p className={labelClass}>Est. Revenue</p>
          <p className="text-2xl font-black text-emerald-400">NPR {totalRevenue}</p>
          <p className="text-xs opacity-60 mt-1">Matches "completed + pending" sum</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* 2. Detailed Revenue Statistics */}
        <div className={cardBase}>
          <h2 className="text-lg font-bold mb-6">Revenue Distribution</h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="opacity-60">Completed ({completedStats.length})</span>
                <span className="font-bold text-emerald-400">NPR {sumCompleted.toFixed(2)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${widthCompleted}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="opacity-60">Pending ({pendingStats.length})</span>
                <span className="font-bold text-indigo-400">NPR {sumPending.toFixed(2)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-indigo-400 rounded-full"
                  style={{ width: `${widthPending}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="opacity-60">Refunded ({refundedStats.length})</span>
                <span className="font-bold text-amber-500">NPR {sumRefunded.toFixed(2)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${widthRefunded}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-white/10 flex justify-between items-center text-sm">
              <span className="font-black uppercase tracking-widest text-[10px] opacity-50">Total Processed Volume</span>
              <span className="font-black">NPR {totalVolume.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* 3. Most Active Renters */}
        <div className={cardBase}>
          <h2 className="text-lg font-bold mb-6">Most Active Renters</h2>
          {topRenters.length === 0 ? (
            <p className="text-xs opacity-50">No renters have booked services yet.</p>
          ) : (
            <div className="space-y-4">
              {topRenters.map((renter, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-black flex items-center justify-center text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate max-w-[120px]">{renter.name}</p>
                      <p className="text-[10px] opacity-60">
                        {renter.completedCount} completed out of {renter.totalCount}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-emerald-400">NPR {renter.totalSpent.toFixed(2)}</p>
                    <p className="text-[9px] uppercase tracking-wider opacity-40">Lifetime Value</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Platform Safety Statistics */}
      <h2 className="text-xl font-bold px-2 mt-10">Platform Safety & Moderation</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={cardBase}>
          <p className={labelClass}>Total Reports</p>
          <p className="text-2xl font-black">{totalReports}</p>
          <p className="text-xs opacity-60 mt-1">All safety flags submitted</p>
        </div>
        <div className={cardBase}>
          <p className={labelClass}>Pending Reviews</p>
          <p className="text-2xl font-black text-amber-500">{pendingReports}</p>
          <p className="text-xs opacity-60 mt-1">Requires admin attention</p>
        </div>
        <div className={cardBase}>
          <p className={labelClass}>Resolved</p>
          <p className="text-2xl font-black text-emerald-400">{resolvedReports}</p>
          <p className="text-xs opacity-60 mt-1">Actions taken & closed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">

        {/* Frequent Report Reasons */}
        <div className={cardBase}>
          <h2 className="text-lg font-bold mb-6">Frequent Issues</h2>
          {frequentReasons.length === 0 ? (
            <p className="text-xs opacity-50">No reports exist.</p>
          ) : (
            <div className="space-y-4">
              {frequentReasons.map(([reason, count], idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="opacity-80 capitalize">{reason}</span>
                    <span className="font-bold">{count}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-red-400 rounded-full"
                      style={{ width: `${(count / totalReports) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most Reported Users (All) */}
        <div className={cardBase}>
          <h2 className="text-lg font-bold mb-6">Most Reported Users</h2>
          {topReportedUsers.length === 0 ? (
            <p className="text-xs opacity-50">No offenders found.</p>
          ) : (
            <div className="space-y-3">
              {topReportedUsers.map((user, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-red-400">{user.name}</p>
                    <p className="text-[10px] opacity-60 uppercase tracking-widest">{user.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black">{user.count}</p>
                    <p className="text-[9px] uppercase tracking-wider opacity-40">Flags</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most Reported Renters (Clients) */}
        <div className={cardBase}>
          <h2 className="text-lg font-bold mb-6">Most Reported Renters</h2>
          {topReportedRenters.length === 0 ? (
            <p className="text-xs opacity-50">No clients reported.</p>
          ) : (
            <div className="space-y-3">
              {topReportedRenters.map((client, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-orange-500/5 border border-orange-500/10 hover:bg-orange-500/10 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-orange-400">{client.name}</p>
                    <p className="text-[10px] opacity-60 uppercase tracking-widest">Client</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black">{client.count}</p>
                    <p className="text-[9px] uppercase tracking-wider opacity-40">Flags</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminAnalyticsSection;

