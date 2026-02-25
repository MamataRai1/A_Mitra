import React from 'react';
import { FiEye } from 'react-icons/fi';

export const KycQueue = ({ isDark, pendingUsers, onViewId, onAction }) => (
  <div
    className={`rounded-[35px] border overflow-hidden ${
      isDark ? 'bg-[#1a1625]/40 border-white/10' : 'bg-white border-gray-200 shadow-sm'
    }`}
  >
    <div className="p-8 border-b border-white/5 flex justify-between items-center">
      <h2 className="text-xl font-bold">Identity Verification Queue</h2>
      <p className="text-xs opacity-60">
        Waiting for manual review: {pendingUsers.length}
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
            <th className="p-6">User Details</th>
            <th className="p-6">Role</th>
            <th className="p-6">Submitted At</th>
            <th className="p-6 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {pendingUsers.length > 0 ? (
            pendingUsers.map((profile) => (
              <tr
                key={profile.id}
                className="hover:bg-indigo-500/5 transition-colors"
              >
                <td className="p-6">
                  <div className="font-bold text-lg">
                    {profile.user.username}
                  </div>
                  <div className="text-xs opacity-50">
                    {profile.user.email}
                  </div>
                </td>
                <td className="p-6">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${
                      profile.role === 'provider'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-indigo-500/10 text-indigo-500'
                    }`}
                  >
                    {profile.role}
                  </span>
                </td>
                <td className="p-6 text-sm opacity-60 font-medium">
                  {new Date(profile.created_at).toLocaleDateString()}
                </td>
                <td className="p-6">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onViewId(profile.kyc_id)}
                      className="p-3 rounded-xl bg-indigo-600/10 text-indigo-500 hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      <FiEye size={18} />
                    </button>
                    <button
                      onClick={() => onAction(profile.id, 'approve')}
                      className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all font-bold text-xs uppercase"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onAction(profile.id, 'reject')}
                      className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold text-xs uppercase"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="4"
                className="p-10 text-center opacity-50"
              >
                No pending verification requests.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const AdminKycSection = ({ isDark, pendingUsers, onViewId, onAction }) => (
  <div className="space-y-6">
    <div className="max-w-3xl mb-2">
      <h2 className="text-xl font-bold mb-1">KYC & Safety Verification</h2>
      <p
        className={`text-sm ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        Every renter and companion must upload a valid citizenship ID and pass
        face verification. Service providers are also tracked via GPS during
        active bookings and can trigger emergency alerts; renters can file
        safety reports if they see misleading identity (different person shows
        up) or unsafe behaviour.
      </p>
    </div>

    <KycQueue
      isDark={isDark}
      pendingUsers={pendingUsers}
      onViewId={onViewId}
      onAction={onAction}
    />
  </div>
);

export default AdminKycSection;

