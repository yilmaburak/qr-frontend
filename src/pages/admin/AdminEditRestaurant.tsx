import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface RestaurantDetail {
    id: number;
    restaurantName: string;
    address: string;
    phone: string;
    currency: string;
    ownerId: number;
    ownerUsername: string;
}

const AdminEditRestaurant: React.FC = () => {
    const { t } = useTranslation('admin');
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [formData, setFormData] = useState<Partial<RestaurantDetail>>({});

    useEffect(() => {
        fetchRestaurant();
    }, [id]);

    const fetchRestaurant = async () => {
        try {
            const response = await api.get<RestaurantDetail>(`/admin/restaurants/${id}`);
            setRestaurant(response.data);
            setFormData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch restaurant:', error);
            toast.error(t('restaurants.edit.fetch_error'));
            navigate('/admin/restaurants');
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
            await api.put(`/admin/restaurants/${id}`, formData);
            toast.success(t('restaurants.edit.update_success'));
            setSaving(false);
            navigate('/admin/restaurants');
        } catch (error) {
            console.error('Failed to update restaurant:', error);
            toast.error(t('restaurants.edit.update_error'));
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">{t('common.loading')}</div>;
    if (!restaurant) return <div className="p-8">{t('restaurants.edit.restaurant_not_found')}</div>;

    return (
        <div className="p-8">
            <button onClick={() => navigate('/admin/restaurants')} className="flex items-center text-gray-600 mb-6 hover:text-gray-900">
                <FaArrowLeft className="mr-2" /> {t('restaurants.edit.back_btn')}
            </button>

            <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-3xl mx-auto">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-2xl font-bold text-gray-800">{t('restaurants.edit.title', { name: restaurant.restaurantName })}</h1>
                    <p className="text-gray-500 text-sm mt-1">{t('restaurants.edit.subtitle', { id: restaurant.id, owner: restaurant.ownerUsername })}</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurants.table.name')}</label>
                            <input
                                type="text"
                                name="restaurantName"
                                value={formData.restaurantName || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurants.edit.fields.currency')}</label>
                            <select
                                name="currency"
                                value={formData.currency || 'USD'}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="TRY">TRY</option>
                                <option value="GBP">GBP</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurants.table.address')}</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurants.edit.fields.phone')}</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
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

                {/* Global Management Actions for Admin */}
                <div className="bg-gray-50 p-6 border-t border-gray-100 flex gap-4">
                    <button
                        type="button"
                        onClick={() => navigate(`/restaurant/branches?userId=${restaurant.ownerId}`)}
                        className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 font-medium"
                    >
                        {t('restaurants.edit.buttons.manage_branches')}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(`/restaurant/menu?userId=${restaurant.ownerId}`)}
                        className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 font-medium"
                    >
                        {t('restaurants.edit.buttons.manage_menu')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminEditRestaurant;
