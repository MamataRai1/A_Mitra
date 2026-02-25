import React from 'react';

const AdminPaymentsSection = ({ isDark, payments }) => {
  const completed = payments.filter((p) => p.status === 'completed');
  const totalCompleted = completed
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)
    .toFixed(2);

  return (
    <div
      className={`rounded-[35px] border overflow-hidden ${
        isDark ? 'bg-[#1a1625]/40 border-white/10' : 'bg-white border-gray-200 shadow-sm'
      }`}
    >
      <div className="p-8 border-b border-white/5 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Payments & Revenue</h2>
          <p className="text-xs opacity-60">
            Completed revenue: NPR {totalCompleted}
          </p>
        </div>
        <p className="text-xs opacity-60">Total records: {payments.length}</p>
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
              <th className="p-4">Booking</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Method</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-indigo-500/5 transition-colors">
                <td className="p-4 text-xs opacity-60">#{p.id}</td>
                <td className="p-4 text-xs">
                  #{p.booking?.id} – {p.booking?.service?.name || 'Service'}
                </td>
                <td className="p-4 font-semibold">NPR {p.amount}</td>
                <td className="p-4 text-xs capitalize">{p.method}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize ${
                      p.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : p.status === 'refunded'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-white/10'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td className="p-6 text-xs opacity-70" colSpan={5}>
                  No payment records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPaymentsSection;

