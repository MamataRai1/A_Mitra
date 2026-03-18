import React, { useState } from 'react';
import API from '../../api';
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';

const AdminServicesSection = ({
    isDark,
    services,
    providers,
    categories,
    setServices,
}) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    // Form states
    const [providerId, setProviderId] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setProviderId('');
        setName('');
        setDescription('');
        setCategory('');
        setPrice('');
        setIsActive(true);
        setSelectedService(null);
        setLoading(false);
    };

    const handleOpenCreate = () => {
        resetForm();
        setIsCreateModalOpen(true);
    };

    const handleOpenEdit = (service) => {
        resetForm();
        setSelectedService(service);
        setProviderId(service.provider?.id || '');
        setName(service.name || '');
        setDescription(service.description || '');
        setCategory(service.category || '');
        setPrice(service.price || '');
        setIsActive(service.is_active);
        setIsEditModalOpen(true);
    };

    const handleCreateService = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Intercept custom category (like in ProviderDashboard)
            const trimmedCat = category.trim();
            if (trimmedCat && !categories.some(c => c.toLowerCase() === trimmedCat.toLowerCase())) {
                const updatedCategories = [...categories, trimmedCat];
                try {
                    await API.patch(`/settings/service_categories/`, { value: updatedCategories });
                } catch (err) {
                    if (err.response && err.response.status === 404) {
                        await API.post('/settings/', { key: 'service_categories', value: updatedCategories });
                    }
                }
            }

            const res = await API.post('/services/', {
                provider_id: providerId,
                name,
                description,
                category: trimmedCat,
                price: price || '0',
                is_active: isActive
            });
            setServices(prev => [...prev, res.data]);
            setIsCreateModalOpen(false);
        } catch (err) {
            alert("Failed to create service. Please check your inputs.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditService = async (e) => {
        e.preventDefault();
        if (!selectedService) return;
        setLoading(true);

        try {
            const trimmedCat = category.trim();
            if (trimmedCat && !categories.some(c => c.toLowerCase() === trimmedCat.toLowerCase())) {
                const updatedCategories = [...categories, trimmedCat];
                try {
                    await API.patch(`/settings/service_categories/`, { value: updatedCategories });
                } catch (err) {
                    if (err.response && err.response.status === 404) {
                        await API.post('/settings/', { key: 'service_categories', value: updatedCategories });
                    }
                }
            }

            const res = await API.patch(`/services/${selectedService.id}/`, {
                name,
                description,
                category: trimmedCat,
                price: price || '0',
                is_active: isActive
            });
            setServices(prev => prev.map(s => s.id === selectedService.id ? { ...s, ...res.data } : s));
            setIsEditModalOpen(false);
        } catch (err) {
            alert("Failed to update service.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteService = async (id) => {
        if (!window.confirm("Are you sure you want to delete this service?")) return;
        try {
            await API.delete(`/services/${id}/`);
            setServices(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            alert("Failed to delete service.");
            console.error(err);
        }
    };

    // Table rendering
    return (
        <div className={`rounded-[35px] border overflow-hidden ${isDark ? 'bg-[#1a1625]/40 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold">Manage Services</h2>
                    <p className="text-xs opacity-60">Total Services: {services.length}</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
                >
                    <FiPlus /> Add New Service
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className={`text-[10px] uppercase tracking-[0.2em] font-black ${isDark ? 'bg-white/5 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
                        <tr>
                            <th className="p-6">Provider</th>
                            <th className="p-6">Service Name</th>
                            <th className="p-6">Category</th>
                            <th className="p-6">Price</th>
                            <th className="p-6 text-center">Status</th>
                            <th className="p-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {services.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center opacity-50">No services found.</td>
                            </tr>
                        ) : (
                            services.map((service) => (
                                <tr key={service.id} className="hover:bg-indigo-500/5 transition-colors text-sm">
                                    <td className="p-6">
                                        <div className="font-bold">{service.provider?.user?.username || 'Unknown'}</div>
                                    </td>
                                    <td className="p-6 font-medium text-indigo-400">
                                        {service.name}
                                    </td>
                                    <td className="p-6 opacity-80 capitalize">
                                        {service.category}
                                    </td>
                                    <td className="p-6 font-bold truncate">
                                        Rs. {service.price}
                                    </td>
                                    <td className="p-6 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${service.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {service.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => handleOpenEdit(service)}
                                                className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all tooltip-trigger"
                                                title="Edit Service"
                                            >
                                                <FiEdit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteService(service.id)}
                                                className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all tooltip-trigger"
                                                title="Delete Service"
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {(isCreateModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className={`relative w-full max-w-lg p-8 rounded-[30px] border ${isDark ? 'bg-[#1a1625] border-white/10' : 'bg-white border-gray-200'} shadow-2xl`}>
                        <button
                            onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <FiX size={20} />
                        </button>
                        
                        <h3 className="text-2xl font-bold mb-6">
                            {isCreateModalOpen ? 'Create New Service' : 'Edit Service'}
                        </h3>

                        <form onSubmit={isCreateModalOpen ? handleCreateService : handleEditService} className="space-y-4">
                            
                            {/* Provider Selection (only on Create) */}
                            {isCreateModalOpen && (
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider opacity-60 mb-2">Assign to Provider</label>
                                    <select
                                        required
                                        value={providerId}
                                        onChange={(e) => setProviderId(e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border outline-none ${isDark ? 'bg-black/20 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                    >
                                        <option value="" disabled>Select a provider...</option>
                                        {providers.map(p => (
                                            <option key={p.id} value={p.id}>{p.user?.username || p.id}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider opacity-60 mb-2">Service Name</label>
                                <input
                                    required
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. City Tour Guide"
                                    className={`w-full px-4 py-3 rounded-xl border outline-none ${isDark ? 'bg-black/20 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider opacity-60 mb-2">Category</label>
                                    <div className="relative">
                                        <input
                                            required
                                            list="admin-category-options"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            placeholder="Select or type..."
                                            className={`w-full px-4 py-3 rounded-xl border outline-none ${isDark ? 'bg-black/20 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                        />
                                        <datalist id="admin-category-options">
                                            {categories.map((cat, idx) => (
                                                <option key={idx} value={cat} />
                                            ))}
                                        </datalist>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider opacity-60 mb-2">Price (NPR)</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="0.00"
                                        className={`w-full px-4 py-3 rounded-xl border outline-none ${isDark ? 'bg-black/20 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider opacity-60 mb-2">Description</label>
                                <textarea
                                    required
                                    rows="3"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border outline-none resize-none ${isDark ? 'bg-black/20 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                ></textarea>
                            </div>

                            <div className="flex items-center gap-3 py-2">
                                <label className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={isActive}
                                            onChange={(e) => setIsActive(e.target.checked)}
                                        />
                                        <div className={`block w-10 h-6 rounded-full transition-colors ${isActive ? 'bg-emerald-500' : 'bg-gray-500'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isActive ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <div className="ml-3 font-semibold text-sm">
                                        {isActive ? 'Service is Active' : 'Service is Inactive'}
                                    </div>
                                </label>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold border border-white/10 hover:bg-white/5 transition-colors"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30 disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminServicesSection;
