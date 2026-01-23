import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { FaLock } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const UnlockQR: React.FC = () => {
    const { t } = useTranslation('qr');
    const { publicId } = useParams<{ publicId: string }>();
    const [password, setPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;

        setIsLoading(true);
        setError('');

        try {
            const { data } = await api.post('/public/unlock', {
                publicId,
                password
            });

            if (data.targetUrl) {
                toast.success(t('unlock_qr.success_redirect'));
                // Use window.location for external redirect
                window.location.href = data.targetUrl;
            }
        } catch (err) {
            console.error(err);
            setError(t('unlock_qr.error_incorrect'));
            toast.error(t('unlock_qr.error_incorrect'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="bg-purple-100 p-3 rounded-full">
                        <FaLock className="h-8 w-8 text-purple-600" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {t('unlock_qr.title')}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {t('unlock_qr.subtitle')}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleUnlock}>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                {t('unlock_qr.password_label')}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                                    placeholder={t('unlock_qr.password_placeholder')}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm font-medium text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
                            >
                                {isLoading ? t('unlock_qr.unlocking') : t('unlock_qr.unlock_button')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UnlockQR;
