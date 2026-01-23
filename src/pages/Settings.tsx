import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { toast } from 'react-toastify';
import { FiUser, FiLock, FiSave, FiRefreshCw } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

interface ProfileData {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    company: string;
    title: string;
    website: string;
    address: string;
}

interface PasswordData {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const Settings: React.FC = () => {
    const { t } = useTranslation('settings');
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

    // Profile Form State
    const [profile, setProfile] = useState<ProfileData>({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        company: '',
        title: '',
        website: '',
        address: ''
    });

    // Password Form State
    const [passwords, setPasswords] = useState<PasswordData>({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await api.get<Partial<ProfileData>>('/users/profile');
            // Merge response with default keys to avoid unchecked inputs warning if null
            if (response.data) {
                setProfile(prev => ({
                    ...prev,
                    ...response.data,
                    // Handle nulls
                    firstName: response.data.firstName || '',
                    lastName: response.data.lastName || '',
                    phone: response.data.phone || '',
                    company: response.data.company || '',
                    title: response.data.title || '',
                    website: response.data.website || '',
                    address: response.data.address || ''
                }));
            }
        } catch (error) {
            console.error(error);
            toast.error(t('settings.profile.load_fail'));
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
    };

    const saveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await api.put('/users/profile', profile);
            toast.success(t('profile.success_updated'));
            // Update local storage user if name changed? Optional but good practice
            // But localStorage user object is minimal usually.
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || t('settings.profile.update_fail'));
        } finally {
            setSaving(false);
        }
    };

    const savePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error(t('settings.account.password_mismatch'));
            return;
        }
        if (passwords.newPassword.length < 6) {
            toast.error(t('settings.account.password_min_error'));
            return;
        }

        try {
            setSaving(true);
            await api.put('/users/change-password', {
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            });
            toast.success(t('account.success_password'));
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || t('settings.account.change_fail'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-4 md:p-8 max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl md:text-3xl  font-bold text-gray-800">{t('page_title')}</h1>
                    <button onClick={fetchProfile} className="p-2 text-gray-500 hover:text-blue-600 transition-colors" title="Reload Profile"><FiRefreshCw /></button>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="flex border-b border-gray-100">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <FiUser /> {t('sections.profile')}
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'security' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <FiLock /> {t('sections.security')}
                                </div>
                            </button>
                        </div>

                        <div className="p-6 md:p-8">
                            {activeTab === 'profile' && (
                                <form onSubmit={saveProfile} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.profile.username_readonly')}</label>
                                            <input type="text" value={profile.username} disabled className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.profile.email_readonly')}</label>
                                            <input type="email" value={profile.email} disabled className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.first_name')}</label>
                                            <input type="text" name="firstName" value={profile.firstName} onChange={handleProfileChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.last_name')}</label>
                                            <input type="text" name="lastName" value={profile.lastName} onChange={handleProfileChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.profile.job_title')}</label>
                                            <input type="text" name="title" value={profile.title} onChange={handleProfileChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.profile.company')}</label>
                                            <input type="text" name="company" value={profile.company} onChange={handleProfileChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.phone')}</label>
                                            <input type="tel" name="phone" value={profile.phone} onChange={handleProfileChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.profile.website')}</label>
                                            <input type="url" name="website" value={profile.website} onChange={handleProfileChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.address')}</label>
                                            <textarea name="address" value={profile.address} onChange={handleProfileChange} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"></textarea>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed">
                                            {saving ? t('common.loading') : <><FiSave /> {t('profile.save_changes')}</>}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'security' && (
                                <form onSubmit={savePassword} className="space-y-6 max-w-lg mx-auto py-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('account.current_password')}</label>
                                        <input type="password" name="oldPassword" value={passwords.oldPassword} onChange={handlePasswordChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                                    </div>
                                    <div className="pt-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('account.new_password')}</label>
                                        <input type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} required minLength={6} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                                        <p className="text-xs text-gray-500 mt-1">{t('settings.account.password_min')}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('account.confirm_password')}</label>
                                        <input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                                    </div>
                                    <div className="flex justify-end pt-6">
                                        <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-black text-white rounded-lg font-medium transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed">
                                            {saving ? t('common.loading') : <><FiLock /> {t('account.update_password')}</>}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Settings;
