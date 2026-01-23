import React, { useState, useEffect } from 'react';
import axios from '../../services/api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

interface POSConfig {
    configured: boolean;
    provider?: string;
    merchantId?: string;
    terminalId?: string;
    isActive?: boolean;
    hasApiKey?: boolean;
    hasApiSecret?: boolean;
}

const POSSettings: React.FC = () => {
    const { t } = useTranslation('restaurant');
    const [config, setConfig] = useState<POSConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);

    // Form state
    const [provider, setProvider] = useState('INGENICO');
    const [merchantId, setMerchantId] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [webhookSecret, setWebhookSecret] = useState('');
    const [terminalId, setTerminalId] = useState('');
    const [terminalIp, setTerminalIp] = useState('');
    const [terminalPort, setTerminalPort] = useState('8080');

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await axios.get('/restaurant/pos-settings');
            setConfig(response.data);

            if (response.data.configured) {
                setProvider(response.data.provider || 'INGENICO');
                setMerchantId(response.data.merchantId || '');
                setTerminalId(response.data.terminalId || '');
            }
        } catch (error) {
            console.error('Error fetching POS config:', error);
            toast.error('Failed to load POS settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            await axios.post('/restaurant/pos-settings', {
                posProvider: provider,
                merchantId,
                apiKey,
                apiSecret,
                webhookSecret,
                terminalId,
                terminalIp,
                terminalPort: terminalPort ? parseInt(terminalPort) : null
            });

            toast.success('POS settings saved successfully!');
            fetchConfig();

            // Clear sensitive fields after save
            setApiKey('');
            setApiSecret('');
            setWebhookSecret('');

        } catch (error) {
            console.error('Error saving POS config:', error);
            toast.error('Failed to save POS settings');
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        setTesting(true);

        try {
            const response = await axios.post('/restaurant/pos-settings/test');

            if (response.data.success) {
                toast.success('✓ Connection test successful!');
            } else {
                toast.warning(response.data.message);
            }
        } catch (error) {
            console.error('Error testing connection:', error);
            toast.error('Connection test failed');
        } finally {
            setTesting(false);
        }
    };

    const handleDisable = async () => {
        if (!window.confirm('Are you sure you want to disable POS integration?')) {
            return;
        }

        try {
            await axios.delete('/restaurant/pos-settings');
            toast.success('POS integration disabled');
            fetchConfig();
        } catch (error) {
            console.error('Error disabling POS:', error);
            toast.error('Failed to disable POS');
        }
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6">POS Integration Settings</h1>

                {/* Status Banner */}
                {config?.configured && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-green-800">
                                    ✓ POS Integration Active
                                </p>
                                <p className="text-sm text-green-600">
                                    Provider: {config.provider} | Merchant ID: {config.merchantId}
                                </p>
                            </div>
                            <button
                                onClick={handleTest}
                                disabled={testing}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                            >
                                {testing ? 'Testing...' : 'Test Connection'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Configuration Form */}
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Provider Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            POS Provider
                        </label>
                        <select
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            className="w-full p-2 border rounded-lg"
                        >
                            <option value="INGENICO">Ingenico</option>
                            <option value="SQUARE">Square</option>
                            <option value="TOAST">Toast</option>
                            <option value="CLOVER">Clover</option>
                        </select>
                    </div>

                    {/* Merchant ID */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Merchant ID *
                        </label>
                        <input
                            type="text"
                            value={merchantId}
                            onChange={(e) => setMerchantId(e.target.value)}
                            placeholder="Your merchant ID from Ingenico"
                            className="w-full p-2 border rounded-lg"
                            required
                        />
                    </div>

                    {/* API Credentials */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                API Key *
                                {config?.hasApiKey && (
                                    <span className="ml-2 text-xs text-green-600">✓ Set</span>
                                )}
                            </label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder={config?.hasApiKey ? '••••••••' : 'Enter API key'}
                                className="w-full p-2 border rounded-lg"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Leave blank to keep existing key
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                API Secret *
                                {config?.hasApiSecret && (
                                    <span className="ml-2 text-xs text-green-600">✓ Set</span>
                                )}
                            </label>
                            <input
                                type="password"
                                value={apiSecret}
                                onChange={(e) => setApiSecret(e.target.value)}
                                placeholder={config?.hasApiSecret ? '••••••••' : 'Enter API secret'}
                                className="w-full p-2 border rounded-lg"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Leave blank to keep existing secret
                            </p>
                        </div>
                    </div>

                    {/* Webhook Secret */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Webhook Secret
                        </label>
                        <input
                            type="password"
                            value={webhookSecret}
                            onChange={(e) => setWebhookSecret(e.target.value)}
                            placeholder="Webhook signature secret"
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>

                    {/* Terminal Settings (Optional) */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-4">Terminal Settings (Optional)</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Terminal ID
                                </label>
                                <input
                                    type="text"
                                    value={terminalId}
                                    onChange={(e) => setTerminalId(e.target.value)}
                                    placeholder="Terminal ID"
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Terminal IP
                                </label>
                                <input
                                    type="text"
                                    value={terminalIp}
                                    onChange={(e) => setTerminalIp(e.target.value)}
                                    placeholder="192.168.1.100"
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Terminal Port
                                </label>
                                <input
                                    type="number"
                                    value={terminalPort}
                                    onChange={(e) => setTerminalPort(e.target.value)}
                                    placeholder="8080"
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
                        >
                            {saving ? 'Saving...' : 'Save Configuration'}
                        </button>

                        {config?.configured && (
                            <button
                                type="button"
                                onClick={handleDisable}
                                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                            >
                                Disable POS
                            </button>
                        )}
                    </div>
                </form>

                {/* Help Text */}
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Need Help?</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Get your credentials from your Ingenico merchant dashboard</li>
                        <li>• Webhook URL: <code className="bg-blue-100 px-2 py-1 rounded">https://yourdomain.com/api/pos/webhook/ingenico/payment-status</code></li>
                        <li>• Contact support if you need assistance with setup</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default POSSettings;
