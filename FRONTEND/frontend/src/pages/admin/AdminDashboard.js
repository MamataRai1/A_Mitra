import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api';
import {
    FiUsers,
    FiShield,
    FiAlertTriangle,
    FiTrendingUp,
    FiSettings,
    FiLogOut,
    FiX,
    FiCalendar,
    FiCreditCard,
    FiBarChart2,
    FiStar,
} from 'react-icons/fi';
import AdminOverviewSection from './AdminOverviewSection';
import AdminKycSection from './AdminKycSection';
import AdminUsersSection from './AdminUsersSection';
import AdminReportsSection from './AdminReportsSection';
import AdminSettingsSection from './AdminSettingsSection';
import AdminBookingsSection from './AdminBookingsSection';
import AdminPaymentsSection from './AdminPaymentsSection';
import AdminReviewsSection from './AdminReviewsSection';
import AdminAnalyticsSection from './AdminAnalyticsSection';
import AdminUserProfileModal from './AdminUserProfileModal';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('dark');
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'kyc' | 'manage_users' | 'bookings' | 'payments' | 'reviews' | 'analytics' | 'reports' | 'settings'
    const [selectedIdImage, setSelectedIdImage] = useState(null);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [payments, setPayments] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState(null);

    const isDark = theme === 'dark';

    // --- 1. FETCH REAL DATA FROM DJANGO ---
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchAll = async () => {
            try {
                const [
                    kycRes,
                    usersRes,
                    bookingsRes,
                    paymentsRes,
                    reportsRes,
                ] = await Promise.all([
                    API.get('/admin/pending-kyc/'),
                    API.get('/profiles/'),
                    API.get('/bookings/'),
                    API.get('/payments/'),
                    API.get('/reports/'),
                ]);

                setPendingUsers(kycRes.data || []);
                setAllUsers(usersRes.data || []);
                setBookings(bookingsRes.data || []);
                setPayments(paymentsRes.data || []);
                setReports(reportsRes.data || []);
            } catch (err) {
                console.error("Failed to fetch admin dashboard data:", err);
                if (err.response && err.response.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    // --- 2. HANDLE APPROVE / REJECT ACTIONS ---
    const handleAction = async (profileId, actionType) => {
        try {
            await API.patch(`/admin/verify-user/${profileId}/`, { action: actionType });
            // After approve/reject, remove from pending list
            if (actionType === 'approve' || actionType === 'reject') {
                setPendingUsers(prev => prev.filter(user => user.id !== profileId));
            }
            // Update user suspension state locally for Manage Users table
            if (actionType === 'suspend' || actionType === 'unsuspend') {
                setAllUsers(prev =>
                    prev.map(user =>
                        user.id === profileId
                            ? { ...user, is_suspended: actionType === 'suspend' }
                            : user
                    )
                );
            }
        } catch (err) {
            alert("Action failed. Make sure you are logged in as an Admin.");
        }
    };

    const handleReportStatus = async (reportId, newStatus, actionTaken = 'none', amount = 0) => {
        try {
            const res = await API.patch(`/reports/${reportId}/`, {
                status: newStatus,
                action_taken: actionTaken,
                fine_amount: amount
            });
            setReports(prev =>
                prev.map(r => (r.id === reportId ? { ...r, ...res.data } : r))
            );
        } catch (err) {
            alert("Could not update report status. Ensure backend is running and you have admin privileges.");
        }
    };

    const totalUsers = allUsers.length;
    const totalProviders = allUsers.filter(u => u.role === 'provider').length;
    const totalClients = allUsers.filter(u => u.role === 'client').length;
    const totalBookings = bookings.length;
    const totalRevenue = payments
        .filter(p => p.status === 'completed' || p.status === 'pending')
        .reduce((sum, p) => sum + Number(p.amount || 0), 0)
        .toFixed(2);
    const pendingReports = reports.filter(r => r.status === 'pending').length;

    const handleLogout = () => {
        // Clear all auth/session data and hard-redirect to login
        localStorage.clear();
        window.location.href = '/login';
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0f0c1d] text-white">Loading Command Center...</div>;

    return (
        <div className={`min-h-screen flex ${isDark ? 'bg-[#0f0c1d] text-white' : 'bg-gray-100 text-gray-900'} transition-all duration-500`}>

            {/* --- SIDEBAR --- */}
            <aside className={`w-64 border-r ${isDark ? 'bg-[#1a1625]/80 border-white/10' : 'bg-white border-gray-200'} backdrop-blur-xl p-6 flex flex-col fixed h-full`}>
                <div className="flex items-center gap-3 mb-10 px-2">
                    {/* <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-indigo-600/40">C</div> */}
                    <span className="text-xl font-bold tracking-tight text-indigo-500">AdminPanel</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarItem
                        icon={<FiTrendingUp />}
                        label="Overview"
                        active={activeTab === 'overview'}
                        onClick={() => setActiveTab('overview')}
                    />
                    <SidebarItem
                        icon={<FiShield />}
                        label="KYC Requests"
                        count={pendingUsers.length}
                        active={activeTab === 'kyc'}
                        onClick={() => setActiveTab('kyc')}
                    />
                    <SidebarItem
                        icon={<FiUsers />}
                        label="Manage Users"
                        active={activeTab === 'manage_users'}
                        onClick={() => setActiveTab('manage_users')}
                    />
                    <SidebarItem
                        icon={<FiCalendar />}
                        label="Bookings"
                        active={activeTab === 'bookings'}
                        onClick={() => setActiveTab('bookings')}
                    />
                    <SidebarItem
                        icon={<FiCreditCard />}
                        label="Payments"
                        active={activeTab === 'payments'}
                        onClick={() => setActiveTab('payments')}
                    />
                    <SidebarItem
                        icon={<FiStar />}
                        label="Reviews"
                        active={activeTab === 'reviews'}
                        onClick={() => setActiveTab('reviews')}
                    />
                    <SidebarItem
                        icon={<FiBarChart2 />}
                        label="Analytics"
                        active={activeTab === 'analytics'}
                        onClick={() => setActiveTab('analytics')}
                    />
                    <SidebarItem
                        icon={<FiAlertTriangle />}
                        label="Reports"
                        active={activeTab === 'reports'}
                        onClick={() => setActiveTab('reports')}
                    />
                    <SidebarItem
                        icon={<FiSettings />}
                        label="Settings"
                        active={activeTab === 'settings'}
                        onClick={() => setActiveTab('settings')}
                    />
                </nav>

                <button onClick={handleLogout} className="flex items-center gap-3 p-4 text-red-400 hover:bg-red-400/10 rounded-2xl transition-all font-bold">
                    <FiLogOut /> Logout
                </button>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 ml-64 p-10 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Command Center</h1>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Monitoring platform safety & identity verification.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-2xl text-xs font-bold border border-red-400/40 text-red-400 hover:bg-red-500/10 transition-all"
                        >
                            Logout
                        </button>
                        <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition-all shadow-xl">
                            {isDark ? '☀️' : '🌙'}
                        </button>
                    </div>
                </header>

                {/* --- OVERVIEW / KYC / USERS / REPORTS / SETTINGS --- */}
                {activeTab === 'overview' && (
                    <AdminOverviewSection
                        isDark={isDark}
                        pendingUsers={pendingUsers}
                        onViewId={setSelectedIdImage}
                        onAction={handleAction}
                        users={allUsers}
                        totalClients={totalClients}
                        totalProviders={totalProviders}
                        onGoToManageUsers={() => setActiveTab('manage_users')}
                        onSelectUser={(profile) => setSelectedProfile(profile)}
                    />
                )}

                {activeTab === 'kyc' && (
                    <AdminKycSection
                        isDark={isDark}
                        pendingUsers={pendingUsers}
                        onViewId={setSelectedIdImage}
                        onAction={handleAction}
                    />
                )}

                {activeTab === 'manage_users' && (
                    <AdminUsersSection
                        isDark={isDark}
                        users={allUsers}
                        totalClients={totalClients}
                        totalProviders={totalProviders}
                        onSelectUser={(profile) => setSelectedProfile(profile)}
                        onToggleSuspend={(userId, isSuspended) =>
                            handleAction(userId, isSuspended ? 'unsuspend' : 'suspend')
                        }
                    />
                )}

                {activeTab === 'bookings' && (
                    <AdminBookingsSection
                        isDark={isDark}
                        bookings={bookings}
                    />
                )}

                {activeTab === 'payments' && (
                    <AdminPaymentsSection
                        isDark={isDark}
                        payments={payments}
                    />
                )}

                {activeTab === 'reviews' && (
                    <AdminReviewsSection
                        isDark={isDark}
                        reviews={[]} // hook up when reviews API is integrated on admin side
                        onDelete={() => { }}
                    />
                )}

                {activeTab === 'analytics' && (
                    <AdminAnalyticsSection
                        isDark={isDark}
                        totalUsers={totalUsers}
                        totalProviders={totalProviders}
                        totalClients={totalClients}
                        totalBookings={totalBookings}
                        totalRevenue={totalRevenue}
                    />
                )}

                {activeTab === 'reports' && (
                    <AdminReportsSection
                        isDark={isDark}
                        reports={reports}
                        pendingCount={pendingReports}
                        onChangeStatus={handleReportStatus}
                    />
                )}

                {activeTab === 'settings' && (
                    <AdminSettingsSection isDark={isDark} />
                )}
            </main>

            {/* --- ID VIEW MODAL --- */}
            {selectedIdImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                    <div className={`relative max-w-4xl w-full p-2 rounded-[40px] ${isDark ? 'bg-[#2d2739]' : 'bg-white'}`}>
                        <button
                            onClick={() => setSelectedIdImage(null)}
                            className="absolute -top-4 -right-4 w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                        >
                            <FiX size={24} />
                        </button>
                        <img
                            src={selectedIdImage}
                            alt="Verification Document"
                            className="w-full h-auto max-h-[80vh] object-contain rounded-[32px] shadow-2xl border-4 border-white/10"
                        />
                        <div className="p-6 text-center">
                            <p className="text-sm font-bold opacity-60 uppercase tracking-widest">KYC Identity Document - High Resolution View</p>
                        </div>
                    </div>
                </div>
            )}

            {/* --- USER PROFILE DETAIL MODAL --- */}
            {selectedProfile && (
                <AdminUserProfileModal
                    isDark={isDark}
                    profile={selectedProfile}
                    onClose={() => setSelectedProfile(null)}
                />
            )}
        </div>
    );
};

// Sub-Components
const SidebarItem = ({ icon, label, count, active, onClick }) => (
    <div
        onClick={onClick}
        className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 scale-105' : 'hover:bg-indigo-500/10 opacity-60 hover:opacity-100'}`}
    >
        <div className="flex items-center gap-4 font-bold">
            <span className="text-xl">{icon}</span>
            <span className="text-sm">{label}</span>
        </div>
        {count > 0 && <span className="bg-white/20 px-2 py-1 rounded-lg text-[10px] font-black">{count}</span>}
    </div>
);

export default AdminDashboard;