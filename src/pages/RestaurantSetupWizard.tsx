import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStore, FaUtensils, FaCheck, FaDollarSign, FaCamera, FaCloudUploadAlt, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const RestaurantSetupWizard: React.FC = () => {
    const { t } = useTranslation('restaurant');
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth(); // renamed loading to authLoading
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    console.log('RestaurantSetupWizard: Rendering', { user, authLoading, step });

    useEffect(() => {
        console.log('RestaurantSetupWizard: Mounted');
        // Double check if profile exists, if so redirect home
        checkExistingProfile();
    }, []);
    const [formData, setFormData] = useState({
        restaurantName: '',
        address: '',
        phone: '',
        currency: 'USD',
        taxRate: 0,
        serviceCharge: 0,
        logoUrl: '', // Optional: In real app, upload to S3/Cloudinary first
        coverImageUrl: ''
    });

    useEffect(() => {
        // Double check if profile exists, if so redirect home
        checkExistingProfile();
    }, []);

    const checkExistingProfile = async () => {
        try {
            const res = await axios.get('/restaurant/profile/me');
            if (res.data && res.data.restaurantName) {
                navigate('/restaurant');
            }
        } catch (error) {
            // No profile found (404), continue setup
        }
    };

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await axios.post('/restaurant/profile', formData);
            toast.success(t('messages.setup_success'));
            navigate('/restaurant');
        } catch (error) {
            toast.error(t('messages.profile_save_fail'));
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'coverImageUrl') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            toast.error('File too large (Max 10MB)');
            return;
        }

        const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');
        if (!currentUser || !currentUser.username) {
            toast.error('Please login to upload files');
            return;
        }

        setLoading(true);

        try {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);

            const response = await axios.post(
                `/storage/upload/image/${currentUser.username}`,
                uploadFormData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );

            if (response.data && response.data.url) {
                setFormData(prev => ({ ...prev, [field]: response.data.url }));
                toast.success('Upload successful');
            }
        } catch (error) {
            console.error('Upload failed', error);
            toast.error('Upload failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-indigo-600 p-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">{t('setup_wizard.title')}</h1>
                    <p className="text-indigo-200">{t('setup_wizard.subtitle')}</p>
                </div>

                {/* Progress Bar */}
                <div className="flex border-b border-gray-100">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`flex-1 p-4 text-center text-sm font-medium ${s === step ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400'}`}>
                            {t(`setup_wizard.step_${s}`)}
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FaStore className="text-indigo-500" /> {t('setup_wizard.basic_info')}
                            </h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('setup_wizard.restaurant_name')}</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder={t('setup_wizard.placeholders.restaurant_name')}
                                    value={formData.restaurantName}
                                    onChange={e => setFormData({ ...formData, restaurantName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('setup_wizard.address_label')}</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder={t('setup_wizard.placeholders.address')}
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('setup_wizard.phone_label')}</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder={t('setup_wizard.placeholders.phone')}
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FaDollarSign className="text-indigo-500" /> {t('setup_wizard.financial_settings')}
                            </h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('setup_wizard.currency_label')}</label>
                                <select
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    value={formData.currency}
                                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="TRY">TRY (₺)</option>
                                    <option value="GBP">GBP (£)</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('setup_wizard.tax_rate')}</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder={t('setup_wizard.placeholders.tax_rate')}
                                        value={formData.taxRate}
                                        onChange={e => setFormData({ ...formData, taxRate: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('setup_wizard.service_charge')}</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder={t('setup_wizard.placeholders.service_charge')}
                                        value={formData.serviceCharge}
                                        onChange={e => setFormData({ ...formData, serviceCharge: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FaCamera className="text-indigo-500" /> {t('setup_wizard.branding')}
                            </h2>
                            <p className="text-sm text-gray-500">{t('setup_wizard.logo_help')}</p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('setup_wizard.logo_url')}</label>
                                <div className="flex items-center gap-4">
                                    {formData.logoUrl && (
                                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                                            <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => setFormData({ ...formData, logoUrl: '' })}
                                                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg hover:bg-red-600"
                                            >
                                                <FaTrash size={12} />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-500 transition-colors text-center cursor-pointer bg-gray-50 hover:bg-white">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                onChange={(e) => handleFileUpload(e, 'logoUrl')}
                                                disabled={loading}
                                            />
                                            <FaCloudUploadAlt className="mx-auto text-gray-400 text-2xl mb-2" />
                                            <p className="text-sm text-gray-500">{loading ? 'Uploading...' : 'Click or drag to upload logo'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('setup_wizard.cover_image_url')}</label>
                                <div className="space-y-3">
                                    {formData.coverImageUrl && (
                                        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                                            <img src={formData.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => setFormData({ ...formData, coverImageUrl: '' })}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 shadow-sm"
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        </div>
                                    )}
                                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-500 transition-colors text-center cursor-pointer bg-gray-50 hover:bg-white">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={(e) => handleFileUpload(e, 'coverImageUrl')}
                                            disabled={loading}
                                        />
                                        <FaCloudUploadAlt className="mx-auto text-gray-400 text-3xl mb-2" />
                                        <p className="text-sm text-gray-500">{loading ? 'Uploading...' : 'Click or drag to upload cover image'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                        {step > 1 ? (
                            <button onClick={handleBack} className="px-6 py-2 text-gray-600 font-medium hover:text-gray-900">
                                {t('setup_wizard.back_button')}
                            </button>
                        ) : <div></div>}

                        {step < 3 ? (
                            <button
                                onClick={handleNext}
                                disabled={step === 1 && !formData.restaurantName}
                                className="bg-indigo-600 text-white px-8 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {t('setup_wizard.next_button')}
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-green-600 text-white px-8 py-3 rounded-full shadow-lg hover:bg-green-700 transition flex items-center gap-2"
                            >
                                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                {t('setup_wizard.complete_button')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantSetupWizard;
