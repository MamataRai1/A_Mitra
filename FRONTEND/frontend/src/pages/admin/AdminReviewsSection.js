import React from 'react';

const AdminReviewsSection = ({ isDark, reviews, onDelete }) => {
  return (
    <div
      className={`rounded-[35px] border overflow-hidden ${
        isDark ? 'bg-[#1a1625]/40 border-white/10' : 'bg-white border-gray-200 shadow-sm'
      }`}
    >
      <div className="p-8 border-b border-white/5 flex justify-between items-center">
        <h2 className="text-xl font-bold">Reviews Moderation</h2>
        <p className="text-xs opacity-60">Total: {reviews.length}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead
            className={`text-[10px] uppercase tracking-[0.2em] font-black ${
              isDark ? 'bg-white/5 text-gray-500' : 'bg-gray-50 text-gray-400'
            }`}
          >
            <tr>
              <th className="p-4">Service</th>
              <th className="p-4">Client</th>
              <th className="p-4">Rating</th>
              <th className="p-4">Comment</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {reviews.map((r) => {
              const serviceName = r.booking?.service?.name || 'Service';
              const clientName =
                r.booking?.client?.user?.username ||
                r.booking?.client?.user?.first_name ||
                'Client';
              return (
                <tr key={r.id} className="hover:bg-indigo-500/5 transition-colors">
                  <td className="p-4">{serviceName}</td>
                  <td className="p-4 text-xs">{clientName}</td>
                  <td className="p-4 text-xs">{r.rating}/5</td>
                  <td className="p-4 text-xs max-w-xs">
                    <span className="line-clamp-2">{r.comment || '—'}</span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => onDelete(r.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold uppercase bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
            {reviews.length === 0 && (
              <tr>
                <td className="p-6 text-xs opacity-70" colSpan={5}>
                  No reviews yet to moderate.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReviewsSection;

