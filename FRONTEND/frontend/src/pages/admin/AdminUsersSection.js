import React from 'react';

const AdminUsersSection = ({
  isDark,
  users,
  totalClients,
  totalProviders,
  onToggleSuspend,
  onSelectUser,
}) => (
  <div
    className={`rounded-[35px] border overflow-hidden ${
      isDark ? 'bg-[#1a1625]/40 border-white/10' : 'bg-white border-gray-200 shadow-sm'
    }`}
  >
    <div className="p-8 border-b border-white/5 flex justify-between items-center">
      <h2 className="text-xl font-bold">Users & Providers</h2>
      <p className="text-xs opacity-60">
        Clients: {totalClients} • Providers: {totalProviders}
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
            <th className="p-6">User</th>
            <th className="p-6">Role</th>
            <th className="p-6">Status</th>
            <th className="p-6 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-indigo-500/5 transition-colors">
              <td
                className="p-6 cursor-pointer"
                onClick={() => onSelectUser && onSelectUser(user)}
              >
                <div className="font-bold">{user.user.username}</div>
                <div className="text-xs opacity-60">{user.user.email}</div>
              </td>
              <td className="p-6">
                <span
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${
                    user.role === 'provider'
                      ? 'bg-amber-500/10 text-amber-500'
                      : user.role === 'admin'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-indigo-500/10 text-indigo-500'
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="p-6 text-sm">
                {user.is_suspended ? (
                  <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold">
                    Suspended
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                    Active
                  </span>
                )}
              </td>
              <td className="p-6">
                <div className="flex items-center justify-center gap-2">
                  {onSelectUser && (
                    <button
                      onClick={() => onSelectUser(user)}
                      className="px-4 py-2 rounded-xl text-xs font-bold uppercase bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all"
                    >
                      View profile
                    </button>
                  )}
                  <button
                    onClick={() =>
                      onToggleSuspend(user.id, user.is_suspended)
                    }
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase ${
                      user.is_suspended
                        ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                        : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'
                    } transition-all`}
                  >
                    {user.is_suspended ? 'Unsuspend' : 'Suspend'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminUsersSection;

