import React from 'react';

const AdminReportsSection = ({
  isDark,
  reports,
  pendingCount,
  onChangeStatus,
}) => {
  const [activeFineId, setActiveFineId] = React.useState(null);
  const [fineAmount, setFineAmount] = React.useState('');

  const submitAction = (reportId, action_taken, amount = 0) => {
    // Send standard unresolved/resolved status update with the new action
    onChangeStatus(reportId, 'resolved', action_taken, amount);
    setActiveFineId(null);
    setFineAmount('');
  };

  return (
    <div
      className={`rounded-[35px] border overflow-hidden ${isDark ? 'bg-[#1a1625]/40 border-white/10' : 'bg-white border-gray-200 shadow-sm'
        }`}
    >
      <div className="p-8 border-b border-white/5 flex justify-between items-center">
        <h2 className="text-xl font-bold">Safety Reports</h2>
        <p className="text-xs opacity-60">
          Pending: {pendingCount} • Total: {reports.length}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead
            className={`text-[10px] uppercase tracking-[0.2em] font-black ${isDark ? 'bg-white/5 text-gray-500' : 'bg-gray-50 text-gray-400'
              }`}
          >
            <tr>
              <th className="p-6">Reporter</th>
              <th className="p-6">Reported User</th>
              <th className="p-6">Reason / Details</th>
              <th className="p-6">Status / Action Taken</th>
              <th className="p-6 text-center">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {reports.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center opacity-50">
                  No safety reports yet.
                </td>
              </tr>
            )}
            {reports.map((report) => {
              const reporterName = report.reporter?.user?.username || 'Unknown';
              const reportedName = report.reported_user?.user?.username || 'Unknown';
              const created = report.created_at
                ? new Date(report.created_at).toLocaleDateString()
                : '';

              const isResolved = report.status === 'resolved';

              return (
                <tr
                  key={report.id}
                  className="hover:bg-indigo-500/5 transition-colors text-sm"
                >
                  <td className="p-6">
                    <div className="font-bold">{reporterName}</div>
                    <div className="text-xs opacity-60">{created}</div>
                  </td>
                  <td className="p-6">
                    <div className="font-medium text-red-400">{reportedName}</div>
                  </td>
                  <td className="p-6 max-w-xs">
                    <div className="font-bold capitalize mb-1">
                      {report.reason?.replace('_', ' ')}
                    </div>
                    {report.description && (
                      <p className="text-xs opacity-70 truncate" title={report.description}>
                        "{report.description}"
                      </p>
                    )}
                  </td>
                  <td className="p-6">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${isResolved ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                        }`}
                    >
                      {report.status}
                    </span>
                    {report.action_taken && report.action_taken !== 'none' && (
                      <div className="mt-2 text-[10px] uppercase font-black tracking-widest opacity-80 text-orange-400">
                        {report.action_taken}
                        {report.action_taken === 'fine' ? ` (Rs. ${report.fine_amount})` : ''}
                      </div>
                    )}
                  </td>
                  <td className="p-6">
                    {!isResolved && activeFineId !== report.id ? (
                      <div className="flex flex-col gap-2 w-32 ml-auto">
                        <button
                          onClick={() => submitAction(report.id, 'warning')}
                          className="px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          Send Warning
                        </button>
                        <button
                          onClick={() => submitAction(report.id, 'suspension')}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          Suspend User
                        </button>
                        <button
                          onClick={() => setActiveFineId(report.id)}
                          className="px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          Issue Fine
                        </button>
                        <button
                          onClick={() => onChangeStatus(report.id, 'rejected')}
                          className="px-3 py-1.5 mt-1 rounded-lg border border-white/20 text-white/50 hover:bg-white hover:text-black text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          Dismiss (Reject)
                        </button>
                      </div>
                    ) : !isResolved && activeFineId === report.id ? (
                      <div className="flex flex-col gap-2 w-40 ml-auto p-3 rounded-xl bg-orange-500/10 border border-orange-500/30">
                        <label className="text-[10px] font-bold uppercase text-orange-400 tracking-widest">
                          Fine Amount (NPR)
                        </label>
                        <input
                          type="number"
                          value={fineAmount}
                          onChange={(e) => setFineAmount(e.target.value)}
                          placeholder="e.g. 500"
                          className="bg-black/40 text-sm border border-white/10 rounded-lg px-2 py-1 outline-none text-white focus:border-orange-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => setActiveFineId(null)}
                            className="flex-1 px-2 py-1 rounded text-[10px] uppercase font-bold text-white/60 hover:text-white hover:bg-white/10"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => submitAction(report.id, 'fine', fineAmount)}
                            className="flex-1 px-2 py-1 rounded bg-orange-500 text-white text-[10px] uppercase font-bold hover:bg-orange-600"
                          >
                            Save Fine
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-xs opacity-50 italic">
                        Action completed
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReportsSection;

