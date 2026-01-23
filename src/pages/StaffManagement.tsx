import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import staffService from '../services/staffService';
import type { StaffUser, StaffCreateRequest } from '../services/staffService';
import { toast } from 'react-toastify';
import { FaUsers, FaUserPlus, FaTimes } from 'react-icons/fa';
import SkeletonLoader from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';

const StaffManagement: React.FC = () => {
    const { t } = useTranslation('restaurant');
    const [staff, setStaff] = useState<StaffUser[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [formData, setFormData] = useState<StaffCreateRequest>({
        username: '',
        password: '',
        email: '',
        role: 'RESTAURANT_USER'
    });

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        try {
            const data = await staffService.getStaff();
            setStaff(data);
        } catch (error) {
            toast.error(t('staff.load_fail'));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.username || !formData.password) {
            toast.error(t('staff.validation_error'));
            return;
        }

        try {
            await staffService.createStaff(formData);
            toast.success(t('staff.create_success'));
            setFormData({ username: '', password: '', email: '', role: 'RESTAURANT_USER' });
            setShowModal(false);
            loadStaff();
        } catch (error: any) {
            toast.error(error.response?.data || t('staff.create_fail'));
        }
    };

    if (loading) return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <SkeletonLoader width={200} height={32} />
                <SkeletonLoader width={120} height={40} />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <SkeletonLoader count={5} height={60} className="mb-4" />
            </div>
        </div>
    );

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <FaUsers className="text-indigo-600" /> {t('staff.title')}
                </h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition"
                >
                    <FaUserPlus /> {t('staff.add_staff')}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                {staff.length === 0 ? (
                    <EmptyState
                        icon={FaUsers}
                        title={t('staff.no_staff')}
                        description={t('staff.no_staff_desc')}
                        actionLabel={t('staff.add_staff')}
                        onAction={() => setShowModal(true)}
                        className="border-none shadow-none"
                    />
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('staff.username')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('staff.email')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('staff.status')}</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('staff.role')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {staff.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{member.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{member.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${member.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {member.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{member.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Staff Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">{t('staff.add_new')}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('staff.username')} *</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder={t('staff.placeholder_username')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('staff.password')} *</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('staff.email_optional')}</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder={t('staff.placeholder_email')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('staff.role')}</label>
                                <select
                                    value={formData.role || 'RESTAURANT_USER'}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="RESTAURANT_USER">{t('staff.waiter')}</option>
                                    <option value="RESTAURANT_MODERATOR">{t('staff.moderator')}</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    {t('staff.role_desc')}
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition"
                                >
                                    {t('staff.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
                                >
                                    {t('staff.create_staff')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;
