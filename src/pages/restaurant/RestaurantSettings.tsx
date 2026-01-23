import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from '../../services/api';
import { FaStore, FaDollarSign, FaCamera, FaSave } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface RestaurantProfile {
    id: number;
    restaurantName: string;
    address: string;
    phone: string;
    currency: string;
    taxRate: number;
    serviceCharge: number;
    logoUrl: string;
    coverImageUrl: string;
}

const RestaurantSettings: React.FC = () => {
    const { t } = useTranslation('restaurant');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState<Partial<RestaurantProfile>>({
        currency: 'USD',
        taxRate: 0,
        serviceCharge: 0
    });

    // ... useEffect ...

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof RestaurantProfile) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const res = await axios.post<{ url: string }>('/storage/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setFormData(prev => ({
                ...prev,
                [fieldName]: res.data.url
            }));
            toast.success(t('settings.upload_success'));
        } catch (error) {
            console.error('Upload failed', error);
            toast.error(t('settings.upload_fail'));
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get('/restaurant/profile/me');
            if (res.data) {
                setFormData(res.data);
            }
        } catch (error) {
            console.error('Failed to load profile', error);
            // If 404, we are creating new, so defaults stay
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'taxRate' || name === 'serviceCharge' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.post('/restaurant/profile', formData);
            toast.success(t('settings.save_success'));
            fetchProfile(); // Refresh
        } catch (error) {
            console.error('Failed to save settings', error);
            toast.error(t('settings.save_fail'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">{t('settings.loading')}</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('settings.title')}</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Branding Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FaCamera className="text-indigo-500" /> {t('settings.branding')}
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                        {/* Logo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.logo')}</label>
                            <div className="flex items-start gap-4">
                                <div className="relative group w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer">
                                    {formData.logoUrl ? (
                                        <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <FaStore className="text-gray-300 text-3xl" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => handleFileUpload(e, 'logoUrl')}
                                        disabled={uploading}
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium">
                                        {t('settings.upload')}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 mb-2">{t('settings.logo_help_text')}</p>
                                    <input
                                        type="text"
                                        name="logoUrl"
                                        value={formData.logoUrl || ''}
                                        readOnly
                                        className="w-full text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded px-2 py-1 mb-2"
                                        placeholder={t('settings.url_placeholder')}
                                    />
                                    {uploading && <span className="text-xs text-indigo-600 animate-pulse">{t('settings.uploading')}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Cover Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.cover_image')}</label>
                            <div className="flex items-start gap-4">
                                <div className="relative group w-48 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer">
                                    {formData.coverImageUrl ? (
                                        <img src={formData.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                                    ) : (
                                        <FaCamera className="text-gray-300 text-3xl" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => handleFileUpload(e, 'coverImageUrl')}
                                        disabled={uploading}
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium">
                                        {t('settings.upload')}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 mb-2">{t('settings.cover_help_text')}</p>
                                    <input
                                        type="text"
                                        name="coverImageUrl"
                                        value={formData.coverImageUrl || ''}
                                        readOnly
                                        className="w-full text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded px-2 py-1 mb-2"
                                        placeholder={t('settings.url_placeholder')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Basic Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FaStore className="text-indigo-500" /> {t('settings.basic_info')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.restaurant_name')}</label>
                            <input
                                type="text"
                                name="restaurantName"
                                required
                                value={formData.restaurantName || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.phone')}</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.address')}</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Financial Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FaDollarSign className="text-indigo-500" /> {t('settings.financial')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.currency')}</label>
                            <select
                                name="currency"
                                value={formData.currency || 'USD'}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="TRY">TRY (₺)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.tax_rate')}</label>
                            <input
                                type="number"
                                step="0.1"
                                name="taxRate"
                                value={formData.taxRate || 0}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.service_charge')}</label>
                            <input
                                type="number"
                                step="0.1"
                                name="serviceCharge"
                                value={formData.serviceCharge || 0}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className={`flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-colors ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        <FaSave />
                        {saving ? t('settings.saving') : t('settings.save_changes')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RestaurantSettings;
