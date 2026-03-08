import React from "react";
import { useNavigate } from "react-router-dom";

function ProviderCard({ service, variant = "normal" }) {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/services/${service.id}`);
  };

  const providerName =
    service.provider?.user?.username ||
    service.provider?.user?.first_name ||
    "Provider";

  // Handle avatar URL processing (existing logic)
  let avatarUrl = service.provider?.profile_pic;
  if (avatarUrl) {
    if (!avatarUrl.startsWith('http')) {
      avatarUrl = `http://127.0.0.1:8000${avatarUrl.startsWith('/media/') ? '' : '/media/'}${avatarUrl.replace(/^\/?media\//, '')}`;
    }
  } else {
    avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(providerName)}&backgroundColor=f3f4f6`;
  }

  // Adjust text sizes based on whether it is rendered compactly (e.g. horizontally scrolling list)
  const isCompact = variant === "compact";

  return (
    <div
      className={`group relative overflow-hidden bg-white border border-slate-200 rounded-[24px] transition-all duration-300 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:border-indigo-200 hover:shadow-indigo-500/10 flex flex-col ${isCompact ? "p-5" : "p-6"
        } h-full`}
    >
      {/* Subtle Background Decoration on Hover */}
      <div className="absolute -right-20 -top-20 w-40 h-40 bg-indigo-50 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      {/* Header: Avatar + Title */}
      <div className={`relative z-10 flex items-center gap-3 ${isCompact ? "mb-4" : "mb-5"}`}>
        <img
          src={avatarUrl}
          alt={providerName}
          className={`rounded-full object-cover border-2 border-slate-50 shadow-sm ${isCompact ? "w-10 h-10" : "w-12 h-12"
            }`}
        />
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-slate-900 truncate ${isCompact ? "text-base" : "text-lg"}`}>
            {service.name}
          </h3>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            Hosted by <span className="font-semibold text-slate-700">{providerName}</span>
          </p>
        </div>
      </div>

      {/* Body: Description */}
      <p className={`relative z-10 text-slate-600 flex-grow ${isCompact ? "text-xs mb-4 line-clamp-3" : "text-sm mb-6 line-clamp-2"}`}>
        {service.description}
      </p>

      {/* Footer: Price + Button */}
      <div className="relative z-10 mt-auto pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Rate</span>
          <span className={`font-black text-indigo-600 ${isCompact ? "text-sm" : "text-base"}`}>
            NPR {service.price} <span className="text-xs font-normal text-slate-400">/ hr</span>
          </span>
        </div>

        <button
          onClick={handleView}
          className="w-full py-2.5 rounded-xl bg-slate-50 text-indigo-600 hover:bg-slate-100 font-bold text-sm transition-colors border border-slate-200 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:text-white group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-indigo-500/25"
        >
          View & Book
        </button>
      </div>
    </div>
  );
}

export default ProviderCard;
