import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface UserDetail {
    id: number;
    username: string;
    email: string;
    role: string;
    status: string;
    subscriptionTier?: string;
    subscriptionStatus?: string;
}

const AdminEditUser: React.FC = () => {
    const { t } = useTranslation('admin');
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [formData, setFormData] = useState<Partial<UserDetail>>({});

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            const response = await api.get<UserDetail>(`/admin/users/${id}`);
            setUser(response.data);
            setFormData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch user:', error);
            toast.error(t('users.edit.fetch_error'));
            navigate('/admin/users');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/admin/users/${id}`, formData);
            toast.success(t('users.edit.update_success'));
            setSaving(false);
            navigate('/admin/users');
        } catch (error) {
            console.error('Failed to update user:', error);
            toast.error(t('users.edit.update_error'));
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">{t('common.loading')}</div>;
    if (!user) return <div className="p-8">{t('users.edit.user_not_found')}</div>;

    return (
        <div className="p-8">
            <button onClick={() => navigate('/admin/users')} className="flex items-center text-gray-600 mb-6 hover:text-gray-900">
                <FaArrowLeft className="mr-2" /> {t('users.edit.back_btn')}
            </button>

            <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-3xl mx-auto">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-2xl font-bold text-gray-800">{t('users.edit.title', { username: user.username })}</h1>
                    <p className="text-gray-500 text-sm mt-1">{t('users.edit.id_label', { id: user.id })}</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.table.username')}</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.table.email')}</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Security & Access */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.table.role')}</label>
                            <select
                                name="role"
                                value={formData.role || 'USER'}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="USER">{t('users.roles.user')}</option>
                                <option value="RESTAURANT_OWNER">{t('users.roles.restaurant_manager')}</option>
                                <option value="SUPER_ADMIN">{t('users.roles.admin')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.table.status')}</label>
                            <select
                                name="status"
                                value={formData.status || 'ACTIVE'}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="ACTIVE">{t('dashboard.active')}</option>
                                <option value="INACTIVE">{t('dashboard.inactive')}</option>
                                <option value="SUSPENDED">{t('dashboard.suspended')}</option>
                            </select>
                        </div>
                    </div>

                    {/* Subscription (Optional if backend supports it) */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('users.edit.sections.subscription')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.edit.fields.subscription_tier')}</label>
                                <select
                                    name="subscriptionTier"
                                    value={formData.subscriptionTier || 'FREE'}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                >
                                    <option value="FREE">{t('users.edit.tier.free')}</option>
                                    <option value="PRO_MONTHLY">{t('users.edit.tier.pro_monthly')}</option>
                                    <option value="PRO_YEARLY">{t('users.edit.tier.pro_yearly')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('users.edit.fields.subscription_status')}</label>
                                <select
                                    name="subscriptionStatus"
                                    value={formData.subscriptionStatus || 'ACTIVE'}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                >
                                    <option value="ACTIVE">{t('dashboard.active')}</option>
                                    <option value="CANCELED">{t('users.edit.status.canceled')}</option>
                                    <option value="EXPIRED">{t('users.edit.status.expired')}</option>
                                    <option value="PAST_DUE">{t('users.edit.status.past_due')}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        <button
                            type="submit"
                            disabled={saving}
                            className={`flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <FaSave className="mr-2" />
                            {saving ? t('common.saving') : t('common.save_changes')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminEditUser;
