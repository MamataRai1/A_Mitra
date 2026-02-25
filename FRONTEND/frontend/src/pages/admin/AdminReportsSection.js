import React from 'react';

const AdminReportsSection = ({
  isDark,
  reports,
  pendingCount,
  onChangeStatus,
}) => (
  <div
    className={`rounded-[35px] border overflow-hidden ${
      isDark ? 'bg-[#1a1625]/40 border-white/10' : 'bg-white border-gray-200 shadow-sm'
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
          className={`text-[10px] uppercase tracking-[0.2em] font-black ${
            isDark ? 'bg-white/5 text-gray-500' : 'bg-gray-50 text-gray-400'
          }`}
        >
          <tr>
            <th className="p-6">Reporter</th>
            <th className="p-6">Reported User</th>
            <th className="p-6">Reason</th>
            <th className="p-6">Status</th>
            <th className="p-6 text-center">Action</th>
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
            const reporterName =
              report.reporter?.user?.username || 'Unknown';
            const reportedName =
              report.reported_user?.user?.username || 'Unknown';
            const created = report.created_at
              ? new Date(report.created_at).toLocaleDateString()
              : '';
            return (
              <tr
                key={report.id}
                className="hover:bg-indigo-500/5 transition-colors"
              >
                <td className="p-6">
                  <div className="font-bold">{reporterName}</div>
                  <div className="text-xs opacity-60">{created}</div>
                </td>
                <td className="p-6">
                  <div className="font-medium">{reportedName}</div>
                </td>
                <td className="p-6 text-sm capitalize">
                  {report.reason?.replace('_', ' ')}
                </td>
                <td className="p-6">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase">
                    {report.status}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onChangeStatus(report.id, 'reviewed')}
                      className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Mark Reviewed
                    </button>
                    <button
                      onClick={() => onChangeStatus(report.id, 'resolved')}
                      className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => onChangeStatus(report.id, 'rejected')}
                      className="px-3 py-1 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminReportsSection;

