import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { FaSave, FaCog, FaUnlockAlt, FaCreditCard, FaExclamationTriangle } from 'react-icons/fa';
import api from '../../services/api';

interface Setting {
    key: string;
    value: string;
    description: string;
}

interface PendingChanges {
    [key: string]: string;
}

const SystemSettings: React.FC = () => {
    const { t } = useTranslation('admin');
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [pendingChanges, setPendingChanges] = useState<PendingChanges>({});
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get<Setting[]>('/admin/settings');
            setSettings(res.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch system settings');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key: string, value: string) => {
        setPendingChanges(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const hasUnsavedChanges = Object.keys(pendingChanges).length > 0;

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save all pending changes
            for (const [key, value] of Object.entries(pendingChanges)) {
                await api.put(`/admin/settings/${key}`, { value });
            }
            toast.success('Settings updated successfully');
            setPendingChanges({});
            setShowConfirmDialog(false);
            fetchSettings();
        } catch (err) {
            toast.error('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelChanges = () => {
        setPendingChanges({});
        toast.info('Changes discarded');
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

    const subscriptionsEnabled = pendingChanges['ENABLE_SUBSCRIPTIONS'] !== undefined
        ? pendingChanges['ENABLE_SUBSCRIPTIONS'] === 'true'
        : settings.find(s => s.key === 'ENABLE_SUBSCRIPTIONS')?.value === 'true';

    const openaiKey = pendingChanges['OPENAI_API_KEY'] !== undefined
        ? pendingChanges['OPENAI_API_KEY']
        : settings.find(s => s.key === 'OPENAI_API_KEY')?.value || '';

    return (
        <>
            <div className="max-w-4xl mx-auto p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <FaCog className="text-indigo-600" /> System Settings
                    </h1>
                    <p className="text-gray-500 mt-2">Manage global configurations for the entire platform.</p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* Billing Toggle */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-xl">
                                <FaCreditCard />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Enable Subscriptions</h3>
                                <p className="text-sm text-gray-500">Enable or disable all billing and PRO feature gates</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={subscriptionsEnabled}
                                onChange={(e) => handleChange('ENABLE_SUBSCRIPTIONS', e.target.checked ? 'true' : 'false')}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    {/* AI Configuration */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 text-xl">
                                <FaUnlockAlt />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">AI & Voice Configuration</h3>
                                <p className="text-sm text-gray-500">Configure global API keys for Voice and Parsing services</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">OpenAI API Key</label>
                                <input
                                    type="password"
                                    value={openaiKey}
                                    onChange={(e) => handleChange('OPENAI_API_KEY', e.target.value)}
                                    placeholder="sk-..."
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition bg-gray-50 focus:bg-white"
                                />
                                <p className="text-xs text-gray-400 mt-2">Used for Whisper Speech-to-Text and AI Order Parsing.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                        <FaCog className="text-amber-500 mt-1 shrink-0" />
                        <p className="text-sm text-amber-700">
                            <strong>Warning:</strong> These settings affect all users globally. Changes to the API keys may temporarily disrupt voice ordering or analytics features.
                        </p>
                    </div>

                    {/* Save Button (sticky at bottom when changes exist) */}
                    {hasUnsavedChanges && (
                        <div className="sticky bottom-4 bg-white p-4 rounded-2xl shadow-lg border-2 border-indigo-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FaExclamationTriangle className="text-amber-500" />
                                <div>
                                    <p className="font-semibold text-gray-900">You have unsaved changes</p>
                                    <p className="text-sm text-gray-500">{Object.keys(pendingChanges).length} setting(s) modified</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCancelChanges}
                                    className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition"
                                >
                                    Discard
                                </button>
                                <button
                                    onClick={() => setShowConfirmDialog(true)}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-2 transition"
                                >
                                    <FaSave />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
                                <FaExclamationTriangle className="text-amber-500 text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Apply Changes?</h3>
                        </div>

                        <p className="text-gray-600 mb-6">
                            You are about to apply {Object.keys(pendingChanges).length} change(s) to the global system settings.
                            These changes will affect all users immediately. Are you sure you want to continue?
                        </p>

                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Changes to be applied:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                                {Object.keys(pendingChanges).map(key => (
                                    <li key={key} className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                                        {key === 'ENABLE_SUBSCRIPTIONS' ? 'Enable Subscriptions' : key.replace(/_/g, ' ')}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                disabled={saving}
                                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Applying...
                                    </>
                                ) : (
                                    <>
                                        <FaSave />
                                        Apply Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SystemSettings;
