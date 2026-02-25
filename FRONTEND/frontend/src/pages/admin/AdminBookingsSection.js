import React from 'react';

const AdminBookingsSection = ({ isDark, bookings }) => {
  return (
    <div
      className={`rounded-[35px] border overflow-hidden ${
        isDark ? 'bg-[#1a1625]/40 border-white/10' : 'bg-white border-gray-200 shadow-sm'
      }`}
    >
      <div className="p-8 border-b border-white/5 flex justify-between items-center">
        <h2 className="text-xl font-bold">All Bookings</h2>
        <p className="text-xs opacity-60">Total: {bookings.length}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead
            className={`text-[10px] uppercase tracking-[0.2em] font-black ${
              isDark ? 'bg-white/5 text-gray-500' : 'bg-gray-50 text-gray-400'
            }`}
          >
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Service</th>
              <th className="p-4">Client</th>
              <th className="p-4">Provider</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {bookings.map((b) => {
              const serviceName = b.service?.name || 'Service';
              const clientName =
                b.client?.user?.username || b.client?.user?.first_name || 'Client';
              const providerName =
                b.service?.provider?.user?.username ||
                b.service?.provider?.user?.first_name ||
                'Provider';
              const date = b.booking_date
                ? new Date(b.booking_date).toLocaleString()
                : 'N/A';
              return (
                <tr key={b.id} className="hover:bg-indigo-500/5 transition-colors">
                  <td className="p-4 text-xs opacity-60">#{b.id}</td>
                  <td className="p-4">
                    <div className="font-semibold">{serviceName}</div>
                  </td>
                  <td className="p-4 text-xs">{clientName}</td>
                  <td className="p-4 text-xs">{providerName}</td>
                  <td className="p-4 text-xs opacity-70">{date}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold capitalize">
                      {b.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {bookings.length === 0 && (
              <tr>
                <td className="p-6 text-xs opacity-70" colSpan={6}>
                  No bookings found yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBookingsSection;

