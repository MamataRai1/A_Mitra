import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import API from '../../api';

// Fix for default marker icons in react-leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const AdminMapSection = ({ isDark }) => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Default center (Kathmandu, Nepal)
    const defaultCenter = [27.7172, 85.3240];

    const fetchLocations = async () => {
        try {
            const res = await API.get('/admin/locations/');
            setLocations(res.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch live locations:", err);
            setError("Could not load real-time provider locations.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchLocations();

        // Polling interval (every 5 seconds)
        const intervalId = setInterval(fetchLocations, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const timeAgo = (dateString) => {
        const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
        let interval = Math.floor(seconds / 3600);
        if (interval >= 1) return interval + " hour(s) ago";
        interval = Math.floor(seconds / 60);
        if (interval >= 1) return interval + " minute(s) ago";
        return Math.floor(seconds) + " seconds ago";
    };

    const isStale = (dateString) => {
        // Considered stale if older than 20 seconds (since pings run every 5s)
        const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
        return seconds > 20;
    };

    const safeLocations = Array.isArray(locations) ? locations : [];
    const activeCount = safeLocations.filter(loc => !isStale(loc.logged_at)).length;

    return (
        <div className={`rounded-[35px] border overflow-hidden flex flex-col h-[75vh] ${isDark ? 'bg-[#1a1625]/40 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
            <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold">Live Provider Tracking</h2>
                    <p className="text-xs opacity-60 mt-1">
                        Monitoring real-time GPS signals from active service providers.
                    </p>
                </div>

                {/* Stats Widget */}
                <div className="flex gap-4">
                    <div className="text-center px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Total Tracked</div>
                        <div className="text-xl font-black">{safeLocations.length}</div>
                    </div>
                    <div className="text-center px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Active Now</div>
                        <div className="text-xl font-black">{activeCount}</div>
                    </div>
                </div>
            </div>

            {loading && safeLocations.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                </div>
            ) : error ? (
                <div className="flex-1 p-8 text-center text-red-400 font-bold flex flex-col items-center justify-center">
                    <p>{error}</p>
                    <button
                        onClick={fetchLocations}
                        className="mt-4 px-6 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-xs uppercase tracking-widest transition-colors"
                    >
                        Retry Connection
                    </button>
                </div>
            ) : (
                <div className="flex-1 relative z-0">
                    <MapContainer
                        center={safeLocations.length > 0 ? [safeLocations[0].latitude, safeLocations[0].longitude] : defaultCenter}
                        zoom={12}
                        scrollWheelZoom={true}
                        className="w-full h-full"
                    >
                        {/* 
                            For Dark mode we use CartoDB DarkMatter tiles. 
                            For Light mode we use standard OpenStreetMap tiles. 
                        */}
                        {isDark ? (
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            />
                        ) : (
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                        )}

                        {safeLocations.map((loc) => (
                            <Marker
                                key={loc.id}
                                position={[loc.latitude, loc.longitude]}
                                opacity={isStale(loc.logged_at) ? 0.5 : 1}
                            >
                                <Popup className={`${isDark ? 'dark-popup' : ''}`}>
                                    <div className="font-sans text-center">
                                        <div className="font-black text-sm text-indigo-500">{loc.username}</div>
                                        {loc.is_verified && (
                                            <div className="text-[9px] uppercase tracking-widest text-emerald-500 font-bold mb-1">
                                                Verified Provider
                                            </div>
                                        )}
                                        <div className="text-xs opacity-70 mt-2">Last signal:</div>
                                        <div className="font-bold text-xs">
                                            {new Date(loc.logged_at).toLocaleTimeString()}
                                        </div>
                                        <div className="text-[10px] opacity-50 mt-1 italic">
                                            {timeAgo(loc.logged_at)}
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <a
                                                href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-white bg-indigo-500 hover:bg-indigo-600 px-3 py-1.5 rounded text-xs font-bold transition-colors w-full block"
                                            >
                                                Open in Google Maps
                                            </a>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            )}
        </div>
    );
};

export default AdminMapSection;
