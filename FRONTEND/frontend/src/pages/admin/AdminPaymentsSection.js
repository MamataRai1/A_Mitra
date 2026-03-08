import React from 'react';

const AdminPaymentsSection = ({ isDark, payments, onRefund }) => {
  const completed = payments.filter((p) => p.status === 'completed');
  const refunded = payments.filter((p) => p.status === 'refunded');
  const pending = payments.filter((p) => p.status === 'pending');

  const totalCompleted = completed
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)
    .toFixed(2);
  const totalRefunded = refunded
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)
    .toFixed(2);
  const totalPending = pending
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)
    .toFixed(2);

  return (
    <div className="space-y-6">
      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={`rounded-[24px] border p-6 ${isDark ? 'bg-[#1a1625]/60 border-white/10' : 'bg-white border-gray-200 shadow-sm'
            }`}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.22em] opacity-60 mb-1">
            Completed Revenue
          </p>
          <p className="text-2xl font-black text-emerald-400">NPR {totalCompleted}</p>
        </div>
        <div
          className={`rounded-[24px] border p-6 ${isDark ? 'bg-[#1a1625]/60 border-white/10' : 'bg-white border-gray-200 shadow-sm'
            }`}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.22em] opacity-60 mb-1">
            Pending Amounts
          </p>
          <p className="text-2xl font-black text-indigo-400">NPR {totalPending}</p>
        </div>
        <div
          className={`rounded-[24px] border p-6 ${isDark ? 'bg-[#1a1625]/60 border-white/10' : 'bg-white border-gray-200 shadow-sm'
            }`}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.22em] opacity-60 mb-1">
            Refunded Amounts
          </p>
          <p className="text-2xl font-black text-amber-400">NPR {totalRefunded}</p>
        </div>
      </div>

      <div
        className={`rounded-[35px] border overflow-hidden ${isDark ? 'bg-[#1a1625]/40 border-white/10' : 'bg-white border-gray-200 shadow-sm'
          }`}
      >
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Payment History</h2>
          </div>
          <p className="text-xs opacity-60">Total records: {payments.length}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead
              className={`text-[10px] uppercase tracking-[0.2em] font-black ${isDark ? 'bg-white/5 text-gray-500' : 'bg-gray-50 text-gray-400'
                }`}
            >
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Booking</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Method</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
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
                      className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize ${p.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : p.status === 'refunded'
                          ? 'bg-amber-500/10 text-amber-500'
                          : p.status === 'pending'
                            ? 'bg-indigo-500/10 text-indigo-400'
                            : 'bg-white/10'
                        }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {p.status === 'completed' && (
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to refund this payment?')) {
                            onRefund(p.id);
                          }
                        }}
                        className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 text-[11px] font-bold hover:bg-amber-500/40 transition-colors"
                      >
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td className="p-6 text-xs opacity-70 text-center" colSpan={6}>
                    No payment records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentsSection;

