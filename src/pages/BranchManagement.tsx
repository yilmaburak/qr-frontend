import React, { useState, useEffect } from 'react';
import { FaPlus, FaStore, FaTrash, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from '../services/api';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { useBranch } from '../contexts/BranchContext';
import { useTranslation } from 'react-i18next';

interface Branch {
    id: number;
    name: string;
    address: string;
    phone: string;
}

const BranchManagement: React.FC = () => {
    const { t } = useTranslation('restaurant');
    const { branches, isLoading: loading, refreshBranches } = useBranch();
    const [showModal, setShowModal] = useState(false);

    // Admin Override
    const queryParams = new URLSearchParams(window.location.search);
    const overrideUserId = queryParams.get('userId');

    // Form State
    const [newBranch, setNewBranch] = useState({ name: '', address: '', phone: '' });

    useEffect(() => {
        refreshBranches();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = overrideUserId
                ? { ...newBranch, userId: overrideUserId }
                : newBranch;
            const res = await axios.post('/restaurant/branches', payload);
            await refreshBranches(); // Refresh context
            setShowModal(false);
            setNewBranch({ name: '', address: '', phone: '' });
            toast.success(t('branch.create_success'));
        } catch (error) {
            toast.error(t('branch.create_fail'));
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm(t('branch.delete_confirm'))) return;
        try {
            await axios.delete(`/restaurant/branches/${id}`);
            await refreshBranches();
            toast.success(t('branch.delete_success'));
        } catch (error) {
            toast.error(t('branch.delete_fail'));
        }
    };

    if (loading) return <SkeletonLoader type="card" count={3} />;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">{t('branch.title')}</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 relative z-10"
                >
                    <FaPlus /> {t('branch.add_branch')}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {branches.map(branch => (
                    <div key={branch.id} className="bg-white/10 border border-white/5 rounded-xl p-6 hover:border-orange-500/50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-orange-500/20 rounded-lg">
                                <FaStore className="text-orange-500 text-xl" />
                            </div>
                            <button
                                onClick={() => handleDelete(branch.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <FaTrash />
                            </button>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">{branch.name}</h3>

                        <div className="space-y-2 text-gray-400">
                            <div className="flex items-center gap-2">
                                <FaMapMarkerAlt size={14} />
                                <span className="text-sm">{branch.address || t('branch.no_address')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaPhone size={14} />
                                <span className="text-sm">{branch.phone || t('branch.no_phone')}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {branches.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-white/5 rounded-xl border border-dashed border-gray-700">
                        <FaStore className="text-4xl mx-auto mb-4 opacity-50" />
                        <p>{t('branch.no_branches')}</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-white mb-4">{t('branch.add_branch')}</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">{t('branch.name')}</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500"
                                    placeholder={t('branch.placeholder_name')}
                                    value={newBranch.name}
                                    onChange={e => setNewBranch({ ...newBranch, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">{t('branch.address')}</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500"
                                    placeholder={t('branch.placeholder_address')}
                                    value={newBranch.address}
                                    onChange={e => setNewBranch({ ...newBranch, address: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">{t('branch.phone')}</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500"
                                    placeholder={t('branch.placeholder_phone')}
                                    value={newBranch.phone}
                                    onChange={e => setNewBranch({ ...newBranch, phone: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-400 hover:text-white"
                                >
                                    {t('branch.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg"
                                >
                                    {t('branch.create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BranchManagement;
