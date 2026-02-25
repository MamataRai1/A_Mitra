import React from 'react';
import { KycQueue } from './AdminKycSection';

const AdminOverviewSection = ({
  isDark,
  pendingUsers,
  onViewId,
  onAction,
  users = [],
  totalClients = 0,
  totalProviders = 0,
  onGoToManageUsers,
  onSelectUser,
}) => {
  const providers = users.filter((u) => u.role === 'provider');
  const clients = users.filter((u) => u.role === 'client');

  const cardBase =
    'rounded-[32px] border p-6 md:p-8 h-full flex flex-col gap-4 ' +
    (isDark
      ? 'bg-[#1a1625]/60 border-white/10'
      : 'bg-white border-gray-200 shadow-sm');

  const sectionLabel =
    'text-[10px] font-black uppercase tracking-[0.25em] opacity-60 mb-1';

  return (
    <div className="space-y-8">
      {/* Top: quick view of providers vs clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Providers */}
        <div className={cardBase}>
          <div className="flex items-center justify-between">
            <div>
              <p className={sectionLabel}>Directory</p>
              <h2 className="text-xl font-bold">Providers</h2>
              <p className="text-xs opacity-70 mt-1">
                Total providers: <span className="font-semibold">{totalProviders}</span>
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400">
              Companions
            </span>
          </div>

          <div className="mt-4 border-t border-white/5 pt-4 space-y-2 text-sm">
            {providers.slice(0, 6).map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between py-2 px-3 rounded-2xl hover:bg-indigo-500/5 transition-colors cursor-pointer"
                onClick={() => onSelectUser && onSelectUser(user)}
              >
                <div>
                  <div className="font-semibold">{user.user?.username}</div>
                  <div className="text-xs opacity-60">{user.user?.email}</div>
                </div>
                <div className="text-right space-y-1">
                  <span className="block text-[10px] px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-black uppercase tracking-widest">
                    {user.is_verified ? 'Verified' : 'Unverified'}
                  </span>
                  {user.is_suspended && (
                    <span className="block text-[10px] px-3 py-1 rounded-full bg-red-500/10 text-red-400 font-black uppercase tracking-widest">
                      Suspended
                    </span>
                  )}
                </div>
              </div>
            ))}

            {providers.length === 0 && (
              <p className="text-xs opacity-60">
                No providers found yet. Once users start offering services, they
                will show up here.
              </p>
            )}
          </div>

          {onGoToManageUsers && (
            <button
              onClick={onGoToManageUsers}
              className="mt-4 self-end text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all"
            >
              View all users
            </button>
          )}
        </div>

        {/* Clients */}
        <div className={cardBase}>
          <div className="flex items-center justify-between">
            <div>
              <p className={sectionLabel}>Directory</p>
              <h2 className="text-xl font-bold">Clients</h2>
              <p className="text-xs opacity-70 mt-1">
                Total clients: <span className="font-semibold">{totalClients}</span>
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-400">
              Renters
            </span>
          </div>

          <div className="mt-4 border-t border-white/5 pt-4 space-y-2 text-sm">
            {clients.slice(0, 6).map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between py-2 px-3 rounded-2xl hover:bg-indigo-500/5 transition-colors cursor-pointer"
                onClick={() => onSelectUser && onSelectUser(user)}
              >
                <div>
                  <div className="font-semibold">{user.user?.username}</div>
                  <div className="text-xs opacity-60">{user.user?.email}</div>
                </div>
                <div className="text-right space-y-1">
                  <span className="block text-[10px] px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-black uppercase tracking-widest">
                    {user.is_verified ? 'KYC Done' : 'KYC Pending'}
                  </span>
                  {user.is_suspended && (
                    <span className="block text-[10px] px-3 py-1 rounded-full bg-red-500/10 text-red-400 font-black uppercase tracking-widest">
                      Suspended
                    </span>
                  )}
                </div>
              </div>
            ))}

            {clients.length === 0 && (
              <p className="text-xs opacity-60">
                No clients found yet. As people join to book companions, they
                will appear here.
              </p>
            )}
          </div>

          {onGoToManageUsers && (
            <button
              onClick={onGoToManageUsers}
              className="mt-4 self-end text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all"
            >
              Manage users
            </button>
          )}
        </div>
      </div>

      {/* Bottom: KYC queue preview stays here to keep safety in focus */}
      <div className={cardBase}>
        <div className="mb-4">
          <p className={sectionLabel}>Identity & Safety</p>
          <h2 className="text-xl font-bold">KYC Requests in Review</h2>
          <p className="text-xs opacity-70 mt-1">
            Quickly scan pending verifications. Open the KYC tab for full tools.
          </p>
        </div>
        <KycQueue
          isDark={isDark}
          pendingUsers={pendingUsers}
          onViewId={onViewId}
          onAction={onAction}
        />
      </div>
    </div>
  );
};

export default AdminOverviewSection;
