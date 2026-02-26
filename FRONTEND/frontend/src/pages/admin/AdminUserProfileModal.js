import React from 'react';

const MEDIA_BASE_URL = 'http://127.0.0.1:8000';

const AdminUserProfileModal = ({ isDark, profile, onClose }) => {
  if (!profile) return null;

  const { user, role, phone_number, address, profile_pic, kyc_id, is_verified, is_suspended, created_at } =
    profile;

  const fullName =
    (user?.first_name || user?.last_name) &&
    `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim();

  const avatarSrc = profile_pic ? (profile_pic.startsWith('http') ? profile_pic : `${MEDIA_BASE_URL}${profile_pic.startsWith('/media/') ? '' : '/media/'}${profile_pic.replace('/media/', '')}`) : null;
  const kycSrc = kyc_id ? (kyc_id.startsWith('http') ? kyc_id : `${MEDIA_BASE_URL}${kyc_id.startsWith('/media/') ? '' : '/media/'}${kyc_id.replace('/media/', '')}`) : null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div
        className={`max-w-4xl w-full rounded-[32px] overflow-hidden ${isDark ? 'bg-[#1a1625] text-white' : 'bg-white text-gray-900'
          } shadow-2xl border border-white/10`}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-60">
              User Profile
            </p>
            <h2 className="text-xl font-bold mt-1">{user?.username}</h2>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {/* Left: avatar and basic info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex flex-col items-center gap-3">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Profile"
                  className="w-28 h-28 rounded-3xl object-cover border border-white/20 shadow-xl"
                />
              ) : (
                <div className="w-28 h-28 rounded-3xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-3xl font-bold">
                  {user?.username?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              <div className="text-center">
                <div className="font-semibold">
                  {fullName || user?.username || 'Unnamed user'}
                </div>
                <div className="text-xs opacity-60">{user?.email}</div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="opacity-60">Role</span>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${role === 'provider'
                      ? 'bg-amber-500/10 text-amber-400'
                      : role === 'admin'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-indigo-500/10 text-indigo-400'
                    }`}
                >
                  {role}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="opacity-60">KYC</span>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${is_verified
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-yellow-500/10 text-yellow-400'
                    }`}
                >
                  {is_verified ? 'Verified' : 'Pending'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="opacity-60">Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${is_suspended
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-emerald-500/10 text-emerald-400'
                    }`}
                >
                  {is_suspended ? 'Suspended' : 'Active'}
                </span>
              </div>

              {created_at && (
                <div className="text-[11px] opacity-60">
                  Joined:{' '}
                  {new Date(created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Middle: contact & address */}
          <div className="md:col-span-1 space-y-4 text-sm">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-60 mb-2">
                Contact
              </p>
              <div
                className={`rounded-2xl p-4 ${isDark ? 'bg-white/5' : 'bg-gray-50'
                  } space-y-2`}
              >
                <div className="flex justify-between">
                  <span className="opacity-70 text-xs">Phone</span>
                  <span className="font-medium text-xs">
                    {phone_number || 'Not provided'}
                  </span>
                </div>
                <div className="border-t border-white/10 my-2" />
                <div className="space-y-1">
                  <span className="opacity-70 text-xs block">Address</span>
                  <p className="text-xs whitespace-pre-wrap">
                    {address || 'No address on file.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: KYC / document preview */}
          <div className="md:col-span-1 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-60 mb-2">
              Identity Document
            </p>

            {kycSrc ? (
              <div
                className={`rounded-3xl overflow-hidden border ${isDark ? 'border-white/10' : 'border-gray-200'
                  } shadow-lg`}
              >
                <img
                  src={kycSrc}
                  alt="KYC document"
                  className="w-full h-40 object-cover"
                />
                <div className="px-4 py-2 text-[11px] opacity-70">
                  Uploaded national ID / document used for verification.
                </div>
              </div>
            ) : (
              <div
                className={`rounded-3xl p-4 text-xs opacity-60 border-dashed border ${isDark ? 'border-white/20' : 'border-gray-300'
                  }`}
              >
                No KYC image attached for this user yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserProfileModal;

