import React, { useState } from 'react';
import axios from '../../services/api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

interface POSOnboardingProps {
    onComplete: () => void;
    onSkip: () => void;
}

const POSOnboarding: React.FC<POSOnboardingProps> = ({ onComplete, onSkip }) => {
    const { t } = useTranslation('restaurant');
    const [step, setStep] = useState(1);
    const [provider, setProvider] = useState('INGENICO');
    const [merchantId, setMerchantId] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!merchantId || !apiKey || !apiSecret) {
            toast.error('Please fill in all required fields');
            return;
        }

        setSaving(true);

        try {
            await axios.post('/restaurant/pos-settings', {
                posProvider: provider,
                merchantId,
                apiKey,
                apiSecret
            });

            toast.success('POS integration configured successfully!');
            onComplete();

        } catch (error) {
            console.error('Error saving POS config:', error);
            toast.error('Failed to configure POS');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">Setup Payment Terminal</h2>
                    <p className="text-gray-600">
                        Connect your Ingenico payment terminal (optional)
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                            }`}>
                            1
                        </div>
                        <div className="w-16 h-1 bg-gray-200"></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                            }`}>
                            2
                        </div>
                    </div>
                </div>

                {/* Step 1: Choose Provider */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Select POS Provider
                            </label>
                            <select
                                value={provider}
                                onChange={(e) => setProvider(e.target.value)}
                                className="w-full p-3 border rounded-lg text-lg"
                            >
                                <option value="INGENICO">Ingenico (Recommended)</option>
                                <option value="SQUARE">Square</option>
                                <option value="TOAST">Toast</option>
                            </select>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-2">Why Ingenico?</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>✓ Widely used in restaurants</li>
                                <li>✓ Secure payment processing</li>
                                <li>✓ Support for all major cards</li>
                                <li>✓ Real-time transaction updates</li>
                            </ul>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(2)}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                            >
                                Continue
                            </button>
                            <button
                                onClick={onSkip}
                                className="px-6 py-3 text-gray-600 hover:text-gray-800"
                            >
                                Skip for now
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Enter Credentials */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-yellow-800">
                                <strong>Don't have credentials yet?</strong> You can skip this step and configure later in Settings.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Merchant ID *
                            </label>
                            <input
                                type="text"
                                value={merchantId}
                                onChange={(e) => setMerchantId(e.target.value)}
                                placeholder="Enter your Ingenico merchant ID"
                                className="w-full p-3 border rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                API Key *
                            </label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Enter your API key"
                                className="w-full p-3 border rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                API Secret *
                            </label>
                            <input
                                type="password"
                                value={apiSecret}
                                onChange={(e) => setApiSecret(e.target.value)}
                                placeholder="Enter your API secret"
                                className="w-full p-3 border rounded-lg"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(1)}
                                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
                            >
                                {saving ? 'Saving...' : 'Complete Setup'}
                            </button>
                            <button
                                onClick={onSkip}
                                className="px-6 py-3 text-gray-600 hover:text-gray-800"
                            >
                                Skip
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default POSOnboarding;
