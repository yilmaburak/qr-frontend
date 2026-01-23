import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaSave, FaCreditCard, FaLock, FaGlobe } from 'react-icons/fa';
import { useTranslation, Trans } from 'react-i18next';

interface PaymentSettingsData {
    id?: number;
    restaurantId?: number;
    provider: 'STRIPE' | 'IYZICO' | 'TROY';
    apiKey: string;
    apiSecret: string;
    isActive: boolean;
}

const PaymentSettings: React.FC = () => {
    const { t } = useTranslation('restaurant');
    const [settings, setSettings] = useState<PaymentSettingsData>({
        provider: 'STRIPE',
        apiKey: '',
        apiSecret: '',
        isActive: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/payment/settings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setSettings(data);
                }
            }
        } catch (error) {
            console.error("Failed to load settings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/payment/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                toast.success(t('payment.saved'));
            } else {
                toast.error(t('payment.save_fail'));
            }
        } catch (error) {
            console.error(error);
            toast.error(t('messages.error_occurred'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">{t('payment.loading')}</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <FaCreditCard className="text-blue-600" /> {t('payment.title')}
            </h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-6 bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                    <FaLock className="text-blue-600 mt-1" />
                    <div>
                        <h3 className="font-bold text-blue-800">{t('payment.secure_config')}</h3>
                        <p className="text-sm text-blue-600">
                            {t('payment.secure_desc')}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Provider Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('payment.provider')}</label>
                        <div className="grid grid-cols-3 gap-4">
                            {['STRIPE', 'IYZICO', 'TROY'].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setSettings({ ...settings, provider: p as any })}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${settings.provider === p
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-blue-200 text-gray-600'
                                        }`}
                                >
                                    <FaGlobe size={24} />
                                    <span className="font-bold">{p}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 my-6" />

                    {/* Dynamic Fields */}
                    {settings.provider === 'STRIPE' && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('payment.publishable_key')}</label>
                                <input
                                    type="text"
                                    value={settings.apiKey}
                                    onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                                    placeholder="pk_test_..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-1">Found in your Stripe Dashboard under Developers &gt; API Keys.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('payment.secret_key')}</label>
                                <input
                                    type="password"
                                    value={settings.apiSecret}
                                    onChange={(e) => setSettings({ ...settings, apiSecret: e.target.value })}
                                    placeholder="sk_test_..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-1">{t('payment.secret_desc')}</p>
                            </div>
                        </>
                    )}

                    {(settings.provider === 'IYZICO' || settings.provider === 'TROY') && (
                        <Trans i18nKey="restaurant:payment.mock_mode" values={{ provider: settings.provider }}>
                            <strong>Note:</strong> {settings.provider} integration is currently in <strong>Mock Mode</strong>.
                        </Trans>
                    )}

                    {/* Active Toggle */}
                    <div className="flex items-center gap-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.isActive}
                                onChange={(e) => setSettings({ ...settings, isActive: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-900">{t('payment.enable')}</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 disabled:bg-gray-400"
                    >
                        {saving ? t('settings.saving') : <><FaSave /> {t('payment.save')}</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PaymentSettings;
